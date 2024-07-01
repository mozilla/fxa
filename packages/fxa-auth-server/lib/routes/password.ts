/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { emailsMatch } from 'fxa-shared/email/helpers';
import { StatsD } from 'hot-shots';
import { Redis } from 'ioredis';
import * as isA from 'joi';

import { OtpManager, OtpStorage } from '@fxa/shared/otp';

import { ConfigType } from '../../config';
import PASSWORD_DOCS from '../../docs/swagger/password-api';
import DESCRIPTION from '../../docs/swagger/shared/descriptions';
import * as butil from '../crypto/butil';
import * as random from '../crypto/random';
import * as error from '../error';
import { schema as METRICS_CONTEXT_SCHEMA } from '../metrics/context';
import { gleanMetrics } from '../metrics/glean';
import * as requestHelper from '../routes/utils/request_helper';
import { AuthLogger, AuthRequest } from '../types';
import { recordSecurityEvent } from './utils/security-event';
import * as validators from './validators';

const HEX_STRING = validators.HEX_STRING;

class OtpRedisAdapter implements OtpStorage {
  constructor(private redis: Redis, private ttl: number) {}

  async set(key: string, value: string) {
    await this.redis.set(key, value, 'EX', this.ttl);
    return null;
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async del(key: string) {
    await this.redis.del(key);
    return null;
  }
}

module.exports = function (
  log: AuthLogger,
  db: any,
  Password: any,
  redirectDomain: any,
  mailer: any,
  verifierVersion: any,
  customs: any,
  signinUtils: any,
  push: any,
  config: ConfigType,
  oauth: any,
  glean: ReturnType<typeof gleanMetrics>,
  authServerCacheRedis: Redis,
  statsd: StatsD
) {
  const otpUtils = require('../../lib/routes/utils/otp')(log, config, db);
  const otpRedisAdapter = config.passwordForgotOtp.enabled
    ? new OtpRedisAdapter(authServerCacheRedis, config.passwordForgotOtp.ttl)
    : { set: async () => null, get: async () => null, del: async () => null };
  const otpManager = new OtpManager(
    { kind: 'passwordForgot', digits: config.passwordForgotOtp.digits },
    otpRedisAdapter
  );

  function failVerifyAttempt(passwordForgotToken: any) {
    return passwordForgotToken.failAttempt()
      ? db.deletePasswordForgotToken(passwordForgotToken)
      : db.updatePasswordForgotToken(passwordForgotToken);
  }

  const routes = [
    {
      method: 'POST',
      path: '/password/change/start',
      options: {
        ...PASSWORD_DOCS.PASSWORD_CHANGE_START_POST,
        validate: {
          payload: isA.object({
            email: validators.email().required().description(DESCRIPTION.email),
            oldAuthPW: validators.authPW.description(DESCRIPTION.authPW),
          }),
        },
      },
      handler: async function (request: AuthRequest) {
        log.begin('Password.changeStart', request);
        const form = request.payload as { email: string; oldAuthPW: string };
        const { oldAuthPW, email } = form;

        await customs.check(request, email, 'passwordChange');

        let keyFetchToken = undefined;
        let keyFetchToken2 = undefined;
        let passwordChangeToken = undefined;

        try {
          const emailRecord = await db.accountRecord(email);
          const password = new Password(
            oldAuthPW,
            emailRecord.authSalt,
            emailRecord.verifierVersion
          );

          const match = await signinUtils.checkPassword(
            emailRecord,
            password,
            request.app.clientAddress
          );

          if (!match) {
            throw error.incorrectPassword(emailRecord.email, form.email);
          }

          if (password.clientVersion === 1) {
            const unwrappedKb = await password.unwrap(emailRecord.wrapWrapKb);
            keyFetchToken = await db.createKeyFetchToken({
              uid: emailRecord.uid,
              kA: emailRecord.kA,
              wrapKb: unwrappedKb,
              emailVerified: emailRecord.emailVerified,
            });
          }

          if (password.clientVersion === 2) {
            const unwrappedKb = await password.unwrap(
              emailRecord.wrapWrapKbVersion2
            );
            keyFetchToken2 = await db.createKeyFetchToken({
              uid: emailRecord.uid,
              kA: emailRecord.kA,
              wrapKb: unwrappedKb,
              emailVerified: emailRecord.emailVerified,
            });
          }

          passwordChangeToken = await db.createPasswordChangeToken({
            uid: emailRecord.uid,
          });
        } catch (err) {
          if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
            customs.flag(request.app.clientAddress, {
              email: form.email,
              errno: err.errno,
            });
          }
          throw err;
        }

        return {
          keyFetchToken: keyFetchToken?.data,
          keyFetchToken2: keyFetchToken2?.data,
          passwordChangeToken: passwordChangeToken?.data,
          verified:
            keyFetchToken?.emailVerified || keyFetchToken2?.emailVerified,
        };
      },
    },
    {
      method: 'POST',
      path: '/password/change/finish',
      options: {
        ...PASSWORD_DOCS.PASSWORD_CHANGE_FINISH_POST,
        auth: {
          strategy: 'passwordChangeToken',
          payload: 'required',
        },
        validate: {
          query: isA.object({
            keys: isA.boolean().optional().description(DESCRIPTION.queryKeys),
          }),
          payload: isA
            .object({
              authPW: validators.authPW.description(DESCRIPTION.authPW),
              authPWVersion2: validators.authPW
                .optional()
                .description(DESCRIPTION.authPW),
              wrapKb: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKb),
              wrapKbVersion2: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKbVersion2),
              clientSalt: validators.clientSalt
                .optional()
                .description(DESCRIPTION.clientSalt),
              sessionToken: isA
                .string()
                .min(64)
                .max(64)
                .regex(HEX_STRING)
                .optional()
                .description(DESCRIPTION.sessionToken),
            })
            .and('authPWVersion2', 'wrapKbVersion2', 'clientSalt'),
        },
      },
      handler: async function (request: AuthRequest) {
        log.begin('Password.changeFinish', request);
        const passwordChangeToken = request.auth.credentials;
        const {
          authPW,
          authPWVersion2,
          wrapKb,
          wrapKbVersion2,
          clientSalt,
          sessionToken: sessionTokenId,
        } = request.payload as {
          authPW: string;
          authPWVersion2?: string;
          wrapKb?: string;
          wrapKbVersion2?: string;
          clientSalt?: string;
          sessionToken?: string;
        };
        const wantsKeys = requestHelper.wantsKeys(request);
        const ip = request.app.clientAddress;

        const hasTotp = await checkTotpToken();

        const { verifiedStatus, previousSessionToken, originatingDeviceId } =
          await getSessionVerificationStatus();

        const devicesToNotify = await fetchDevicesToNotify();

        const { account, isPasswordUpgrade } = await changePassword();

        await notifyAccount();
        const sessionToken = await createSessionToken();

        await verifySessionToken();

        const { keyFetchToken, keyFetchToken2 } = await createKeyFetchToken();
        return createResponse();

        async function checkTotpToken() {
          const hasTotp = await otpUtils.hasTotpToken(passwordChangeToken);

          // Currently, users that have a TOTP token must specify a sessionTokenId to complete the
          // password change process. While the `sessionTokenId` is optional, we require it
          // by TOTP.
          if (hasTotp && !sessionTokenId) {
            throw error.unverifiedSession();
          }
          return hasTotp;
        }

        async function getSessionVerificationStatus() {
          const result: {
            verifiedStatus: boolean;
            previousSessionToken?: any;
            originatingDeviceId?: any;
          } = { verifiedStatus: false };

          if (!sessionTokenId) {
            // Don't create a verified session unless they already had one.
            result.verifiedStatus = false;
            return result;
          }

          const tokenData = await db.sessionToken(sessionTokenId);
          result.previousSessionToken = tokenData;
          result.verifiedStatus = tokenData.tokenVerified;
          if (tokenData.deviceId) {
            result.originatingDeviceId = tokenData.deviceId;
          }

          if (hasTotp && tokenData.authenticatorAssuranceLevel <= 1) {
            throw error.unverifiedSession();
          }
          return result;
        }

        async function fetchDevicesToNotify() {
          // We fetch the devices to notify before changePassword() because
          // db.resetAccount() deletes all the devices saved in the account.
          const devices = await request.app.devices;

          // If the originating sessionToken belongs to a device,
          // do not send the notification to that device. It will
          // get informed about the change via WebChannel message.
          if (originatingDeviceId) {
            return devices.filter((d: any) => d.id !== originatingDeviceId);
          }
          return devices;
        }

        async function changePassword() {
          const authSalt = await random.hex(32);
          const password = new Password(authPW, authSalt, verifierVersion);
          const verifyHash = await password.verifyHash();
          const account = await db.account(passwordChangeToken.uid);
          const wrapWrapKb = await password.wrap(wrapKb);

          let isPasswordUpgrade = false;
          if (
            authPWVersion2 &&
            !/quickStretchV2/.test(account.clientSalt || '')
          ) {
            const v1Password = new Password(
              authPW,
              account.authSalt,
              account.verifierVersion
            );
            isPasswordUpgrade = await signinUtils.checkPassword(
              account,
              v1Password,
              request.app.clientAddress
            );
          }

          // For the time being we store both passwords in the DB. authPW is created
          // with the old quickStretch and authPWVersion2 is created with improved 'quick' stretch.
          let password2 = undefined;
          let verifyHashVersion2 = undefined;
          let wrapWrapKbVersion2 = undefined;
          if (authPWVersion2) {
            password2 = new Password(
              authPWVersion2,
              authSalt,
              verifierVersion,
              2
            );
            verifyHashVersion2 = await password2.verifyHash();
            wrapWrapKbVersion2 = await password2.wrap(wrapKbVersion2);
          }

          await db.deletePasswordChangeToken(passwordChangeToken);

          if (isPasswordUpgrade) {
            const result = await db.resetAccount(
              passwordChangeToken,
              {
                authSalt: authSalt,
                clientSalt: clientSalt,
                verifierVersion: password.version,
                verifyHash: verifyHash,
                verifyHashVersion2: verifyHashVersion2,
                wrapWrapKb: wrapWrapKb,
                wrapWrapKbVersion2: wrapWrapKbVersion2,
                keysHaveChanged: false,
              },
              true
            );

            await request.emitMetricsEvent('account.upgradedPassword', {
              uid: passwordChangeToken.uid,
            });

            await recordSecurityEvent('account.password_upgrade_success', {
              db,
              request,
              account: passwordChangeToken,
            });

            await recordSecurityEvent('account.password_upgraded', {
              db,
              request,
              account: passwordChangeToken,
            });

            return { result, account, isPasswordUpgrade };
          }

          const result = await db.resetAccount(passwordChangeToken, {
            authSalt: authSalt,
            clientSalt: clientSalt,
            verifierVersion: password.version,
            verifyHash: verifyHash,
            verifyHashVersion2: verifyHashVersion2,
            wrapWrapKb: wrapWrapKb,
            wrapWrapKbVersion2: wrapWrapKbVersion2,
            keysHaveChanged: false,
          });

          await request.emitMetricsEvent('account.changedPassword', {
            uid: passwordChangeToken.uid,
          });

          await recordSecurityEvent('account.password_reset_success', {
            db,
            request,
            account: passwordChangeToken,
          });

          await recordSecurityEvent('account.password_changed', {
            db,
            request,
            account: passwordChangeToken,
          });

          return { result, account, isPasswordUpgrade };
        }

        async function notifyAccount() {
          // When upgrading passwords, the previous password is still
          // valid, and therefore we can short circuit the notification
          // processes.
          if (isPasswordUpgrade) {
            return;
          }

          if (devicesToNotify) {
            // Notify the devices that the account has changed.
            push.notifyPasswordChanged(
              passwordChangeToken.uid,
              devicesToNotify
            );
          }

          log.notifyAttachedServices('passwordChange', request, {
            uid: passwordChangeToken.uid,
            generation: account.verifierSetAt,
          });
          await oauth.removePublicAndCanGrantTokens(passwordChangeToken.uid);
          const emails = await db.accountEmails(passwordChangeToken.uid);
          const geoData = request.app.geo;
          const {
            browser: uaBrowser,
            browserVersion: uaBrowserVersion,
            os: uaOS,
            osVersion: uaOSVersion,
            deviceType: uaDeviceType,
          } = request.app.ua;

          try {
            await mailer.sendPasswordChangedEmail(emails, account, {
              acceptLanguage: request.app.acceptLanguage,
              ip,
              location: geoData.location,
              timeZone: geoData.timeZone,
              uaBrowser,
              uaBrowserVersion,
              uaOS,
              uaOSVersion,
              uaDeviceType,
              uid: passwordChangeToken.uid,
            });
          } catch (error) {
            // If we couldn't email them, no big deal. Log
            // and pretend everything worked.
            log.trace(
              'Password.changeFinish.sendPasswordChangedNotification.error',
              {
                error,
              }
            );
          }
        }

        async function createSessionToken() {
          const maybeToken = !verifiedStatus ? await random.hex(16) : undefined;
          const {
            browser: uaBrowser,
            browserVersion: uaBrowserVersion,
            os: uaOS,
            osVersion: uaOSVersion,
            deviceType: uaDeviceType,
            formFactor: uaFormFactor,
          } = request.app.ua;

          // Create a sessionToken with the verification status of the current session
          const sessionTokenOptions = {
            uid: account.uid,
            email: account.email,
            emailCode: account.emailCode,
            emailVerified: account.emailVerified,
            verifierSetAt: account.verifierSetAt,
            mustVerify: wantsKeys,
            tokenVerificationId: maybeToken,
            uaBrowser,
            uaBrowserVersion,
            uaOS,
            uaOSVersion,
            uaDeviceType,
            uaFormFactor,
          };

          return db.createSessionToken(sessionTokenOptions);
        }

        function verifySessionToken() {
          if (
            sessionToken &&
            previousSessionToken &&
            previousSessionToken.verificationMethodValue
          ) {
            return db.verifyTokensWithMethod(
              sessionToken.id,
              previousSessionToken.verificationMethodValue
            );
          }
        }

        async function createKeyFetchToken() {
          const result: {
            keyFetchToken?: any;
            keyFetchToken2?: any;
          } = {};
          if (wantsKeys) {
            // Create a verified keyFetchToken. This is deliberately verified because we don't
            // want to perform an email confirmation loop.
            if (authPW) {
              result.keyFetchToken = await db.createKeyFetchToken({
                uid: account.uid,
                kA: account.kA,
                wrapKb: wrapKb,
                emailVerified: account.emailVerified,
              });
            }

            if (authPWVersion2) {
              result.keyFetchToken2 = await db.createKeyFetchToken({
                uid: account.uid,
                kA: account.kA,
                wrapKb: wrapKbVersion2,
                emailVerified: account.emailVerified,
              });
            }
          }
          return result;
        }

        function createResponse() {
          // If no sessionToken, this could be a legacy client
          // attempting to change password, return legacy response.
          if (!sessionTokenId) {
            return {};
          }

          const response: any = {
            uid: sessionToken.uid,
            sessionToken: sessionToken.data,
            verified: sessionToken.emailVerified && sessionToken.tokenVerified,
            authAt: sessionToken.lastAuthAt(),
          };

          if (wantsKeys) {
            if (keyFetchToken) {
              response.keyFetchToken = keyFetchToken.data;
            }

            if (keyFetchToken2) {
              response.keyFetchToken2 = keyFetchToken2.data;
            }
          }

          return response;
        }
      },
    },
    {
      // This endpoint will eventually replace '/password/forgot/send_code'
      // below.  That is also the reason for the similarity between them.
      method: 'POST',
      path: '/password/forgot/send_otp',
      options: {
        ...PASSWORD_DOCS.PASSWORD_FORGOT_SEND_OTP_POST,
        validate: {
          query: isA.object({
            service: validators.service.description(DESCRIPTION.serviceRP),
            keys: isA.boolean().optional(),
          }),
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailRecovery),
            service: validators.service.description(DESCRIPTION.serviceRP),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }),
        },
      },
      handler: async function (request: AuthRequest) {
        if (!config.passwordForgotOtp.enabled) {
          throw error.featureNotEnabled();
        }

        log.begin('Password.forgotOtp', request);
        await request.emitMetricsEvent('password.forgot.send_otp.start');
        const payload = request.payload as {
          email: string;
          service: string;
          metricsContext: any;
        };
        const email = payload.email;

        await customs.check(request, email, 'passwordForgotSendOtp');

        request.validateMetricsContext();

        const account = await db.accountRecord(email);
        if (!emailsMatch(account.primaryEmail.normalizedEmail, email)) {
          throw error.cannotResetPasswordWithSecondaryEmail();
        }

        let flowCompleteSignal;
        if (requestHelper.wantsKeys(request)) {
          flowCompleteSignal = 'account.signed';
        } else {
          flowCompleteSignal = 'account.reset';
        }
        request.setMetricsFlowCompleteSignal(flowCompleteSignal);

        const code = await otpManager.create(account.uid);
        const ip = request.app.clientAddress;
        const service = payload.service || request.query.service;
        const { deviceId, flowId, flowBeginTime } = await request.app
          .metricsContext;
        const geoData = request.app.geo;
        const {
          browser: uaBrowser,
          browserVersion: uaBrowserVersion,
          os: uaOS,
          osVersion: uaOSVersion,
          deviceType: uaDeviceType,
        } = request.app.ua;

        await mailer.sendPasswordForgotOtpEmail(account.emails, account, {
          code,
          service,
          acceptLanguage: request.app.acceptLanguage,
          deviceId,
          flowId,
          flowBeginTime,
          ip,
          location: geoData.location,
          timeZone: geoData.timeZone,
          uaBrowser,
          uaBrowserVersion,
          uaOS,
          uaOSVersion,
          uaDeviceType,
          uid: account.uid,
        });

        glean.resetPassword.otpEmailSent(request);

        await request.emitMetricsEvent('password.forgot.send_otp.completed');

        recordSecurityEvent('account.password_reset_otp_sent', {
          db,
          request,
          account: { uid: account.uid },
        });

        statsd.increment('otp.passwordForgot.sent');

        return {};
      },
    },
    {
      method: 'POST',
      path: '/password/forgot/verify_otp',
      options: {
        ...PASSWORD_DOCS.PASSWORD_FORGOT_VERIFY_OTP_POST,
        validate: {
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailRecovery),
            code: isA
              .string()
              .length(config.passwordForgotOtp.digits)
              .regex(validators.DIGITS),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }),
        },
      },
      handler: async function (request: any) {
        if (!config.passwordForgotOtp.enabled) {
          throw error.featureNotEnabled();
        }

        log.begin('Password.forgotOtpVerify', request);
        await request.emitMetricsEvent('password.forgot.verify_otp.start');
        statsd.increment('otp.passwordForgot.attempt');

        const { email, code } = request.payload;
        await customs.check(request, email, 'passwordForgotVerifyOtp');

        request.validateMetricsContext();

        const account = await db.accountRecord(email);
        const isValidCode = await otpManager.isValid(account.uid, code);

        if (!isValidCode) {
          throw error.invalidVerificationCode();
        }

        const passwordForgotToken = await db.createPasswordForgotToken(account);

        await otpManager.delete(account.uid);
        glean.resetPassword.otpVerified(request);
        await request.emitMetricsEvent('password.forgot.verify_otp.completed');

        recordSecurityEvent('account.password_reset_otp_verified', {
          db,
          request,
          account: { uid: account.uid },
        });

        statsd.increment('otp.passwordForgot.verified');

        return {
          code: passwordForgotToken.passCode,
          emailToHashWith: passwordForgotToken.email,
          token: passwordForgotToken.data,
          uid: passwordForgotToken.uid,
        };
      },
    },
    {
      method: 'POST',
      path: '/password/forgot/send_code',
      options: {
        ...PASSWORD_DOCS.PASSWORD_FORGOT_SEND_CODE_POST,
        validate: {
          query: isA.object({
            service: validators.service.description(DESCRIPTION.serviceRP),
            keys: isA.boolean().optional(),
          }),
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailRecovery),
            service: validators.service.description(DESCRIPTION.serviceRP),
            redirectTo: validators
              .redirectTo(redirectDomain)
              .optional()
              .description(DESCRIPTION.redirectTo),
            resume: isA
              .string()
              .max(2048)
              .optional()
              .description(DESCRIPTION.resume),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }),
        },
        response: {
          schema: isA.object({
            passwordForgotToken: isA.string(),
            ttl: isA.number(),
            codeLength: isA.number(),
            tries: isA.number(),
          }),
        },
      },
      handler: async function (request: AuthRequest) {
        log.begin('Password.forgotSend', request);
        const payload = request.payload as {
          email: string;
          service: string;
          redirectTo?: string;
          resume?: string;
        };

        const email = payload.email;
        const service = payload.service || request.query.service;
        const ip = request.app.clientAddress;

        request.validateMetricsContext();

        let flowCompleteSignal;
        if (requestHelper.wantsKeys(request)) {
          flowCompleteSignal = 'account.signed';
        } else {
          flowCompleteSignal = 'account.reset';
        }
        request.setMetricsFlowCompleteSignal(flowCompleteSignal);

        const { deviceId, flowId, flowBeginTime } = await request.app
          .metricsContext;

        await Promise.all([
          request.emitMetricsEvent('password.forgot.send_code.start'),
          customs.check(request, email, 'passwordForgotSendCode'),
        ]);
        const accountRecord = await db.accountRecord(email);

        if (!emailsMatch(accountRecord.primaryEmail.normalizedEmail, email)) {
          throw error.cannotResetPasswordWithSecondaryEmail();
        }
        // The token constructor sets createdAt from its argument.
        // Clobber the timestamp to prevent prematurely expired tokens.
        accountRecord.createdAt = undefined;
        const passwordForgotToken = await db.createPasswordForgotToken(
          accountRecord
        );
        const [, emails] = await Promise.all([
          request.stashMetricsContext(passwordForgotToken),
          db.accountEmails(passwordForgotToken.uid),
        ]);
        const geoData = request.app.geo;
        const {
          browser: uaBrowser,
          browserVersion: uaBrowserVersion,
          os: uaOS,
          osVersion: uaOSVersion,
          deviceType: uaDeviceType,
        } = request.app.ua;

        await mailer.sendRecoveryEmail(emails, passwordForgotToken, {
          emailToHashWith: passwordForgotToken.email,
          token: passwordForgotToken.data,
          code: passwordForgotToken.passCode,
          service: service,
          redirectTo: payload.redirectTo,
          resume: payload.resume,
          acceptLanguage: request.app.acceptLanguage,
          deviceId,
          flowId,
          flowBeginTime,
          ip,
          location: geoData.location,
          timeZone: geoData.timeZone,
          uaBrowser,
          uaBrowserVersion,
          uaOS,
          uaOSVersion,
          uaDeviceType,
          uid: passwordForgotToken.uid,
        });
        await Promise.all([
          request.emitMetricsEvent('password.forgot.send_code.completed'),
          glean.resetPassword.emailSent(request),
        ]);
        return {
          passwordForgotToken: passwordForgotToken.data,
          ttl: passwordForgotToken.ttl(),
          codeLength: passwordForgotToken.passCode.length,
          tries: passwordForgotToken.tries,
        };
      },
    },
    {
      method: 'POST',
      path: '/password/forgot/resend_code',
      options: {
        ...PASSWORD_DOCS.PASSWORD_FORGOT_RESEND_CODE_POST,
        auth: {
          strategy: 'passwordForgotToken',
          payload: 'required',
        },
        validate: {
          query: isA.object({
            service: validators.service.description(DESCRIPTION.serviceRP),
          }),
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailRecovery),
            service: validators.service.description(DESCRIPTION.serviceRP),
            redirectTo: validators
              .redirectTo(redirectDomain)
              .optional()
              .description(DESCRIPTION.redirectTo),
            resume: isA
              .string()
              .max(2048)
              .optional()
              .description(DESCRIPTION.resume),
          }),
        },
        response: {
          schema: isA.object({
            passwordForgotToken: isA.string(),
            ttl: isA.number(),
            codeLength: isA.number(),
            tries: isA.number(),
          }),
        },
      },
      handler: async function (request: AuthRequest) {
        log.begin('Password.forgotResend', request);
        const passwordForgotToken = request.auth.credentials as any;
        const payload = request.payload as {
          email: string;
          service: string;
          redirectTo?: string;
          resume?: string;
        };
        const service = payload.service || request.query.service;
        const ip = request.app.clientAddress;

        const { deviceId, flowId, flowBeginTime } = await request.app
          .metricsContext;

        await Promise.all([
          request.emitMetricsEvent('password.forgot.resend_code.start'),
          customs.check(
            request,
            passwordForgotToken.email,
            'passwordForgotResendCode'
          ),
        ]);

        const emails = await db.accountEmails(passwordForgotToken.uid);

        const geoData = request.app.geo;
        const {
          browser: uaBrowser,
          browserVersion: uaBrowserVersion,
          os: uaOS,
          osVersion: uaOSVersion,
          deviceType: uaDeviceType,
        } = request.app.ua;

        await mailer.sendRecoveryEmail(emails, passwordForgotToken, {
          code: passwordForgotToken.passCode,
          emailToHashWith: passwordForgotToken.email,
          token: passwordForgotToken.data,
          service,
          redirectTo: payload.redirectTo,
          resume: payload.resume,
          acceptLanguage: request.app.acceptLanguage,
          deviceId,
          flowId,
          flowBeginTime,
          ip,
          location: geoData.location,
          timeZone: geoData.timeZone,
          uaBrowser,
          uaBrowserVersion,
          uaOS,
          uaOSVersion,
          uaDeviceType,
          uid: passwordForgotToken.uid,
        });
        await Promise.all([
          request.emitMetricsEvent('password.forgot.resend_code.completed'),
          recordSecurityEvent('account.password_reset_requested', {
            db,
            request,
          }),
        ]);
        return {
          passwordForgotToken: passwordForgotToken.data,
          ttl: passwordForgotToken.ttl(),
          codeLength: passwordForgotToken.passCode.length,
          tries: passwordForgotToken.tries,
        };
      },
    },
    {
      method: 'POST',
      path: '/password/forgot/verify_code',
      options: {
        ...PASSWORD_DOCS.PASSWORD_FORGOT_VERIFY_CODE_POST,
        auth: {
          strategy: 'passwordForgotToken',
          payload: 'required',
        },
        validate: {
          payload: isA.object({
            code: isA
              .string()
              .min(32)
              .max(32)
              .regex(HEX_STRING)
              .required()
              .description(DESCRIPTION.codeRecovery),
            accountResetWithRecoveryKey: isA.boolean().optional(),
          }),
        },
        response: {
          schema: isA.object({
            accountResetToken: isA.string(),
          }),
        },
      },
      handler: async function (request: AuthRequest) {
        log.begin('Password.forgotVerify', request);
        const passwordForgotToken = request.auth.credentials as any;
        const { code, accountResetWithRecoveryKey } = request.payload as {
          code: string;
          accountResetWithRecoveryKey?: boolean;
        };

        const { deviceId, flowId, flowBeginTime } = await request.app
          .metricsContext;

        await Promise.all([
          request.emitMetricsEvent('password.forgot.verify_code.start'),
          customs.check(
            request,
            passwordForgotToken.email,
            'passwordForgotVerifyCode'
          ),
        ]);

        let accountResetToken;
        if (
          butil.buffersAreEqual(passwordForgotToken.passCode, code) &&
          passwordForgotToken.ttl() > 0
        ) {
          accountResetToken = await db.forgotPasswordVerified(
            passwordForgotToken
          );
        } else {
          await failVerifyAttempt(passwordForgotToken);
          throw error.invalidVerificationCode({
            tries: passwordForgotToken.tries,
            ttl: passwordForgotToken.ttl(),
          });
        }

        const [, emails] = await Promise.all([
          request.propagateMetricsContext(
            passwordForgotToken,
            accountResetToken
          ),
          db.accountEmails(passwordForgotToken.uid),
        ]);

        // To prevent multiple password change emails being sent to a user,
        // we check for a flag to see if this is a reset using an account recovery key.
        // If it is, then the notification email will be sent in `/account/reset`
        if (!accountResetWithRecoveryKey) {
          await mailer.sendPasswordResetEmail(emails, passwordForgotToken, {
            code,
            acceptLanguage: request.app.acceptLanguage,
            deviceId,
            flowId,
            flowBeginTime,
            uid: passwordForgotToken.uid,
          });
        }

        await request.emitMetricsEvent('password.forgot.verify_code.completed');

        return {
          accountResetToken: accountResetToken.data,
        };
      },
    },
    {
      method: 'POST',
      path: '/password/create',
      options: {
        ...PASSWORD_DOCS.PASSWORD_CREATE_POST,
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: isA
            .object({
              authPW: validators.authPW.description(DESCRIPTION.authPW),
              authPWVersion2: validators.authPWVersion2
                .optional()
                .description(DESCRIPTION.authPWVersion2),
              wrapKb: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKb),
              wrapKbVersion2: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKbVersion2),
              clientSalt: validators.clientSalt
                .optional()
                .description(DESCRIPTION.clientSalt),
            })
            .and('authPWVersion2', 'wrapKb', 'wrapKbVersion2', 'clientSalt'),
        },
      },
      handler: async function (request: AuthRequest) {
        log.begin('Password.create', request);
        const sessionToken = request.auth.credentials as any;
        const { uid } = sessionToken;

        const { authPW, authPWVersion2, wrapKb, wrapKbVersion2, clientSalt } =
          request.payload as {
            authPW: string;
            authPWVersion2?: string;
            wrapKb?: string;
            wrapKbVersion2?: string;
            clientSalt?: string;
          };

        const account = await db.account(uid);
        // We don't allow users that have a password set already to create a new password
        // because this process would destroy their original encryption keys and might
        // leave the account in an invalid state.
        if (account.verifierSetAt > 0) {
          throw error.cannotCreatePassword();
        }

        // Users that have enabled 2FA must be in a 2FA verified session to create a password.
        const hasTotpToken = await otpUtils.hasTotpToken(account);
        if (
          hasTotpToken &&
          (sessionToken.tokenVerificationId ||
            sessionToken.authenticatorAssuranceLevel <= 1)
        ) {
          throw error.unverifiedSession();
        }

        const authSalt = await random.hex(32);

        // For V1 credentials
        const password = new Password(authPW, authSalt, config.verifierVersion);
        const verifyHash = await password.verifyHash();
        let wrapWrapKb = undefined;

        // For V2 credentials
        let wrapWrapKbVersion2 = undefined;
        let verifyHashVersion2 = undefined;
        if (authPWVersion2) {
          const password2 = new Password(
            authPWVersion2,
            authSalt,
            config.verifierVersion
          );
          wrapWrapKbVersion2 = await password2.wrap(wrapKbVersion2);
          verifyHashVersion2 = await password2.verifyHash();

          // Important! For V2 credentials, wrapKb and wrapKbVersion2 are supplied by client
          // to ensure that a single kB results from either password. Therefore, we
          // must used supplied wrapKb
          wrapWrapKb = await password.wrap(wrapKb);
        } else {
          wrapWrapKb = await random.hex(32);
        }

        const passwordCreated = await db.createPassword(
          uid,
          authSalt,
          clientSalt,
          verifyHash,
          verifyHashVersion2,
          wrapWrapKb,
          wrapWrapKbVersion2,
          verifierVersion
        );

        recordSecurityEvent('account.password_added', {
          db,
          request,
          account: { uid },
        });

        // We need to track when users with third party accounts actually set a passwords. Note that
        // this handler will exit early if the user already has a password, and this code would not
        // be reached, which ensures this event will only fire when a user is setting their linked
        // account password for the first time.
        const linkedAccounts = await db.getLinkedAccounts(uid);
        if (
          linkedAccounts?.length > 0 &&
          linkedAccounts.some((x: { enabled: boolean }) => x.enabled)
        ) {
          glean.thirdPartyAuth.setPasswordComplete(request, {
            uid,
          });
        }

        return passwordCreated;
      },
    },
    {
      method: 'GET',
      path: '/password/forgot/status',
      options: {
        ...PASSWORD_DOCS.PASSWORD_FORGOT_STATUS_GET,
        auth: {
          strategy: 'passwordForgotToken',
        },
        response: {
          schema: isA.object({
            tries: isA.number(),
            ttl: isA.number(),
          }),
        },
      },
      handler: async function (request: AuthRequest) {
        log.begin('Password.forgotStatus', request);
        const passwordForgotToken = request.auth.credentials as any;
        return {
          tries: passwordForgotToken.tries,
          ttl: passwordForgotToken.ttl(),
        };
      },
    },
  ];

  return routes;
};
