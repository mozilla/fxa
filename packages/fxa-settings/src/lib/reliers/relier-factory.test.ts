/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon, { createSandbox } from 'sinon';
import {
  BaseRelier,
  BrowserRelier,
  OAuthRelier,
  PairingAuthorityRelier,
  PairingSupplicantRelier,
  Relier,
} from '../../models/reliers';
import { StorageData, UrlHashData, UrlQueryData } from '../model-data';
import { RelierDelegates } from './interfaces';
import { RelierFactory } from './relier-factory';
import { DefaultRelierFlags } from './relier-factory-flags';

type RelierFlagOverrides = {
  isDevicePairingAsAuthority?: boolean;
  isDevicePairingAsSupplicant?: boolean;
  isOAuth?: boolean;
  isSyncService?: boolean;
  isV3DesktopContext?: boolean;
};

type FactoryCallCounts = {
  initRelier?: number;
  initBrowserRelier?: number;
  initOAuthRelier?: number;
  initClientInfo?: number;
};

describe('lib/reliers/relier-factory', () => {
  let sandbox: sinon.SinonSandbox;
  let flags: DefaultRelierFlags;
  let urlQueryData: UrlQueryData;
  let urlHashData: UrlHashData;
  let storageData: StorageData;
  let delegates: RelierDelegates;

  /**
   * Initial setup for factory tests. Checks that factory methods were invoked and factory produced correct relier type.
   **/
  async function setup<T extends Relier>(
    flagOverrides: RelierFlagOverrides,
    callCounts: FactoryCallCounts,
    checkInstance: (relier: Relier) => boolean
  ) {
    // Make sure sinon is reset
    sandbox.restore();

    // Fake flag method responses so we can control the factory
    sandbox
      .stub(flags, 'isDevicePairingAsAuthority')
      .returns(!!flagOverrides.isDevicePairingAsAuthority);
    sandbox
      .stub(flags, 'isDevicePairingAsSupplicant')
      .returns(!!flagOverrides.isDevicePairingAsSupplicant);
    sandbox.stub(flags, 'isOAuth').returns(!!flagOverrides.isOAuth);
    sandbox.stub(flags, 'isSyncService').returns(!!flagOverrides.isSyncService);
    sandbox
      .stub(flags, 'isV3DesktopContext')
      .returns(!!flagOverrides.isV3DesktopContext);

    // Create a factory with current state
    const factory = new RelierFactory({
      data: urlQueryData,
      channelData: urlHashData,
      flags,
      delegates,
    });

    urlQueryData.set('client_id', '123');
    urlQueryData.set('redirect_uri', 'https://redirect.to');

    // Create the relier
    const relier = await factory.getRelier();
    checkInstance(relier);
    return relier as T;
  }

  function mockSearchParams(overrides: Record<string, string>) {
    const newSearch = new URLSearchParams(overrides).toString();

    const location = {
      ...window.location,
      search: newSearch,
    };

    sandbox.replaceGetter(window, 'location', () => location);
  }

  /** Prime the initial state */
  beforeAll(() => {
    sandbox = createSandbox();

    // Create various data stores required by factory. Data stores bind an external
    // state to our models.
    urlQueryData = new UrlQueryData(window);
    urlHashData = new UrlHashData(window);
    storageData = new StorageData(window);

    // Flags hold all the logic that controls the state which drives the type of relier
    // instance being created by the factory
    flags = new DefaultRelierFlags(urlQueryData, storageData);

    // Delegates are used by the factory as callbacks to get external data.
    // This stops the factory from becoming concerned with out to fetch external
    // state which makes testing simpler, and unit testing possible.
    delegates = {
      getProductIdFromRoute() {
        return '123';
      },
      async getProductInfo(_subscriptionId: string) {
        return { productName: 'foo' };
      },
      async getClientInfo(clientId: string) {
        return {
          client_id: '123',
          redirect_uri: 'https://redirect.to',
          name: 'foo',
          image_uri: 'https://redirect.to/foo',
          trusted: false,
        };
      },
    };
  });

  describe('BaseRelier creation', () => {
    let relier: BaseRelier;

    beforeAll(async () => {
      relier = await setup<BaseRelier>(
        {},
        { initRelier: 1 },
        (r: Relier) => r instanceof BaseRelier
      );
    });

    it('has correct state`', function () {
      expect(relier.name).toEqual('base');
      expect(relier.isOAuth()).toBeFalsy();
      expect(relier.isSync()).toBeFalsy();
      expect(relier.wantsKeys()).toBeFalsy();
      expect(relier.pickResumeTokenInfo()).toEqual({});
      expect(relier.isTrusted()).toBeTruthy();
    });

    // TODO: Remove with approval.
    //
    // I think maybe this is feature envy, perhaps we should have some dedicated thing that checks relier state
    // and account state to determine if features are needed. As far as I can tell the relier models
    // themselves really shouldn't know or care about 'accounts'
    //
    // describe('accountNeedsPermissions', function () {
    //   it('returns `false`', function () {
    //     assert.isFalse(relier.accountNeedsPermissions());
    //   });
    // });
  });

  describe('BrowserRelier creation', () => {
    const ACTION = 'email';
    const CONTEXT = 'fx_desktop_v3';
    const COUNTRY = 'RO';
    const SYNC_SERVICE = 'sync';
    let relier: BrowserRelier;

    beforeAll(async () => {
      relier = await setup<BrowserRelier>(
        { isSyncService: true, isV3DesktopContext: true },
        { initRelier: 1, initBrowserRelier: 1 },
        (r: Relier) => r instanceof BrowserRelier
      );
    });

    it('has correct state', () => {
      expect(relier.name).toEqual('browser');
      expect(relier.isOAuth()).toBeFalsy();
      expect(relier.isSync()).toBeTruthy();
      expect(relier.wantsKeys()).toBeTruthy();
      expect(relier.pickResumeTokenInfo()).toEqual({});
      expect(relier.isTrusted()).toBeTruthy();
    });

    it('populates model from the search parameters', () => {
      mockSearchParams({
        action: ACTION,
        context: CONTEXT,
        country: COUNTRY,
        service: SYNC_SERVICE,
      });

      expect(relier.action).toEqual(ACTION);
      expect(relier.context).toEqual(CONTEXT);
      expect(relier.country).toEqual(COUNTRY);
      expect(relier.service).toEqual(SYNC_SERVICE);
    });

    // TODO: Port remaining tests from content-server
  });

  describe('OAuthRelier creation', () => {
    let relier: OAuthRelier;

    beforeAll(async () => {
      relier = await setup<OAuthRelier>(
        { isOAuth: true },
        { initRelier: 1, initOAuthRelier: 1, initClientInfo: 1 },
        (r: Relier) => r instanceof OAuthRelier
      );
    });

    it('has correct state', () => {
      expect(relier.name).toEqual('oauth');
      expect(relier.isOAuth()).toBeTruthy();
      expect(relier.isSync()).toBeFalsy();
      expect(relier.wantsKeys()).toBeFalsy();
      expect(relier.pickResumeTokenInfo()).toEqual({});
      expect(relier.isTrusted()).toBeFalsy();
    });
    // TODO: Port remaining tests from content-server
  });

  describe.only('PairingSupplicantRelier creation', () => {
    let relier: PairingSupplicantRelier;

    beforeAll(async () => {
      mockSearchParams({
        redirect_uri: 'foo',
      });
      relier = await setup<PairingSupplicantRelier>(
        { isDevicePairingAsSupplicant: true },
        { initRelier: 1, initClientInfo: 1 },
        (r: Relier) => r instanceof PairingSupplicantRelier
      );
    });

    it('has correct state', async () => {
      expect(relier.name).toEqual('pairing-supplicant');
      expect(relier.isOAuth()).toBeTruthy();
      expect(await relier.isSync()).toBeFalsy();
      expect(relier.wantsKeys()).toBeFalsy();
      expect(relier.pickResumeTokenInfo()).toEqual({});
      expect(relier.isTrusted()).toBeFalsy();
    });
  });

  describe('PairingAuthorityRelier creation', () => {
    let relier: PairingAuthorityRelier;

    beforeAll(async () => {
      relier = await setup<PairingAuthorityRelier>(
        { isDevicePairingAsAuthority: true },
        { initRelier: 1, initClientInfo: 1, initOAuthRelier: 1 },
        (r: Relier) => r instanceof PairingSupplicantRelier
      );
    });

    it('has correct state', () => {
      mockSearchParams({
        redirect_uri: 'foo',
      });
      expect(relier.name).toEqual('pairing-authority');
      expect(relier.isOAuth()).toBeTruthy();
      expect(relier.isSync()).toBeFalsy();
      expect(relier.wantsKeys()).toBeFalsy();
      expect(relier.pickResumeTokenInfo()).toEqual({});
      expect(relier.isTrusted()).toBeFalsy();
    });
  });
});
