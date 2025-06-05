/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Request } from '@hapi/hapi';
import * as isA from 'joi';

import {
  RecoveryPhoneService,
  RecoveryPhoneNotEnabled,
  RecoveryNumberNotSupportedError,
  RecoveryNumberInvalidFormatError,
  RecoveryNumberAlreadyExistsError,
  RecoveryNumberNotExistsError,
  SmsSendRateLimitExceededError,
  RecoveryNumberRemoveMissingBackupCodes,
  RecoveryPhoneRegistrationLimitReached,
  TwilioMessageStatus,
} from '@fxa/accounts/recovery-phone';
import {
  AccountManager,
  VerificationMethods,
} from '@fxa/shared/account/account';
import { GleanMetricsType } from '../metrics/glean';
import {
  AuthCredential,
  AuthRequest,
  SessionTokenAuthCredential,
} from '../types';
import { E164_NUMBER } from './validators';
import AppError from '../error';
import Localizer from '../l10n';
import NodeRendererBindings from '../senders/renderer/bindings-node';
import { AccountEventsManager } from '../account-events';
import { recordSecurityEvent } from './utils/security-event';

import { Container } from 'typedi';
import { ConfigType } from '../../config';
import { PasswordForgotToken } from 'fxa-shared/db/models/auth';

enum RecoveryPhoneStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export type Customs = {
  check: (req: AuthRequest, email: string, action: string) => Promise<void>;
  checkAuthenticated: (
    req: AuthRequest,
    uid: string,
    email: string,
    action: string
  ) => Promise<void>;
};

const l10nTypeMap = {
  setup: {
    id: 'recovery-phone-setup-sms-body',
    fallbackMessage:
      '${code} is your Mozilla verification code. Expires in 5 minutes.',
  },
  'setup-short': {
    id: 'recovery-phone-setup-sms-short-body',
    fallbackMessage: 'Mozilla verification code: ${code}',
  },
  signin: {
    id: 'recovery-phone-signin-sms-body',
    fallbackMessage:
      '${code} is your Mozilla recovery code. Expires in 5 minutes.',
  },
  'signin-short': {
    id: 'recovery-phone-signin-sms-short-body',
    fallbackMessage: 'Mozilla code: ${code}',
  },
  'reset-password': {
    id: 'recovery-phone-reset-password-sms-body',
    fallbackMessage:
      '${code} is your Mozilla recovery code. Expires in 5 minutes.',
  },
  'reset-password-short': {
    id: 'recovery-phone-reset-password-sms-short-body',
    fallbackMessage: 'Mozilla code: ${code}',
  },
};

class RecoveryPhoneHandler {
  private readonly recoveryPhoneService: RecoveryPhoneService;
  private readonly accountManager: AccountManager;
  private readonly accountEventsManager: AccountEventsManager;
  private readonly localizer: Localizer;

  constructor(
    private readonly customs: Customs,
    private readonly db: any,
    private readonly glean: GleanMetricsType,
    private readonly log: any,
    private readonly mailer: any,
    private readonly statsd: any
  ) {
    this.recoveryPhoneService = Container.get(RecoveryPhoneService);
    this.accountManager = Container.get(AccountManager);
    this.accountEventsManager = Container.get(AccountEventsManager);
    this.localizer = new Localizer(new NodeRendererBindings());
  }

  getLocalizedMessage = async (
    request: AuthRequest,
    code: string,
    type: keyof typeof l10nTypeMap
  ) => {
    const l10n = l10nTypeMap[type];
    const localizedStrings = await this.localizer.localizeStrings(
      request.app.locale,
      [
        {
          id: l10n.id,
          message: l10n.fallbackMessage,
          vars: { code },
        },
      ]
    );
    return localizedStrings[l10n.id];
  };

