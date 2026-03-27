/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError } from '@fxa/accounts/errors';
import { AuthRequest } from '../../types';

// Create all event recorder mocks via a helper so we can reference them by name.
const gleanMocks: Record<string, jest.Mock> = {};
const mockFn = (name: string): jest.Mock => {
  gleanMocks[name] = jest.fn();
  return gleanMocks[name];
};

const recordMock = jest.fn();

jest.mock('./server_events', () => ({
  createAccountsEventsEvent: () => ({ record: recordMock }),
  createEventsServerEventLogger: () => ({
    recordRegAccCreated: mockFn('recordRegAccCreated'),
    recordRegEmailSent: mockFn('recordRegEmailSent'),
    recordRegAccVerified: mockFn('recordRegAccVerified'),
    recordRegComplete: mockFn('recordRegComplete'),
    recordRegSubmitError: mockFn('recordRegSubmitError'),
    recordLoginSuccess: mockFn('recordLoginSuccess'),
    recordLoginSubmitBackendError: mockFn('recordLoginSubmitBackendError'),
    recordLoginTotpCodeSuccess: mockFn('recordLoginTotpCodeSuccess'),
    recordLoginTotpCodeFailure: mockFn('recordLoginTotpCodeFailure'),
    recordLoginBackupCodeSuccess: mockFn('recordLoginBackupCodeSuccess'),
    recordLoginRecoveryPhoneSuccess: mockFn('recordLoginRecoveryPhoneSuccess'),
    recordLoginEmailConfirmationSent: mockFn(
      'recordLoginEmailConfirmationSent'
    ),
    recordLoginEmailConfirmationSuccess: mockFn(
      'recordLoginEmailConfirmationSuccess'
    ),
    recordLoginComplete: mockFn('recordLoginComplete'),
    recordPasswordResetEmailSent: mockFn('recordPasswordResetEmailSent'),
    recordPasswordResetCreateNewSuccess: mockFn(
      'recordPasswordResetCreateNewSuccess'
    ),
    recordAccountPasswordReset: mockFn('recordAccountPasswordReset'),
    recordPasswordResetRecoveryKeySuccess: mockFn(
      'recordPasswordResetRecoveryKeySuccess'
    ),
    recordPasswordResetRecoveryKeyCreateSuccess: mockFn(
      'recordPasswordResetRecoveryKeyCreateSuccess'
    ),
    recordAccessTokenCreated: mockFn('recordAccessTokenCreated'),
    recordAccessTokenChecked: mockFn('recordAccessTokenChecked'),
    recordThirdPartyAuthGoogleLoginComplete: mockFn(
      'recordThirdPartyAuthGoogleLoginComplete'
    ),
    recordThirdPartyAuthAppleLoginComplete: mockFn(
      'recordThirdPartyAuthAppleLoginComplete'
    ),
    recordThirdPartyAuthGoogleRegComplete: mockFn(
      'recordThirdPartyAuthGoogleRegComplete'
    ),
    recordThirdPartyAuthAppleRegComplete: mockFn(
      'recordThirdPartyAuthAppleRegComplete'
    ),
    recordThirdPartyAuthSetPasswordComplete: mockFn(
      'recordThirdPartyAuthSetPasswordComplete'
    ),
    recordAccountDeleteComplete: mockFn('recordAccountDeleteComplete'),
    recordAccountDeleteTaskHandled: mockFn('recordAccountDeleteTaskHandled'),
    recordPasswordResetEmailConfirmationSent: mockFn(
      'recordPasswordResetEmailConfirmationSent'
    ),
    recordPasswordResetEmailConfirmationSuccess: mockFn(
      'recordPasswordResetEmailConfirmationSuccess'
    ),
    recordTwoFactorAuthCodeComplete: mockFn('recordTwoFactorAuthCodeComplete'),
    recordTwoFactorAuthReplaceCodeComplete: mockFn(
      'recordTwoFactorAuthReplaceCodeComplete'
    ),
    recordTwoFactorAuthSetCodesComplete: mockFn(
      'recordTwoFactorAuthSetCodesComplete'
    ),
    recordTwoFactorAuthSetupVerifySuccess: mockFn(
      'recordTwoFactorAuthSetupVerifySuccess'
    ),
    recordTwoFactorAuthSetupInvalidCodeError: mockFn(
      'recordTwoFactorAuthSetupInvalidCodeError'
    ),
    recordTwoFactorAuthReplaceSuccess: mockFn(
      'recordTwoFactorAuthReplaceSuccess'
    ),
    recordTwoFactorAuthReplaceFailure: mockFn(
      'recordTwoFactorAuthReplaceFailure'
    ),
    recordTwoStepAuthPhoneCodeSent: mockFn('recordTwoStepAuthPhoneCodeSent'),
    recordTwoStepAuthPhoneCodeSendError: mockFn(
      'recordTwoStepAuthPhoneCodeSendError'
    ),
    recordTwoStepAuthPhoneCodeComplete: mockFn(
      'recordTwoStepAuthPhoneCodeComplete'
    ),
    recordTwoStepAuthPhoneRemoveSuccess: mockFn(
      'recordTwoStepAuthPhoneRemoveSuccess'
    ),
    recordTwoStepAuthRemoveSuccess: mockFn('recordTwoStepAuthRemoveSuccess'),
    recordPasswordResetTwoFactorSuccess: mockFn(
      'recordPasswordResetTwoFactorSuccess'
    ),
    recordPasswordResetRecoveryCodeSuccess: mockFn(
      'recordPasswordResetRecoveryCodeSuccess'
    ),
    recordInactiveAccountDeletionStatusChecked: mockFn(
      'recordInactiveAccountDeletionStatusChecked'
    ),
    recordInactiveAccountDeletionFirstEmailTaskRequest: mockFn(
      'recordInactiveAccountDeletionFirstEmailTaskRequest'
    ),
    recordInactiveAccountDeletionFirstEmailTaskEnqueued: mockFn(
      'recordInactiveAccountDeletionFirstEmailTaskEnqueued'
    ),
    recordInactiveAccountDeletionFirstEmailTaskRejected: mockFn(
      'recordInactiveAccountDeletionFirstEmailTaskRejected'
    ),
    recordInactiveAccountDeletionFirstEmailSkipped: mockFn(
      'recordInactiveAccountDeletionFirstEmailSkipped'
    ),
    recordInactiveAccountDeletionSecondEmailTaskRequest: mockFn(
      'recordInactiveAccountDeletionSecondEmailTaskRequest'
    ),
    recordInactiveAccountDeletionSecondEmailTaskEnqueued: mockFn(
      'recordInactiveAccountDeletionSecondEmailTaskEnqueued'
    ),
    recordInactiveAccountDeletionSecondEmailTaskRejected: mockFn(
      'recordInactiveAccountDeletionSecondEmailTaskRejected'
    ),
    recordInactiveAccountDeletionSecondEmailSkipped: mockFn(
      'recordInactiveAccountDeletionSecondEmailSkipped'
    ),
    recordInactiveAccountDeletionFinalEmailTaskRequest: mockFn(
      'recordInactiveAccountDeletionFinalEmailTaskRequest'
    ),
    recordInactiveAccountDeletionFinalEmailTaskEnqueued: mockFn(
      'recordInactiveAccountDeletionFinalEmailTaskEnqueued'
    ),
    recordInactiveAccountDeletionFinalEmailTaskRejected: mockFn(
      'recordInactiveAccountDeletionFinalEmailTaskRejected'
    ),
    recordInactiveAccountDeletionFinalEmailSkipped: mockFn(
      'recordInactiveAccountDeletionFinalEmailSkipped'
    ),
    recordInactiveAccountDeletionDeletionScheduled: mockFn(
      'recordInactiveAccountDeletionDeletionScheduled'
    ),
    recordInactiveAccountDeletionDeletionSkipped: mockFn(
      'recordInactiveAccountDeletionDeletionSkipped'
    ),
    recordEmailDeliverySuccess: mockFn('recordEmailDeliverySuccess'),
    recordPasswordResetRecoveryPhoneCodeSent: mockFn(
      'recordPasswordResetRecoveryPhoneCodeSent'
    ),
    recordPasswordResetRecoveryPhoneCodeSendError: mockFn(
      'recordPasswordResetRecoveryPhoneCodeSendError'
    ),
    recordPasswordResetRecoveryPhoneCodeComplete: mockFn(
      'recordPasswordResetRecoveryPhoneCodeComplete'
    ),
    recordTwoStepAuthPhoneReplaceSuccess: mockFn(
      'recordTwoStepAuthPhoneReplaceSuccess'
    ),
    recordTwoStepAuthPhoneReplaceFailure: mockFn(
      'recordTwoStepAuthPhoneReplaceFailure'
    ),
    recordLoginConfirmSkipForKnownIp: mockFn(
      'recordLoginConfirmSkipForKnownIp'
    ),
    recordLoginConfirmSkipForNewAccount: mockFn(
      'recordLoginConfirmSkipForNewAccount'
    ),
    recordLoginConfirmSkipForKnownDevice: mockFn(
      'recordLoginConfirmSkipForKnownDevice'
    ),
  }),
}));

