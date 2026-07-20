/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import { OAuthNativeClients, OAuthNativeServices } from '@fxa/accounts/oauth';
import {
  isOAuthIntegration,
  OAuthNativeIntegration,
} from './oauth-native-integration';
import { IntegrationType } from './integration';
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

  describe('requiresKeys', () => {
    it('returns true for Sync when scope has scoped keys', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      model.data.keysJwk = 'mock-keys-jwk';
      model.data.scope = 'https://identity.mozilla.com/apps/oldsync';
      model = new OAuthNativeIntegration(data, oauthData, {
        scopedKeysEnabled: true,
        scopedKeysValidation: {
          'https://identity.mozilla.com/apps/oldsync': {
            redirectUris: [model.clientInfo?.redirectUri],
          },
        },
        isPromptNoneEnabled: true,
        isPromptNoneEnabledClientIds: [],
      });
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      model.data.keysJwk = 'mock-keys-jwk';
      model.data.scope = 'https://identity.mozilla.com/apps/oldsync';
      expect(model.requiresKeys()).toBe(true);
    });

    it('returns false for non-Sync services', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      expect(model.requiresKeys()).toBe(false);
    });

    it('returns false when scopedKeysEnabled is false', () => {
      model = new OAuthNativeIntegration(data, oauthData, {
        scopedKeysEnabled: false,
        scopedKeysValidation: {},
        isPromptNoneEnabled: true,
        isPromptNoneEnabledClientIds: [],
      });
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      expect(model.requiresKeys()).toBe(false);
    });
  });

  describe('wantsKeysIfPasswordEntered', () => {
    it('returns true for non-Sync browser services with scoped keys', () => {
      model = new OAuthNativeIntegration(data, oauthData, {
        scopedKeysEnabled: true,
        scopedKeysValidation: {
          'https://identity.mozilla.com/apps/oldsync': {
            redirectUris: ['https://mock.com'],
          },
        },
        isPromptNoneEnabled: true,
        isPromptNoneEnabledClientIds: [],
      });
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      model.data.keysJwk = 'mock-keys-jwk';
      model.data.scope = 'https://identity.mozilla.com/apps/oldsync';
      expect(model.wantsKeysIfPasswordEntered()).toBe(true);
    });

    it('returns false for Sync', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      expect(model.wantsKeysIfPasswordEntered()).toBe(false);
    });
  });

  describe('wantsKeys (combined)', () => {
    it('returns true when requiresKeys is true', () => {
      model = new OAuthNativeIntegration(data, oauthData, {
        scopedKeysEnabled: true,
        scopedKeysValidation: {
          'https://identity.mozilla.com/apps/oldsync': {
            redirectUris: ['https://mock.com'],
          },
        },
        isPromptNoneEnabled: true,
        isPromptNoneEnabledClientIds: [],
      });
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      model.data.keysJwk = 'mock-keys-jwk';
      model.data.scope = 'https://identity.mozilla.com/apps/oldsync';
      expect(model.wantsKeys()).toBe(true);
      expect(model.requiresKeys()).toBe(true);
    });

    it('returns true when wantsKeysIfPasswordEntered is true', () => {
      model = new OAuthNativeIntegration(data, oauthData, {
        scopedKeysEnabled: true,
        scopedKeysValidation: {
          'https://identity.mozilla.com/apps/oldsync': {
            redirectUris: ['https://mock.com'],
          },
        },
        isPromptNoneEnabled: true,
        isPromptNoneEnabledClientIds: [],
      });
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      model.data.keysJwk = 'mock-keys-jwk';
      model.data.scope = 'https://identity.mozilla.com/apps/oldsync';
      expect(model.wantsKeys()).toBe(true);
      expect(model.requiresKeys()).toBe(false);
      expect(model.wantsKeysIfPasswordEntered()).toBe(true);
    });

    it('returns false when no scoped keys are requested', () => {
      expect(model.wantsKeys()).toBe(false);
    });
  });

  describe('getServiceName', () => {
    it('returns VPN service name for vpn service', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Vpn;
      expect(model.getServiceName()).toBe('Mozilla VPN');
    });

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

    it('returns Smart Window service name for smartwindow service', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.SmartWindow;
      expect(model.getServiceName()).toBe('Firefox Smart Window');
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

    it('returns false when service is smartwindow', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.SmartWindow;
      expect(model.isFirefoxClientServiceRelay()).toBe(false);
    });
  });

  describe('isFirefoxClientServiceSmartWindow', () => {
    it('returns true when service is smartwindow', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.SmartWindow;
      expect(model.isFirefoxClientServiceSmartWindow()).toBe(true);
    });

    it('returns false when service is sync', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      expect(model.isFirefoxClientServiceSmartWindow()).toBe(false);
    });

    it('returns false when service is relay', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      expect(model.isFirefoxClientServiceSmartWindow()).toBe(false);
    });
  });

  describe('isFirefoxClientServiceVpn', () => {
    it('returns true when service is vpn', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Vpn;
      expect(model.isFirefoxClientServiceVpn()).toBe(true);
    });

    it('returns false when service is sync', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      expect(model.isFirefoxClientServiceVpn()).toBe(false);
    });

    it('returns false when service is relay', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      expect(model.isFirefoxClientServiceVpn()).toBe(false);
    });
  });

  describe('isOAuthIntegration', () => {
    it('returns true for PairingAuthority', () => {
      expect(
        isOAuthIntegration({ type: IntegrationType.PairingAuthority })
      ).toBe(true);
    });

    it('returns true for PairingSupplicant', () => {
      expect(
        isOAuthIntegration({ type: IntegrationType.PairingSupplicant })
      ).toBe(true);
    });

    it('returns false for SyncBasic', () => {
      expect(isOAuthIntegration({ type: IntegrationType.SyncBasic })).toBe(
        false
      );
    });
  });

  describe('isFirefoxNonSync', () => {
    it('returns false when service is sync', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Sync;
      expect(model.isFirefoxNonSync()).toBe(false);
    });

    it('returns false when service is undefined', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      expect(model.isFirefoxNonSync()).toBe(false);
    });

    it('returns true when service is relay', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      expect(model.isFirefoxNonSync()).toBe(true);
    });

    it('returns true when service is smartwindow', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.SmartWindow;
      expect(model.isFirefoxNonSync()).toBe(true);
    });

    it('returns true when service is vpn', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Vpn;
      expect(model.isFirefoxNonSync()).toBe(true);
    });
  });

  describe('getWebChannelServices', () => {
    it('returns relay services when service is relay', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Relay;
      expect(model.getWebChannelServices()).toEqual({ relay: {} });
    });

    it('returns smartwindow services when service is smartwindow', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.SmartWindow;
      expect(model.getWebChannelServices()).toEqual({ smartwindow: {} });
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

    it('returns vpn services when service is vpn', () => {
      model.clientInfo = mockClientInfo(OAuthNativeClients.FirefoxDesktop);
      model.data.service = OAuthNativeServices.Vpn;
      expect(model.getWebChannelServices()).toEqual({ vpn: {} });
    });
  });

  describe('scope tolerance (no URL scope)', () => {
    const SYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';

    function buildModel(opts: {
      scope?: string;
      service?: OAuthNativeServices;
      clientId?: OAuthNativeClients;
      scopedKeysEnabled?: boolean;
      scopedKeysValidation?: Record<string, { redirectUris: string[] }>;
      keysJwk?: string;
    }) {
      const clientId = opts.clientId ?? OAuthNativeClients.FirefoxDesktop;
      const freshData = new GenericData({ clientId });
      const freshOauthData = new GenericData({});
      const m = new OAuthNativeIntegration(freshData, freshOauthData, {
        scopedKeysEnabled: opts.scopedKeysEnabled ?? true,
        scopedKeysValidation: opts.scopedKeysValidation ?? {},
        isPromptNoneEnabled: true,
        isPromptNoneEnabledClientIds: [],
      });
      m.clientInfo = mockClientInfo(clientId);
      if (opts.service !== undefined) {
        m.data.service = opts.service;
      }
      // Bind-decorated `scope` validates non-empty; omit when the test
      // wants to mirror the runtime "URL has no scope" state.
      if (opts.scope !== undefined) {
        m.data.scope = opts.scope;
      }
      if (opts.keysJwk !== undefined) {
        m.data.keysJwk = opts.keysJwk;
      }
      return m;
    }

    describe('getNormalizedScope', () => {
      it('returns "" when URL scope is missing (server resolves from service=)', () => {
        const m = buildModel({ service: OAuthNativeServices.Sync });
        expect(m.getNormalizedScope()).toBe('');
      });

      it('returns the URL scope when present (explicit scope wins)', () => {
        const m = buildModel({
          scope: SYNC_SCOPE,
          service: OAuthNativeServices.Sync,
          scopedKeysValidation: {
            [SYNC_SCOPE]: { redirectUris: ['https://mock.com'] },
          },
        });
        expect(m.getNormalizedScope()).toBe(SYNC_SCOPE);
      });
    });

    describe('getPermissions', () => {
      it('returns [] when URL scope is missing (no client-side permissions to enumerate)', () => {
        // Without this override, super.getPermissions() throws
        // INVALID_PARAMETER(scope) on an empty scope, which breaks any
        // call site that enumerates the permission set (e.g. verifySession
        // in ConfirmSignupCode).
        const m = buildModel({ service: OAuthNativeServices.Sync });
        expect(m.getPermissions()).toEqual([]);
      });

      it('defers to super.getPermissions() when URL scope is present', () => {
        const m = buildModel({
          scope: SYNC_SCOPE,
          service: OAuthNativeServices.Sync,
          scopedKeysValidation: {
            [SYNC_SCOPE]: { redirectUris: ['https://mock.com'] },
          },
        });
        expect(m.getPermissions()).toEqual([SYNC_SCOPE]);
      });
    });

    describe('_scopeRequestsKeys (via requiresKeys / wantsKeysIfPasswordEntered)', () => {
      it('Sync without URL scope requires keys when keysJwk is present', () => {
        const m = buildModel({
          service: OAuthNativeServices.Sync,
          keysJwk: 'mock',
        });
        expect(m.requiresKeys()).toBe(true);
        expect(m.wantsKeys()).toBe(true);
      });

      it('VPN without URL scope wants keys opportunistically (with keysJwk)', () => {
        const m = buildModel({
          service: OAuthNativeServices.Vpn,
          keysJwk: 'mock',
        });
        expect(m.wantsKeysIfPasswordEntered()).toBe(true);
        expect(m.requiresKeys()).toBe(false);
      });

      it('Relay and SmartWindow without URL scope want keys on password too', () => {
        const relay = buildModel({
          service: OAuthNativeServices.Relay,
          keysJwk: 'mock',
        });
        const sw = buildModel({
          service: OAuthNativeServices.SmartWindow,
          keysJwk: 'mock',
        });
        expect(relay.wantsKeysIfPasswordEntered()).toBe(true);
        expect(sw.wantsKeysIfPasswordEntered()).toBe(true);
      });

      it('returns false without keysJwk (no wrapped keys → no Sync grant possible)', () => {
        const m = buildModel({ service: OAuthNativeServices.Sync });
        expect(m.requiresKeys()).toBe(false);
        expect(m.wantsKeysIfPasswordEntered()).toBe(false);
      });

      it('returns false when scopedKeysEnabled is false', () => {
        const m = buildModel({
          service: OAuthNativeServices.Sync,
          keysJwk: 'mock',
          scopedKeysEnabled: false,
        });
        expect(m.requiresKeys()).toBe(false);
      });

      it('explicit URL scope that DOES carry keys still works via super', () => {
        // Today's flow: Firefox includes apps/oldsync in the URL scope,
        // super._scopeRequestsKeys matches the scopedKeysValidation entry,
        // requiresKeys=true. This path is preserved byte-for-byte.
        const m = buildModel({
          scope: SYNC_SCOPE,
          service: OAuthNativeServices.Sync,
          keysJwk: 'mock',
          scopedKeysValidation: {
            [SYNC_SCOPE]: { redirectUris: ['https://mock.com'] },
          },
        });
        expect(m.requiresKeys()).toBe(true);
      });

      it('explicit URL scope that does NOT carry keys returns false via super', () => {
        // Realistic non-keys VPN URL: scope=apps/vpn profile (no oldsync),
        // keysJwk present, scopedKeysValidation only configured for
        // apps/oldsync. The override delegates to super, which iterates
        // the URL scopes against validation and finds no match → false.
        // Confirms wantsKeysIfPasswordEntered=false in this case.
        const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
        const m = buildModel({
          scope: `${VPN_SCOPE} profile`,
          service: OAuthNativeServices.Vpn,
          keysJwk: 'mock',
          scopedKeysValidation: {
            [SYNC_SCOPE]: { redirectUris: ['https://mock.com'] },
          },
        });
        expect(m.wantsKeysIfPasswordEntered()).toBe(false);
        expect(m.requiresKeys()).toBe(false);
      });
    });
  });
});