  async sendSigninCode(request: AuthRequest) {
    const { uid, email } = request.auth
      .credentials as SessionTokenAuthCredential;

    if (!email) {
      throw AppError.invalidToken();
    }

    await this.customs.checkAuthenticated(
      request,
      uid,
      email,
      'recoveryPhoneSendSigninCode'
    );

    const getFormattedMessage = async (code: string) => {
      const localizedMessage = await this.getLocalizedMessage(
        request,
        code,
        'signin'
      );
      const shortLocalizedMessage = await this.getLocalizedMessage(
        request,
        code,
        'signin-short'
      );
      return {
        msg: localizedMessage,
        shortMsg: shortLocalizedMessage,
        failsafeMsg: `Mozilla: ${code}`,
      };
    };

    let success = false;
    try {
      success = await this.recoveryPhoneService.sendCode(
        uid,
        getFormattedMessage
      );
    } catch (error) {
      if (error instanceof RecoveryNumberNotExistsError) {
        throw AppError.recoveryPhoneNumberDoesNotExist();
      }

      if (error instanceof SmsSendRateLimitExceededError) {
        throw AppError.smsSendRateLimitExceeded();
      }

      if (error instanceof RecoveryPhoneNotEnabled) {
        throw AppError.featureNotEnabled();
      }

      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'sendSigninCode',
        { uid },
        error
      );
    }

    if (success) {
      this.statsd.increment('account.recoveryPhone.signinSendCode.success');
      await this.glean.twoStepAuthPhoneCode.sent(request);

      recordSecurityEvent('account.recovery_phone_send_code', {
        db: this.db,
        request,
      });

      return { status: RecoveryPhoneStatus.SUCCESS };
    }

