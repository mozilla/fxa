/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon, { createSandbox } from 'sinon';
import {
  BaseIntegration,
  Integration,
  IntegrationType,
  OAuthIntegration,
  PairingAuthorityIntegration,
  PairingSupplicantIntegration,
  RelierClientInfo,
  RelierSubscriptionInfo,
  SyncDesktopV3Integration,
} from '../../models/integrations';
import { StorageData, UrlHashData, UrlQueryData } from '../model-data';
import { IntegrationFactory, DefaultIntegrationFlags } from '../integrations';
import { ReachRouterWindow } from '../window';
import { Constants } from '../constants';

type IntegrationFlagOverrides = {
  isDevicePairingAsAuthority?: boolean;
  isDevicePairingAsSupplicant?: boolean;
  isOAuth?: boolean;
  isServiceSync?: boolean;
  isV3DesktopContext?: boolean;
};

type FactoryCallCounts = {
  initIntegration?: number;
  initSyncDesktopV3Integration?: number;
  initOAuthIntegration?: number;
  initClientInfo?: number;
};

describe('lib/integrations/integration-factory', () => {
  const window = new ReachRouterWindow();
  let sandbox: sinon.SinonSandbox;
  let flags: DefaultIntegrationFlags;
  let urlQueryData: UrlQueryData;
  let urlHashData: UrlHashData;
  let storageData: StorageData;
  let clientInfo: RelierClientInfo;
  let productInfo: RelierSubscriptionInfo;

  /**
   * Initial setup for factory tests. Checks that factory methods were invoked and factory produced correct integration type.
   **/
  async function setup<T extends Integration>(
    flagOverrides: IntegrationFlagOverrides,
    callCounts: FactoryCallCounts,
    checkInstance: (integration: Integration) => boolean
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
    sandbox.stub(flags, 'isServiceSync').returns(!!flagOverrides.isServiceSync);
    sandbox
      .stub(flags, 'isV3DesktopContext')
      .returns(!!flagOverrides.isV3DesktopContext);

    urlQueryData.set('scope', 'profile');
    urlQueryData.set('client_id', '720bc80adfa6988d');
    urlQueryData.set('redirect_uri', 'https://redirect.to');

    urlHashData.set('scope', 'profile');

    // Create a factory with current state
    const factory = new IntegrationFactory({
      window,
      data: urlQueryData,
      channelData: urlHashData,
      storageData,
      flags,
      clientInfo,
      productInfo,
    });

    // Create the integration
    const integration = factory.getIntegration();
    checkInstance(integration);
    return integration as T;
  }

  async function mockSearchParams(overrides: Record<string, string>) {
    const newSearch = new URLSearchParams(overrides).toString();

    const location = {
      ...window.location,
      search: newSearch,
    };

    sandbox.replaceGetter(window, 'location', () => location);

    await urlQueryData.refresh();
  }

  /** Prime the initial state */
  beforeAll(() => {
    sandbox = createSandbox();

    // Create various data stores required by factory. Data stores bind an external
    // state to our models.
    urlQueryData = new UrlQueryData(window);
    urlHashData = new UrlHashData(window);
    storageData = new StorageData(window);

    // Flags hold all the logic that controls the state which drives the type of integration
    // instance being created by the factory
    flags = new DefaultIntegrationFlags(urlQueryData, storageData);

    productInfo = {
      subscriptionProductId: '123',
      subscriptionProductName: 'foo',
    };

    clientInfo = {
      serviceName: 'foo',
      clientId: '720bc80adfa6988d',
      redirectUri: 'https://redirect.to',
      imageUri: 'https://redirect.to/foo',
      trusted: true,
    };
  });

  describe('BaseIntegration creation', () => {
    let integration: BaseIntegration;

    beforeAll(async () => {
      integration = await setup<BaseIntegration>(
        {},
        { initIntegration: 1 },
        (i: Integration) => i instanceof BaseIntegration
      );
    });

    it('has correct state`', async () => {
      expect(integration.type).toEqual(IntegrationType.Web);
      expect(integration.isSync()).toBeFalsy();
      expect(integration.wantsKeys()).toBeFalsy();
      expect(integration.isTrusted()).toBeTruthy();
    });

    // TODO: Remove with approval.
    //
    // I think maybe this is feature envy, perhaps we should have some dedicated thing that checks integration state
    // and account state to determine if features are needed. As far as I can tell the integration models
    // themselves really shouldn't know or care about 'accounts'
    //
    // describe('accountNeedsPermissions', function () {
    //   it('returns `false`', function () {
    //     assert.isFalse(integration.accountNeedsPermissions());
    //   });
    // });
  });

  describe('SyncDesktop creation', () => {
    const ACTION = 'email';
    const CONTEXT = 'fx_desktop_v3';
    const COUNTRY = 'RO';
    const SYNC_SERVICE = 'sync';
    let integration: SyncDesktopV3Integration;

    beforeAll(async () => {
      integration = await setup<SyncDesktopV3Integration>(
        { isServiceSync: true, isV3DesktopContext: true },
        { initIntegration: 1, initSyncDesktopV3Integration: 1 },
        (i: Integration) => i instanceof SyncDesktopV3Integration
      );
    });

    afterAll(() => {
      urlQueryData.set('service', '');
    });

    it('has correct state', () => {
      expect(integration.type).toEqual(IntegrationType.SyncDesktopV3);
      expect(integration.isSync()).toBeTruthy();
      expect(integration.wantsKeys()).toBeTruthy();
      expect(integration.isTrusted()).toBeTruthy();
    });

    it('populates model from the search parameters', async () => {
      await mockSearchParams({
        action: ACTION,
        context: CONTEXT,
        country: COUNTRY,
        service: SYNC_SERVICE,
      });

      expect(integration.data.action).toEqual(ACTION);
      expect(integration.data.context).toEqual(CONTEXT);
      expect(integration.data.country).toEqual(COUNTRY);
      expect(integration.data.service).toEqual(SYNC_SERVICE);
    });

    // TODO: Port remaining tests from content-server
  });

  describe('OAuthIntegration creation', () => {
    let integration: OAuthIntegration;

    describe('OAuth redirect', () => {
      beforeEach(async () => {
        integration = await setup<OAuthIntegration>(
          { isOAuth: true },
          { initIntegration: 1, initOAuthIntegration: 1, initClientInfo: 1 },
          (i: Integration) => i instanceof OAuthIntegration
        );
      });

      it('has correct state', async () => {
        expect(integration.type).toEqual(IntegrationType.OAuth);
        expect(integration.isSync()).toBeFalsy();
        expect(integration.wantsKeys()).toBeFalsy();
        expect(integration.isTrusted()).toBeTruthy();
      });
    });

    describe('OAuth Sync', () => {
      beforeEach(async () => {
        integration = await setup<OAuthIntegration>(
          { isOAuth: true },
          { initIntegration: 1, initOAuthIntegration: 1, initClientInfo: 1 },
          (i: Integration) => i instanceof OAuthIntegration
        );
        await mockSearchParams({
          scope: Constants.OAUTH_OLDSYNC_SCOPE,
          context: Constants.OAUTH_WEBCHANNEL_CONTEXT,
        });
      });

      it('has correct state', async () => {
        expect(integration.type).toEqual(IntegrationType.OAuth);
        expect(integration.isSync()).toBeTruthy();
        expect(integration.wantsKeys()).toBeTruthy();
        expect(integration.isTrusted()).toBeTruthy();
      });
    });

    // TODO: Port remaining tests from content-server
  });

  describe('PairingSupplicantIntegration creation', () => {
    let integration: PairingSupplicantIntegration;

    beforeAll(async () => {
      integration = await setup<PairingSupplicantIntegration>(
        { isDevicePairingAsSupplicant: true },
        { initIntegration: 1, initClientInfo: 1 },
        (i: Integration) => i instanceof PairingSupplicantIntegration
      );
      await mockSearchParams({
        redirect_uri: 'foo',
        clientId: '720bc80adfa6988d',
      });
    });

    it('has correct state', () => {
      expect(integration.type).toEqual(IntegrationType.PairingSupplicant);
      expect(integration.isSync()).toBeFalsy();
      expect(integration.wantsKeys()).toBeFalsy();
      expect(integration.isTrusted()).toBeTruthy();
    });
  });

  describe('PairingAuthorityIntegration creation', () => {
    let integration: PairingAuthorityIntegration;

    beforeAll(async () => {
      integration = await setup<PairingAuthorityIntegration>(
        { isDevicePairingAsAuthority: true },
        { initIntegration: 1, initClientInfo: 1, initOAuthIntegration: 1 },
        (i: Integration) => i instanceof PairingSupplicantIntegration
      );

      sandbox
        .stub(integration, 'clientInfo')
        .get(() => ({ ...clientInfo, trusted: false }));
    });

    it('has correct state', async () => {
      await mockSearchParams({
        redirect_uri: 'foo',
      });
      expect(integration.type).toEqual(IntegrationType.PairingAuthority);
      expect(integration.isSync()).toBeFalsy();
      expect(integration.wantsKeys()).toBeFalsy();
      expect(integration.isTrusted()).toBeFalsy();
    });
  });
});
