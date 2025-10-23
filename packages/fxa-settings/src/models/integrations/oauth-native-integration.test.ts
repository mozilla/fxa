/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GenericData, ModelDataStore } from '../../lib/model-data';
import {
  OAuthNativeClients,
  OAuthNativeIntegration,
  OAuthNativeServices,
} from './oauth-native-integration';
import { OAuthWebIntegration } from './oauth-web-integration';

function mockClientInfo(clientId: string) {
  return {
    clientId,
    serviceName: 'Firefox Sync',
    redirectUri: 'https://mock.com',
    trusted: true,
    imageUri: '',
  };
}

describe('OAuthNativeIntegration', function () {
  let data: ModelDataStore;
  let oauthData: ModelDataStore;
  let model: OAuthNativeIntegration;

  beforeEach(function () {
    data = new GenericData({
      clientId: OAuthNativeClients.FirefoxIOS,
      service: OAuthNativeServices.Sync,
    });
    oauthData = new GenericData({
      scope: 'profile',
    });
    model = new OAuthNativeIntegration(data, oauthData, {
      scopedKeysEnabled: true,
      scopedKeysValidation: {},
      isPromptNoneEnabled: true,
      isPromptNoneEnabledClientIds: [],
    });
    model.data.service = OAuthNativeServices.Sync;
    model.data.state = 'aaaa';
    model.data.clientId = '123abc';
  });

  it('exists and extends OAuthWebIntegration', () => {
    expect(model).toBeDefined();
    expect(model instanceof OAuthWebIntegration).toBe(true);
  });

  describe('isSync', () => {
    it('returns true for Firefox desktop client when service is sync', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      expect(model.isSync()).toBe(true);
    });

    it('returns true for Firefox desktop client when service is not defined', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      expect(model.isSync()).toBe(true);
    });

    it('returns true for Firefox iOS client', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxIOS);
      expect(model.isSync()).toBe(true);
    });

    it('returns true for Fenix client', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.Fenix);
      expect(model.isSync()).toBe(true);
    });

    it('returns true for Fennec client', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.Fennec);
      expect(model.isSync()).toBe(true);
    });

    it('returns false for non-Sync services', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      expect(model.isSync()).toBe(false);
    });
  });

  describe('isDesktopSync', () => {
    it('returns true when client is Firefox desktop and service is sync', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      expect(model.isDesktopSync()).toBe(true);
    });

    it('returns false for non-sync service', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      expect(model.isDesktopSync()).toBe(false);
    });
  });

  describe('isFirefoxMobileClient', () => {
    it('returns true for Firefox iOS client ID', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxIOS);
      expect(model.isFirefoxMobileClient()).toBe(true);
    });

    it('returns true for Fenix client ID', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.Fenix);
      expect(model.isFirefoxMobileClient()).toBe(true);
    });

    it('returns true for Fennec client ID', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.Fennec);
      expect(model.isFirefoxMobileClient()).toBe(true);
    });

    it('returns false for unknown client ID', () => {
      model.clientInfo = mockClientInfo('unknown-client-id');
      expect(model.isFirefoxMobileClient()).toBe(false);
    });
  });

  describe('isFirefoxDesktopClient', () => {
    it('returns true for Firefox desktop client ID', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      expect(model.isFirefoxDesktopClient()).toBe(true);
    });

    it('returns false for other client IDs', () => {
      expect(model.isFirefoxDesktopClient()).toBe(false);
    });
  });

  describe('wantsKeys', () => {
    it('returns true', () => {
      expect(model.wantsKeys()).toBe(true);
    });
  });

  describe('getServiceName', () => {
    it('returns "Firefox" for non-sync services', () => {
      model.data.service = 'non-sync-service';
      expect(model.getServiceName()).toBe('Firefox');
    });

    it('returns Sync service name for sync service', () => {
      model.data.service = OAuthNativeServices.Sync;
      expect(model.getServiceName()).toBe('Firefox Sync');
    });

    it('returns Relay service name for relay service', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      expect(model.getServiceName()).toBe('Firefox Relay');
    });

    it('returns AI Mode service name for aimode service', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.AiMode;
      expect(model.getServiceName()).toBe('Firefox AI Mode');
    });
  });

  describe('isFirefoxClientServiceRelay', () => {
    it('returns true when service is relay', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      expect(model.isFirefoxClientServiceRelay()).toBe(true);
    });

    it('returns false when service is sync', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      expect(model.isFirefoxClientServiceRelay()).toBe(false);
    });

    it('returns false when service is aimode', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.AiMode;
      expect(model.isFirefoxClientServiceRelay()).toBe(false);
    });
  });

  describe('isFirefoxClientServiceAiMode', () => {
    it('returns true when service is aimode', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.AiMode;
      expect(model.isFirefoxClientServiceAiMode()).toBe(true);
    });

    it('returns false when service is sync', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      expect(model.isFirefoxClientServiceAiMode()).toBe(false);
    });

    it('returns false when service is relay', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      expect(model.isFirefoxClientServiceAiMode()).toBe(false);
    });
  });

  describe('getWebChannelServices', () => {
    it('returns relay services when service is relay', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      expect(model.getWebChannelServices()).toEqual({ relay: {} });
    });

    it('returns aimode services when service is aimode', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.AiMode;
      expect(model.getWebChannelServices()).toEqual({ aimode: {} });
    });

    it('returns sync services when service is sync', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      const syncEngines = { offeredEngines: ['tabs'], declinedEngines: [] };
      expect(model.getWebChannelServices(syncEngines)).toEqual({
        sync: syncEngines,
      });
    });

    it('returns sync services with empty object when no sync engines provided', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      expect(model.getWebChannelServices()).toEqual({ sync: {} });
    });
  });
});