    await this.glean.twoStepAuthPhoneCode.sendError(request);
    return { status: RecoveryPhoneStatus.FAILURE };
  }

  async sendResetPasswordCode(request: AuthRequest) {
    const { uid, email } = request.auth.credentials as PasswordForgotToken;

    if (!email) {
      throw AppError.invalidToken();
    }

    await this.customs.checkAuthenticated(
      request,
      uid,
      email,
      'recoveryPhoneSendResetPasswordCode'
    );

    const getFormattedMessage = async (code: string) => {
      const localizedMessage = await this.getLocalizedMessage(
        request,
        code,
        'reset-password'
      );
      const shortLocalizedMessage = await this.getLocalizedMessage(
        request,
        code,
        'reset-password-short'
      );
      return {
        msg: localizedMessage,
        shortMsg: shortLocalizedMessage,
        failsafeMsg: `Mozilla: ${code}`,
      };
    };

    let success = false;
    try {
      success = await this.recoveryPhoneService.sendCode(
        uid,
        getFormattedMessage
      );
    } catch (error) {
      if (error instanceof RecoveryNumberNotExistsError) {
        throw AppError.recoveryPhoneNumberDoesNotExist();
      }

      if (error instanceof SmsSendRateLimitExceededError) {
        throw AppError.smsSendRateLimitExceeded();
      }

      if (error instanceof RecoveryPhoneNotEnabled) {
        throw AppError.featureNotEnabled();
      }

      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'sendResetPasswordCode',
        { uid },
        error
      );
    }

    if (success) {
      this.statsd.increment(
        'account.recoveryPhone.resetPasswordSendCode.success'
      );

      this.glean.resetPassword.recoveryPhoneCodeSent(request);

      recordSecurityEvent('account.recovery_phone_send_code', {
        db: this.db,
        request,
      });

      return { status: RecoveryPhoneStatus.SUCCESS };
    }

    this.glean.resetPassword.recoveryPhoneCodeSendError(request);

    return { status: RecoveryPhoneStatus.FAILURE };
  }

  async setupPhoneNumber(request: AuthRequest) {
    const { uid, email } = request.auth
      .credentials as SessionTokenAuthCredential;

    const { phoneNumber } = request.payload as unknown as {
      phoneNumber: string;
    };

    if (!email) {
      throw AppError.invalidToken();
    }

    await this.customs.checkAuthenticated(
      request,
      uid,
      email,
      'recoveryPhoneSendSetupCode'
    );

    const getFormattedMessages = async (code: string) => {
      const msg = await this.getLocalizedMessage(request, code, 'setup');
      const shortMsg = await this.getLocalizedMessage(
        request,
        code,
        'setup-short'
      );
      const failsafeMsg = `Mozilla: ${code}`;
      return {
        msg,
        shortMsg,
        failsafeMsg,
      };
    };

    let success = false;
    try {
      success = await this.recoveryPhoneService.setupPhoneNumber(
        uid,
        phoneNumber,
        getFormattedMessages
      );
      if (success) {
        this.statsd.increment('account.recoveryPhone.setupPhoneNumber.success');
        recordSecurityEvent('account.recovery_phone_send_code', {
          db: this.db,
          request,
        });
        await this.glean.twoStepAuthPhoneCode.sent(request);

        let nationalFormat: string | null = null;
        try {
          nationalFormat =
            await this.recoveryPhoneService.getNationalFormat(phoneNumber);
        } catch (e) {
          // This should not fail since the number was already validated with Twilio so
          // if it does it's a network problem - just return a null value and don't error out.
        }

        return { status: RecoveryPhoneStatus.SUCCESS, nationalFormat };
      }
      await this.glean.twoStepAuthPhoneCode.sendError(request);
      return { status: RecoveryPhoneStatus.FAILURE };
    } catch (error) {
      if (error instanceof RecoveryPhoneNotEnabled) {
        throw AppError.featureNotEnabled();
      }

      await this.glean.twoStepAuthPhoneCode.sendError(request);

      if (
        error instanceof RecoveryNumberInvalidFormatError ||
        error instanceof RecoveryNumberNotSupportedError ||
        error instanceof RecoveryNumberAlreadyExistsError
      ) {
        throw AppError.invalidPhoneNumber();
      }

      if (error instanceof SmsSendRateLimitExceededError) {
        throw AppError.smsSendRateLimitExceeded();
      }

      if (error instanceof RecoveryPhoneRegistrationLimitReached) {
        throw AppError.recoveryPhoneRegistrationLimitReached();
      }

      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'setupPhoneNumber',
        { uid },
        error
      );
    }
  }

  async confirmSigninCode(request: AuthRequest, isSetup: boolean) {
    const {
      id: sessionTokenId,
      uid,
      email,
    } = request.auth.credentials as SessionTokenAuthCredential;

    const { code } = request.payload as unknown as {
      code: string;
    };

    if (!email) {
      throw AppError.invalidToken();
    }

    await this.customs.checkAuthenticated(
      request,
      uid,
      email,
      'verifyRecoveryPhoneTotpCode'
    );

    let success = false;
    try {
      if (isSetup) {
        // This is the initial setup case, where a user is validating an sms
        // code on their phone for the first time. It does NOT impact the totp
        // token's database state.
        success = await this.recoveryPhoneService.confirmSetupCode(uid, code);
      } else {
        // This is a sign in attempt. This will check the code, and if valid, mark the
        // session token verified. This session will have a security level that allows
        // the user to remove totp devices.
        success = await this.recoveryPhoneService.confirmCode(uid, code);

        // Mark session as verified
        if (success) {
          await this.accountManager.verifySession(
            uid,
            sessionTokenId,
            VerificationMethods.sms2fa
          );
        }
      }
    } catch (error) {
      if (error instanceof RecoveryPhoneNotEnabled) {
        throw AppError.featureNotEnabled();
      }

      if (error instanceof RecoveryNumberAlreadyExistsError) {
        throw AppError.recoveryPhoneNumberAlreadyExists();
      }

      if (error instanceof RecoveryPhoneRegistrationLimitReached) {
        throw AppError.recoveryPhoneRegistrationLimitReached();
      }

      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'confirmCode',
        { uid },
        error
      );
    }

    if (success) {
      await this.glean.twoStepAuthPhoneCode.complete(request);

      const account = await this.db.account(uid);
      const { acceptLanguage, geo, ua } = request.app;

      if (isSetup) {
        this.statsd.increment('account.recoveryPhone.phoneAdded.success');

        try {
          const { phoneNumber, nationalFormat } =
            // User has successfully set up a recovery phone. Give back the
            // full nationalFormat (don't strip it).
            await this.recoveryPhoneService.hasConfirmed(uid);
          await this.mailer.sendPostAddRecoveryPhoneEmail(
            account.emails,
            account,
            {
              acceptLanguage,
              maskedLastFourPhoneNumber: `••••••${this.recoveryPhoneService.stripPhoneNumber(
                phoneNumber || '',
                4
              )}`,
              timeZone: geo.timeZone,
              uaBrowser: ua.browser,
              uaBrowserVersion: ua.browserVersion,
              uaOS: ua.os,
              uaOSVersion: ua.osVersion,
              uaDeviceType: ua.deviceType,
              uid,
            }
          );

          recordSecurityEvent('account.recovery_phone_setup_complete', {
            db: this.db,
            request,
          });

          return {
            phoneNumber,
            nationalFormat,
            status: RecoveryPhoneStatus.SUCCESS,
          };
        } catch (error) {
          // log email send error but don't throw
          // user should be allowed to proceed

          this.log.trace('account.recoveryPhone.phoneAddedNotification.error', {
            error,
          });
        }
      } else {
        this.statsd.increment('account.recoveryPhone.phoneSignin.success');
        // this signals the end of the login flow
        await request.emitMetricsEvent('account.confirmed', { uid });

        recordSecurityEvent('account.recovery_phone_signin_complete', {
          db: this.db,
          request,
        });

        try {
          await this.mailer.sendPostSigninRecoveryPhoneEmail(
            account.emails,
            account,
            {
              acceptLanguage,
              timeZone: geo.timeZone,
              uaBrowser: ua.browser,
              uaBrowserVersion: ua.browserVersion,
              uaOS: ua.os,
              uaOSVersion: ua.osVersion,
              uaDeviceType: ua.deviceType,
              uid,
            }
          );
        } catch (error) {
          // log email send error but don't throw
          // user should be allowed to proceed
          this.log.trace(
            'account.recoveryPhone.phoneSigninNotification.error',
            {
              error,
            }
          );
        }
      }

      return { status: RecoveryPhoneStatus.SUCCESS };
    }

    recordSecurityEvent('account.recovery_phone_signin_failed', {
      db: this.db,
      request,
    });

    throw AppError.invalidOrExpiredOtpCode();
  }

  async changePhoneNumber(request: AuthRequest) {
    // need to check first that there is an existing phone number
    const { uid } = request.auth.credentials as SessionTokenAuthCredential;

    const { code } = request.payload as unknown as {
      code: string;
    };

    // check if user has a confirmed recovery phone number
    const { exists } = await this.recoveryPhoneService.hasConfirmed(uid);

    if (!exists) {
      throw AppError.recoveryPhoneNumberDoesNotExist();
    }

    // check their code is valid before moving on. Code is
    // not removed until the replace is successful.
    const codeIsValid = await this.recoveryPhoneService.validateSetupCode(
      uid,
      code
    );

    if (!codeIsValid) {
      throw AppError.invalidOrExpiredOtpCode();
    }

    // replace the existing phone number with the new one associated with the code.
    let replacedSuccess = false;
    try {
      replacedSuccess = await this.recoveryPhoneService.changePhoneNumber(
        uid,
        code
      );
    } catch (error) {
      if (error instanceof RecoveryPhoneNotEnabled) {
        throw AppError.featureNotEnabled();
      } else if (error instanceof RecoveryNumberNotExistsError) {
        throw AppError.recoveryPhoneNumberDoesNotExist();
      } else if (error instanceof RecoveryNumberAlreadyExistsError) {
        throw AppError.recoveryPhoneNumberAlreadyExists();
      } else {
        throw AppError.backendServiceFailure(
          'RecoveryPhoneService',
          'confirmCode',
          { uid },
          error
        );
      }
    }

    if (!replacedSuccess) {
      await this.glean.twoStepAuthPhoneReplace.failure(request);
      this.statsd.increment('account.recoveryPhone.changePhoneNumber.failure');
      recordSecurityEvent('account.recovery_phone_replace_failed', {
        db: this.db,
        request,
      });
      return {
        status: RecoveryPhoneStatus.FAILURE,
      };
    }

    await this.glean.twoStepAuthPhoneReplace.success(request);
    this.statsd.increment('account.recoveryPhone.changePhoneNumber.success');

    const { phoneNumber, nationalFormat } =
      await this.recoveryPhoneService.hasConfirmed(uid);
    const { acceptLanguage, geo, ua } = request.app;
    const account = await this.db.account(uid);

    try {
      await this.mailer.postChangeRecoveryPhoneEmail(account.emails, account, {
        acceptLanguage,
        timeZone: geo.timeZone,
        uaBrowser: ua.browser,
        uaBrowserVersion: ua.browserVersion,
        uaOS: ua.os,
        uaOSVersion: ua.osVersion,
        uaDeviceType: ua.deviceType,
        uid,
      });

      recordSecurityEvent('account.recovery_phone_replace_complete', {
        db: this.db,
        request,
      });
    } catch (error) {
      // log error, but don't throw
      // user should be allowed to proceed if email or security event fails
      this.log.trace('account.recoveryPhone.phoneReplacedNotification.error', {
        error,
      });
    }

    return {
      phoneNumber,
      nationalFormat,
      status: RecoveryPhoneStatus.SUCCESS,
    };
  }

  async confirmResetPasswordCode(request: AuthRequest) {
    const { id, uid, email } = request.auth.credentials as unknown as {
      id: string;
      uid: string;
      email: string;
    };

    const { code } = request.payload as unknown as {
      code: string;
    };

    if (!email) {
      throw AppError.invalidToken();
    }

    await this.customs.checkAuthenticated(
      request,
      uid,
      email,
      'verifyRecoveryPhoneTotpCode'
    );

    let success = false;
    try {
      success = await this.recoveryPhoneService.confirmCode(uid, code);
    } catch (error) {
      if (error instanceof RecoveryPhoneNotEnabled) {
        throw AppError.featureNotEnabled();
      }

      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'confirmCode',
        { uid },
        error
      );
    }

    if (success) {
      await this.db.verifyPasswordForgotTokenWithMethod(id, 'totp-2fa');

      await this.glean.resetPassword.recoveryPhoneCodeComplete(request);

      this.statsd.increment('account.resetPassword.recoveryPhone.success');

      recordSecurityEvent('account.recovery_phone_reset_password_complete', {
        db: this.db,
        request,
      });

      const account = await this.db.account(uid);
      const { acceptLanguage, geo, ua } = request.app;

      try {
        await this.mailer.sendPasswordResetRecoveryPhoneEmail(
          account.emails,
          account,
          {
            acceptLanguage,
            timeZone: geo.timeZone,
            uaBrowser: ua.browser,
            uaBrowserVersion: ua.browserVersion,
            uaOS: ua.os,
            uaOSVersion: ua.osVersion,
            uaDeviceType: ua.deviceType,
            uid,
          }
        );
      } catch (error) {
        this.log.error(
          'account.recoveryPhone.phonePasswordResetNotification.error',
          {
            error,
          }
        );
      }

      return { status: RecoveryPhoneStatus.SUCCESS };
    }

    recordSecurityEvent('account.recovery_phone_reset_password_failed', {
      db: this.db,
      request,
    });

    throw AppError.invalidOrExpiredOtpCode();
  }

  async destroy(request: AuthRequest) {
    const sessionToken = request.auth.credentials as SessionTokenAuthCredential;
    const { uid } = sessionToken;

    let success = false;
    try {
      success = await this.recoveryPhoneService.removePhoneNumber(uid);
    } catch (error) {
      if (error instanceof RecoveryNumberNotExistsError) {
        throw AppError.recoveryPhoneNumberDoesNotExist();
      }

      if (error instanceof RecoveryNumberRemoveMissingBackupCodes) {
        throw AppError.recoveryPhoneRemoveMissingRecoveryCodes();
      }

      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'destroy',
        { uid },
        error
      );
    }

    if (success) {
      this.statsd.increment('account.recoveryPhone.phoneRemoved.success');
      await this.glean.twoStepAuthPhoneRemove.success(request);

      const account = await this.db.account(uid);
      const { acceptLanguage, geo, ua } = request.app;

      try {
        recordSecurityEvent('account.recovery_phone_removed', {
          db: this.db,
          request,
          account,
        });

        await this.mailer.sendPostRemoveRecoveryPhoneEmail(
          account.emails,
          account,
          {
            acceptLanguage,
            timeZone: geo.timeZone,
            uaBrowser: ua.browser,
            uaBrowserVersion: ua.browserVersion,
            uaOS: ua.os,
            uaOSVersion: ua.osVersion,
            uaDeviceType: ua.deviceType,
            uid,
          }
        );
      } catch (error) {
        // log email send error but don't throw
        // user should be allowed to proceed
        this.log.trace('account.recoveryPhone.phoneRemovedNotification.error', {
          error,
        });
      }
    }

    return {};
  }

  /**
   * Check if a user can setup phone number, ie in correct region and does
   * not already have a confirmed phone number.
   *
   * @param request
   */
  async available(request: AuthRequest) {
    const { uid, email } = request.auth
      .credentials as unknown as SessionTokenAuthCredential;

    if (!email || !uid) {
      throw AppError.invalidToken();
    }

    // Maxmind countryCode is two-letter ISO country code (ex `US` for the United States)
    // This is the same format as the `region` field in the recovery phone config
    const location = request.app.geo?.location;

    if (!location || !location.countryCode) {
      return {
        available: false,
      };
    }

    try {
      const available = await this.recoveryPhoneService.available(
        uid,
        location.countryCode
      );

      return {
        available,
      };
    } catch (error) {
      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'available',
        { uid },
        error
      );
    }
  }

  async exists(request: AuthRequest) {
    // To ensure no data is leaked, we will never expose the full phone number, if
    // the session is not verified. e.g. The user has entered the correct password,
    // but failed to provide 2FA.
    const shouldStripNumber = (() => {
      if (request.auth.strategy === 'multiStrategySessionToken') {
        const { emailVerified, mustVerify, tokenVerified } = request.auth
          .credentials as SessionTokenAuthCredential;
        return !emailVerified || (mustVerify && !tokenVerified);
      }
      return true;
    })();

    const phoneNumberStrip = shouldStripNumber ? 4 : undefined;
    const { uid } = request.auth.credentials as AuthCredential;

    try {
      return await this.recoveryPhoneService.hasConfirmed(
        uid,
        phoneNumberStrip
      );
    } catch (error) {
      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'exists',
        { uid },
        error
      );
    }
  }

  /**
   * Validates if the request is a legitimate request from Twilio. Throws an unauthorized
   * error if validation fails.
   *
   * Important notes!
   *
   * 1. We are doing this inline, because it could require the request payload and
   *    this is not available during the authentication lifecycle without jumping
   *    through some weird hoops.
   *
   * 2. We have two ways of validating requests. The first way is by using a signature
   *    we generate. This will be used when twilio is configured with api keys and the
   *    authToken isn't used, which is considered best practice. The downside to this
   *    approach is that while we can validate the incoming call was signed by us, we
   *    can't validate the message body. There is a very unlikely chance that a man in
   *    the middle attack on TLS could result in a bogus payload state. We aren't doing
   *    anything critical with message status updates, so this is probably good enough.
   *
   * 3. The second way of authenticating is the default twilio approach. Unfortunately
   *    this requires the authToken to be known and we don't to set this in the env.
   *    If at some point, validating the request payload becomes super important, we
   *    might consider this approach, despite the authToken requirement.
   *
   * @param request A typical hapi request.
   */
  validateWebhookCall(request: Request) {
    const fxaSignature = request.query?.fxaSignature;
    const fxaMessage = request.query?.fxaMessage;
    const twilioSignature = request.headers['X-Twilio-Signature'];
    const twilioPayload = request.payload;

    this.log?.debug('validateWebhookCall', {
      fxaSignature,
      fxaMessage,
      twilioSignature,
      twilioPayload,
    });

    let valid = false;
    if (fxaSignature && fxaMessage) {
      valid = this.recoveryPhoneService.validateTwilioWebhookCallback({
        fxa: {
          signature: fxaSignature,
          message: fxaMessage,
        },
      });
    } else if (twilioSignature && typeof twilioPayload === 'object') {
      valid = this.recoveryPhoneService.validateTwilioWebhookCallback({
        twilio: {
          signature: twilioSignature,
          params: twilioPayload,
        },
      });
    }

    this.log?.debug('validateWebhookCall', {
      valid,
    });

    if (valid) {
      this.statsd.increment('account.recoveryPhone.validateWebhookCall.valid');
    } else {
      this.statsd.increment(
        'account.recoveryPhone.validateWebhookCall.invalid'
      );
      throw AppError.unauthorized(`Signature Invalid`);
    }
  }

  /**
   * Takes a request, and processes the message status provided by twilio.
   * @param request An incoming web request from Twilio with a message status update.
   * @returns true assuming no errors processing the message.
   */
  async messageStatus(request: Request) {
    this.validateWebhookCall(request);

    // We can now continue.
    await this.recoveryPhoneService.onMessageStatusUpdate(
      request.payload as TwilioMessageStatus
    );
    return true;
  }
}

