/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import crypto from 'crypto';
import { Container } from 'typedi';

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');

let log: any, mockConfig: any, mockStatsD: any, routes: any, route: any, request: any;
let mockCmsManager: any, mockLegalTermsManager: any, mockLocalization: any;

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

function createBaseConfig(overrides: any = {}) {
  return {
    l10nId: 'desktopSyncFirefoxCms',
    name: 'Firefox Desktop Sync',
    entrypoint: 'desktop-sync',
    clientId: 'sync-client',
    SigninPage: {
      headline: 'Enter your password',
      description: 'to sign in to Firefox and start syncing',
    },
    ...overrides,
  };
}

function createLocalizationRequest(clientId: string, entrypoint: string, locale: string) {
  return {
    query: { clientId, entrypoint },
    app: { locale },
    log: log,
  };
}

// Mock the CMS dependencies before requiring the module
// Note: jest.mock factories are hoisted, so we must use inline values
jest.mock('@fxa/shared/cms', () => ({
  RelyingPartyConfigurationManager: function () {},
  LegalTermsConfigurationManager: function () {},
}));

// Use a global-scoped variable for the mock localization instance
// so it can be swapped in beforeEach
// eslint-disable-next-line no-var
var mockLocalizationInstance: any;

jest.mock('./utils/cms', () => ({
  CMSLocalization: function () {
    return mockLocalizationInstance;
  },
  StrapiWebhookPayload: {},
}));

