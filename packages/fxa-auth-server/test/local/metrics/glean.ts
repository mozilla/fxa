/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import proxyquire from 'proxyquire';
import sinon, { SinonStub } from 'sinon';
import { assert } from 'chai';
import AppError from '../../../lib/error';
import mocks from '../../mocks';
import { GleanMetricsType } from '../../../lib/metrics/glean';
import { AuthRequest } from '../../../lib/types';
import { Dictionary } from 'lodash';

const recordStub = sinon.stub();

const recordRegAccCreatedStub = sinon.stub();
const recordRegEmailSentStub = sinon.stub();
const recordRegAccVerifiedStub = sinon.stub();
const recordRegCompleteStub = sinon.stub();
const recordRegSubmitErrorStub = sinon.stub();
const recordLoginSuccessStub = sinon.stub();
const recordLoginSubmitBackendErrorStub = sinon.stub();
const recordLoginTotpCodeSuccessStub = sinon.stub();
const recordLoginTotpCodeFailureStub = sinon.stub();
const recordLoginBackupCodeSuccessStub = sinon.stub();
const recordLoginEmailConfirmationSentStub = sinon.stub();
const recordLoginEmailConfirmationSuccessStub = sinon.stub();
const recordLoginCompleteStub = sinon.stub();
const recordPasswordResetEmailSentStub = sinon.stub();
const recordPasswordResetCreateNewSuccessStub = sinon.stub();
const recordAccountPasswordResetStub = sinon.stub();
const recordPasswordResetRecoveryKeySuccessStub = sinon.stub();
const recordPasswordResetRecoveryKeyCreateSuccessStub = sinon.stub();
const recordAccessTokenCreatedStub = sinon.stub();
const recordAccessTokenCheckedStub = sinon.stub();
const recordThirdPartyAuthGoogleLoginCompleteStub = sinon.stub();
const recordThirdPartyAuthAppleLoginCompleteStub = sinon.stub();
const recordThirdPartyAuthGoogleRegCompleteStub = sinon.stub();
const recordThirdPartyAuthAppleRegCompleteStub = sinon.stub();
const recordThirdPartyAuthSetPasswordCompleteStub = sinon.stub();
const recordAccountDeleteCompleteStub = sinon.stub();
const recordAccountDeleteTaskHandledStub = sinon.stub();
const recordPasswordResetEmailConfirmationSentStub = sinon.stub();
const recordPasswordResetEmailConfirmationSuccessStub = sinon.stub();
const recordTwoFactorAuthCodeCompleteStub = sinon.stub();
const recordTwoFactorAuthReplaceCodeCompleteStub = sinon.stub();
const recordTwoStepAuthPhoneCodeSentStub = sinon.stub();
const recordTwoStepAuthPhoneCodeSendErrorStub = sinon.stub();
const recordTwoStepAuthPhoneCodeCompleteStub = sinon.stub();
const recordTwoStepAuthPhoneRemoveSuccessStub = sinon.stub();
const recordTwoStepAuthRemoveSuccessStub = sinon.stub();
const recordPasswordResetTwoFactorSuccessStub = sinon.stub();
const recordPasswordResetRecoveryCodeSuccessStub = sinon.stub();
const recordInactiveAccountDeletionStatusCheckedStub = sinon.stub();
const recordInactiveAccountDeletionFirstEmailTaskRequestStub = sinon.stub();
const recordInactiveAccountDeletionFirstEmailTaskEnqueuedStub = sinon.stub();
const recordInactiveAccountDeletionFirstEmailTaskRejectedStub = sinon.stub();
const recordInactiveAccountDeletionFirstEmailSkippedStub = sinon.stub();
const recordInactiveAccountDeletionSecondEmailTaskRequestStub = sinon.stub();
const recordInactiveAccountDeletionSecondEmailTaskEnqueuedStub = sinon.stub();
const recordInactiveAccountDeletionSecondEmailTaskRejectedStub = sinon.stub();
const recordInactiveAccountDeletionSecondEmailSkippedStub = sinon.stub();
const recordInactiveAccountDeletionFinalEmailTaskRequestStub = sinon.stub();
const recordInactiveAccountDeletionFinalEmailTaskEnqueuedStub = sinon.stub();
const recordInactiveAccountDeletionFinalEmailTaskRejectedStub = sinon.stub();
const recordInactiveAccountDeletionFinalEmailSkippedStub = sinon.stub();
const recordInactiveAccountDeletionDeletionScheduledStub = sinon.stub();
const recordInactiveAccountDeletionDeletionSkippedStub = sinon.stub();