// Import after jest.mock so the mock is in place.
import { gleanMetrics, logErrorWithGlean, GleanMetricsType } from './index';

const config = {
  gleanMetrics: {
    enabled: true,
    applicationId: 'accounts_backend_test',
    channel: 'test',
    loggerAppName: 'auth-server-tests',
  },
  oauth: {
    clientIds: {},
  },
} as any;

const request = {
  app: {
    isMetricsEnabled: true,
    metricsContext: {},
    ua: {},
    clientAddress: '10.10.10.10',
  },
  auth: { credentials: {} },
  headers: {
    'user-agent': 'ELinks/0.9.3 (textmode; SunOS)',
  },
} as unknown as AuthRequest;

describe('Glean server side events', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    recordMock.mockClear();
    Object.values(gleanMocks).forEach((m) => m.mockClear());
  });

  describe('enabled state', () => {
    it('can be disabled via config', async () => {
      const gleanConfig = {
        ...config,
        gleanMetrics: { ...config.gleanMetrics, enabled: false },
      };
      const glean = gleanMetrics(gleanConfig);
      await glean.login.success(request);

      expect(recordMock).not.toHaveBeenCalled();
    });

    it('can be disabled by the account', async () => {
      const glean = gleanMetrics(config);
      await glean.login.success({
        ...request,
        app: { ...request.app, isMetricsEnabled: false },
      } as unknown as AuthRequest);

      expect(recordMock).not.toHaveBeenCalled();
    });

    it('logs when enabled', async () => {
      const glean = gleanMetrics(config);
      await glean.login.success(request);
      expect(recordMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('metrics', () => {
    let glean: GleanMetricsType;

    beforeEach(() => {
      glean = gleanMetrics(config);
    });

    it('defaults', async () => {
      await glean.login.success(request);
      const metrics = recordMock.mock.calls[0][0];
      expect(metrics.user_agent).toBe(request.headers['user-agent']);
      expect(metrics.ip_address).toBe(request.app.clientAddress);

      delete metrics.event_name; // there's always a name of course
      delete metrics.user_agent;
      delete metrics.ip_address;

      // the rest should default to an empty string
      expect(Object.values(metrics).every((x) => x === '')).toBe(true);
    });

    describe('user id', () => {
      it('uses the id from the passed in data', async () => {
        await glean.login.success(request, { uid: 'rome_georgia' });
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['account_user_id_sha256']).toBe(
          '7c05994f542f257aac8ee13eebc711f07e480b06de5498c7e63f9b3e615ac8af'
        );
      });

      it('uses the id from the session token', async () => {
        const sessionAuthedReq = {
          ...request,
          auth: {
            ...request.auth,
            credentials: { ...request.auth.credentials, uid: 'athens_texas' },
          },
        } as unknown as AuthRequest;
        await glean.login.success(sessionAuthedReq);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['account_user_id_sha256']).toBe(
          '0c1d07d948132bcec965796e16a0bef4bd8aca2bc920c26f3a6d4f46e8971fcd'
        );
      });

      it('uses the id from oauth token', async () => {
        const oauthReq = {
          ...request,
          auth: {
            ...request.auth,
            credentials: {
              ...request.auth.credentials,
              user: 'paris_tennessee',
            },
          },
        } as unknown as AuthRequest;
        await glean.login.success(oauthReq);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['account_user_id_sha256']).toBe(
          'b2710dc44cb98ec552e189e48b43e460366f1ae40f922bf325e2635b098962e7'
        );
      });

      it('uses the "reason" event property from the data argument', async () => {
        await glean.login.error(request, { reason: 'too_cool_for_school' });
        const metrics = recordMock.mock.calls[0][0];

        expect(metrics['event_reason']).toBe('too_cool_for_school');
      });
    });

    describe('oauth', () => {
      it('uses the client id from the oauth token', async () => {
        const req = {
          ...request,
          auth: {
            ...request.auth,
            credentials: {
              ...request.auth.credentials,
              client_id: 'runny_eggs',
            },
          },
        } as unknown as AuthRequest;
        await glean.login.success(req);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['relying_party_oauth_client_id']).toBe('runny_eggs');
      });

      it('uses the client id from the payload', async () => {
        const req = {
          ...request,
          payload: {
            ...(request.payload as object),
            client_id: 'corny_jokes',
          },
        } as unknown as AuthRequest;
        await glean.login.success(req);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['relying_party_oauth_client_id']).toBe('corny_jokes');
      });

      it('uses the client id from the event data', async () => {
        await glean.login.success(request, { oauthClientId: 'runny_eggs' });
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['relying_party_oauth_client_id']).toBe('runny_eggs');
      });

      it('uses the service name from the metrics context', async () => {
        const req = {
          ...request,
          app: {
            ...request.app,
            metricsContext: {
              ...request.app.metricsContext,
              service: 'brass_monkey',
            },
          },
        } as unknown as AuthRequest;
        await glean.login.success(req);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['relying_party_service']).toBe('brass_monkey');
      });

      it('uses the client id in the service name property', async () => {
        const req = {
          ...request,
          app: {
            ...request.app,
            metricsContext: {
              ...request.app.metricsContext,
              client_id: undefined,
              service: '7f1a38488a0df47b',
            },
          },
        } as unknown as AuthRequest;
        await glean.login.success(req);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['relying_party_oauth_client_id']).toBe(
          '7f1a38488a0df47b'
        );
      });
    });

    describe('user session', () => {
      it('sets the device type', async () => {
        const req = {
          ...request,
          app: {
            ...request.app,
            ua: {
              ...request.app.ua,
              deviceType: 'phablet',
            },
          },
        } as unknown as AuthRequest;
        await glean.login.success(req);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['session_device_type']).toBe('phablet');
      });

      it('sets the entrypoint', async () => {
        const req = {
          ...request,
          app: {
            ...request.app,
            metricsContext: {
              ...request.app.metricsContext,
              entrypoint: 'homepage',
            },
          },
        } as unknown as AuthRequest;
        await glean.login.success(req);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['session_entrypoint']).toBe('homepage');
      });

      it('sets the flow id', async () => {
        const req = {
          ...request,
          app: {
            ...request.app,
            metricsContext: {
              ...request.app.metricsContext,
              flowId: '101',
            },
          },
        } as unknown as AuthRequest;
        await glean.login.success(req);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['session_flow_id']).toBe('101');
      });
    });

    describe('utm', () => {
      let metrics: Record<string, string>;

      beforeEach(async () => {
        const req = {
          ...request,
          app: {
            ...request.app,
            metricsContext: {
              ...request.app.metricsContext,
              utmCampaign: 'camp',
              utmContent: 'con',
              utmMedium: 'mid',
              utmSource: 'sour',
              utmTerm: 'erm',
            },
          },
        } as unknown as AuthRequest;
        await glean.login.success(req);
        metrics = recordMock.mock.calls[0][0];
      });

      it('sets the campaign', () => {
        expect(metrics['utm_campaign']).toBe('camp');
      });

      it('sets the content', () => {
        expect(metrics['utm_content']).toBe('con');
      });

      it('sets the medium', () => {
        expect(metrics['utm_medium']).toBe('mid');
      });

      it('sets the source', () => {
        expect(metrics['utm_source']).toBe('sour');
      });

      it('sets the term', () => {
        expect(metrics['utm_term']).toBe('erm');
      });
    });
  });

  describe('account events', () => {
    let glean: GleanMetricsType;

    beforeEach(() => {
      glean = gleanMetrics(config);
    });

    it('logs a "account_password_reset" event', async () => {
      await glean.resetPassword.accountReset(request);
      expect(recordMock).toHaveBeenCalledTimes(1);
      const metrics = recordMock.mock.calls[0][0];
      expect(metrics['event_name']).toBe('account_password_reset');
      expect(gleanMocks['recordAccountPasswordReset']).toHaveBeenCalledTimes(1);
    });

    it('logs a "account_delete_complete" event', async () => {
      await glean.account.deleteComplete(request);
      expect(recordMock).toHaveBeenCalledTimes(1);
      const metrics = recordMock.mock.calls[0][0];
      expect(metrics['event_name']).toBe('account_delete_complete');
      expect(gleanMocks['recordAccountDeleteComplete']).toHaveBeenCalledTimes(
        1
      );
    });
  });

  describe('two factor auth', () => {
    let glean: GleanMetricsType;

    beforeEach(() => {
      glean = gleanMetrics(config);
    });

    it('logs a "two_factor_auth_code_complete" event', async () => {
      await glean.twoFactorAuth.codeComplete(request);
      expect(recordMock).toHaveBeenCalledTimes(1);
      const metrics = recordMock.mock.calls[0][0];
      expect(metrics['event_name']).toBe('two_factor_auth_code_complete');
      expect(
        gleanMocks['recordTwoFactorAuthCodeComplete']
      ).toHaveBeenCalledTimes(1);
    });

    it('logs a "two_factor_auth_replace_code_complete" event', async () => {
      await glean.twoFactorAuth.replaceCodeComplete(request);
      expect(recordMock).toHaveBeenCalledTimes(1);
      const metrics = recordMock.mock.calls[0][0];
      expect(metrics['event_name']).toBe(
        'two_factor_auth_replace_code_complete'
      );
      expect(
        gleanMocks['recordTwoFactorAuthReplaceCodeComplete']
      ).toHaveBeenCalledTimes(1);
    });

    it('logs a "two_factor_auth_setup_invalid_code_error" event', async () => {
      await glean.twoFactorAuth.setupInvalidCodeError(request);
      expect(recordMock).toHaveBeenCalledTimes(1);
      const metrics = recordMock.mock.calls[0][0];
      expect(metrics['event_name']).toBe(
        'two_factor_auth_setup_invalid_code_error'
      );
      expect(
        gleanMocks['recordTwoFactorAuthSetupInvalidCodeError']
      ).toHaveBeenCalledTimes(1);
    });

    it('logs a "two_factor_auth_replace_success" event', async () => {
      await glean.twoFactorAuth.replaceSuccess(request);
      expect(recordMock).toHaveBeenCalledTimes(1);
      const metrics = recordMock.mock.calls[0][0];
      expect(metrics['event_name']).toBe('two_factor_auth_replace_success');
      expect(
        gleanMocks['recordTwoFactorAuthReplaceSuccess']
      ).toHaveBeenCalledTimes(1);
    });

    it('logs a "two_factor_auth_replace_failure" event', async () => {
      await glean.twoFactorAuth.replaceFailure(request);
      expect(recordMock).toHaveBeenCalledTimes(1);
      const metrics = recordMock.mock.calls[0][0];
      expect(metrics['event_name']).toBe('two_factor_auth_replace_failure');
      expect(
        gleanMocks['recordTwoFactorAuthReplaceFailure']
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('registration', () => {
    let glean: GleanMetricsType;

    beforeEach(() => {
      glean = gleanMetrics(config);
    });

    describe('accountCreated', () => {
      it('logs a "reg_acc_created" event', async () => {
        await glean.registration.accountCreated(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe('reg_acc_created');
        expect(gleanMocks['recordRegAccCreated']).toHaveBeenCalledTimes(1);
      });
    });

    describe('confirmationEmailSent', () => {
      it('logs a "reg_email_sent" event', async () => {
        await glean.registration.confirmationEmailSent(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe('reg_email_sent');
        expect(gleanMocks['recordRegEmailSent']).toHaveBeenCalledTimes(1);
      });
    });

    describe('accountVerified', () => {
      it('logs a "reg_acc_verified" event', async () => {
        const glean = gleanMetrics(config);
        await glean.registration.accountVerified(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe('reg_acc_verified');
        expect(gleanMocks['recordRegAccVerified']).toHaveBeenCalledTimes(1);
      });
    });

    describe('reg_complete', () => {
      it('logs a "reg_complete" event with reason', async () => {
        const glean = gleanMetrics(config);
        await glean.registration.complete(request, { reason: 'otp' });
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe('reg_complete');
        expect(metrics['event_reason']).toBe('otp');
        expect(gleanMocks['recordRegComplete']).toHaveBeenCalledTimes(1);
      });
    });

    describe('reg_submit_error', () => {
      it('logs a "reg_submit_error" event', async () => {
        const glean = gleanMetrics(config);
        await glean.registration.error(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe('reg_submit_error');
        expect(gleanMocks['recordRegSubmitError']).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('login', () => {
    let glean: GleanMetricsType;

    beforeEach(() => {
      glean = gleanMetrics(config);
    });

    describe('success', () => {
      it('logs a "login_success" event', async () => {
        await glean.login.success(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe('login_success');
      });
    });

    describe('error', () => {
      it('logs a "login_submit_backend_error" event', async () => {
        await glean.login.error(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe('login_submit_backend_error');
      });
    });

    describe('totp', () => {
      it('logs a "login_totp_code_success" event', async () => {
        await glean.login.totpSuccess(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe('login_totp_code_success');
      });

      it('logs a "login_totp_code_failure" event', async () => {
        await glean.login.totpFailure(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe('login_totp_code_failure');
      });
    });

    describe('verifyCodeEmail', () => {
      it('logs a "login_email_confirmation_sent" event', async () => {
        await glean.login.verifyCodeEmailSent(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe('login_email_confirmation_sent');
      });

      it('logs a "login_email_confirmation_success" event', async () => {
        await glean.login.verifyCodeConfirmed(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe('login_email_confirmation_success');
      });
    });
  });

  describe('oauth', () => {
    describe('tokenCreated', () => {
      it('normalizes space-separated scopes to sorted comma-separated', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenCreated(request, {
          scopes: 'https://identity.mozilla.com/apps/smartwindow profile:uid',
        });
        expect(gleanMocks['recordAccessTokenCreated']).toHaveBeenCalledTimes(1);
        const metrics = gleanMocks['recordAccessTokenCreated'].mock.calls[0][0];
        expect(metrics['scopes']).toBe(
          'https://identity.mozilla.com/apps/smartwindow,profile:uid'
        );
      });

      it('handles undefined scopes', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenCreated(request, {
          scopes: undefined,
        });
        expect(gleanMocks['recordAccessTokenCreated']).toHaveBeenCalledTimes(1);
        const metrics = gleanMocks['recordAccessTokenCreated'].mock.calls[0][0];
        expect(metrics['scopes']).toBe('');
      });

      it('handles scopes passed as an array', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenCreated(request, {
          scopes: ['profile', 'openid'],
        });
        expect(gleanMocks['recordAccessTokenCreated']).toHaveBeenCalledTimes(1);
        const metrics = gleanMocks['recordAccessTokenCreated'].mock.calls[0][0];
        expect(metrics['scopes']).toBe('openid,profile');
      });
    });

    describe('tokenChecked', () => {
      it('sends an empty ip address', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenChecked(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['ip_address']).toBe('');
      });

      it('handles undefined scopes', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenChecked(request, {
          scopes: undefined,
        });
        expect(gleanMocks['recordAccessTokenChecked']).toHaveBeenCalledTimes(1);
        const metrics = gleanMocks['recordAccessTokenChecked'].mock.calls[0][0];
        expect(metrics['scopes']).toBe('');
      });

      it('handles empty scopes', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenChecked(request, {
          scopes: '',
        });
        expect(gleanMocks['recordAccessTokenChecked']).toHaveBeenCalledTimes(1);
        const metrics = gleanMocks['recordAccessTokenChecked'].mock.calls[0][0];
        expect(metrics['scopes']).toBe('');
      });

      it('includes sorted comma separated scopes as array', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenChecked(request, {
          scopes: ['profile', 'openid'],
        });
        expect(gleanMocks['recordAccessTokenChecked']).toHaveBeenCalledTimes(1);
        const metrics = gleanMocks['recordAccessTokenChecked'].mock.calls[0][0];
        expect(metrics['scopes']).toBe('openid,profile');
      });

      it('includes sorted comma separated scopes as string', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenChecked(request, {
          scopes: 'profile,openid',
        });
        expect(gleanMocks['recordAccessTokenChecked']).toHaveBeenCalledTimes(1);
        const metrics = gleanMocks['recordAccessTokenChecked'].mock.calls[0][0];
        expect(metrics['scopes']).toBe('openid,profile');
      });
    });
  });

  describe('thirdPartyAuth', () => {
    describe('googleLoginComplete', () => {
      it('log string and event metrics with account linking for Google', async () => {
        const glean = gleanMetrics(config);
        await glean.thirdPartyAuth.googleLoginComplete(request, {
          reason: 'linking',
        });
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe(
          'third_party_auth_google_login_complete'
        );
        expect(metrics['event_reason']).toBe('linking');
        expect(
          gleanMocks['recordThirdPartyAuthGoogleLoginComplete']
        ).toHaveBeenCalledTimes(1);
        expect(
          gleanMocks['recordThirdPartyAuthGoogleLoginComplete'].mock.calls[0][0]
            .linking
        ).toBe(true);
      });

      it('log string and event metrics without account linking for Google', async () => {
        const glean = gleanMetrics(config);
        await glean.thirdPartyAuth.googleLoginComplete(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe(
          'third_party_auth_google_login_complete'
        );
        expect(metrics['event_reason']).toBe('');
        expect(
          gleanMocks['recordThirdPartyAuthGoogleLoginComplete']
        ).toHaveBeenCalledTimes(1);
        expect(
          gleanMocks['recordThirdPartyAuthGoogleLoginComplete'].mock.calls[0][0]
            .linking
        ).toBe(false);
      });
    });

    describe('appleLoginComplete', () => {
      it('log string and event metrics with account linking for Apple', async () => {
        const glean: GleanMetricsType = gleanMetrics(config);
        await glean.thirdPartyAuth.appleLoginComplete(request, {
          reason: 'linking',
        });
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe(
          'third_party_auth_apple_login_complete'
        );
        expect(metrics['event_reason']).toBe('linking');
        expect(
          gleanMocks['recordThirdPartyAuthAppleLoginComplete']
        ).toHaveBeenCalledTimes(1);
        expect(
          gleanMocks['recordThirdPartyAuthAppleLoginComplete'].mock.calls[0][0]
            .linking
        ).toBe(true);
      });

      it('log string and event metrics without account linking for Apple', async () => {
        const glean: GleanMetricsType = gleanMetrics(config);
        await glean.thirdPartyAuth.appleLoginComplete(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe(
          'third_party_auth_apple_login_complete'
        );
        expect(metrics['event_reason']).toBe('');
        expect(
          gleanMocks['recordThirdPartyAuthAppleLoginComplete']
        ).toHaveBeenCalledTimes(1);
        expect(
          gleanMocks['recordThirdPartyAuthAppleLoginComplete'].mock.calls[0][0]
            .linking
        ).toBe(false);
      });
    });

    describe('googleRegComplete', () => {
      it('log string and event metrics for Google', async () => {
        const glean: GleanMetricsType = gleanMetrics(config);
        await glean.thirdPartyAuth.googleRegComplete(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe(
          'third_party_auth_google_reg_complete'
        );
        expect(
          gleanMocks['recordThirdPartyAuthGoogleRegComplete']
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('appleRegComplete', () => {
      it('log string and event metrics for Google', async () => {
        const glean: GleanMetricsType = gleanMetrics(config);
        await glean.thirdPartyAuth.appleRegComplete(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe(
          'third_party_auth_apple_reg_complete'
        );
        expect(
          gleanMocks['recordThirdPartyAuthAppleRegComplete']
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('setPasswordComplete', () => {
      it('log string and event metrics with account linking', async () => {
        const glean: GleanMetricsType = gleanMetrics(config);
        await glean.thirdPartyAuth.setPasswordComplete(request);
        expect(recordMock).toHaveBeenCalledTimes(1);
        const metrics = recordMock.mock.calls[0][0];
        expect(metrics['event_name']).toBe(
          'third_party_auth_set_password_complete'
        );
        expect(
          gleanMocks['recordThirdPartyAuthSetPasswordComplete']
        ).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('logErrorWithGlean hapi preResponse error logger', () => {
    const error = AppError.requestBlocked();

    // Build a mock glean object where every method is a jest.fn()
    const mockGleanObj = gleanMetrics(config);
    for (const funnel in mockGleanObj) {
      for (const event in (mockGleanObj as any)[funnel]) {
        (mockGleanObj as any)[funnel][event] = jest.fn();
      }
    }

    describe('/account/create', () => {
      it('logs a ping with glean.registration.error', () => {
        (mockGleanObj.registration.error as jest.Mock).mockClear();
        const req = { path: '/account/create' };
        logErrorWithGlean({
          glean: mockGleanObj,
          request: req as any,
          error,
        });
        expect(
          mockGleanObj.registration.error as jest.Mock
        ).toHaveBeenCalledTimes(1);
        expect(
          mockGleanObj.registration.error as jest.Mock
        ).toHaveBeenCalledWith(req, { reason: 'REQUEST_BLOCKED' });
      });
    });

    describe('/account/login', () => {
      it('logs a ping with glean.login.error', () => {
        (mockGleanObj.login.error as jest.Mock).mockClear();
        const req = { path: '/account/login' };
        logErrorWithGlean({
          glean: mockGleanObj,
          request: req as any,
          error,
        });
        expect(mockGleanObj.login.error as jest.Mock).toHaveBeenCalledTimes(1);
        expect(mockGleanObj.login.error as jest.Mock).toHaveBeenCalledWith(
          req,
          { reason: 'REQUEST_BLOCKED' }
        );
      });
    });
  });
});
