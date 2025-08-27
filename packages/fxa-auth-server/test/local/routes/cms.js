/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const { Container } = require('typedi');
const proxyquire = require('proxyquire');

let log, mockConfig, mockStatsD, routes, route, request;
let mockCmsManager, mockLocalization;

const sandbox = sinon.createSandbox();

// Helper function to create realistic Strapi test data
function createStrapiTestData() {
  return [
    {
      l10nId: 'desktopSyncFirefoxCms',
      name: 'Firefox Desktop Sync',
      entrypoint: 'desktop-sync',
      clientId: 'sync-client',
      SigninPage: {
        headline: 'Enter your password',
        description: 'to sign in to Firefox and start syncing',
      },
      EmailFirstPage: {
        headline: 'Welcome to Firefox Sync',
        description: 'Sync your passwords, tabs, and bookmarks',
      },
    },
  ];
}

// Helper functions for localization tests
function createBaseConfig(overrides = {}) {
  return {
    l10nId: 'desktopSyncFirefoxCms',
    name: 'Firefox Desktop Sync',
    entrypoint: 'desktop-sync',
    clientId: 'sync-client',
    SigninPage: {
      headline: 'Enter your password',
      description: 'to sign in to Firefox and start syncing',
    },
    ...overrides
  };
}

function createLocalizationRequest(clientId, entrypoint, locale) {
  return {
    query: { clientId, entrypoint },
    app: { locale },
    log: log,
  };
}

