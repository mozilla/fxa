/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  RecoveryPhoneService,
  RecoveryPhoneNotEnabled,
  RecoveryNumberNotSupportedError,
  RecoveryNumberInvalidFormatError,
  RecoveryNumberAlreadyExistsError,
  RecoveryNumberNotExistsError,
  SmsSendRateLimitExceededError,
  RecoveryNumberRemoveMissingBackupCodes,
} from '@fxa/accounts/recovery-phone';
import {
  AccountManager,
  VerificationMethods,
} from '@fxa/shared/account/account';
import * as isA from 'joi';
import { GleanMetricsType } from '../metrics/glean';
import { AuthRequest, SessionTokenAuthCredential } from '../types';
import { E164_NUMBER } from './validators';
import AppError from '../error';
import Localizer from '../l10n';
import NodeRendererBindings from '../senders/renderer/bindings-node';

const { Container } = require('typedi');

enum RecoveryPhoneStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export type Customs = {
  check: (req: AuthRequest, email: string, action: string) => Promise<void>;
  checkAuthenticated: (
    req: AuthRequest,
    uid: string,
    action: string
  ) => Promise<void>;
};

class RecoveryPhoneHandler {
  private readonly recoveryPhoneService: RecoveryPhoneService;
  private readonly accountManager: AccountManager;
  private readonly localizer: Localizer;

  constructor(
    private readonly customs: Customs,
    private readonly db: any,
    private readonly glean: GleanMetricsType,
    private readonly log: any,
    private readonly mailer: any
  ) {
    this.recoveryPhoneService = Container.get(RecoveryPhoneService);
    this.accountManager = Container.get(AccountManager);
    this.localizer = new Localizer(new NodeRendererBindings());
  }

  getLocalizedMessage = async (
    request: AuthRequest,
    code: string,
    type: 'setup' | 'signin'
  ) => {
    const id =
      type === 'setup'
        ? 'recovery-phone-setup-sms-body'
        : 'recovery-phone-signin-sms-body';

    const fallbackMessage =
      type === 'setup'
        ? `${code} is your Mozilla verification code. Expires in 5 minutes.`
        : `${code} is your Mozilla recovery code. Expires in 5 minutes.`;

    const localizedStrings = await this.localizer.localizeStrings(
      request.app.locale,
      [
        {
          id,
          message: fallbackMessage,
          vars: { code },
        },
      ]
    );
    return localizedStrings[id];
  };

  async sendCode(request: AuthRequest) {
    const { uid, email } = request.auth
      .credentials as SessionTokenAuthCredential;

    if (!email) {
      throw AppError.invalidToken();
    }

    await this.customs.check(request, email, 'recoveryPhoneSendCode');

    const getFormattedMessage = async (code: string) => {
      const localizedMessage = await this.getLocalizedMessage(
        request,
        code,
        'signin'
      );
      return localizedMessage;
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
        'sendCode',
        { uid },
        error
      );
    }

    if (success) {
      this.log.info('account.recoveryPhone.signinSendCode.success', { uid });
      await this.glean.twoStepAuthPhoneCode.sent(request);
      return { status: RecoveryPhoneStatus.SUCCESS };
    }

    await this.glean.twoStepAuthPhoneCode.sendError(request);
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
    await this.customs.checkAuthenticated(request, uid, 'recoveryPhoneCreate');

    const getFormattedMessage = async (code: string) => {
      const localizedMessage = await this.getLocalizedMessage(
        request,
        code,
        'setup'
      );
      return localizedMessage;
    };

    let success = false;
    try {
      success = await this.recoveryPhoneService.setupPhoneNumber(
        uid,
        phoneNumber,
        getFormattedMessage
      );
      if (success) {
        this.log.info('account.recoveryPhone.setupPhoneNumber.success', {
          uid,
        });
        await this.glean.twoStepAuthPhoneCode.sent(request);

        let nationalFormat: string | null = null;
        try {
          nationalFormat = await this.recoveryPhoneService.getNationalFormat(
            phoneNumber
          );
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

      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'setupPhoneNumber',
        { uid },
        error
      );
    }
  }

  async confirmCode(request: AuthRequest, isSetup: boolean) {
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
      'recoveryPhoneConfirmCode'
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
        success = await this.recoveryPhoneService.confirmSigninCode(uid, code);

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
        this.log.info('account.recoveryPhone.phoneAdded.success', { uid });

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
        this.log.info('account.recoveryPhone.phoneSignin.success', { uid });

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

    throw AppError.invalidOrExpiredOtpCode();
  }

  async destroy(request: AuthRequest) {
    const { uid } = request.auth.credentials as unknown as { uid: string };

    let success = false;
    try {
      success = await this.recoveryPhoneService.removePhoneNumber(uid);
    } catch (error) {
      if (error instanceof RecoveryPhoneNotEnabled) {
        throw AppError.featureNotEnabled();
      }

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
      this.log.info('account.recoveryPhone.phoneRemoved.success', { uid });
      await this.glean.twoStepAuthPhoneRemove.success(request);

      const account = await this.db.account(uid);
      const { acceptLanguage, geo, ua } = request.app;

      try {
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
    const { uid, emailVerified, mustVerify, tokenVerified } = request.auth
      .credentials as SessionTokenAuthCredential;

    // To ensure no data is leaked, we will never expose the full phone number, if
    // the session is not verified. e.g. The user has entered the correct password,
    // but failed to provide 2FA.
    const phoneNumberStrip =
      !emailVerified || (mustVerify && !tokenVerified) ? 4 : undefined;

    try {
      return await this.recoveryPhoneService.hasConfirmed(
        uid,
        phoneNumberStrip
      );
    } catch (error) {
      if (error instanceof RecoveryPhoneNotEnabled) {
        throw AppError.featureNotEnabled();
      }

      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'destroy',
        { uid },
        error
      );
    }
  }
}

export const recoveryPhoneRoutes = (
  customs: Customs,
  db: any,
  glean: GleanMetricsType,
  log: any,
  mailer: any
) => {
  const recoveryPhoneHandler = new RecoveryPhoneHandler(
    customs,
    db,
    glean,
    log,
    mailer
  );
  const routes = [
    {
      method: 'POST',
      path: '/recovery_phone/create',
      options: {
        auth: {
          strategies: ['sessionToken'],
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
          strategies: ['sessionToken'],
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
        auth: {
          strategies: ['sessionToken'],
        },
        validate: {
          payload: isA.object({
            code: isA.string().min(6).max(8),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneConfirmSetup', request);
        return recoveryPhoneHandler.confirmCode(request, true);
      },
    },
    {
      method: 'POST',
      path: '/recovery_phone/signin/send_code',
      options: {
        auth: {
          strategies: ['sessionToken'],
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneSigninSendCode', request);
        return recoveryPhoneHandler.sendCode(request);
      },
    },
    {
      method: 'POST',
      path: '/recovery_phone/signin/confirm',
      options: {
        auth: {
          strategies: ['sessionToken'],
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneSigninConfirmCode', request);
        return recoveryPhoneHandler.confirmCode(request, false);
      },
    },
    {
      method: 'DELETE',
      path: '/recovery_phone',
      options: {
        auth: {
          strategies: ['sessionToken'],
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
          strategy: 'sessionToken',
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('recoveryPhoneInfo', request);
        return recoveryPhoneHandler.exists(request);
      },
    },
  ];

  return routes;
};
