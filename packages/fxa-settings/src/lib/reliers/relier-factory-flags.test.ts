/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createSandbox, SinonSandbox } from 'sinon';
import { Constants } from '../constants';
import { StorageContext, UrlSearchContext } from '../context';
import { DefaultRelierFlags } from './relier-factory-flags';

describe('lib/reliers/relier-factory-flags', function () {
  let relierFlags: DefaultRelierFlags;
  let searchContext: UrlSearchContext;
  let storageContext: StorageContext;
  let sandbox: SinonSandbox;

  beforeAll(() => {
    sandbox = createSandbox();
  });

  beforeEach(() => {
    sandbox.restore();
    searchContext = new UrlSearchContext(window);
    storageContext = new StorageContext(window);
    relierFlags = new DefaultRelierFlags(searchContext, storageContext);
  });

  it('isDevicePairingAsAuthority', () => {
    expect(relierFlags.isDevicePairingAsAuthority()).toBeFalsy();
    searchContext.set(
      'redirect_uri',
      Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI
    );
    expect(relierFlags.isDevicePairingAsAuthority()).toBeTruthy();
  });

  it('isDevicePairingAsSupplicant', () => {
    expect(relierFlags.isDevicePairingAsSupplicant()).toBeFalsy();
    sandbox.replaceGetter(searchContext, 'pathName', () => '/pair/supplicant');
    expect(relierFlags.isDevicePairingAsSupplicant()).toBeTruthy();
  });

  describe('isOAuth', () => {
    beforeEach(() => {
      sandbox.restore();
      sandbox.resetBehavior();
      sandbox.reset();
    });

    it('when oauth in path', () => {
      sandbox.replaceGetter(searchContext, 'pathName', () => '/oauth/');
      expect(relierFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is same and verification 1', () => {
      storageContext.set('oauth', { client_id: 'sync' });
      searchContext.set('service', 'sync');
      searchContext.set('uid', '123');
      searchContext.set('code', '123');
      expect(relierFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is same and verification 2', () => {
      storageContext.set('oauth', { client_id: 'sync' });
      searchContext.set('service', 'sync');
      searchContext.set('token', '123');
      searchContext.set('code', '123');
      expect(relierFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is same and verification 3', () => {
      storageContext.set('oauth', { client_id: 'sync' });
      searchContext.set('service', 'sync');
      sandbox.replaceGetter(searchContext, 'pathName', () => '/report_signin/');
      expect(relierFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is different and verification 1', () => {
      storageContext.set('oauth', { client_id: 'foo' });
      searchContext.set('service', 'foo');
      searchContext.set('uid', '123');
      searchContext.set('code', '123');
      expect(relierFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is different and verification 2', () => {
      storageContext.set('oauth', { client_id: 'foo' });
      searchContext.set('service', 'foo');
      searchContext.set('uid', '123');
      searchContext.set('token', '123');
      expect(relierFlags.isOAuth()).toBeTruthy();
    });

    it('when browser is different and verification 3', () => {
      storageContext.set('oauth', { client_id: 'foo' });
      searchContext.set('service', 'foo');
      sandbox.replaceGetter(searchContext, 'pathName', () => '/report_signin/');
      expect(relierFlags.isOAuth()).toBeTruthy();
    });

    // TODO: OAuth has a complex set of conditions. Add more tests, specifically for negative cases.
  });

  it('isSyncService', () => {
    searchContext.set('service', Constants.SYNC_SERVICE);
    expect(relierFlags.isSyncService()).toBeTruthy();
  });

  it('isV3DesktopContext', () => {
    searchContext.set('context', Constants.FX_DESKTOP_V3_CONTEXT);
    expect(relierFlags.isSyncService()).toBeTruthy();
  });

  it('isOAuthSuccessFlow', () => {
    sandbox.replaceGetter(
      searchContext,
      'pathName',
      () => '/oauth/success/foo'
    );
    expect(relierFlags.isOAuthSuccessFlow().status).toBeTruthy();
    expect(relierFlags.isOAuthSuccessFlow().clientId).toEqual('foo');
  });

  it('isOAuthVerificationFlow', () => {
    searchContext.set('code', '123');
    expect(relierFlags.isOAuthVerificationFlow()).toBeTruthy();
  });

  it('getOAuthResumeObj', () => {
    searchContext.set('service', 'foo');
    const obj1 = relierFlags.getOAuthResumeObj();
    storageContext.set('oauth', { ...obj1, extra: 'bar' });
    const obj2 = relierFlags.getOAuthResumeObj();

    expect(obj1).toEqual({
      // Is this correct? It's the way the ported code functioned.
      client_id: 'foo',
      service: 'foo',
    });
    expect(obj2).toEqual({
      // Is this correct? It's the way the ported code functioned.
      client_id: 'foo',
      service: 'foo',
      extra: 'bar',
    });
  });
});
