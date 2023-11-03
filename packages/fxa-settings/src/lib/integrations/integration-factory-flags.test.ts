/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createSandbox, SinonSandbox } from 'sinon';
import { Constants } from '../constants';
import { StorageData, UrlQueryData } from '../model-data';
import { DefaultIntegrationFlags } from './integration-factory-flags';
import { ReachRouterWindow } from '../window';

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

  it('isDevicePairingAsSupplicant', () => {
    expect(integrationFlags.isDevicePairingAsSupplicant()).toBeFalsy();
    sandbox.replaceGetter(queryData, 'pathName', () => '/pair/supplicant');
    expect(integrationFlags.isDevicePairingAsSupplicant()).toBeTruthy();
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

  it('isSyncService', () => {
    queryData.set('service', Constants.SYNC_SERVICE);
    expect(integrationFlags.isSyncService()).toBeTruthy();
  });

  it('isV3DesktopContext', () => {
    queryData.set('context', Constants.FX_DESKTOP_V3_CONTEXT);
    expect(integrationFlags.isSyncService()).toBeTruthy();
  });

  it('isOAuthSuccessFlow', () => {
    sandbox.replaceGetter(queryData, 'pathName', () => '/oauth/success/foo');
    expect(integrationFlags.isOAuthSuccessFlow().status).toBeTruthy();
    expect(integrationFlags.isOAuthSuccessFlow().clientId).toEqual('foo');
  });

  it('isOAuthVerificationFlow', () => {
    queryData.set('code', '123');
    expect(integrationFlags.isOAuthVerificationFlow()).toBeTruthy();
  });
});
