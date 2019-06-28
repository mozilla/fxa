/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const emailUtils = require('./utils/email');
const error = require('../error');
const isA = require('joi');
const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema;
const P = require('../promise');
const random = require('../crypto/random');
const requestHelper = require('./utils/request_helper');
const uuid = require('uuid');
const validators = require('./validators');
const authMethods = require('../authMethods');
const ScopeSet = require('fxa-shared').oauth.scopes;

const {
  determineClientVisibleSubscriptionCapabilities,
} = require('./utils/subscriptions');

const HEX_STRING = validators.HEX_STRING;

const MS_ONE_HOUR = 1000 * 60 * 60;
const MS_ONE_DAY = MS_ONE_HOUR * 24;
const MS_ONE_WEEK = MS_ONE_DAY * 7;
const MS_ONE_MONTH = MS_ONE_DAY * 30;

module.exports = (
  log,
  db,
  mailer,
  Password,
  config,
  customs,
  subhub,
  signinUtils,
  push,
  verificationReminders
) => {
  const tokenCodeConfig = config.signinConfirmation.tokenVerificationCode;
  const tokenCodeLifetime =
    (tokenCodeConfig && tokenCodeConfig.codeLifetime) || MS_ONE_HOUR;
  const tokenCodeLength = (tokenCodeConfig && tokenCodeConfig.codeLength) || 8;
  const TokenCode = random.base10(tokenCodeLength);
  const totpUtils = require('./utils/totp')(log, config, db);
  const skipConfirmationForEmailAddresses =
    config.signinConfirmation.skipForEmailAddresses;

  const OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS = new Set(
    config.oauth.disableNewConnectionsForClients || []
  );

  const routes = [
    {
      method: 'POST',
      path: '/account/create',
      options: {
        validate: {
          query: {
            keys: isA.boolean().optional(),
            service: validators.service,
          },
          payload: {
            email: validators.email().required(),
            authPW: validators.authPW,
            preVerified: isA.boolean(),
            service: validators.service,
            redirectTo: validators
              .redirectTo(config.smtp.redirectDomain)
              .optional(),
            resume: isA
              .string()
              .max(2048)
              .optional(),
            metricsContext: METRICS_CONTEXT_SCHEMA,
            style: isA
              .string()
              .allow(['trailhead'])
              .optional(),
          },
        },
        response: {
          schema: {
            uid: isA
              .string()
              .regex(HEX_STRING)
              .required(),
            sessionToken: isA
              .string()
              .regex(HEX_STRING)
              .required(),
            keyFetchToken: isA
              .string()
              .regex(HEX_STRING)
              .optional(),
            authAt: isA.number().integer(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Account.create', request);
        const form = request.payload;
        const query = request.query;
        const email = form.email;
        const authPW = form.authPW;
        const locale = request.app.acceptLanguage;
        const userAgentString = request.headers['user-agent'];
        const service = form.service || query.service;
        const preVerified = !!form.preVerified;
        const ip = request.app.clientAddress;
        const style = form.style;
        let password,
          verifyHash,
          account,
          sessionToken,
          keyFetchToken,
          emailCode,
          tokenVerificationId,
          tokenVerificationCode,
          authSalt;

        request.validateMetricsContext();
        if (OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(service)) {
          throw error.disabledClientId(service);
        }

        const { deviceId, flowId, flowBeginTime } = await request.app
          .metricsContext;

        return customs
          .check(request, email, 'accountCreate')
          .then(deleteAccountIfUnverified)
          .then(setMetricsFlowCompleteSignal)
          .then(generateRandomValues)
          .then(createPassword)
          .then(createAccount)
          .then(createSessionToken)
          .then(sendVerifyCode)
          .then(createKeyFetchToken)
          .then(recordSecurityEvent)
          .then(createResponse);

        function deleteAccountIfUnverified() {
          return db
            .getSecondaryEmail(email)
            .then(secondaryEmailRecord => {
              // Currently, users can not create an account from a verified
              // secondary email address
              if (secondaryEmailRecord.isPrimary) {
                if (secondaryEmailRecord.isVerified) {
                  throw error.accountExists(secondaryEmailRecord.email);
                }
                request.app.accountRecreated = true;
                return db.deleteAccount(secondaryEmailRecord).then(() =>
                  log.info('accountDeleted.unverifiedSecondaryEmail', {
                    ...secondaryEmailRecord,
                  })
                );
              } else {
                if (secondaryEmailRecord.isVerified) {
                  throw error.verifiedSecondaryEmailAlreadyExists();
                }

                return db.deleteEmail(
                  secondaryEmailRecord.uid,
                  secondaryEmailRecord.email
                );
              }
            })
            .catch(err => {
              if (err.errno !== error.ERRNO.SECONDARY_EMAIL_UNKNOWN) {
                throw err;
              }
            });
        }

        function setMetricsFlowCompleteSignal() {
          let flowCompleteSignal;
          if (service === 'sync') {
            flowCompleteSignal = 'account.signed';
          } else {
            flowCompleteSignal = 'account.verified';
          }
          request.setMetricsFlowCompleteSignal(
            flowCompleteSignal,
            'registration'
          );

          return P.resolve();
        }

        function generateRandomValues() {
          return P.all([random.hex(16), random.hex(32), TokenCode()]).spread(
            (hex16, hex32, tokenCode) => {
              emailCode = hex16;
              tokenVerificationId = emailCode;
              tokenVerificationCode = tokenCode;
              authSalt = hex32;
            }
          );
        }

        function createPassword() {
          password = new Password(authPW, authSalt, config.verifierVersion);
          return password.verifyHash().then(result => {
            verifyHash = result;
          });
        }

        async function createAccount() {
          if (!locale) {
            // We're seeing a surprising number of accounts created
            // without a proper locale. Log details to help debug this.
            log.info('account.create.emptyLocale', {
              email: email,
              locale: locale,
              agent: userAgentString,
            });
          }

          const hexes = await random.hex(32, 32);
          account = await db.createAccount({
            uid: uuid.v4('binary').toString('hex'),
            createdAt: Date.now(),
            email: email,
            emailCode: emailCode,
            emailVerified: preVerified,
            kA: hexes[0],
            wrapWrapKb: hexes[1],
            accountResetToken: null,
            passwordForgotToken: null,
            authSalt: authSalt,
            verifierVersion: password.version,
            verifyHash: verifyHash,
            verifierSetAt: Date.now(),
            locale: locale,
          });

          await request.emitMetricsEvent('account.created', {
            uid: account.uid,
          });

          const geoData = request.app.geo;
          const country = geoData.location && geoData.location.country;
          const countryCode = geoData.location && geoData.location.countryCode;
          if (account.emailVerified) {
            await log.notifyAttachedServices('verified', request, {
              email: account.email,
              locale: account.locale,
              service,
              uid: account.uid,
              userAgent: userAgentString,
              country,
              countryCode,
            });
          }

          await log.notifyAttachedServices('login', request, {
            deviceCount: 1,
            country,
            countryCode,
            email: account.email,
            service,
            uid: account.uid,
            userAgent: userAgentString,
          });
        }

        function createSessionToken() {
          // Verified sessions should only be created for preverified accounts.
          if (preVerified) {
            tokenVerificationId = undefined;
          }

          const {
            browser: uaBrowser,
            browserVersion: uaBrowserVersion,
            os: uaOS,
            osVersion: uaOSVersion,
            deviceType: uaDeviceType,
            formFactor: uaFormFactor,
          } = request.app.ua;

          return db
            .createSessionToken({
              uid: account.uid,
              email: account.email,
              emailCode: account.emailCode,
              emailVerified: account.emailVerified,
              verifierSetAt: account.verifierSetAt,
              mustVerify: requestHelper.wantsKeys(request),
              tokenVerificationCode: tokenVerificationCode,
              tokenVerificationCodeExpiresAt: Date.now() + tokenCodeLifetime,
              tokenVerificationId: tokenVerificationId,
              uaBrowser,
              uaBrowserVersion,
              uaOS,
              uaOSVersion,
              uaDeviceType,
              uaFormFactor,
            })
            .then(result => {
              sessionToken = result;
              return request.stashMetricsContext(sessionToken);
            })
            .then(() => {
              // There is no session token when we emit account.verified
              // so stash the data against a synthesized "token" instead.
              return request.stashMetricsContext({
                uid: account.uid,
                id: account.emailCode,
              });
            });
        }

        function sendVerifyCode() {
          if (!account.emailVerified) {
            return mailer
              .sendVerifyCode([], account, {
                code: account.emailCode,
                service: form.service || query.service,
                redirectTo: form.redirectTo,
                resume: form.resume,
                acceptLanguage: locale,
                deviceId,
                flowId,
                flowBeginTime,
                ip,
                location: request.app.geo.location,
                style,
                uaBrowser: sessionToken.uaBrowser,
                uaBrowserVersion: sessionToken.uaBrowserVersion,
                uaOS: sessionToken.uaOS,
                uaOSVersion: sessionToken.uaOSVersion,
                uaDeviceType: sessionToken.uaDeviceType,
                uid: sessionToken.uid,
              })
              .then(() => {
                if (tokenVerificationId) {
                  // Log server-side metrics for confirming verification rates
                  log.info('account.create.confirm.start', {
                    uid: account.uid,
                    tokenVerificationId: tokenVerificationId,
                  });
                }

                return verificationReminders.create(
                  account.uid,
                  flowId,
                  flowBeginTime
                );
              })
              .catch(err => {
                log.error('mailer.sendVerifyCode.1', { err: err });

                if (tokenVerificationId) {
                  // Log possible email bounce, used for confirming verification rates
                  log.error('account.create.confirm.error', {
                    uid: account.uid,
                    err: err,
                    tokenVerificationId: tokenVerificationId,
                  });
                }

                // show an error to the user, the account is already created.
                // the user can come back later and try again.
                throw emailUtils.sendError(err, true);
              });
          }
        }

        function createKeyFetchToken() {
          if (requestHelper.wantsKeys(request)) {
            return password
              .unwrap(account.wrapWrapKb)
              .then(wrapKb => {
                return db.createKeyFetchToken({
                  uid: account.uid,
                  kA: account.kA,
                  wrapKb: wrapKb,
                  emailVerified: account.emailVerified,
                  tokenVerificationId: tokenVerificationId,
                });
              })
              .then(result => {
                keyFetchToken = result;
                return request.stashMetricsContext(keyFetchToken);
              });
          }
        }

        function recordSecurityEvent() {
          db.securityEvent({
            name: 'account.create',
            uid: account.uid,
            ipAddr: request.app.clientAddress,
            tokenId: sessionToken.id,
          });
        }

        function createResponse() {
          const response = {
            uid: account.uid,
            sessionToken: sessionToken.data,
            authAt: sessionToken.lastAuthAt(),
          };

          if (keyFetchToken) {
            response.keyFetchToken = keyFetchToken.data;
          }

          return response;
        }
      },
    },
    {
      method: 'POST',
      path: '/account/login',
      apidoc: {
        errors: [
          error.unknownAccount,
          error.requestBlocked,
          error.incorrectPassword,
          error.cannotLoginWithSecondaryEmail,
          error.invalidUnblockCode,
          error.cannotLoginWithEmail,
          error.cannotSendEmail,
        ],
      },
      options: {
        validate: {
          query: {
            keys: isA.boolean().optional(),
            service: validators.service,
            verificationMethod: validators.verificationMethod.optional(),
          },
          payload: {
            email: validators.email().required(),
            authPW: validators.authPW,
            service: validators.service,
            redirectTo: validators
              .redirectTo(config.smtp.redirectDomain)
              .optional(),
            resume: isA.string().optional(),
            reason: isA
              .string()
              .max(16)
              .optional(),
            unblockCode: signinUtils.validators.UNBLOCK_CODE,
            metricsContext: METRICS_CONTEXT_SCHEMA,
            originalLoginEmail: validators.email().optional(),
            verificationMethod: validators.verificationMethod.optional(),
          },
        },
        response: {
          schema: {
            uid: isA
              .string()
              .regex(HEX_STRING)
              .required(),
            sessionToken: isA
              .string()
              .regex(HEX_STRING)
              .required(),
            keyFetchToken: isA
              .string()
              .regex(HEX_STRING)
              .optional(),
            verificationMethod: isA.string().optional(),
            verificationReason: isA.string().optional(),
            verified: isA.boolean().required(),
            authAt: isA.number().integer(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Account.login', request);

        const form = request.payload;
        const email = form.email;
        const authPW = form.authPW;
        const originalLoginEmail = form.originalLoginEmail;
        let verificationMethod = form.verificationMethod;
        const service = form.service || request.query.service;
        const requestNow = Date.now();

        let accountRecord,
          password,
          sessionToken,
          keyFetchToken,
          didSigninUnblock;
        let securityEventRecency = Infinity,
          securityEventVerified = false;

        request.validateMetricsContext();
        if (OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(service)) {
          throw error.disabledClientId(service);
        }

        return checkCustomsAndLoadAccount()
          .then(checkEmailAndPassword)
          .then(checkSecurityHistory)
          .then(checkTotpToken)
          .then(createSessionToken)
          .then(sendSigninNotifications)
          .then(createKeyFetchToken)
          .then(createResponse);

        function checkCustomsAndLoadAccount() {
          return signinUtils
            .checkCustomsAndLoadAccount(request, email)
            .then(res => {
              accountRecord = res.accountRecord;
              // Remember whether they did a signin-unblock,
              // because we can use it to bypass token verification.
              didSigninUnblock = res.didSigninUnblock;
            });
        }

        function checkEmailAndPassword() {
          return signinUtils
            .checkEmailAddress(accountRecord, email, originalLoginEmail)
            .then(() => {
              password = new Password(
                authPW,
                accountRecord.authSalt,
                accountRecord.verifierVersion
              );
              return signinUtils.checkPassword(
                accountRecord,
                password,
                request.app.clientAddress
              );
            })
            .then(match => {
              if (!match) {
                throw error.incorrectPassword(accountRecord.email, email);
              }
            });
        }

        function checkSecurityHistory() {
          return db
            .securityEvents({
              uid: accountRecord.uid,
              ipAddr: request.app.clientAddress,
            })
            .then(
              events => {
                if (events.length > 0) {
                  let latest = 0;
                  events.forEach(ev => {
                    if (ev.verified) {
                      securityEventVerified = true;
                      if (ev.createdAt > latest) {
                        latest = ev.createdAt;
                      }
                    }
                  });
                  if (securityEventVerified) {
                    securityEventRecency = requestNow - latest;
                    let coarseRecency;
                    if (securityEventRecency < MS_ONE_DAY) {
                      coarseRecency = 'day';
                    } else if (securityEventRecency < MS_ONE_WEEK) {
                      coarseRecency = 'week';
                    } else if (securityEventRecency < MS_ONE_MONTH) {
                      coarseRecency = 'month';
                    } else {
                      coarseRecency = 'old';
                    }

                    log.info('Account.history.verified', {
                      uid: accountRecord.uid,
                      events: events.length,
                      recency: coarseRecency,
                    });
                  } else {
                    log.info('Account.history.unverified', {
                      uid: accountRecord.uid,
                      events: events.length,
                    });
                  }
                }
              },
              err => {
                // Security event history allows some convenience during login,
                // but errors here shouldn't fail the entire request.
                // so errors shouldn't stop the login attempt
                log.error('Account.history.error', {
                  err: err,
                  uid: accountRecord.uid,
                });
              }
            );
        }

        function checkTotpToken() {
          // Check to see if the user has a TOTP token and it is verified and
          // enabled, if so then the verification method is automatically forced so that
          // they have to verify the token.
          return totpUtils.hasTotpToken(accountRecord).then(result => {
            if (result) {
              // User has enabled TOTP, no way around it, they must verify TOTP token
              verificationMethod = 'totp-2fa';
            } else if (!result && verificationMethod === 'totp-2fa') {
              // Error if requesting TOTP verification with TOTP not setup
              throw error.totpRequired();
            }
          });
        }

        function createSessionToken() {
          // All sessions are considered unverified by default.
          let needsVerificationId = true;

          // However! To help simplify the login flow, we can use some heuristics to
          // decide whether to consider the session pre-verified.  Some accounts
          // get excluded from this process, e.g. testing accounts where we want
          // to know for sure what flow they're going to see.
          if (!forceTokenVerification(request, accountRecord)) {
            if (skipTokenVerification(request, accountRecord)) {
              needsVerificationId = false;
            }
          }

          // If they just went through the sigin-unblock flow, they have already verified their email.
          // We don't need to force them to do that again, just make a verified session.
          if (didSigninUnblock) {
            needsVerificationId = false;
          }

          // If the request wants keys , user *must* confirm their login session before they can actually
          // use it. Otherwise, they don't *have* to verify their session. All sessions are created
          // unverified because it prevents them from being used for sync.
          let mustVerifySession =
            needsVerificationId && requestHelper.wantsKeys(request);

          // For accounts with TOTP, we always force verifying a session.
          if (verificationMethod === 'totp-2fa') {
            mustVerifySession = true;
            needsVerificationId = true;
          }

          return P.resolve()
            .then(() => {
              if (!needsVerificationId) {
                return [];
              }
              return [random.hex(16), TokenCode()];
            })
            .spread((tokenVerificationId, tokenVerificationCode) => {
              const {
                browser: uaBrowser,
                browserVersion: uaBrowserVersion,
                os: uaOS,
                osVersion: uaOSVersion,
                deviceType: uaDeviceType,
                formFactor: uaFormFactor,
              } = request.app.ua;

              const sessionTokenOptions = {
                uid: accountRecord.uid,
                email: accountRecord.primaryEmail.email,
                emailCode: accountRecord.primaryEmail.emailCode,
                emailVerified: accountRecord.primaryEmail.isVerified,
                verifierSetAt: accountRecord.verifierSetAt,
                mustVerify: mustVerifySession,
                tokenVerificationId: tokenVerificationId,
                tokenVerificationCode: tokenVerificationCode,
                tokenVerificationCodeExpiresAt: Date.now() + tokenCodeLifetime,
                uaBrowser,
                uaBrowserVersion,
                uaOS,
                uaOSVersion,
                uaDeviceType,
                uaFormFactor,
              };

              return db.createSessionToken(sessionTokenOptions);
            })
            .then(result => {
              sessionToken = result;
            });
        }

        function forceTokenVerification(request, account) {
          // If there was anything suspicious about the request,
          // we should force token verification.
          if (request.app.isSuspiciousRequest) {
            return true;
          }
          // If it's an email address used for testing etc,
          // we should force token verification.
          if (config.signinConfirmation) {
            if (config.signinConfirmation.forcedEmailAddresses) {
              if (
                config.signinConfirmation.forcedEmailAddresses.test(
                  account.primaryEmail.email
                )
              ) {
                return true;
              }
            }
          }

          return false;
        }

        function skipTokenVerification(request, account) {
          // If they're logging in from an IP address on which they recently did
          // another, successfully-verified login, then we can consider this one
          // verified as well without going through the loop again.
          const allowedRecency =
            config.securityHistory.ipProfiling.allowedRecency || 0;
          if (securityEventVerified && securityEventRecency < allowedRecency) {
            log.info('Account.ipprofiling.seenAddress', {
              uid: account.uid,
            });
            return true;
          }

          // If the account was recently created, don't make the user
          // confirm sign-in for a configurable amount of time. This will reduce
          // the friction of a user adding a second device.
          const skipForNewAccounts =
            config.signinConfirmation.skipForNewAccounts;
          if (skipForNewAccounts && skipForNewAccounts.enabled) {
            const accountAge = requestNow - account.createdAt;
            if (accountAge <= skipForNewAccounts.maxAge) {
              log.info('account.signin.confirm.bypass.age', {
                uid: account.uid,
              });
              return true;
            }
          }

          // Certain accounts have the ability to *always* skip sign-in confirmation
          // regardless of account age or device. This is for internal use where we need
          // to guarantee the login experience.
          const lowerCaseEmail = account.primaryEmail.normalizedEmail.toLowerCase();
          const alwaysSkip =
            skipConfirmationForEmailAddresses &&
            skipConfirmationForEmailAddresses.includes(lowerCaseEmail);
          if (alwaysSkip) {
            log.info('account.signin.confirm.bypass.always', {
              uid: account.uid,
            });
            return true;
          }

          return false;
        }

        async function sendSigninNotifications() {
          await signinUtils.sendSigninNotifications(
            request,
            accountRecord,
            sessionToken,
            verificationMethod
          );

          // For new sync logins that don't send some other sort of email,
          // send an after-the-fact notification email so that the user
          // is aware that something happened on their account.
          if (accountRecord.primaryEmail.isVerified) {
            if (sessionToken.tokenVerified || !sessionToken.mustVerify) {
              if (requestHelper.wantsKeys(request)) {
                const geoData = request.app.geo;
                const service =
                  request.payload.service || request.query.service;
                const ip = request.app.clientAddress;
                const { deviceId, flowId, flowBeginTime } = await request.app
                  .metricsContext;

                try {
                  await mailer.sendNewDeviceLoginNotification(
                    accountRecord.emails,
                    accountRecord,
                    {
                      acceptLanguage: request.app.acceptLanguage,
                      deviceId,
                      flowId,
                      flowBeginTime,
                      ip,
                      location: geoData.location,
                      service,
                      timeZone: geoData.timeZone,
                      uaBrowser: request.app.ua.browser,
                      uaBrowserVersion: request.app.ua.browserVersion,
                      uaOS: request.app.ua.os,
                      uaOSVersion: request.app.ua.osVersion,
                      uaDeviceType: request.app.ua.deviceType,
                      uid: sessionToken.uid,
                    }
                  );
                } catch (err) {
                  // If we couldn't email them, no big deal. Log
                  // and pretend everything worked.
                  log.trace(
                    'Account.login.sendNewDeviceLoginNotification.error',
                    {
                      error: err,
                    }
                  );
                }
              }
            }
          }
        }

        function createKeyFetchToken() {
          if (requestHelper.wantsKeys(request)) {
            return signinUtils
              .createKeyFetchToken(
                request,
                accountRecord,
                password,
                sessionToken
              )
              .then(result => {
                keyFetchToken = result;
              });
          }
        }

        function createResponse() {
          const response = {
            uid: sessionToken.uid,
            sessionToken: sessionToken.data,
            authAt: sessionToken.lastAuthAt(),
          };

          if (keyFetchToken) {
            response.keyFetchToken = keyFetchToken.data;
          }

          Object.assign(
            response,
            signinUtils.getSessionVerificationStatus(
              sessionToken,
              verificationMethod
            )
          );

          return response;
        }
      },
    },
    {
      method: 'GET',
      path: '/account/status',
      options: {
        auth: {
          mode: 'optional',
          strategy: 'sessionToken',
        },
        validate: {
          query: {
            uid: isA
              .string()
              .min(32)
              .max(32)
              .regex(HEX_STRING),
          },
        },
      },
      handler: async function(request) {
        const sessionToken = request.auth.credentials;
        if (sessionToken) {
          return { exists: true, locale: sessionToken.locale };
        } else if (request.query.uid) {
          const uid = request.query.uid;
          return db.account(uid).then(
            account => {
              return { exists: true };
            },
            err => {
              if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
                return { exists: false };
              }
              throw err;
            }
          );
        } else {
          throw error.missingRequestParameter('uid');
        }
      },
    },
    {
      method: 'POST',
      path: '/account/status',
      options: {
        validate: {
          payload: {
            email: validators.email().required(),
          },
        },
        response: {
          schema: {
            exists: isA.boolean().required(),
          },
        },
      },
      handler: async function(request) {
        const email = request.payload.email;

        return customs
          .check(request, email, 'accountStatusCheck')
          .then(() => {
            return db.accountExists(email);
          })
          .then(
            exist => {
              return {
                exists: exist,
              };
            },
            err => {
              if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
                return { exists: false };
              }
              throw err;
            }
          );
      },
    },
    {
      method: 'GET',
      path: '/account/profile',
      options: {
        auth: {
          strategies: ['sessionToken', 'oauthToken'],
        },
        response: {
          schema: {
            email: isA.string().optional(),
            locale: isA
              .string()
              .optional()
              .allow(null),
            authenticationMethods: isA
              .array()
              .items(isA.string().required())
              .optional(),
            authenticatorAssuranceLevel: isA.number().min(0),
            subscriptions: isA
              .array()
              .items(isA.string().required())
              .optional(),
            profileChangedAt: isA.number().min(0),
          },
        },
      },
      handler: async function(request) {
        const auth = request.auth;
        let uid, scope, client_id;
        if (auth.strategy === 'sessionToken') {
          uid = auth.credentials.uid;
          scope = { contains: () => true };
          client_id = null;
        } else {
          uid = auth.credentials.user;
          scope = ScopeSet.fromArray(auth.credentials.scope);
          client_id = auth.credentials.client_id;
        }

        const res = {};
        const account = await db.account(uid);

        if (scope.contains('profile:email')) {
          res.email = account.primaryEmail.email;
        }
        if (scope.contains('profile:locale')) {
          res.locale = account.locale;
        }
        if (scope.contains('profile:amr')) {
          const amrValues = await authMethods.availableAuthenticationMethods(
            db,
            account
          );
          res.authenticationMethods = Array.from(amrValues);
          res.authenticatorAssuranceLevel = authMethods.maximumAssuranceLevel(
            amrValues
          );
        }

        if (
          config.subscriptions &&
          config.subscriptions.enabled &&
          scope.contains('profile:subscriptions')
        ) {
          const capabilities = await determineClientVisibleSubscriptionCapabilities(
            config,
            auth,
            db,
            uid,
            client_id
          );
          if (capabilities) {
            res.subscriptions = capabilities;
          }
        }

        // If no keys set on the response, there was no valid profile scope found. We only
        // want to return `profileChangedAt` if a valid scope was found and set.
        if (Object.keys(res).length !== 0) {
          res.profileChangedAt = account.profileChangedAt;
        }

        return res;
      },
    },
    {
      method: 'GET',
      path: '/account/keys',
      options: {
        auth: {
          strategy: 'keyFetchTokenWithVerificationStatus',
        },
        response: {
          schema: {
            bundle: isA.string().regex(HEX_STRING),
          },
        },
      },
      handler: async function accountKeys(request) {
        log.begin('Account.keys', request);
        const keyFetchToken = request.auth.credentials;

        const verified =
          keyFetchToken.tokenVerified && keyFetchToken.emailVerified;
        if (!verified) {
          // don't delete the token on use until the account is verified
          throw error.unverifiedAccount();
        }
        return db
          .deleteKeyFetchToken(keyFetchToken)
          .then(() => {
            return request.emitMetricsEvent('account.keyfetch', {
              uid: keyFetchToken.uid,
            });
          })
          .then(() => {
            return {
              bundle: keyFetchToken.keyBundle,
            };
          });
      },
    },
    {
      method: 'POST',
      path: '/account/unlock/resend_code',
      options: {
        validate: {
          payload: true,
        },
      },
      handler: async function(request) {
        log.error('Account.UnlockCodeResend', { request: request });
        throw error.gone();
      },
    },
    {
      method: 'POST',
      path: '/account/unlock/verify_code',
      options: {
        validate: {
          payload: true,
        },
      },
      handler: async function(request) {
        log.error('Account.UnlockCodeVerify', { request: request });
        throw error.gone();
      },
    },
    {
      method: 'POST',
      path: '/account/reset',
      options: {
        auth: {
          strategy: 'accountResetToken',
          payload: 'required',
        },
        validate: {
          query: {
            keys: isA.boolean().optional(),
          },
          payload: isA
            .object({
              authPW: validators.authPW,
              wrapKb: validators.wrapKb.optional(),
              recoveryKeyId: validators.recoveryKeyId.optional(),
              sessionToken: isA.boolean().optional(),
            })
            .and('wrapKb', 'recoveryKeyId'),
        },
      },
      handler: async function accountReset(request) {
        log.begin('Account.reset', request);
        const accountResetToken = request.auth.credentials;
        const authPW = request.payload.authPW;
        const hasSessionToken = request.payload.sessionToken;
        let wrapKb = request.payload.wrapKb;
        const recoveryKeyId = request.payload.recoveryKeyId;
        let account,
          sessionToken,
          keyFetchToken,
          verifyHash,
          wrapWrapKb,
          password,
          hasTotpToken = false,
          tokenVerificationId;

        return checkRecoveryKey()
          .then(checkTotpToken)
          .then(resetAccountData)
          .then(recoveryKeyDeleteAndEmailNotification)
          .then(createSessionToken)
          .then(createKeyFetchToken)
          .then(recordSecurityEvent)
          .then(createResponse);

        function checkRecoveryKey() {
          if (recoveryKeyId) {
            return db.getRecoveryKey(accountResetToken.uid, recoveryKeyId);
          }

          return P.resolve();
        }

        function checkTotpToken() {
          return totpUtils
            .hasTotpToken({ uid: accountResetToken.uid })
            .then(result => {
              hasTotpToken = result;
            });
        }

        function resetAccountData() {
          let authSalt;
          return random
            .hex(32)
            .then(hex => {
              authSalt = hex;
              password = new Password(authPW, authSalt, config.verifierVersion);
              return password.verifyHash();
            })
            .then(verifyHashData => {
              verifyHash = verifyHashData;

              return setupKb();
            })
            .then(() => {
              return db.resetAccount(accountResetToken, {
                authSalt,
                verifyHash,
                wrapWrapKb,
                verifierVersion: password.version,
              });
            })
            .then(() => {
              // Delete all passwordChangeTokens, passwordForgotTokens and
              // accountResetTokens associated with this uid
              return db.resetAccountTokens(accountResetToken.uid);
            })
            .then(() => {
              // Notify the devices that the account has changed.
              request.app.devices.then(devices =>
                push.notifyPasswordReset(accountResetToken.uid, devices)
              );

              return db
                .account(accountResetToken.uid)
                .then(accountData => (account = accountData));
            })
            .then(() => {
              return P.all([
                request.emitMetricsEvent('account.reset', {
                  uid: account.uid,
                }),
                log.notifyAttachedServices('reset', request, {
                  uid: account.uid,
                  generation: account.verifierSetAt,
                }),
                customs.reset(account.email),
              ]);
            });
        }

        function setupKb() {
          if (recoveryKeyId) {
            // We have the previous kB, just re-wrap it with the new password.
            return password.wrap(wrapKb).then(result => (wrapWrapKb = result));
          } else {
            // We need to regenerate kB and wrap it with the new password.
            return random.hex(32).then(result => {
              wrapWrapKb = result;
              return password
                .unwrap(wrapWrapKb)
                .then(result => (wrapKb = result));
            });
          }
        }

        function recoveryKeyDeleteAndEmailNotification() {
          // If the password was reset with a recovery key, then we explicitly delete the
          // recovery key and send an email that the account was reset with it.
          if (recoveryKeyId) {
            return db.deleteRecoveryKey(account.uid).then(() => {
              const geoData = request.app.geo;
              const ip = request.app.clientAddress;
              const emailOptions = {
                acceptLanguage: request.app.acceptLanguage,
                ip: ip,
                location: geoData.location,
                timeZone: geoData.timeZone,
                uaBrowser: request.app.ua.browser,
                uaBrowserVersion: request.app.ua.browserVersion,
                uaOS: request.app.ua.os,
                uaOSVersion: request.app.ua.osVersion,
                uaDeviceType: request.app.ua.deviceType,
                uid: account.uid,
              };

              return mailer.sendPasswordResetAccountRecoveryNotification(
                account.emails,
                account,
                emailOptions
              );
            });
          }

          return P.resolve();
        }

        function createSessionToken() {
          if (hasSessionToken) {
            const {
              browser: uaBrowser,
              browserVersion: uaBrowserVersion,
              os: uaOS,
              osVersion: uaOSVersion,
              deviceType: uaDeviceType,
              formFactor: uaFormFactor,
            } = request.app.ua;

            return Promise.resolve()
              .then(() => {
                // Since the only way to reach this point is clicking a
                // link from the user's email, we create a verified sessionToken
                // **unless** the user has a TOTP token.
                if (!hasTotpToken) {
                  return;
                }
                return random.hex(16);
              })
              .then(randomHex => {
                tokenVerificationId = randomHex;
                const sessionTokenOptions = {
                  uid: account.uid,
                  email: account.primaryEmail.email,
                  emailCode: account.primaryEmail.emailCode,
                  emailVerified: account.primaryEmail.isVerified,
                  verifierSetAt: account.verifierSetAt,
                  mustVerify: !!tokenVerificationId,
                  tokenVerificationId,
                  uaBrowser,
                  uaBrowserVersion,
                  uaOS,
                  uaOSVersion,
                  uaDeviceType,
                  uaFormFactor,
                };

                return db
                  .createSessionToken(sessionTokenOptions)
                  .then(result => {
                    sessionToken = result;
                    return request.propagateMetricsContext(
                      accountResetToken,
                      sessionToken
                    );
                  });
              });
          }
        }

        function createKeyFetchToken() {
          if (requestHelper.wantsKeys(request)) {
            if (!hasSessionToken) {
              // Sanity-check: any client requesting keys,
              // should also be requesting a sessionToken.
              throw error.missingRequestParameter('sessionToken');
            }
            return db
              .createKeyFetchToken({
                uid: account.uid,
                kA: account.kA,
                wrapKb: wrapKb,
                emailVerified: account.primaryEmail.isVerified,
                tokenVerificationId,
              })
              .then(result => {
                keyFetchToken = result;
                return request.propagateMetricsContext(
                  accountResetToken,
                  keyFetchToken
                );
              });
          }
        }

        function recordSecurityEvent() {
          db.securityEvent({
            name: 'account.reset',
            uid: account.uid,
            ipAddr: request.app.clientAddress,
            tokenId: sessionToken && sessionToken.id,
          });
        }

        function createResponse() {
          // If no sessionToken, this could be a legacy client
          // attempting to reset an account password, return legacy response.
          if (!hasSessionToken) {
            return {};
          }

          const response = {
            uid: sessionToken.uid,
            sessionToken: sessionToken.data,
            verified: sessionToken.emailVerified,
            authAt: sessionToken.lastAuthAt(),
          };

          if (requestHelper.wantsKeys(request)) {
            response.keyFetchToken = keyFetchToken.data;
          }

          const verificationMethod = hasTotpToken ? 'totp-2fa' : undefined;
          Object.assign(
            response,
            signinUtils.getSessionVerificationStatus(
              sessionToken,
              verificationMethod
            )
          );

          return response;
        }
      },
    },
    {
      method: 'POST',
      path: '/account/destroy',
      options: {
        auth: {
          mode: 'optional',
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            email: validators.email().required(),
            authPW: validators.authPW,
          },
        },
      },
      handler: async function accountDestroy(request) {
        log.begin('Account.destroy', request);
        const form = request.payload;
        const authPW = form.authPW;

        return customs
          .check(request, form.email, 'accountDestroy')
          .then(db.accountRecord.bind(db, form.email))
          .then(emailRecord => {
            return totpUtils.hasTotpToken(emailRecord).then(hasToken => {
              const sessionToken = request.auth && request.auth.credentials;

              // Someone tried to delete an account with TOTP but did not specify a session.
              // This shouldn't happen in practice, but just in case we throw unverified session.
              if (!sessionToken && hasToken) {
                throw error.unverifiedSession();
              }

              // If TOTP is enabled, ensure that the session has the correct assurance level before
              // deleting account.
              if (
                sessionToken &&
                hasToken &&
                (sessionToken.tokenVerificationId ||
                  sessionToken.authenticatorAssuranceLevel <= 1)
              ) {
                throw error.unverifiedSession();
              }

              // In other scenarios, fall back to the default behavior and let the user
              // delete the account
              return emailRecord;
            });
          })
          .then(
            emailRecord => {
              const uid = emailRecord.uid;
              const password = new Password(
                authPW,
                emailRecord.authSalt,
                emailRecord.verifierVersion
              );
              let devicesToNotify;

              return signinUtils
                .checkPassword(emailRecord, password, request.app.clientAddress)
                .then(async match => {
                  if (!match) {
                    throw error.incorrectPassword(
                      emailRecord.email,
                      form.email
                    );
                  }

                  if (config.subscriptions && config.subscriptions.enabled) {
                    // TODO: We should probably delete the upstream customer for
                    // subscriptions, but no such API exists in subhub yet.
                    // https://github.com/mozilla/subhub/issues/61

                    // Cancel all subscriptions before deletion, if any exist
                    // Subscription records will be deleted from DB as part of account
                    // deletion, but we have to trigger cancellation in payment systems
                    const uid = emailRecord.uid;
                    const subscriptions =
                      (await db.fetchAccountSubscriptions(uid)) || [];
                    for (const subscription of subscriptions) {
                      const { subscriptionId } = subscription;
                      await subhub.cancelSubscription(uid, subscriptionId);
                    }
                  }

                  // We fetch the devices to notify before deleteAccount()
                  // because obviously we can't retrieve the devices list after!
                  return db.devices(uid);
                })
                .then(devices => {
                  devicesToNotify = devices;
                  return db
                    .deleteAccount(emailRecord)
                    .then(() =>
                      log.info('accountDeleted.byRequest', { ...emailRecord })
                    );
                })
                .then(() => {
                  push
                    .notifyAccountDestroyed(uid, devicesToNotify)
                    .catch(() => {
                      // Ignore notification errors since this account no longer exists
                    });

                  return P.all([
                    log.notifyAttachedServices('delete', request, {
                      uid,
                    }),
                    request.emitMetricsEvent('account.deleted', { uid }),
                  ]);
                });
            },
            err => {
              if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
                customs.flag(request.app.clientAddress, {
                  email: form.email,
                  errno: err.errno,
                });
              }
              throw err;
            }
          );
      },
    },
  ];

  if (config.isProduction) {
    delete routes[0].options.validate.payload.preVerified;
  } else {
    // programmatic account lockout was only available in
    // non-production mode.
    routes.push({
      method: 'POST',
      path: '/account/lock',
      options: {
        validate: {
          payload: true,
        },
      },
      handler: async function(request) {
        log.error('Account.lock', { request: request });
        throw error.gone();
      },
    });
  }

  return routes;
};