const gleanProxy = proxyquire('../../../lib/metrics/glean', {
  './server_events': {
    createAccountsEventsEvent: () => ({ record: recordStub }),
    // this is out of hand!  we need to switch to use sinon.mock or some such thing
    createEventsServerEventLogger: () => ({
      recordRegAccCreated: recordRegAccCreatedStub,
      recordRegEmailSent: recordRegEmailSentStub,
      recordRegAccVerified: recordRegAccVerifiedStub,
      recordRegComplete: recordRegCompleteStub,
      recordRegSubmitError: recordRegSubmitErrorStub,
      recordLoginSuccess: recordLoginSuccessStub,
      recordLoginSubmitBackendError: recordLoginSubmitBackendErrorStub,
      recordLoginTotpCodeSuccess: recordLoginTotpCodeSuccessStub,
      recordLoginTotpCodeFailure: recordLoginTotpCodeFailureStub,
      recordLoginBackupCodeSuccess: recordLoginBackupCodeSuccessStub,
      recordLoginEmailConfirmationSent: recordLoginEmailConfirmationSentStub,
      recordLoginEmailConfirmationSuccess:
        recordLoginEmailConfirmationSuccessStub,
      recordLoginComplete: recordLoginCompleteStub,
      recordPasswordResetEmailSent: recordPasswordResetEmailSentStub,
      recordPasswordResetCreateNewSuccess:
        recordPasswordResetCreateNewSuccessStub,
      recordAccountPasswordReset: recordAccountPasswordResetStub,
      recordPasswordResetRecoveryKeySuccess:
        recordPasswordResetRecoveryKeySuccessStub,
      recordPasswordResetRecoveryKeyCreateSuccess:
        recordPasswordResetRecoveryKeyCreateSuccessStub,
      recordAccessTokenCreated: recordAccessTokenCreatedStub,
      recordAccessTokenChecked: recordAccessTokenCheckedStub,
      recordThirdPartyAuthGoogleLoginComplete:
        recordThirdPartyAuthGoogleLoginCompleteStub,
      recordThirdPartyAuthAppleLoginComplete:
        recordThirdPartyAuthAppleLoginCompleteStub,
      recordThirdPartyAuthGoogleRegComplete:
        recordThirdPartyAuthGoogleRegCompleteStub,
      recordThirdPartyAuthAppleRegComplete:
        recordThirdPartyAuthAppleRegCompleteStub,
      recordThirdPartyAuthSetPasswordComplete:
        recordThirdPartyAuthSetPasswordCompleteStub,
      recordAccountDeleteComplete: recordAccountDeleteCompleteStub,
      recordAccountDeleteTaskHandled: recordAccountDeleteTaskHandledStub,
      recordPasswordResetEmailConfirmationSent:
        recordPasswordResetEmailConfirmationSentStub,
      recordPasswordResetEmailConfirmationSuccess:
        recordPasswordResetEmailConfirmationSuccessStub,
      recordTwoFactorAuthCodeComplete: recordTwoFactorAuthCodeCompleteStub,
      recordTwoFactorAuthReplaceCodeComplete:
        recordTwoFactorAuthReplaceCodeCompleteStub,
      recordTwoStepAuthPhoneCodeSent: recordTwoStepAuthPhoneCodeSentStub,
      recordTwoStepAuthPhoneCodeSendError:
        recordTwoStepAuthPhoneCodeSendErrorStub,
      recordTwoStepAuthPhoneCodeComplete:
        recordTwoStepAuthPhoneCodeCompleteStub,
      recordTwoStepAuthPhoneRemoveSuccess:
        recordTwoStepAuthPhoneRemoveSuccessStub,
      recordTwoStepAuthRemoveSuccess: recordTwoStepAuthRemoveSuccessStub,
      recordPasswordResetTwoFactorSuccess:
        recordPasswordResetTwoFactorSuccessStub,
      recordPasswordResetRecoveryCodeSuccess:
        recordPasswordResetRecoveryCodeSuccessStub,
      recordInactiveAccountDeletionStatusChecked:
        recordInactiveAccountDeletionStatusCheckedStub,
      recordInactiveAccountDeletionFirstEmailTaskRequest:
        recordInactiveAccountDeletionFirstEmailTaskRequestStub,
      recordInactiveAccountDeletionFirstEmailTaskEnqueued:
        recordInactiveAccountDeletionFirstEmailTaskEnqueuedStub,
      recordInactiveAccountDeletionFirstEmailTaskRejected:
        recordInactiveAccountDeletionFirstEmailTaskRejectedStub,
      recordInactiveAccountDeletionFirstEmailSkipped:
        recordInactiveAccountDeletionFirstEmailSkippedStub,
      recordInactiveAccountDeletionSecondEmailTaskRequest:
        recordInactiveAccountDeletionSecondEmailTaskRequestStub,
      recordInactiveAccountDeletionSecondEmailTaskEnqueued:
        recordInactiveAccountDeletionSecondEmailTaskEnqueuedStub,
      recordInactiveAccountDeletionSecondEmailTaskRejected:
        recordInactiveAccountDeletionSecondEmailTaskRejectedStub,
      recordInactiveAccountDeletionSecondEmailSkipped:
        recordInactiveAccountDeletionSecondEmailSkippedStub,
      recordInactiveAccountDeletionFinalEmailTaskRequest:
        recordInactiveAccountDeletionFinalEmailTaskRequestStub,
      recordInactiveAccountDeletionFinalEmailTaskEnqueued:
        recordInactiveAccountDeletionFinalEmailTaskEnqueuedStub,
      recordInactiveAccountDeletionFinalEmailTaskRejected:
        recordInactiveAccountDeletionFinalEmailTaskRejectedStub,
      recordInactiveAccountDeletionFinalEmailSkipped:
        recordInactiveAccountDeletionFinalEmailSkippedStub,
      recordInactiveAccountDeletionDeletionScheduled:
        recordInactiveAccountDeletionDeletionScheduledStub,
      recordInactiveAccountDeletionDeletionSkipped:
        recordInactiveAccountDeletionDeletionSkippedStub,
    }),
  },
});
const gleanMetrics: (config: any) => GleanMetricsType = gleanProxy.gleanMetrics;
const logErrorWithGlean = gleanProxy.logErrorWithGlean;

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
};

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
    recordStub.reset();
    recordRegAccCreatedStub.reset();
    recordRegEmailSentStub.reset();
    recordRegAccVerifiedStub.reset();
    recordRegCompleteStub.reset();
    recordRegSubmitErrorStub.reset();
    recordAccessTokenCheckedStub.reset();
  });

  describe('enabled state', () => {
    it('can be disabled via config', async () => {
      const gleanConfig = {
        ...config,
        gleanMetrics: { ...config.gleanMetrics, enabled: false },
      };
      const glean = gleanMetrics(gleanConfig);
      await glean.login.success(request);

      sinon.assert.notCalled(recordStub);
    });

    it('can be disabled by the account', async () => {
      const glean = gleanMetrics(config);
      await glean.login.success({
        ...request,
        app: { ...request.app, isMetricsEnabled: false },
      } as unknown as AuthRequest);

      sinon.assert.notCalled(recordStub);
    });

    it('logs when enabled', async () => {
      const glean = gleanMetrics(config);
      await glean.login.success(request);
      sinon.assert.calledOnce(recordStub);
    });
  });

  describe('metrics', () => {
    let glean: GleanMetricsType;

    beforeEach(() => {
      glean = gleanMetrics(config);
    });

    it('defaults', async () => {
      await glean.login.success(request);
      const metrics = recordStub.args[0][0];
      assert.equal(metrics.user_agent, request.headers['user-agent']);
      assert.equal(metrics.ip_address, request.app.clientAddress);

      delete metrics.event_name; // there's always a name of course
      delete metrics.user_agent;
      delete metrics.ip_address;

      // the rest should default to an empty string
      assert.isTrue(Object.values(metrics).every((x) => x === ''));
    });

    describe('user id', () => {
      it('uses the id from the passed in data', async () => {
        await glean.login.success(request, { uid: 'rome_georgia' });
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['account_user_id_sha256'],
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
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['account_user_id_sha256'],
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
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['account_user_id_sha256'],
          'b2710dc44cb98ec552e189e48b43e460366f1ae40f922bf325e2635b098962e7'
        );
      });

      it('uses the "reason" event property from the data argument', async () => {
        await glean.login.error(request, { reason: 'too_cool_for_school' });
        const metrics = recordStub.args[0][0];

        assert.equal(metrics['event_reason'], 'too_cool_for_school');
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
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['relying_party_oauth_client_id'], 'runny_eggs');
      });

      it('uses the client id from the payload', async () => {
        const req = {
          ...request,
          payload: { ...(request.payload as object), client_id: 'corny_jokes' },
        } as unknown as AuthRequest;
        await glean.login.success(req);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['relying_party_oauth_client_id'], 'corny_jokes');
      });

      it('uses the client id from the event data', async () => {
        await glean.login.success(request, { oauthClientId: 'runny_eggs' });
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['relying_party_oauth_client_id'], 'runny_eggs');
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
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['relying_party_service'], 'brass_monkey');
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
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['relying_party_oauth_client_id'],
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
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['session_device_type'], 'phablet');
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
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['session_entrypoint'], 'homepage');
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
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['session_flow_id'], '101');
      });
    });

    describe('utm', () => {
      let metrics: Dictionary<string>;

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
        metrics = recordStub.args[0][0];
      });

      it('sets the campaign', async () => {
        assert.equal(metrics['utm_campaign'], 'camp');
      });

      it('sets the content', async () => {
        assert.equal(metrics['utm_content'], 'con');
      });

      it('sets the medium', async () => {
        assert.equal(metrics['utm_medium'], 'mid');
      });

      it('sets the source', async () => {
        assert.equal(metrics['utm_source'], 'sour');
      });

      it('sets the term', async () => {
        assert.equal(metrics['utm_term'], 'erm');
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
      sinon.assert.calledOnce(recordStub);
      const metrics = recordStub.args[0][0];
      assert.equal(metrics['event_name'], 'account_password_reset');
      sinon.assert.calledOnce(recordAccountPasswordResetStub);
    });

    it('logs a "account_delete_complete" event', async () => {
      await glean.account.deleteComplete(request);
      sinon.assert.calledOnce(recordStub);
      const metrics = recordStub.args[0][0];
      assert.equal(metrics['event_name'], 'account_delete_complete');
      sinon.assert.calledOnce(recordAccountDeleteCompleteStub);
    });
  });

  describe('two factor auth', () => {
    let glean: GleanMetricsType;

    beforeEach(() => {
      glean = gleanMetrics(config);
    });

    it('logs a "two_factor_auth_code_complete" event', async () => {
      await glean.twoFactorAuth.codeComplete(request);
      sinon.assert.calledOnce(recordStub);
      const metrics = recordStub.args[0][0];
      assert.equal(metrics['event_name'], 'two_factor_auth_code_complete');
      sinon.assert.calledOnce(recordTwoFactorAuthCodeCompleteStub);
    });

    it('logs a "two_factor_auth_replace_code_complete" event', async () => {
      await glean.twoFactorAuth.replaceCodeComplete(request);
      sinon.assert.calledOnce(recordStub);
      const metrics = recordStub.args[0][0];
      assert.equal(
        metrics['event_name'],
        'two_factor_auth_replace_code_complete'
      );
      sinon.assert.calledOnce(recordTwoFactorAuthReplaceCodeCompleteStub);
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
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'reg_acc_created');
        sinon.assert.calledOnce(recordRegAccCreatedStub);
      });
    });

    describe('confirmationEmailSent', () => {
      it('logs a "reg_email_sent" event', async () => {
        await glean.registration.confirmationEmailSent(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'reg_email_sent');
        sinon.assert.calledOnce(recordRegEmailSentStub);
      });
    });

    describe('accountVerified', () => {
      it('logs a "reg_acc_verified" event', async () => {
        const glean = gleanMetrics(config);
        await glean.registration.accountVerified(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'reg_acc_verified');
        sinon.assert.calledOnce(recordRegAccVerifiedStub);
      });
    });

    describe('reg_complete', () => {
      it('logs a "reg_complete" event', async () => {
        const glean = gleanMetrics(config);
        await glean.registration.complete(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'reg_complete');
        sinon.assert.calledOnce(recordRegCompleteStub);
      });
    });

    describe('reg_submit_error', () => {
      it('logs a "reg_submit_error" event', async () => {
        const glean = gleanMetrics(config);
        await glean.registration.error(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'reg_submit_error');
        sinon.assert.calledOnce(recordRegSubmitErrorStub);
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
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'login_success');
      });
    });

    describe('error', () => {
      it('logs a "login_submit_backend_error" event', async () => {
        await glean.login.error(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'login_submit_backend_error');
      });
    });

    describe('totp', () => {
      it('logs a "login_totp_code_success" event', async () => {
        await glean.login.totpSuccess(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'login_totp_code_success');
      });

      it('logs a "login_totp_code_failure" event', async () => {
        await glean.login.totpFailure(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'login_totp_code_failure');
      });
    });

    describe('verifyCodeEmail', () => {
      it('logs a "login_email_confirmation_sent" event', async () => {
        await glean.login.verifyCodeEmailSent(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'login_email_confirmation_sent');
      });

      it('logs a "login_email_confirmation_success" event', async () => {
        await glean.login.verifyCodeConfirmed(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'login_email_confirmation_success');
      });
    });
  });

  describe('oauth', () => {
    describe('tokenChecked', () => {
      it('sends an empty ip address', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenChecked(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['ip_address'], '');
      });

      it('handles undefined scopes', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenChecked(request, {
          scopes: undefined,
        });
        sinon.assert.calledOnce(recordAccessTokenCheckedStub);
        const metrics = recordAccessTokenCheckedStub.args[0][0];
        assert.equal(metrics['scopes'], '');
      });

      it('handles empty scopes', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenChecked(request, {
          scopes: '',
        });
        sinon.assert.calledOnce(recordAccessTokenCheckedStub);
        const metrics = recordAccessTokenCheckedStub.args[0][0];
        assert.equal(metrics['scopes'], '');
      });

      it('includes sorted comma separated scopes as array', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenChecked(request, {
          scopes: ['profile', 'openid'],
        });
        sinon.assert.calledOnce(recordAccessTokenCheckedStub);
        const metrics = recordAccessTokenCheckedStub.args[0][0];
        assert.equal(metrics['scopes'], 'openid,profile');
      });

      it('includes sorted comma separated scopes as string', async () => {
        const glean = gleanMetrics(config);
        await glean.oauth.tokenChecked(request, {
          scopes: 'profile,openid',
        });
        sinon.assert.calledOnce(recordAccessTokenCheckedStub);
        const metrics = recordAccessTokenCheckedStub.args[0][0];
        assert.equal(metrics['scopes'], 'openid,profile');
      });
    });
  });

  describe('thirdPartyAuth', () => {
    describe('googleLoginComplete', () => {
      beforeEach(() => {
        recordThirdPartyAuthGoogleLoginCompleteStub.reset();
      });

      it('log string and event metrics with account linking for Google', async () => {
        const glean = gleanMetrics(config);
        await glean.thirdPartyAuth.googleLoginComplete(request, {
          reason: 'linking',
        });
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['event_name'],
          'third_party_auth_google_login_complete'
        );
        assert.equal(metrics['event_reason'], 'linking');
        sinon.assert.calledOnce(recordThirdPartyAuthGoogleLoginCompleteStub);
        assert.isTrue(
          recordThirdPartyAuthGoogleLoginCompleteStub.args[0][0].linking
        );
      });

      it('log string and event metrics without account linking for Google', async () => {
        const glean = gleanMetrics(config);
        await glean.thirdPartyAuth.googleLoginComplete(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['event_name'],
          'third_party_auth_google_login_complete'
        );
        assert.equal(metrics['event_reason'], '');
        sinon.assert.calledOnce(recordThirdPartyAuthGoogleLoginCompleteStub);
        assert.isFalse(
          recordThirdPartyAuthGoogleLoginCompleteStub.args[0][0].linking
        );
      });
    });
    describe('appleLoginComplete', () => {
      beforeEach(() => {
        recordThirdPartyAuthAppleLoginCompleteStub.reset();
      });

      it('log string and event metrics with account linking for Apple', async () => {
        const glean: GleanMetricsType = gleanMetrics(config);
        await glean.thirdPartyAuth.appleLoginComplete(request, {
          reason: 'linking',
        });
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['event_name'],
          'third_party_auth_apple_login_complete'
        );
        assert.equal(metrics['event_reason'], 'linking');
        sinon.assert.calledOnce(recordThirdPartyAuthAppleLoginCompleteStub);
        assert.isTrue(
          recordThirdPartyAuthAppleLoginCompleteStub.args[0][0].linking
        );
      });

      it('log string and event metrics without account linking for Apple', async () => {
        const glean: GleanMetricsType = gleanMetrics(config);
        await glean.thirdPartyAuth.appleLoginComplete(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['event_name'],
          'third_party_auth_apple_login_complete'
        );
        assert.equal(metrics['event_reason'], '');
        sinon.assert.calledOnce(recordThirdPartyAuthAppleLoginCompleteStub);
        assert.isFalse(
          recordThirdPartyAuthAppleLoginCompleteStub.args[0][0].linking
        );
      });
    });
    describe('googleRegComplete', () => {
      beforeEach(() => {
        recordThirdPartyAuthGoogleRegCompleteStub.reset();
      });

      it('log string and event metrics for Google', async () => {
        const glean: GleanMetricsType = gleanMetrics(config);
        await glean.thirdPartyAuth.googleRegComplete(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['event_name'],
          'third_party_auth_google_reg_complete'
        );
        sinon.assert.calledOnce(recordThirdPartyAuthGoogleRegCompleteStub);
      });
    });
    describe('appleRegComplete', () => {
      beforeEach(() => {
        recordThirdPartyAuthAppleRegCompleteStub.reset();
      });

      it('log string and event metrics for Google', async () => {
        const glean: GleanMetricsType = gleanMetrics(config);
        await glean.thirdPartyAuth.appleRegComplete(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['event_name'],
          'third_party_auth_apple_reg_complete'
        );
        sinon.assert.calledOnce(recordThirdPartyAuthAppleRegCompleteStub);
      });
    });
    describe('setPasswordComplete', () => {
      beforeEach(() => {
        recordThirdPartyAuthSetPasswordCompleteStub.reset();
      });

      it('log string and event metrics with account linking', async () => {
        const glean: GleanMetricsType = gleanMetrics(config);
        await glean.thirdPartyAuth.setPasswordComplete(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['event_name'],
          'third_party_auth_set_password_complete'
        );
        sinon.assert.calledOnce(recordThirdPartyAuthSetPasswordCompleteStub);
      });
    });
  });

  describe('logErrorWithGlean hapi preResponse error logger', () => {
    const error = AppError.requestBlocked();
    const glean = mocks.mockGlean();

    describe('/account/create', () => {
      it('logs a ping with glean.registration.error', () => {
        (glean.registration.error as SinonStub).reset();
        const request = { path: '/account/create' };
        logErrorWithGlean({
          glean,
          request,
          error,
        });
        sinon.assert.calledOnce(glean.registration.error as SinonStub);
        sinon.assert.calledWithExactly(
          glean.registration.error as SinonStub,
          request,
          { reason: 'REQUEST_BLOCKED' }
        );
      });
    });

    describe('/account/login', () => {
      it('logs a ping with glean.login.error', () => {
        (glean.login.error as SinonStub).reset();
        const request = { path: '/account/login' };
        logErrorWithGlean({
          glean,
          request,
          error,
        });
        sinon.assert.calledOnce(glean.login.error as SinonStub);
        sinon.assert.calledWithExactly(
          glean.login.error as SinonStub,
          request,
          { reason: 'REQUEST_BLOCKED' }
        );
      });
    });
  });
});
