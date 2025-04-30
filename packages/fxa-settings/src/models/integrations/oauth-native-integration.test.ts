/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import {
  OAuthNativeClients,
  OAuthNativeIntegration,
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
      service: 'sync',
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
    model.data.service = 'sync';
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
      model.data.service = 'sync';
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
      model.data.service = 'relay';
      expect(model.isSync()).toBe(false);
    });
  });

  describe('isDesktopSync', () => {
    it('returns true when client is Firefox desktop and service is sync', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = 'sync';
      expect(model.isDesktopSync()).toBe(true);
    });

    it('returns false for non-sync service', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = 'relay';
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

  describe('serviceName', () => {
    it('returns "Firefox" for non-sync services', () => {
      model.data.service = 'non-sync-service';
      expect(model.serviceName).toBe('Firefox');
    });

    it('returns Sync service name for sync service', () => {
      model.data.service = 'sync';
      expect(model.serviceName).toBe('Firefox Sync');
    });
  });
});