export const recoveryPhoneRoutes = (
  customs: Customs,
  db: any,
  glean: GleanMetricsType,
  log: any,
  mailer: any,
  statsd: any,
  config: ConfigType
) => {
  const featureEnabledCheck = () => {
    if (!config.recoveryPhone.enabled) {
      throw AppError.featureNotEnabled();
    }
    return true;
  };
  const recoveryPhoneHandler = new RecoveryPhoneHandler(
    customs,
    db,
    glean,
    log,
    mailer,
    statsd
  );
  const routes = [
    {
      method: 'POST',
      path: '/recovery_phone/create',
      options: {
        pre: [{ method: featureEnabledCheck }],
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: isA.object({
            phoneNumber: isA.string().regex(E164_NUMBER).required(),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneStartSetup', request);
        return recoveryPhoneHandler.setupPhoneNumber(request);
      },
    },
    {
      method: 'POST',
      path: '/recovery_phone/available',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneAvailable', request);
        return recoveryPhoneHandler.available(request);
      },
    },
    {
      method: 'POST',
      path: '/recovery_phone/confirm',
      options: {
        pre: [{ method: featureEnabledCheck }],
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: isA.object({
            code: isA.string().min(6).max(8),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneConfirmSetup', request);
        return recoveryPhoneHandler.confirmSigninCode(request, true);
      },
    },
    {
      method: 'POST',
      path: '/recovery_phone/change',
      options: {
        pre: [{ method: featureEnabledCheck }],
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: isA.object({
            code: isA.string().min(6).max(8),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneChange', request);
        return recoveryPhoneHandler.changePhoneNumber(request);
      },
    },
    {
      method: 'POST',
      path: '/recovery_phone/signin/send_code',
      options: {
        pre: [{ method: featureEnabledCheck }],
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneSigninSendCode', request);
        return recoveryPhoneHandler.sendSigninCode(request);
      },
    },
    {
      method: 'POST',
      path: '/recovery_phone/signin/confirm',
      options: {
        pre: [{ method: featureEnabledCheck }],
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneSigninConfirmCode', request);
        return recoveryPhoneHandler.confirmSigninCode(request, false);
      },
    },
    {
      method: 'POST',
      path: '/recovery_phone/reset_password/send_code',
      options: {
        pre: [{ method: featureEnabledCheck }],
        auth: {
          strategy: 'passwordForgotToken',
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneResetPasswordSendCode', request);
        return recoveryPhoneHandler.sendResetPasswordCode(request);
      },
    },
    {
      method: 'POST',
      path: '/recovery_phone/reset_password/confirm',
      options: {
        pre: [{ method: featureEnabledCheck }],
        auth: {
          strategy: 'passwordForgotToken',
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneResetPasswordConfirmCode', request);
        return recoveryPhoneHandler.confirmResetPasswordCode(request);
      },
    },
    {
      method: 'DELETE',
      path: '/recovery_phone',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneRemove', request);
        return recoveryPhoneHandler.destroy(request);
      },
    },
    {
      method: 'GET',
      path: '/recovery_phone',
      options: {
        auth: {
          strategies: [
            'multiStrategySessionToken',
            'multiStrategyPasswordForgotToken',
          ],
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneInfo', request);
        return recoveryPhoneHandler.exists(request);
      },
    },
    {
      method: 'POST',
      path: '/recovery_phone/message_status',
      options: {
        payload: {
          parse: true,
          allow: 'application/x-www-form-urlencoded',
        },
      },
      handler: function (request: Request) {
        return recoveryPhoneHandler.messageStatus(request);
      },
    },
  ];

  return routes;
};
