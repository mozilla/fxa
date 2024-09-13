/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';
import * as GleanMetricsAPI from '@mozilla/glean/metrics';
import { testResetGlean } from '@mozilla/glean/testing';
import sinon, { SinonStub } from 'sinon';

import GleanMetrics, { GleanMetricsContext } from './index';
import * as pings from 'fxa-shared/metrics/glean/web/pings';
import * as event from 'fxa-shared/metrics/glean/web/event';
import * as reg from 'fxa-shared/metrics/glean/web/reg';
import * as login from 'fxa-shared/metrics/glean/web/login';
import * as accountPref from 'fxa-shared/metrics/glean/web/accountPref';
import * as accountBanner from 'fxa-shared/metrics/glean/web/accountBanner';
import * as deleteAccount from 'fxa-shared/metrics/glean/web/deleteAccount';
import * as thirdPartyAuth from 'fxa-shared/metrics/glean/web/thirdPartyAuth';
import { userIdSha256, userId } from 'fxa-shared/metrics/glean/web/account';
import {
  oauthClientId,
  service,
} from 'fxa-shared/metrics/glean/web/relyingParty';
import {
  deviceType,
  entrypoint,
  flowId,
} from 'fxa-shared/metrics/glean/web/session';
import * as utm from 'fxa-shared/metrics/glean/web/utm';
import * as entrypointQuery from 'fxa-shared/metrics/glean/web/entrypoint';

import { Config } from '../config';
import { WebIntegration, useAccount } from '../../models';
import { MetricsFlow } from '../metrics-flow';

const sandbox = sinon.createSandbox();
const mockConfig: Config['glean'] = {
  enabled: false,
  applicationId: 'testo',
  uploadEnabled: true,
  appDisplayVersion: '9001',
  appChannel: 'test',
  serverEndpoint: 'https://metrics.example.io/',
  logPings: false,
  debugViewTag: '',
};
let mockMetricsFlow: MetricsFlow | null = null;
const mockAccount = {
  metricsEnabled: true,
  recoveryKey: { exists: true },
  totpActive: true,
  hasSecondaryVerifiedEmail: false,
} as unknown as ReturnType<typeof useAccount>;
let mockUserAgent = '';
const mockIntegration = { data: {} } as unknown as WebIntegration;
const mockMetricsContext: GleanMetricsContext = {
  metricsFlow: mockMetricsFlow,
  account: mockAccount,
  userAgent: mockUserAgent,
  integration: mockIntegration,
};