describe('cms', () => {
  beforeEach(() => {
    log = mocks.mockLog();
    mockStatsD = {
      increment: sandbox.stub(),
      timing: sandbox.stub(),
    };

    mockConfig = {
      cms: {
        enabled: true,
        webhookCacheInvalidation: {
          enabled: true,
          secret: 'Bearer neo',
        },
      },
      cmsl10n: {
        enabled: true,
        strapiWebhook: {
          enabled: true,
          secret: 'Bearer test-webhook-secret',
        },
        ftlUrl: {
          template: 'https://raw.githubusercontent.com/test-owner/test-repo/main/locales/{locale}/cms.ftl',
          timeout: 5000,
        },
        github: {
          owner: 'test-owner',
          repo: 'test-repo',
          token: 'test-token',
        },
      },
    };

    // Mock CMS Manager
    mockCmsManager = {
      fetchCMSData: sandbox.stub(),
      invalidateCache: sandbox.stub(),
      // FTL caching methods
      cacheFtlContent: sandbox.stub(),
      getCachedFtlContent: sandbox.stub(),
      invalidateFtlCache: sandbox.stub(),
    };

    // Mock Localization
    mockLocalization = {
      fetchAllStrapiEntries: sandbox.stub(),
      validateGitHubConfig: sandbox.stub(),
      strapiToFtl: sandbox.stub(),
      findExistingPR: sandbox.stub(),
      updateExistingPR: sandbox.stub(),
      createGitHubPR: sandbox.stub(),
      fetchLocalizationFromUrl: sandbox.stub(),
      convertFtlToStrapiFormat: sandbox.stub(),
      // Methods used by cms.ts
      fetchLocalizedFtlWithFallback: sandbox.stub(),
      mergeConfigs: sandbox.stub(),
      extractBaseLocale: sandbox.stub(),
      generateFtlContentFromEntries: sandbox.stub(),
    };

    // Mock Container
    sandbox.stub(Container, 'has').returns(true);
    sandbox.stub(Container, 'get').returns(mockCmsManager);

    // Use proxyquire to mock dependencies
    const cmsModule = proxyquire('../../../lib/routes/cms', {
      '@fxa/shared/cms': {
        RelyingPartyConfigurationManager: mockCmsManager,
      },
      './utils/cms': {
        CMSLocalization: function () {
          return mockLocalization;
        },
        StrapiWebhookPayload: {},
      },
    });

    routes = cmsModule.default(log, mockConfig, mockStatsD);
  });

  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    Container.reset();
  });

  describe('GET /cms/config', () => {
    beforeEach(() => {
      route = getRoute(routes, '/cms/config', 'GET');
    });

    it('should return config when CMS manager is available', async () => {
      const mockResult = {
        relyingParties: [createStrapiTestData()[0]],
      };
      mockCmsManager.fetchCMSData.resolves(mockResult);

      request = createLocalizationRequest('desktopSyncFirefoxCms', 'desktop-sync', 'en');

      const response = await route.handler(request);

      assert.deepEqual(response, mockResult.relyingParties[0]);
      assert.calledOnce(mockCmsManager.fetchCMSData);
      assert.calledWith(
        mockCmsManager.fetchCMSData,
        'desktopSyncFirefoxCms',
        'desktop-sync'
      );
    });

    it('should return empty object when no relying parties found', async () => {
      mockCmsManager.fetchCMSData.resolves({ relyingParties: [] });

      request = createLocalizationRequest('test-client', 'test-entrypoint', 'en');

      const response = await route.handler(request);

      assert.deepEqual(response, {});
      assert.calledOnce(mockStatsD.increment);
      assert.calledWith(mockStatsD.increment, 'cms.getConfig.empty');
    });

    it('should handle errors gracefully and return empty object', async () => {
      mockCmsManager.fetchCMSData.rejects(new Error('CMS Error'));

      request = createLocalizationRequest('test-client', 'test-entrypoint', 'en');

      const response = await route.handler(request);

      assert.deepEqual(response, {});
      assert.calledOnce(mockStatsD.increment);
      assert.calledWith(mockStatsD.increment, 'cms.getConfig.error');
    });

    it('should validate required clientId parameter', async () => {
      const queryObj = {
        entrypoint: 'test-entrypoint'
        // Missing clientId
      };

      try {
        await route.options.validate.query.validateAsync(queryObj);
        assert.fail('Should have thrown validation error');
      } catch (error) {
        assert.ok(error.message.includes('clientId') || error.message.includes('required'));
      }
    });
  });

  describe('POST /cms/webhook/strapil10n', () => {
    beforeEach(() => {
      route = getRoute(routes, '/cms/webhook/strapil10n', 'POST');
    });

    it('should process valid webhook successfully', async () => {
      const webhookPayload = {
        event: 'entry.publish',
        entry: {
          id: 123,
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
        model: 'relying-party',
      };

      const strapiData = createStrapiTestData();

      mockLocalization.fetchAllStrapiEntries.resolves(strapiData);
      mockLocalization.generateFtlContentFromEntries.returns('ftl-content');
      mockLocalization.findExistingPR.resolves(null);
      mockLocalization.createGitHubPR.resolves();

      request = {
        headers: {
          authorization: 'Bearer test-webhook-secret',
        },
        payload: webhookPayload,
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, { success: true });
      assert.calledOnce(mockStatsD.increment);
      assert.calledWith(mockStatsD.increment, 'cms.strapiWebhook.processed');
    });

    it('should return early when webhook is disabled', async () => {
      mockConfig.cmsl10n.strapiWebhook.enabled = false;

      request = {
        headers: {},
        payload: {},
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, { success: true });
      assert.calledOnce(log.info);
      assert.calledWith(log.info, 'cms.strapiWebhook.disabled', {});
    });

    it('should reject when authorization header is missing', async () => {
      request = {
        headers: {},
        payload: { event: 'entry.publish' },
        log: log,
      };

      try {
        await route.handler(request);
        assert.fail('Should have thrown authorization error');
      } catch (error) {
        assert.equal(error.message, 'Missing authorization header');
      }
    });

    it('should reject when authorization token is invalid', async () => {
      request = {
        headers: {
          authorization: 'Bearer wrong-secret-123456',
        },
        payload: { event: 'entry.publish' },
        log: log,
      };

      try {
        await route.handler(request);
        assert.fail('Should have thrown authorization error');
      } catch (error) {
        assert.equal(error.message, 'Invalid authorization header');
      }
    });
  });

  describe('POST /cms/webhook/cache/reset', () => {
    const webhookPayload = {
      model: 'relying-party',
      entry: {
        clientId: 'fed321',
        documentId: '0001-22-333333',
        entrypoint: 'testo',
        name: '123MaybeDone',
      },
    };

    beforeEach(() => {
      route = getRoute(routes, '/cms/webhook/cache/reset', 'POST');
    });

    it('should throw on invalid header', async () => {
      const req = {
        headers: { authorization: 'Bearer geo' },
        payload: webhookPayload,
      };
      try {
        await route.handler(req);
        assert.fail('an error should have been thrown');
      } catch (error) {
        assert.calledWith(
          log.error,
          'cms.cacheReset.error.auth',
          webhookPayload.entry
        );
        assert.calledWith(mockStatsD.increment, 'cms.cacheReset.error.auth', {
          clientId: webhookPayload.entry.clientId,
          entrypoint: webhookPayload.entry.entrypoint,
        });
        assert.equal(error.message, 'Invalid authorization header');
      }
    });

    it('should invalidate cms cache via mockCmsManager.invalidateCache', async () => {
      const req = {
        headers: {
          authorization: mockConfig.cms.webhookCacheInvalidation.secret,
        },
        payload: { ...webhookPayload, event: 'entry.publish' },
      };
      mockCmsManager.invalidateCache.resolves();

      const result = await route.handler(req);
      assert.deepEqual(result, { success: true });
      assert.calledOnceWithExactly(
        mockCmsManager.invalidateCache,
        webhookPayload.entry.clientId,
        webhookPayload.entry.entrypoint
      );
    });
  });

  describe('Localization tests - getLocalizedConfig', () => {
    beforeEach(() => {
      route = getRoute(routes, '/cms/config', 'GET');
    });

    it('should return base config for English locale', async () => {
      const baseConfig = createBaseConfig();
      const mockResult = { relyingParties: [baseConfig] };
      mockCmsManager.fetchCMSData.resolves(mockResult);

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'en');

      const response = await route.handler(request);

      assert.deepEqual(response, baseConfig);
      assert.calledOnce(mockCmsManager.fetchCMSData);
      // Should not fetch localization for English
      assert.notCalled(mockLocalization.fetchLocalizedFtlWithFallback);
    });

          it('should return base config when localization is disabled', async () => {
        mockConfig.cmsl10n.enabled = false;
        const baseConfig = createBaseConfig();
        const mockResult = { relyingParties: [baseConfig] };
      mockCmsManager.fetchCMSData.resolves(mockResult);

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'es');

      const response = await route.handler(request);

      assert.deepEqual(response, baseConfig);
      assert.calledOnce(mockCmsManager.fetchCMSData);
      assert.notCalled(mockLocalization.fetchLocalizedFtlWithFallback);
      assert.calledOnce(log.info);
      assert.calledWith(log.info, 'cms.getLocalizedConfig.baseConfigOnly', {
        clientId: 'sync-client',
        entrypoint: 'desktop-sync',
        locale: 'es',
        reason: 'localization-disabled'
      });
    });

    it('should fetch and merge localized content for non-English locale', async () => {
      const baseConfig = createBaseConfig();
      const mockResult = { relyingParties: [baseConfig] };

      const ftlContent = 'Spanish FTL content';

      const localizedData = {
        SigninPage: {
          headline: 'Introduzca su contraseña',
          description: 'para iniciar sesión en Firefox',
        },
      };

      mockCmsManager.fetchCMSData.resolves(mockResult);
      mockLocalization.fetchLocalizedFtlWithFallback.resolves(ftlContent);
      mockLocalization.mergeConfigs.resolves({
        ...baseConfig,
        ...localizedData
      });

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'es');

      const response = await route.handler(request);

      assert.calledOnce(mockLocalization.fetchLocalizedFtlWithFallback);
      assert.calledWith(mockLocalization.fetchLocalizedFtlWithFallback, 'es');
      assert.calledOnce(mockLocalization.mergeConfigs);
      assert.calledWith(mockLocalization.mergeConfigs, baseConfig, ftlContent, 'sync-client', 'desktop-sync');

      // Should merge localized content with base config
      assert.equal(response.SigninPage.headline, 'Introduzca su contraseña');
      assert.equal(response.SigninPage.description, 'para iniciar sesión en Firefox');
      assert.equal(response.name, 'Firefox Desktop Sync'); // Base config preserved

      assert.calledOnce(mockStatsD.increment);
      assert.calledWith(mockStatsD.increment, 'cms.getLocalizedConfig.success');
    });

    it('should fallback to base config when FTL content is empty', async () => {
      const baseConfig = createBaseConfig();
      const mockResult = { relyingParties: [baseConfig] };

      mockCmsManager.fetchCMSData.resolves(mockResult);
      mockLocalization.fetchLocalizedFtlWithFallback.resolves(''); // Empty FTL content

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'fr');

      const response = await route.handler(request);

      assert.deepEqual(response, baseConfig);
      assert.calledOnce(log.info);
      assert.calledWith(log.info, 'cms.getLocalizedConfig.fallbackToBase', {
        clientId: 'sync-client',
        entrypoint: 'desktop-sync',
        locale: 'fr'
      });
      assert.calledOnce(mockStatsD.increment);
      assert.calledWith(mockStatsD.increment, 'cms.getLocalizedConfig.fallback');
    });

    it('should return early when base config is empty object', async () => {
      // Mock that no relying parties are found
      mockCmsManager.fetchCMSData.resolves({ relyingParties: [] });

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'es');

      const response = await route.handler(request);

      // Should return empty object immediately without attempting localization
      assert.deepEqual(response, {});

      // Should not attempt to fetch localized content
      assert.notCalled(mockLocalization.fetchLocalizedFtlWithFallback);
      assert.notCalled(mockLocalization.mergeConfigs);

      // Should log both the getConfig result and the early return
      assert.calledTwice(log.info);

      // First call should be from getConfig method
      assert.calledWith(log.info.firstCall, 'cms.getConfig: No relying parties found', {
        clientId: 'sync-client',
        entrypoint: 'desktop-sync'
      });

      // Second call should be from the early return logic
      assert.calledWith(log.info.secondCall, 'cms.getLocalizedConfig.noBaseConfig', {
        clientId: 'sync-client',
        entrypoint: 'desktop-sync',
        locale: 'es'
      });

      // Should increment the getConfig.empty metric from the getConfig method
      assert.calledOnce(mockStatsD.increment);
      assert.calledWith(mockStatsD.increment, 'cms.getConfig.empty');
    });
  });

  describe('Route validation', () => {
    it('should validate GET /cms/config route structure', () => {
      const configRoute = getRoute(routes, '/cms/config', 'GET');

      assert.exists(configRoute);
      assert.equal(configRoute.method, 'GET');
      assert.equal(configRoute.path, '/cms/config');
      assert.exists(configRoute.options.validate.query);
    });

    it('should validate POST /cms/webhook/strapil10n route structure', () => {
      const webhookRoute = getRoute(routes, '/cms/webhook/strapil10n', 'POST');

      assert.exists(webhookRoute);
      assert.equal(webhookRoute.method, 'POST');
      assert.equal(webhookRoute.path, '/cms/webhook/strapil10n');
    });

    it('should validate POST /cms/webhook/cache/reset route structure', () => {
      const cacheResetRoute = getRoute(routes, '/cms/webhook/cache/reset', 'POST');

      assert.exists(cacheResetRoute);
      assert.equal(cacheResetRoute.method, 'POST');
      assert.equal(cacheResetRoute.path, '/cms/webhook/cache/reset');
    });
  });
});