describe('cms', () => {
  beforeEach(() => {
    log = mocks.mockLog();
    mockStatsD = {
      increment: sinon.stub(),
      timing: sinon.stub(),
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
          template:
            'https://raw.githubusercontent.com/test-owner/test-repo/main/locales/{locale}/cms.ftl',
          timeout: 5000,
        },
        github: {
          owner: 'test-owner',
          repo: 'test-repo',
          token: 'test-token',
        },
      },
    };

    mockCmsManager = {
      fetchCMSData: sinon.stub(),
      invalidateCache: sinon.stub(),
      cacheFtlContent: sinon.stub(),
      getCachedFtlContent: sinon.stub(),
      invalidateFtlCache: sinon.stub(),
    };

    mockLegalTermsManager = {
      getLegalTermsByClientId: sinon.stub(),
      getLegalTermsByService: sinon.stub(),
    };

    mockLocalization = {
      fetchAllStrapiEntries: sinon.stub(),
      validateGitHubConfig: sinon.stub(),
      strapiToFtl: sinon.stub(),
      findExistingPR: sinon.stub(),
      updateExistingPR: sinon.stub(),
      createGitHubPR: sinon.stub(),
      fetchLocalizationFromUrl: sinon.stub(),
      convertFtlToStrapiFormat: sinon.stub(),
      fetchLocalizedFtlWithFallback: sinon.stub(),
      mergeConfigs: sinon.stub(),
      extractBaseLocale: sinon.stub(),
      generateFtlContentFromEntries: sinon.stub(),
    };

    mockLocalizationInstance = mockLocalization;

    // Use callsFake to always return the right mock based on argument
    const containerHas = sinon.stub(Container, 'has').returns(true);
    const containerGet = sinon.stub(Container, 'get').callsFake((token: any) => {
      // The cms module calls Container.get with the constructor functions
      // First call is RelyingPartyConfigurationManager, second is LegalTermsConfigurationManager
      // We match by name since the mocked constructors have no distinctive props
      if (token === require('@fxa/shared/cms').LegalTermsConfigurationManager) {
        return mockLegalTermsManager;
      }
      return mockCmsManager;
    });

    const cmsModule = require('./cms');
    routes = cmsModule.default(log, mockConfig, mockStatsD);

    // Restore Container stubs after routes are created (they're only needed during init)
    containerHas.restore();
    containerGet.restore();
  });

  afterAll(() => {
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

      request = createLocalizationRequest(
        'desktopSyncFirefoxCms',
        'desktop-sync',
        'en'
      );

      const response = await route.handler(request);

      expect(response).toEqual(mockResult.relyingParties[0]);
      sinon.assert.calledOnce(mockCmsManager.fetchCMSData);
      sinon.assert.calledWith(
        mockCmsManager.fetchCMSData,
        'desktopSyncFirefoxCms',
        'desktop-sync'
      );
    });

    it('should return empty object when no relying parties found', async () => {
      mockCmsManager.fetchCMSData.resolves({ relyingParties: [] });

      request = createLocalizationRequest(
        'test-client',
        'test-entrypoint',
        'en'
      );

      const response = await route.handler(request);

      expect(response).toEqual({});
      sinon.assert.calledOnce(mockStatsD.increment);
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getConfig.empty');
    });

    it('should handle errors gracefully and return empty object', async () => {
      mockCmsManager.fetchCMSData.rejects(new Error('CMS Error'));

      request = createLocalizationRequest(
        'test-client',
        'test-entrypoint',
        'en'
      );

      const response = await route.handler(request);

      expect(response).toEqual({});
      sinon.assert.calledOnce(mockStatsD.increment);
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getConfig.error');
    });

    it('should validate required clientId parameter', async () => {
      const queryObj = {
        entrypoint: 'test-entrypoint',
      };

      try {
        await route.options.validate.query.validateAsync(queryObj);
        throw new Error('Should have thrown validation error');
      } catch (err: any) {
        expect(
          err.message.includes('clientId') ||
            err.message.includes('required')
        ).toBeTruthy();
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

      expect(response).toEqual({ success: true });
      sinon.assert.calledOnce(mockStatsD.increment);
      sinon.assert.calledWith(mockStatsD.increment, 'cms.strapiWebhook.processed');
    });

    it('should return early when webhook is disabled', async () => {
      mockConfig.cmsl10n.strapiWebhook.enabled = false;

      request = {
        headers: {},
        payload: {},
        log: log,
      };

      const response = await route.handler(request);

      expect(response).toEqual({ success: true });
      sinon.assert.calledOnce(log.info);
      sinon.assert.calledWith(log.info, 'cms.strapiWebhook.disabled', {});
    });

    it('should reject when authorization header is missing', async () => {
      request = {
        headers: {},
        payload: { event: 'entry.publish' },
        log: log,
      };

      try {
        await route.handler(request);
        throw new Error('Should have thrown authorization error');
      } catch (err: any) {
        expect(err.message).toBe('Missing authorization header');
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
        throw new Error('Should have thrown authorization error');
      } catch (err: any) {
        expect(err.message).toBe('Invalid authorization header');
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
        throw new Error('an error should have been thrown');
      } catch (err: any) {
        sinon.assert.calledWith(
          log.error,
          'cms.cacheReset.error.auth',
          webhookPayload.entry
        );
        sinon.assert.calledWith(mockStatsD.increment, 'cms.cacheReset.error.auth', {
          clientId: webhookPayload.entry.clientId,
          entrypoint: webhookPayload.entry.entrypoint,
        });
        expect(err.message).toBe('Invalid authorization header');
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
      expect(result).toEqual({ success: true });
      sinon.assert.calledOnceWithExactly(
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

      expect(response).toEqual(baseConfig);
      sinon.assert.calledOnce(mockCmsManager.fetchCMSData);
      sinon.assert.notCalled(mockLocalization.fetchLocalizedFtlWithFallback);
    });

    it('should return base config when localization is disabled', async () => {
      mockConfig.cmsl10n.enabled = false;
      const baseConfig = createBaseConfig();
      const mockResult = { relyingParties: [baseConfig] };
      mockCmsManager.fetchCMSData.resolves(mockResult);

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'es');

      const response = await route.handler(request);

      expect(response).toEqual(baseConfig);
      sinon.assert.calledOnce(mockCmsManager.fetchCMSData);
      sinon.assert.notCalled(mockLocalization.fetchLocalizedFtlWithFallback);
      sinon.assert.calledOnce(log.info);
      sinon.assert.calledWith(log.info, 'cms.getLocalizedConfig.baseConfigOnly', {
        clientId: 'sync-client',
        entrypoint: 'desktop-sync',
        locale: 'es',
        reason: 'localization-disabled',
      });
    });

    it('should fetch and merge localized content for non-English locale', async () => {
      const baseConfig = createBaseConfig();
      const mockResult = { relyingParties: [baseConfig] };

      const headlineHash = crypto
        .createHash('md5')
        .update('Enter your password')
        .digest('hex')
        .substring(0, 8);
      const descriptionHash = crypto
        .createHash('md5')
        .update('Please enter your password to continue')
        .digest('hex')
        .substring(0, 8);

      const ftlContent = `${headlineHash} = Introduzca su contraseña\n${descriptionHash} = para iniciar sesión en Firefox`;

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
        ...localizedData,
      });

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'es');

      const response = await route.handler(request);

      sinon.assert.calledOnce(mockLocalization.fetchLocalizedFtlWithFallback);
      sinon.assert.calledWith(mockLocalization.fetchLocalizedFtlWithFallback, 'es');
      sinon.assert.calledOnce(mockLocalization.mergeConfigs);
      sinon.assert.calledWith(
        mockLocalization.mergeConfigs,
        baseConfig,
        ftlContent,
        'sync-client',
        'desktop-sync'
      );

      expect(response.SigninPage.headline).toBe('Introduzca su contraseña');
      expect(response.SigninPage.description).toBe(
        'para iniciar sesión en Firefox'
      );
      expect(response.name).toBe('Firefox Desktop Sync');

      sinon.assert.calledOnce(mockStatsD.increment);
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getLocalizedConfig.success');
    });

    it('should fallback to base config when FTL content is empty', async () => {
      const baseConfig = createBaseConfig();
      const mockResult = { relyingParties: [baseConfig] };

      mockCmsManager.fetchCMSData.resolves(mockResult);
      mockLocalization.fetchLocalizedFtlWithFallback.resolves('');

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'fr');

      const response = await route.handler(request);

      expect(response).toEqual(baseConfig);
      sinon.assert.calledOnce(log.info);
      sinon.assert.calledWith(log.info, 'cms.getLocalizedConfig.fallbackToBase', {
        clientId: 'sync-client',
        entrypoint: 'desktop-sync',
        locale: 'fr',
      });
      sinon.assert.calledOnce(mockStatsD.increment);
      sinon.assert.calledWith(
        mockStatsD.increment,
        'cms.getLocalizedConfig.fallback'
      );
    });

    it('should return early when base config is empty object', async () => {
      mockCmsManager.fetchCMSData.resolves({ relyingParties: [] });

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'es');

      const response = await route.handler(request);

      expect(response).toEqual({});

      sinon.assert.notCalled(mockLocalization.fetchLocalizedFtlWithFallback);
      sinon.assert.notCalled(mockLocalization.mergeConfigs);

      sinon.assert.calledTwice(log.info);

      sinon.assert.calledWith(
        log.info.firstCall,
        'cms.getConfig: No relying parties found',
        {
          clientId: 'sync-client',
          entrypoint: 'desktop-sync',
        }
      );

      sinon.assert.calledWith(
        log.info.secondCall,
        'cms.getLocalizedConfig.noBaseConfig',
        {
          clientId: 'sync-client',
          entrypoint: 'desktop-sync',
          locale: 'es',
        }
      );

      sinon.assert.calledOnce(mockStatsD.increment);
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getConfig.empty');
    });
  });

  describe('GET /cms/legal-terms', () => {
    beforeEach(() => {
      route = getRoute(routes, '/cms/legal-terms', 'GET');
      mockLegalTermsManager.getLegalTermsByClientId.reset();
      mockLegalTermsManager.getLegalTermsByService.reset();
      mockLocalization.fetchLocalizedFtlWithFallback.reset();
      mockLocalization.mergeConfigs.reset();
      mockStatsD.increment.resetHistory();
    });

    const mockLegalTermsResult = {
      label: 'Example service',
      termsOfServiceLink: 'https://example.com/tos',
      privacyNoticeLink: 'https://example.com/privacy',
      fontSize: 'default',
    };

    it('should return legal terms when found by clientId', async () => {
      const clientId = '1234567890abcdef';
      request = {
        query: { clientId },
        app: { locale: 'en' },
        log: log,
      };

      mockLegalTermsManager.getLegalTermsByClientId.resolves({
        getLegalTerms: () => mockLegalTermsResult,
      });

      const response = await route.handler(request);

      sinon.assert.calledOnce(mockLegalTermsManager.getLegalTermsByClientId);
      sinon.assert.calledWith(
        mockLegalTermsManager.getLegalTermsByClientId,
        clientId
      );
      expect(response).toEqual(mockLegalTermsResult);
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getLegalTerms.success');
    });

    it('should return legal terms when found by service', async () => {
      const service = 'sync';
      request = {
        query: { service },
        app: { locale: 'en' },
        log: log,
      };

      mockLegalTermsManager.getLegalTermsByService.resolves({
        getLegalTerms: () => mockLegalTermsResult,
      });

      const response = await route.handler(request);

      sinon.assert.calledOnce(mockLegalTermsManager.getLegalTermsByService);
      sinon.assert.calledWith(mockLegalTermsManager.getLegalTermsByService, service);
      expect(response).toEqual(mockLegalTermsResult);
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getLegalTerms.success');
    });

    it('should return null when no legal terms found', async () => {
      const clientId = '1234567890abcdef';
      request = {
        query: { clientId },
        app: { locale: 'en' },
        log: log,
      };

      mockLegalTermsManager.getLegalTermsByClientId.resolves({
        getLegalTerms: () => null,
      });

      const response = await route.handler(request);

      expect(response).toBeNull();
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getLegalTerms.empty');
    });

    it('should throw error when both clientId and service provided', async () => {
      request = {
        query: { clientId: '1234567890abcdef', service: 'sync' },
        app: { locale: 'en' },
        log: log,
      };

      try {
        await route.handler(request);
        throw new Error('Should have thrown error');
      } catch (err: any) {
        expect(err.message).toBe('Invalid parameter in request body');
        expect(err.errno).toBe(107);
        expect(err.code).toBe(400);
      }
    });

    it('should throw error when neither clientId nor service provided', async () => {
      request = {
        query: {},
        app: { locale: 'en' },
        log: log,
      };

      try {
        await route.handler(request);
        throw new Error('Should have thrown error');
      } catch (err: any) {
        expect(err.message).toBe('Invalid parameter in request body');
        expect(err.errno).toBe(107);
        expect(err.code).toBe(400);
      }
    });

    it('should return localized legal terms for non-English locale', async () => {
      const clientId = '1234567890abcdef';
      const locale = 'fr';
      const ftlContent = 'legal-terms-label = Conditions générales';

      request = {
        query: { clientId },
        app: { locale },
        log: log,
      };

      mockLegalTermsManager.getLegalTermsByClientId.resolves({
        getLegalTerms: () => mockLegalTermsResult,
      });

      mockLocalization.fetchLocalizedFtlWithFallback.resolves(ftlContent);
      mockLocalization.mergeConfigs.resolves({
        ...mockLegalTermsResult,
        label: 'Conditions générales',
      });

      const response = await route.handler(request);

      sinon.assert.calledOnce(mockLocalization.fetchLocalizedFtlWithFallback);
      sinon.assert.calledWith(mockLocalization.fetchLocalizedFtlWithFallback, locale);
      sinon.assert.calledOnce(mockLocalization.mergeConfigs);
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getLegalTerms.success');
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getLegalTerms.localized');
      expect(response.label).toBe('Conditions générales');
    });

    it('should fallback to base legal terms when FTL content is empty', async () => {
      const clientId = '1234567890abcdef';
      const locale = 'de';

      request = {
        query: { clientId },
        app: { locale },
        log: log,
      };

      mockLegalTermsManager.getLegalTermsByClientId.resolves({
        getLegalTerms: () => mockLegalTermsResult,
      });

      mockLocalization.fetchLocalizedFtlWithFallback.resolves(null);

      const response = await route.handler(request);

      expect(response).toEqual(mockLegalTermsResult);
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getLegalTerms.fallback');
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getLegalTerms.success');
    });

    it('should return base legal terms when localization is disabled', async () => {
      const clientId = '1234567890abcdef';
      const locale = 'es';

      mockConfig.cmsl10n.enabled = false;

      request = {
        query: { clientId },
        app: { locale },
        log: log,
      };

      mockLegalTermsManager.getLegalTermsByClientId.resolves({
        getLegalTerms: () => mockLegalTermsResult,
      });

      const response = await route.handler(request);

      expect(response).toEqual(mockLegalTermsResult);
      sinon.assert.notCalled(mockLocalization.fetchLocalizedFtlWithFallback);
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getLegalTerms.success');

      mockConfig.cmsl10n.enabled = true;
    });

    it('should handle errors gracefully and return null', async () => {
      const clientId = '1234567890abcdef';
      request = {
        query: { clientId },
        app: { locale: 'en' },
        log: log,
      };

      mockLegalTermsManager.getLegalTermsByClientId.rejects(
        new Error('Strapi error')
      );

      const response = await route.handler(request);

      expect(response).toBeNull();
      sinon.assert.calledWith(mockStatsD.increment, 'cms.getLegalTerms.error');
    });
  });

  describe('Route validation', () => {
    it('should validate GET /cms/config route structure', () => {
      const configRoute = getRoute(routes, '/cms/config', 'GET');

      expect(configRoute).toBeTruthy();
      expect(configRoute.method).toBe('GET');
      expect(configRoute.path).toBe('/cms/config');
      expect(configRoute.options.validate.query).toBeTruthy();
    });

    it('should validate POST /cms/webhook/strapil10n route structure', () => {
      const webhookRoute = getRoute(routes, '/cms/webhook/strapil10n', 'POST');

      expect(webhookRoute).toBeTruthy();
      expect(webhookRoute.method).toBe('POST');
      expect(webhookRoute.path).toBe('/cms/webhook/strapil10n');
    });

    it('should validate POST /cms/webhook/cache/reset route structure', () => {
      const cacheResetRoute = getRoute(
        routes,
        '/cms/webhook/cache/reset',
        'POST'
      );

      expect(cacheResetRoute).toBeTruthy();
      expect(cacheResetRoute.method).toBe('POST');
      expect(cacheResetRoute.path).toBe('/cms/webhook/cache/reset');
    });

    it('should validate GET /cms/legal-terms route structure', () => {
      const legalTermsRoute = getRoute(routes, '/cms/legal-terms', 'GET');

      expect(legalTermsRoute).toBeTruthy();
      expect(legalTermsRoute.method).toBe('GET');
      expect(legalTermsRoute.path).toBe('/cms/legal-terms');
      expect(legalTermsRoute.options.validate.query).toBeTruthy();
    });
  });
});