describe('lib/glean', () => {
  let submitPingStub: SinonStub,
    setDeviceTypeStub: SinonStub,
    setEntrypointStub: SinonStub,
    setEventNameStub: SinonStub,
    setEventReasonStub: SinonStub,
    setFlowIdStub: SinonStub,
    setOauthClientIdStub: SinonStub,
    setServiceStub: SinonStub,
    setUserIdStub: SinonStub,
    setUserIdSha256Stub: SinonStub,
    setUtmCampaignStub: SinonStub,
    setUtmContentStub: SinonStub,
    setUtmMediumStub: SinonStub,
    setUtmSourceStub: SinonStub,
    setUtmTermStub: SinonStub,
    setEntrypointExperimentStub: SinonStub,
    setEntrypointVariationStub: SinonStub,
    pageLoadStub: SinonStub,
    handleClickEvent: SinonStub;

  beforeEach(async () => {
    mockMetricsContext.metricsFlow = {
      flowId: '00ff',
      flowBeginTime: Date.now(),
    };
    mockMetricsContext.userAgent = 'ELinks/0.9.3 (textmode; SunOS)';
    mockIntegration.data = {
      clientId: 'abc',
      service: 'wibble',
      entrypoint: 'theweb',
      utmCampaign: 'greatest',
      utmContent: 'show',
      utmMedium: 'TV',
      utmSource: 'mystery',
      utmTerm: 'thunk',
      entrypointExperiment: 'on',
      entrypointVariation: 'earth',
    };

    setDeviceTypeStub = sandbox.stub(deviceType, 'set');
    setEntrypointStub = sandbox.stub(entrypoint, 'set');
    setEventNameStub = sandbox.stub(event.name, 'set');
    setEventReasonStub = sandbox.stub(event.reason, 'set');
    setFlowIdStub = sandbox.stub(flowId, 'set');
    setOauthClientIdStub = sandbox.stub(oauthClientId, 'set');
    setServiceStub = sandbox.stub(service, 'set');
    setUserIdStub = sandbox.stub(userId, 'set');
    setUserIdSha256Stub = sandbox.stub(userIdSha256, 'set');
    setUtmCampaignStub = sandbox.stub(utm.campaign, 'set');
    setUtmContentStub = sandbox.stub(utm.content, 'set');
    setUtmMediumStub = sandbox.stub(utm.medium, 'set');
    setUtmSourceStub = sandbox.stub(utm.source, 'set');
    setUtmTermStub = sandbox.stub(utm.term, 'set');
    setEntrypointExperimentStub = sandbox.stub(
      entrypointQuery.experiment,
      'set'
    );
    setEntrypointVariationStub = sandbox.stub(entrypointQuery.variation, 'set');
    submitPingStub = sandbox.stub(pings.accountsEvents, 'submit');
    pageLoadStub = sandbox.stub(GleanMetricsAPI.default, 'pageLoad');
    handleClickEvent = sandbox.stub(
      GleanMetricsAPI.default,
      'handleClickEvent'
    );

    await testResetGlean('glean-test');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('disabled', () => {
    it('does not call Glean.initialize', () => {
      const initStub = sandbox.stub(Glean, 'initialize');
      sandbox.stub(Glean, 'setUploadEnabled');
      const setEnabledSpy = sandbox.spy(GleanMetrics, 'setEnabled');
      GleanMetrics.initialize(mockConfig, mockMetricsContext);
      sinon.assert.notCalled(initStub);
      sinon.assert.calledOnce(setEnabledSpy);
      sinon.assert.calledWith(setEnabledSpy, false);
    });

    it('does not submit a ping on an event', async () => {
      GleanMetrics.registration.view();
      await GleanMetrics.isDone();
      sinon.assert.notCalled(submitPingStub);
    });

    it('does not set the metrics values', async () => {
      GleanMetrics.registration.view();
      await GleanMetrics.isDone();
      sinon.assert.notCalled(setOauthClientIdStub);
      sinon.assert.notCalled(setServiceStub);
      sinon.assert.notCalled(setDeviceTypeStub);
      sinon.assert.notCalled(setEntrypointStub);
      sinon.assert.notCalled(setFlowIdStub);
      sinon.assert.notCalled(setUtmCampaignStub);
      sinon.assert.notCalled(setUtmContentStub);
      sinon.assert.notCalled(setUtmMediumStub);
      sinon.assert.notCalled(setUtmSourceStub);
      sinon.assert.notCalled(setUtmTermStub);
      sinon.assert.notCalled(setEntrypointExperimentStub);
      sinon.assert.notCalled(setEntrypointVariationStub);
    });
  });

  describe('initialization error', () => {
    it('disables Glean', async () => {
      const config = { ...mockConfig, enabled: true };
      const initStub = sandbox.stub(Glean, 'initialize').throws();
      GleanMetrics.initialize(config, mockMetricsContext);
      sinon.assert.calledOnce(initStub);
      expect(config.enabled).toBe(false);
      GleanMetrics.registration.view();
      await GleanMetrics.isDone();
      sinon.assert.notCalled(setUserIdStub);
      sinon.assert.notCalled(setUserIdSha256Stub);
    });
  });

  describe('enabled', () => {
    it('calls Glean.initialize when enabled', () => {
      const initStub = sandbox.stub(Glean, 'initialize');
      const setEnabledSpy = sandbox.spy(GleanMetrics, 'setEnabled');
      const logPingsStub = sandbox.stub(Glean, 'setLogPings');
      const debugViewTagStub = sandbox.stub(Glean, 'setDebugViewTag');
      GleanMetrics.initialize(
        { ...mockConfig, enabled: true },
        mockMetricsContext
      );
      sinon.assert.calledOnce(initStub);
      sinon.assert.calledWith(
        initStub,
        mockConfig.applicationId,
        mockConfig.uploadEnabled,
        {
          appDisplayVersion: mockConfig.appDisplayVersion,
          channel: mockConfig.appChannel,
          serverEndpoint: mockConfig.serverEndpoint,
          enableAutoPageLoadEvents: true,
          enableAutoElementClickEvents: true,
        }
      );
      sinon.assert.calledWith(logPingsStub, mockConfig.logPings);
      sinon.assert.notCalled(debugViewTagStub);
      sinon.assert.calledOnce(setEnabledSpy);
      sinon.assert.calledWith(setEnabledSpy, true);
    });

    it('submits a ping on an event', async () => {
      GleanMetrics.registration.view();
      await GleanMetrics.isDone();
      sinon.assert.calledOnce(submitPingStub);
    });

    it('sets empty strings as defaults', async () => {
      mockIntegration.data = {};
      mockMetricsContext.userAgent = '';
      mockMetricsContext.metricsFlow = null;
      mockMetricsContext.account = undefined;
      GleanMetrics.initialize(
        { ...mockConfig, enabled: true },
        mockMetricsContext
      );
      GleanMetrics.registration.view();
      await GleanMetrics.isDone();

      sinon.assert.calledWith(setUserIdStub, '');
      sinon.assert.calledWith(setUserIdSha256Stub, '');
      sinon.assert.calledWith(setOauthClientIdStub, '');
      sinon.assert.calledWith(setServiceStub, '');
      sinon.assert.calledWith(setDeviceTypeStub, '');
      sinon.assert.calledWith(setEntrypointStub, '');
      sinon.assert.calledWith(setFlowIdStub, '');
      sinon.assert.calledWith(setUtmCampaignStub, '');
      sinon.assert.calledWith(setUtmContentStub, '');
      sinon.assert.calledWith(setUtmMediumStub, '');
      sinon.assert.calledWith(setUtmSourceStub, '');
      sinon.assert.calledWith(setUtmTermStub, '');
      sinon.assert.calledWith(setEntrypointExperimentStub, '');
      sinon.assert.calledWith(setEntrypointVariationStub, '');
    });

    it('sets the metrics values', async () => {
      GleanMetrics.initialize(
        { ...mockConfig, enabled: true },
        mockMetricsContext
      );

      GleanMetrics.registration.view();
      await GleanMetrics.isDone();

      sinon.assert.calledWith(
        setOauthClientIdStub,
        mockIntegration.data.clientId
      );
      sinon.assert.calledWith(setServiceStub, mockIntegration.data.service);
      sinon.assert.calledWith(setDeviceTypeStub, 'desktop');
      sinon.assert.calledWith(
        setEntrypointStub,
        mockIntegration.data.entrypoint
      );
      sinon.assert.calledWith(setFlowIdStub, '00ff');
      sinon.assert.calledWith(
        setUtmCampaignStub,
        mockIntegration.data.utmCampaign
      );
      sinon.assert.calledWith(
        setUtmContentStub,
        mockIntegration.data.utmContent
      );
      sinon.assert.calledWith(setUtmMediumStub, mockIntegration.data.utmMedium);
      sinon.assert.calledWith(setUtmSourceStub, mockIntegration.data.utmSource);
      sinon.assert.calledWith(setUtmTermStub, mockIntegration.data.utmTerm);
      sinon.assert.calledWith(
        setEntrypointVariationStub,
        mockIntegration.data.entrypointVariation
      );
      sinon.assert.calledWith(
        setEntrypointExperimentStub,
        mockIntegration.data.entrypointExperiment
      );
    });

    it('submits the pings in order', async () => {
      // not await on these calls
      GleanMetrics.registration.view();
      GleanMetrics.registration.submit();
      GleanMetrics.registration.success();

      // the ping submissions are await'd internally in GleanMetrics...
      await GleanMetrics.isDone();

      // the set name call is after the await of the ping ahead of it...
      expect(
        setDeviceTypeStub.getCall(0).calledBefore(setEventNameStub.getCall(1))
      ).toBeTruthy();

      expect(
        setDeviceTypeStub.getCall(1).calledBefore(setEventNameStub.getCall(2))
      ).toBeTruthy();
    });

    describe('hashed uid', () => {
      it('logs userId when session token exists', async () => {
        mockMetricsContext.account = { uid: 'testo' } as ReturnType<
          typeof useAccount
        >;
        GleanMetrics.login.success();
        // the ping submissions are await'd internally in GleanMetrics...
        await GleanMetrics.isDone();

        // it sets a default of '' first
        sinon.assert.calledTwice(setUserIdStub);
        sinon.assert.calledWith(setUserIdStub, '');
        sinon.assert.calledWith(setUserIdStub, 'testo');

        sinon.assert.calledTwice(setUserIdSha256Stub);
        sinon.assert.calledWith(setUserIdSha256Stub, '');
        sinon.assert.calledWith(
          setUserIdSha256Stub,
          '7ca0172850c53065046beeac3cdec3fe921532dbfebdf7efeb5c33d019cd7798'
        );
      });
    });

    describe('email first', () => {
      it('submits a ping with the email_first_view event name', async () => {
        GleanMetrics.emailFirst.view();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'email_first_view');
      });
    });

    describe('registration', () => {
      it('submits a ping with the reg_view event name', async () => {
        GleanMetrics.registration.view();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'reg_view');
      });

      it('submits a ping with the reg_submit event name', async () => {
        GleanMetrics.registration.submit();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'reg_submit');
      });

      it('submits a ping with the reg_submit_success event name', async () => {
        GleanMetrics.registration.success();
        await new Promise((resolve) =>
          setTimeout(() => {
            sinon.assert.calledOnce(setEventNameStub);
            sinon.assert.calledWith(setEventNameStub, 'reg_submit_success');
            resolve(undefined);
          }, 20)
        );
      });

      it('submits a ping with the reg_change_email_link_click event name', async () => {
        GleanMetrics.registration.changeEmail();
        const spy = sandbox.spy(reg.changeEmailLinkClick, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'reg_change_email_link_click'
        );
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the reg_why_do_we_ask_link_click event name', async () => {
        GleanMetrics.registration.whyWeAsk();
        const spy = sandbox.spy(reg.whyDoWeAskLinkClick, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'reg_why_do_we_ask_link_click'
        );
        sinon.assert.calledOnce(spy);
      });
    });

    describe('signup confirmation code', () => {
      it('submits a ping with the reg_signup_code_view event name', async () => {
        GleanMetrics.signupConfirmation.view();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'reg_signup_code_view');
      });

      it('submits a ping with the reg_signup_code_submit event name', async () => {
        GleanMetrics.signupConfirmation.submit();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'reg_signup_code_submit');
      });
    });

    describe('loginConfirmation', () => {
      it('submits a ping with the login_email_confirmation_view event name', async () => {
        GleanMetrics.loginConfirmation.view();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'login_email_confirmation_view'
        );
      });

      it('submits a ping with the reg_submit event name', async () => {
        GleanMetrics.loginConfirmation.submit();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'login_email_confirmation_submit'
        );
      });
    });

    describe('totpForm', () => {
      it('submits a ping with the login_totp_form_view event name', async () => {
        GleanMetrics.totpForm.view();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'login_totp_form_view');
      });

      it('submits a ping with the login_totp_code_submit event name', async () => {
        GleanMetrics.totpForm.submit();
        await new Promise((resolve) =>
          setTimeout(() => {
            sinon.assert.calledOnce(setEventNameStub);
            sinon.assert.calledWith(setEventNameStub, 'login_totp_code_submit');
            resolve(undefined);
          }, 20)
        );
      });

      it('submits a ping with the login_totp_code_success_view event name', async () => {
        GleanMetrics.totpForm.success();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'login_totp_code_success_view'
        );
      });
    });

    describe('login', () => {
      it('submits a ping with the login_view event name', async () => {
        GleanMetrics.login.view();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'login_view');
      });

      it('submits a ping with the login_submit event name', async () => {
        GleanMetrics.login.submit();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'login_submit');
      });

      it('submits a ping with the login_submit_success event name', async () => {
        GleanMetrics.login.success();
        await new Promise((resolve) =>
          setTimeout(() => {
            sinon.assert.calledOnce(setEventNameStub);
            sinon.assert.calledWith(setEventNameStub, 'login_submit_success');
            resolve(undefined);
          }, 20)
        );
      });

      it('submits a ping with the login_submit_frontend_error event name and a reason', async () => {
        GleanMetrics.login.error({ event: { reason: 'quux' } });
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'login_submit_frontend_error'
        );
        sinon.assert.calledOnce(setEventReasonStub);
        sinon.assert.calledWith(setEventReasonStub, 'quux');
      });
    });

    describe('loginBackupCode', () => {
      it('submits a ping with the login_backup_code_view name', async () => {
        GleanMetrics.loginBackupCode.view();
        const spy = sandbox.spy(login.backupCodeView, 'record');
        await new Promise((resolve) =>
          setTimeout(() => {
            sinon.assert.calledOnce(setEventNameStub);
            sinon.assert.calledWith(setEventNameStub, 'login_backup_code_view');
            sinon.assert.calledOnce(spy);
            resolve(undefined);
          }, 20)
        );
      });

      it('submits a ping with the login_backup_code_submit event name', async () => {
        GleanMetrics.loginBackupCode.submit();
        const spy = sandbox.spy(login.backupCodeSubmit, 'record');
        await new Promise((resolve) =>
          setTimeout(() => {
            sinon.assert.calledOnce(setEventNameStub);
            sinon.assert.calledWith(
              setEventNameStub,
              'login_backup_code_submit'
            );
            sinon.assert.calledOnce(spy);
            resolve(undefined);
          }, 20)
        );
      });

      it('submits a ping with the login_backup_code_success_view event name', async () => {
        GleanMetrics.loginBackupCode.success();
        const spy = sandbox.spy(login.backupCodeSuccessView, 'record');
        await new Promise((resolve) =>
          setTimeout(() => {
            sinon.assert.calledOnce(setEventNameStub);
            sinon.assert.calledWith(
              setEventNameStub,
              'login_backup_code_success_view'
            );
            sinon.assert.calledOnce(spy);
            resolve(undefined);
          }, 20)
        );
      });

      it('submits a ping with the login_submit_frontend_error event name and a reason', async () => {
        GleanMetrics.login.error({ event: { reason: 'quux' } });
        await new Promise((resolve) =>
          setTimeout(() => {
            sinon.assert.calledOnce(setEventNameStub);
            sinon.assert.calledWith(
              setEventNameStub,
              'login_submit_frontend_error'
            );
            sinon.assert.calledOnce(setEventReasonStub);
            sinon.assert.calledWith(setEventReasonStub, 'quux');
            resolve(undefined);
          }, 20)
        );
      });
    });

    describe('thirdPartyAuth', () => {
      it('submits a ping with the third_party_auth_google_reg_start event name', async () => {
        const spy = sandbox.spy(thirdPartyAuth.googleRegStart, 'record');
        GleanMetrics.thirdPartyAuth.startGoogleAuthFromReg();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'third_party_auth_google_reg_start'
        );
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the login_third_party_auth_no_pw_view event name', async () => {
        const spy = sandbox.spy(thirdPartyAuth.loginNoPwView, 'record');
        GleanMetrics.thirdPartyAuth.viewWithNoPasswordSet();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'third_party_auth_login_no_pw_view'
        );
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the third_party_auth_google_login_start event name', async () => {
        const spy = sandbox.spy(thirdPartyAuth.googleLoginStart, 'record');
        GleanMetrics.thirdPartyAuth.startGoogleAuthFromLogin();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'third_party_auth_google_login_start'
        );
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the third_party_auth_apple_login_start event name', async () => {
        const spy = sandbox.spy(thirdPartyAuth.appleLoginStart, 'record');
        GleanMetrics.thirdPartyAuth.startAppleAuthFromLogin();
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'third_party_auth_apple_login_start'
        );
        sinon.assert.calledOnce(spy);
      });
    });

    describe('accountPref', () => {
      it('submits a ping with the account_pref_view event name', async () => {
        GleanMetrics.accountPref.view();
        const spy = sandbox.spy(accountPref.view, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'account_pref_view');
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the account_pref_recovery_key_submit event name', async () => {
        GleanMetrics.accountPref.recoveryKeySubmit();
        const spy = sandbox.spy(accountPref.recoveryKeySubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_recovery_key_submit'
        );
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the account_pref_display_name_submit event name', async () => {
        GleanMetrics.accountPref.displayNameSubmit();
        const spy = sandbox.spy(accountPref.displayNameSubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_display_name_submit'
        );
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the account_pref_secondary_email_submit event name', async () => {
        GleanMetrics.accountPref.secondaryEmailSubmit();
        const spy = sandbox.spy(accountPref.secondaryEmailSubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_secondary_email_submit'
        );
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the account_pref_two_step_auth_submit event name', async () => {
        GleanMetrics.accountPref.twoStepAuthSubmit();
        const spy = sandbox.spy(accountPref.twoStepAuthSubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_two_step_auth_submit'
        );
        sinon.assert.called(spy);
      });

      it('submits a ping with the account_pref_google_unlink_submit event name', async () => {
        GleanMetrics.accountPref.googleUnlinkSubmit();
        const spy = sandbox.spy(accountPref.googleUnlinkSubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_google_unlink_submit'
        );
        sinon.assert.called(spy);
      });
      it('submits a ping with the account_pref_apple_unlink_submit event name', async () => {
        GleanMetrics.accountPref.appleUnlinkSubmit();
        const spy = sandbox.spy(accountPref.appleUnlinkSubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_apple_unlink_submit'
        );
        sinon.assert.called(spy);
      });
      it('submits a ping with the account_pref_google_unlink_submit_confirm event name', async () => {
        GleanMetrics.accountPref.googleUnlinkSubmitConfirm();
        const spy = sandbox.spy(
          accountPref.googleUnlinkSubmitConfirm,
          'record'
        );
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_google_unlink_submit_confirm'
        );
        sinon.assert.called(spy);
      });
      it('submits a ping with the account_pref_apple_unlink_submit_confirm event name', async () => {
        GleanMetrics.accountPref.appleUnlinkSubmitConfirm();
        const spy = sandbox.spy(accountPref.appleUnlinkSubmitConfirm, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_apple_unlink_submit_confirm'
        );
        sinon.assert.called(spy);
      });

      it('submits a ping with the account_pref_change_password_submit event name', async () => {
        GleanMetrics.accountPref.changePasswordSubmit();
        const spy = sandbox.spy(accountPref.changePasswordSubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_change_password_submit'
        );
        sinon.assert.called(spy);
      });

      it('submits a ping with the account_pref_device_signout event name', async () => {
        GleanMetrics.accountPref.deviceSignout({
          event: { reason: 'something' },
        });
        const spy = sandbox.spy(accountPref.deviceSignout, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_device_signout'
        );
        sinon.assert.called(spy);
        sinon.assert.calledOnce(setEventReasonStub);
        sinon.assert.calledWith(setEventReasonStub, 'something');
      });

      it('submits a ping with the account_pref_google_play_submit event name', async () => {
        GleanMetrics.accountPref.googlePlaySubmit();
        const spy = sandbox.spy(accountPref.googlePlaySubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_google_play_submit'
        );
        sinon.assert.called(spy);
      });

      it('submits a ping with the account_pref_apple_submit event name', async () => {
        GleanMetrics.accountPref.appleSubmit();
        const spy = sandbox.spy(accountPref.appleSubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'account_pref_apple_submit');
        sinon.assert.called(spy);
      });

      it('submits a ping with the account_pref_promo_monitor_view event name', async () => {
        GleanMetrics.accountPref.promoMonitorView();
        const spy = sandbox.spy(accountPref.promoMonitorView, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_promo_monitor_view'
        );
        sinon.assert.called(spy);
      });

      it('submits a ping with the account_pref_promo_monitor_submit event name', async () => {
        GleanMetrics.accountPref.promoMonitorSubmit();
        const spy = sandbox.spy(accountPref.promoMonitorSubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_promo_monitor_submit'
        );
        sinon.assert.called(spy);
      });

      it('submits a ping with the account_pref_bento_view event name', async () => {
        GleanMetrics.accountPref.bentoView();
        const spy = sandbox.spy(accountPref.bentoView, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'account_pref_bento_view');
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the account_pref_bento_firefox_desktop event name', async () => {
        GleanMetrics.accountPref.bentoFirefoxDesktop();
        const spy = sandbox.spy(accountPref.bentoFirefoxDesktop, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_bento_firefox_desktop'
        );
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the account_pref_bento_firefox_mobile event name', async () => {
        GleanMetrics.accountPref.bentoFirefoxMobile();
        const spy = sandbox.spy(accountPref.bentoFirefoxMobile, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_pref_bento_firefox_mobile'
        );
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the account_pref_bento_monitor event name', async () => {
        GleanMetrics.accountPref.bentoMonitor();
        const spy = sandbox.spy(accountPref.bentoMonitor, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'account_pref_bento_monitor');
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the account_pref_bento_pocket event name', async () => {
        GleanMetrics.accountPref.bentoPocket();
        const spy = sandbox.spy(accountPref.bentoPocket, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'account_pref_bento_pocket');
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the account_pref_bento_relay event name', async () => {
        GleanMetrics.accountPref.bentoRelay();
        const spy = sandbox.spy(accountPref.bentoRelay, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'account_pref_bento_relay');
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the account_pref_bento_vpn event name', async () => {
        GleanMetrics.accountPref.bentoVpn();
        const spy = sandbox.spy(accountPref.bentoVpn, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'account_pref_bento_vpn');
        sinon.assert.calledOnce(spy);
      });
    });

    describe('accountBanner', () => {
      it('submits a ping with the account_banner_create_recovery_key_view event name', async () => {
        GleanMetrics.accountBanner.createRecoveryKeyView();
        const spy = sandbox.spy(accountBanner.createRecoveryKeyView, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'account_banner_create_recovery_key_view'
        );
        sinon.assert.calledOnce(spy);
      });
    });

    describe('deleteAccount', () => {
      it('submits a ping with the delete_account_settings_submit event name', async () => {
        GleanMetrics.deleteAccount.settingsSubmit();
        const spy = sandbox.spy(deleteAccount.settingsSubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'delete_account_settings_submit'
        );
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the delete_account_view event name', async () => {
        GleanMetrics.deleteAccount.view();
        const spy = sandbox.spy(deleteAccount.view, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'delete_account_view');
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the delete_account_engage event name', async () => {
        GleanMetrics.deleteAccount.engage();
        const spy = sandbox.spy(deleteAccount.engage, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'delete_account_engage');
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the delete_account_submit event name', async () => {
        GleanMetrics.deleteAccount.submit();
        const spy = sandbox.spy(deleteAccount.submit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'delete_account_submit');
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the delete_account_password_view event name', async () => {
        GleanMetrics.deleteAccount.passwordView();
        const spy = sandbox.spy(deleteAccount.passwordView, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'delete_account_password_view'
        );
        sinon.assert.calledOnce(spy);
      });

      it('submits a ping with the delete_account_password_password_submit event name', async () => {
        GleanMetrics.deleteAccount.passwordSubmit();
        const spy = sandbox.spy(deleteAccount.passwordSubmit, 'record');
        await GleanMetrics.isDone();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'delete_account_password_submit'
        );
        sinon.assert.calledOnce(spy);
      });
    });
  });

  describe('toggle enabled state', () => {
    let setEnabledStub: SinonStub;

    beforeEach(() => {
      setEnabledStub = sandbox.stub(Glean, 'setUploadEnabled');
    });

    it('set enabled to true', async () => {
      await GleanMetrics.setEnabled(true);
      sinon.assert.calledOnce(setEnabledStub);
      sinon.assert.calledWith(setEnabledStub, true);
    });

    it('set enabled to false', async () => {
      await GleanMetrics.setEnabled(false);
      sinon.assert.calledOnce(setEnabledStub);
      sinon.assert.calledWith(setEnabledStub, false);
    });
  });

  describe('isDone', () => {
    it('resolves', async () => {
      GleanMetrics.registration.view();
      GleanMetrics.registration.submit();
      GleanMetrics.registration.success();
      GleanMetrics.login.view();
      GleanMetrics.login.submit();
      GleanMetrics.login.success();
      await GleanMetrics.isDone();
      expect(true).toBeTruthy();
    });
  });

  describe('pageLoad', () => {
    it('resolves', async () => {
      GleanMetrics.pageLoad();
      sinon.assert.calledOnce(pageLoadStub);
    });
  });
  describe('handleClickEvent', () => {
    it('resolves', async () => {
      const fakeEvent = new Event('click');
      GleanMetrics.handleClickEvent(fakeEvent);
      sinon.assert.calledOnce(handleClickEvent);
      sinon.assert.calledWith(handleClickEvent, fakeEvent);
    });
  });
});
