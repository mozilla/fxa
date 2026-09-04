/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeClients, OAuthNativeServices } from '@fxa/accounts/oauth';
import {
  OAUTH_SCOPE_OLD_SYNC,
  OAUTH_SCOPE_RELAY,
} from 'fxa-shared/oauth/constants';

import {
  dropUnconsentedSyncScope,
  excludeDauCacheKey,
} from './desktop-sync-dau-authorization-bandaid';

const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';
const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const DESKTOP = OAuthNativeClients.FirefoxDesktop;
const WEB_RP = '98e6508e88680e1b';

describe('dropUnconsentedSyncScope', () => {
  describe('Firefox Desktop signing into a non-Sync browser service', () => {
    it.each([
      OAuthNativeServices.SmartWindow,
      OAuthNativeServices.Relay,
      OAuthNativeServices.Vpn,
    ])('drops the Sync scope for service=%s', (serviceValue) => {
      expect(
        dropUnconsentedSyncScope({
          scopes: ['profile', OAUTH_SCOPE_OLD_SYNC, SMARTWINDOW_SCOPE],
          serviceValue,
          clientIdHex: DESKTOP,
        })
      ).toEqual({
        scopes: ['profile', SMARTWINDOW_SCOPE],
        droppedSyncScope: true,
      });
    });

    it('returns the remaining scopes when Sync was the only scope', () => {
      expect(
        dropUnconsentedSyncScope({
          scopes: [OAUTH_SCOPE_OLD_SYNC],
          serviceValue: OAuthNativeServices.SmartWindow,
          clientIdHex: DESKTOP,
        })
      ).toEqual({ scopes: [], droppedSyncScope: true });
    });

    it('drops the Sync scope the server added for a keys_jwe flow, since a password is not Sync consent', () => {
      // service=vpn + keys_jwe resolves to [apps/vpn, profile, apps/oldsync]
      // via keysConditionalScope. The user never saw anything about Sync.
      expect(
        dropUnconsentedSyncScope({
          scopes: [VPN_SCOPE, 'profile', OAUTH_SCOPE_OLD_SYNC],
          serviceValue: OAuthNativeServices.Vpn,
          clientIdHex: DESKTOP,
        })
      ).toEqual({
        scopes: [VPN_SCOPE, 'profile'],
        droppedSyncScope: true,
      });
    });

    it('matches the client id case-insensitively', () => {
      expect(
        dropUnconsentedSyncScope({
          scopes: ['profile', OAUTH_SCOPE_OLD_SYNC],
          serviceValue: OAuthNativeServices.SmartWindow,
          clientIdHex: DESKTOP.toUpperCase(),
        })
      ).toEqual({ scopes: ['profile'], droppedSyncScope: true });
    });

    it('matches the service case-insensitively', () => {
      expect(
        dropUnconsentedSyncScope({
          scopes: ['profile', OAUTH_SCOPE_OLD_SYNC],
          serviceValue: 'SmartWindow',
          clientIdHex: DESKTOP,
        })
      ).toEqual({ scopes: ['profile'], droppedSyncScope: true });
    });

    it('does not mutate the scopes it was given', () => {
      const scopes = ['profile', OAUTH_SCOPE_OLD_SYNC];
      dropUnconsentedSyncScope({
        scopes,
        serviceValue: OAuthNativeServices.Vpn,
        clientIdHex: DESKTOP,
      });
      expect(scopes).toEqual(['profile', OAUTH_SCOPE_OLD_SYNC]);
    });
  });

  describe('cases that must keep the Sync scope', () => {
    it('keeps it when the service is Sync in any casing', () => {
      expect(
        dropUnconsentedSyncScope({
          scopes: ['profile', OAUTH_SCOPE_OLD_SYNC],
          serviceValue: 'SYNC',
          clientIdHex: DESKTOP,
        })
      ).toEqual({
        scopes: ['profile', OAUTH_SCOPE_OLD_SYNC],
        droppedSyncScope: false,
      });
    });

    it('keeps it when Desktop signed into Sync itself', () => {
      expect(
        dropUnconsentedSyncScope({
          scopes: ['profile', OAUTH_SCOPE_OLD_SYNC],
          serviceValue: OAuthNativeServices.Sync,
          clientIdHex: DESKTOP,
        })
      ).toEqual({
        scopes: ['profile', OAUTH_SCOPE_OLD_SYNC],
        droppedSyncScope: false,
      });
    });

    it('keeps it when no service was resolved, since that means Sync by convention', () => {
      expect(
        dropUnconsentedSyncScope({
          scopes: ['profile', OAUTH_SCOPE_OLD_SYNC],
          serviceValue: '',
          clientIdHex: DESKTOP,
        })
      ).toEqual({
        scopes: ['profile', OAUTH_SCOPE_OLD_SYNC],
        droppedSyncScope: false,
      });
    });

    it('keeps it on Android, where a VPN signup is also a Sync signup', () => {
      // Fenix sends profile + oldsync + vpn with service=vpn while Sync is not
      // decoupled on Android, so the user really has consented to both.
      expect(
        dropUnconsentedSyncScope({
          scopes: ['profile', OAUTH_SCOPE_OLD_SYNC, VPN_SCOPE],
          serviceValue: OAuthNativeServices.Vpn,
          clientIdHex: OAuthNativeClients.Fenix,
        })
      ).toEqual({
        scopes: ['profile', OAUTH_SCOPE_OLD_SYNC, VPN_SCOPE],
        droppedSyncScope: false,
      });
    });

    it('keeps it for a web RP, which never resolves a service', () => {
      expect(
        dropUnconsentedSyncScope({
          scopes: ['profile', OAUTH_SCOPE_OLD_SYNC],
          serviceValue: '',
          clientIdHex: WEB_RP,
        })
      ).toEqual({
        scopes: ['profile', OAUTH_SCOPE_OLD_SYNC],
        droppedSyncScope: false,
      });
    });

    it('reports no drop when the Sync scope was not requested', () => {
      expect(
        dropUnconsentedSyncScope({
          scopes: ['profile', OAUTH_SCOPE_RELAY],
          serviceValue: OAuthNativeServices.Relay,
          clientIdHex: DESKTOP,
        })
      ).toEqual({
        scopes: ['profile', OAUTH_SCOPE_RELAY],
        droppedSyncScope: false,
      });
    });

    it('leaves an oldsync sub-scope alone, since the match is on the exact scope URL', () => {
      const subScope = `${OAUTH_SCOPE_OLD_SYNC}/bookmarks`;
      expect(
        dropUnconsentedSyncScope({
          scopes: ['profile', subScope],
          serviceValue: OAuthNativeServices.SmartWindow,
          clientIdHex: DESKTOP,
        })
      ).toEqual({
        scopes: ['profile', subScope],
        droppedSyncScope: false,
      });
    });
  });
});

describe('excludeDauCacheKey', () => {
  // Pins the literal format. Both consumers build their expected key by calling
  // this function, so a prefix change would keep every test green while
  // orphaning in-flight Redis entries across a deploy.
  it('namespaces the code hash under syncDauExclude', () => {
    expect(excludeDauCacheKey('ab'.repeat(32))).toBe(
      `syncDauExclude:${'ab'.repeat(32)}`
    );
  });
});
