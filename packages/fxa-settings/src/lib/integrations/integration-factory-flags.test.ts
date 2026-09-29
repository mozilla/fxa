/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createSandbox, SinonSandbox } from 'sinon';
import { Constants } from '../constants';
import { StorageData, UrlQueryData } from '../model-data';
import { DefaultIntegrationFlags } from './integration-factory-flags';
import { ReachRouterWindow } from '../window';
import {
  capturePairingChannelParams,
  resetPairingChannelParamsForTest,
} from '../pairing-channel-params';

describe('lib/integrations/integration-factory-flags', function () {
  const window = new ReachRouterWindow();
  let integrationFlags: DefaultIntegrationFlags;
  let queryData: UrlQueryData;
  let storageData: StorageData;
  let sandbox: SinonSandbox;

  beforeAll(() => {
    sandbox = createSandbox();
  });

  beforeEach(() => {
    sandbox.restore();
    queryData = new UrlQueryData(window);
    storageData = new StorageData(window);
    integrationFlags = new DefaultIntegrationFlags(queryData, storageData);
  });

  it('isDevicePairingAsAuthority', () => {
    expect(integrationFlags.isDevicePairingAsAuthority()).toBeFalsy();
    queryData.set(
      'redirect_uri',
      Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI
    );
    expect(integrationFlags.isDevicePairingAsAuthority()).toBeTruthy();
  });

  it('isDevicePairingAsAuthority from the v2 authority pathname', () => {
    sandbox.replaceGetter(
      queryData,
      'pathName',
      () => '/pair/authority/scan_qr'
    );
    expect(integrationFlags.isDevicePairingAsAuthority()).toBeTruthy();
  });

  it('isDevicePairingAsV2Authority', () => {
    expect(integrationFlags.isDevicePairingAsV2Authority()).toBeFalsy();
    sandbox.replaceGetter(
      queryData,
      'pathName',
      () => '/pair/authority/scan_qr'
    );
    expect(integrationFlags.isDevicePairingAsV2Authority()).toBeTruthy();
  });

  // The v1 redirect URI makes an authority, but not a v2 one.
  it('isDevicePairingAsV2Authority ignores the v1 redirect_uri', () => {
    queryData.set(
      'redirect_uri',
      Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI
    );
    expect(integrationFlags.isDevicePairingAsAuthority()).toBeTruthy();
    expect(integrationFlags.isDevicePairingAsV2Authority()).toBeFalsy();
  });

  it('isDevicePairingAsSupplicant', () => {
    expect(integrationFlags.isDevicePairingAsSupplicant()).toBeFalsy();
    sandbox.replaceGetter(queryData, 'pathName', () => '/pair/supplicant');
    // Only pathname is required — no WebChannel context needed.
    // Firefox iOS uses OAuth redirect (not WebChannel) for pairing.
    expect(integrationFlags.isDevicePairingAsSupplicant()).toBeTruthy();
  });

  it('isDevicePairingAsSupplicant with WebChannel context', () => {
    sandbox.replaceGetter(queryData, 'pathName', () => '/pair/supp');
    queryData.set('context', Constants.OAUTH_WEBCHANNEL_CONTEXT);
    expect(integrationFlags.isDevicePairingAsSupplicant()).toBeTruthy();
  });

  it.each([
    '/pair/supp',
    '/pair/supp/',
    '/pair/supp/allow',
    '/pair/supplicant',
    '/pair/supplicant/connect_this_device',
  ])('isDevicePairingAsSupplicant for the pathname %s', (pathName) => {
    sandbox.replaceGetter(queryData, 'pathName', () => pathName);
    expect(integrationFlags.isDevicePairingAsSupplicant()).toBe(true);
  });

  it.each(['/pair', '/pair/auth/allow', '/supp'])(
    'isDevicePairingAsSupplicant is false for the pathname %s',
    (pathName) => {
      sandbox.replaceGetter(queryData, 'pathName', () => pathName);
      expect(integrationFlags.isDevicePairingAsSupplicant()).toBe(false);
    }
  );

  // A system-camera scan of a v2 QR lands on `/pair#channel_id=…&v=2`, and
  // startup lifts that fragment out of the URL before the factory runs.
  describe('isDevicePairingAsSupplicant for a scanned QR on /pair', () => {
    function landOnPair(hash: string) {
      window.location.hash = hash;
      resetPairingChannelParamsForTest();
      capturePairingChannelParams();
      sandbox.replaceGetter(queryData, 'pathName', () => '/pair');
    }

    afterEach(() => {
      window.location.hash = '';
      resetPairingChannelParamsForTest();
    });

    it('is true for a v2 channel', () => {
      landOnPair('#channel_id=chan-1&channel_key=key-1&v=2');
      expect(integrationFlags.isDevicePairingAsSupplicant()).toBe(true);
    });

    it('is false for a channel without a version', () => {
      landOnPair('#channel_id=chan-1&channel_key=key-1');
      expect(integrationFlags.isDevicePairingAsSupplicant()).toBe(false);
    });
  });

  describe('isOAuth', () => {
    beforeEach(() => {
      sandbox.restore();
      sandbox.resetBehavior();
      sandbox.reset();
    });

    it('when oauth in path', () => {
      sandbox.replaceGetter(queryData, 'pathName', () => '/oauth/');
      expect(integrationFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is same and verification 1', () => {
      storageData.set('oauth', JSON.stringify({ client_id: 'sync' }));
      queryData.set('service', 'sync');
      queryData.set('uid', '123');
      queryData.set('code', '123');
      expect(integrationFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is same and verification 2', () => {
      storageData.set('oauth', JSON.stringify({ client_id: 'sync' }));
      queryData.set('service', 'sync');
      queryData.set('token', '123');
      queryData.set('code', '123');
      expect(integrationFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is same and verification 3', () => {
      storageData.set('oauth', JSON.stringify({ client_id: 'sync' }));
      queryData.set('service', 'sync');
      sandbox.replaceGetter(queryData, 'pathName', () => '/report_signin/');
      expect(integrationFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is different and verification 1', () => {
      storageData.set('oauth', JSON.stringify({ client_id: 'foo' }));
      queryData.set('service', 'foo');
      queryData.set('uid', '123');
      queryData.set('code', '123');
      expect(integrationFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is different and verification 2', () => {
      storageData.set('oauth', JSON.stringify({ client_id: 'foo' }));
      queryData.set('service', 'foo');
      queryData.set('uid', '123');
      queryData.set('token', '123');
      expect(integrationFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is different and verification 3', () => {
      storageData.set('oauth', JSON.stringify({ client_id: 'foo' }));
      queryData.set('service', 'foo');
      sandbox.replaceGetter(queryData, 'pathName', () => '/report_signin/');
      expect(integrationFlags.isOAuth()).toBeTruthy();
    });

    // TODO: OAuth has a complex set of conditions. Add more tests, specifically for negative cases.
  });

  it('isServiceSync', () => {
    queryData.set('service', Constants.SYNC_SERVICE);
    expect(integrationFlags.isServiceSync()).toBeTruthy();
  });

  it('isV3DesktopContext', () => {
    queryData.set('context', Constants.FX_DESKTOP_V3_CONTEXT);
    expect(integrationFlags.isServiceSync()).toBeTruthy();
  });

  it('isOAuthSuccessFlow', () => {
    sandbox.replaceGetter(queryData, 'pathName', () => '/oauth/success/foo');
    expect(integrationFlags.isOAuthSuccessFlow().status).toBeTruthy();
    expect(integrationFlags.isOAuthSuccessFlow().clientId).toEqual('foo');
  });

  it('isOAuthSuccessFlow with a trailing slash', () => {
    sandbox.replaceGetter(queryData, 'pathName', () => '/oauth/success/foo/');
    expect(integrationFlags.isOAuthSuccessFlow().status).toBeTruthy();
    expect(integrationFlags.isOAuthSuccessFlow().clientId).toEqual('foo');
  });

  it('isOAuthVerificationFlow', () => {
    queryData.set('code', '123');
    expect(integrationFlags.isOAuthVerificationFlow()).toBeTruthy();
  });

  describe('with a clean URL', () => {
    // Query params live in the shared jsdom URL, so clear what earlier tests set.
    beforeEach(() => {
      globalThis.history.replaceState(null, '', '/');
    });

    describe('isVerification', () => {
      it('is true for a sign-up verification', () => {
        queryData.set('code', '123');
        queryData.set('uid', '123');
        expect(integrationFlags.isVerification()).toBe(true);
      });

      it('is true for a password reset verification', () => {
        queryData.set('code', '123');
        queryData.set('token', '123');
        expect(integrationFlags.isVerification()).toBe(true);
      });

      it('is true for report sign-in', () => {
        sandbox.replaceGetter(queryData, 'pathName', () => '/report_signin');
        expect(integrationFlags.isVerification()).toBe(true);
      });

      it('is false for a code without a uid or token', () => {
        queryData.set('code', '123');
        expect(integrationFlags.isVerification()).toBe(false);
      });

      it('is false without params', () => {
        expect(integrationFlags.isVerification()).toBe(false);
      });
    });

    describe('isServiceOAuth', () => {
      it('is true for a service other than Sync', () => {
        queryData.set('service', 'foo');
        expect(integrationFlags.isServiceOAuth()).toBe(true);
      });

      it('is false for Sync', () => {
        queryData.set('service', Constants.SYNC_SERVICE);
        expect(integrationFlags.isServiceOAuth()).toBe(false);
      });

      it('is false without a service', () => {
        expect(integrationFlags.isServiceOAuth()).toBe(false);
      });
    });

    it('searchParam returns the value, or undefined for a missing key', () => {
      queryData.set('service', 'foo');
      expect(integrationFlags.searchParam('service')).toBe('foo');
      expect(integrationFlags.searchParam('missing')).toBeUndefined();
    });
  });
});
