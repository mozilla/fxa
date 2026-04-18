/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { Container } from 'typedi';

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');

let log: any,
  mockConfig: any,
  mockStatsD: any,
  routes: any,
  route: any,
  request: any;
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

function createLocalizationRequest(
  clientId: string,
  entrypoint: string,
  locale: string
) {
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
      increment: jest.fn(),
      timing: jest.fn(),
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
      fetchCMSData: jest.fn(),
      invalidateCache: jest.fn(),
      cacheFtlContent: jest.fn(),
      getCachedFtlContent: jest.fn(),
      invalidateFtlCache: jest.fn(),
    };

    mockLegalTermsManager = {
      getLegalTermsByClientId: jest.fn(),
      getLegalTermsByService: jest.fn(),
    };

    mockLocalization = {
      fetchAllStrapiEntries: jest.fn(),
      validateGitHubConfig: jest.fn(),
      strapiToFtl: jest.fn(),
      findExistingPR: jest.fn(),
      updateExistingPR: jest.fn(),
      createGitHubPR: jest.fn(),
      fetchLocalizationFromUrl: jest.fn(),
      convertFtlToStrapiFormat: jest.fn(),
      fetchLocalizedFtlWithFallback: jest.fn(),
      mergeConfigs: jest.fn(),
      extractBaseLocale: jest.fn(),
      generateFtlContentFromEntries: jest.fn(),
    };

    mockLocalizationInstance = mockLocalization;

    // Use callsFake to always return the right mock based on argument
    const containerHas = jest.spyOn(Container, 'has').mockReturnValue(true);
    const containerGet = jest
      .spyOn(Container, 'get')
      .mockImplementation((token: any) => {
        // The cms module calls Container.get with the constructor functions
        // First call is RelyingPartyConfigurationManager, second is LegalTermsConfigurationManager
        // We match by name since the mocked constructors have no distinctive props
        if (
          token === require('@fxa/shared/cms').LegalTermsConfigurationManager
        ) {
          return mockLegalTermsManager;
        }
        return mockCmsManager;
      });

    const cmsModule = require('./cms');
    routes = cmsModule.default(log, mockConfig, mockStatsD);

    // Restore Container stubs after routes are created (they're only needed during init)
    containerHas.mockRestore();
    containerGet.mockRestore();
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
      mockCmsManager.fetchCMSData.mockResolvedValue(mockResult);

      request = createLocalizationRequest(
        'desktopSyncFirefoxCms',
        'desktop-sync',
        'en'
      );

      const response = await route.handler(request);

      expect(response).toEqual(mockResult.relyingParties[0]);
      expect(mockCmsManager.fetchCMSData).toHaveBeenCalledTimes(1);
      expect(mockCmsManager.fetchCMSData).toHaveBeenCalledWith(
        'desktopSyncFirefoxCms',
        'desktop-sync'
      );
    });

    it('should return empty object when no relying parties found', async () => {
      mockCmsManager.fetchCMSData.mockResolvedValue({ relyingParties: [] });

      request = createLocalizationRequest(
        'test-client',
        'test-entrypoint',
        'en'
      );

      const response = await route.handler(request);

      expect(response).toEqual({});
      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith('cms.getConfig.empty');
    });

    it('should handle errors gracefully and return empty object', async () => {
      mockCmsManager.fetchCMSData.mockRejectedValue(new Error('CMS Error'));

      request = createLocalizationRequest(
        'test-client',
        'test-entrypoint',
        'en'
      );

      const response = await route.handler(request);

      expect(response).toEqual({});
      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith('cms.getConfig.error');
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
          err.message.includes('clientId') || err.message.includes('required')
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

      mockLocalization.fetchAllStrapiEntries.mockResolvedValue(strapiData);
      mockLocalization.generateFtlContentFromEntries.mockReturnValue(
        'ftl-content'
      );
      mockLocalization.findExistingPR.mockResolvedValue(null);
      mockLocalization.createGitHubPR.mockResolvedValue();

      request = {
        headers: {
          authorization: 'Bearer test-webhook-secret',
        },
        payload: webhookPayload,
        log: log,
      };

      const response = await route.handler(request);

      expect(response).toEqual({ success: true });
      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.strapiWebhook.processed'
      );
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
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledWith('cms.strapiWebhook.disabled', {});
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
        expect(log.error).toHaveBeenCalledWith(
          'cms.cacheReset.error.auth',
          webhookPayload.entry
        );
        expect(mockStatsD.increment).toHaveBeenCalledWith(
          'cms.cacheReset.error.auth',
          {
            clientId: webhookPayload.entry.clientId,
            entrypoint: webhookPayload.entry.entrypoint,
          }
        );
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
      mockCmsManager.invalidateCache.mockResolvedValue();

      const result = await route.handler(req);
      expect(result).toEqual({ success: true });
      expect(mockCmsManager.invalidateCache).toHaveBeenCalledTimes(1);
      expect(mockCmsManager.invalidateCache).toHaveBeenCalledWith(
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
      mockCmsManager.fetchCMSData.mockResolvedValue(mockResult);

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'en');

      const response = await route.handler(request);

      expect(response).toEqual(baseConfig);
      expect(mockCmsManager.fetchCMSData).toHaveBeenCalledTimes(1);
      expect(
        mockLocalization.fetchLocalizedFtlWithFallback
      ).not.toHaveBeenCalled();
    });

    it('should return base config when localization is disabled', async () => {
      mockConfig.cmsl10n.enabled = false;
      const baseConfig = createBaseConfig();
      const mockResult = { relyingParties: [baseConfig] };
      mockCmsManager.fetchCMSData.mockResolvedValue(mockResult);

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'es');

      const response = await route.handler(request);

      expect(response).toEqual(baseConfig);
      expect(mockCmsManager.fetchCMSData).toHaveBeenCalledTimes(1);
      expect(
        mockLocalization.fetchLocalizedFtlWithFallback
      ).not.toHaveBeenCalled();
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.baseConfigOnly',
        {
          clientId: 'sync-client',
          entrypoint: 'desktop-sync',
          locale: 'es',
          reason: 'localization-disabled',
        }
      );
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

      mockCmsManager.fetchCMSData.mockResolvedValue(mockResult);
      mockLocalization.fetchLocalizedFtlWithFallback.mockResolvedValue(
        ftlContent
      );
      mockLocalization.mergeConfigs.mockResolvedValue({
        ...baseConfig,
        ...localizedData,
      });

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'es');

      const response = await route.handler(request);

      expect(
        mockLocalization.fetchLocalizedFtlWithFallback
      ).toHaveBeenCalledTimes(1);
      expect(
        mockLocalization.fetchLocalizedFtlWithFallback
      ).toHaveBeenCalledWith('es');
      expect(mockLocalization.mergeConfigs).toHaveBeenCalledTimes(1);
      expect(mockLocalization.mergeConfigs).toHaveBeenCalledWith(
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

      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.success'
      );
    });

    it('should fallback to base config when FTL content is empty', async () => {
      const baseConfig = createBaseConfig();
      const mockResult = { relyingParties: [baseConfig] };

      mockCmsManager.fetchCMSData.mockResolvedValue(mockResult);
      mockLocalization.fetchLocalizedFtlWithFallback.mockResolvedValue('');

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'fr');

      const response = await route.handler(request);

      expect(response).toEqual(baseConfig);
      expect(log.info).toHaveBeenCalledTimes(1);
      expect(log.info).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.fallbackToBase',
        {
          clientId: 'sync-client',
          entrypoint: 'desktop-sync',
          locale: 'fr',
        }
      );
      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.fallback'
      );
    });

    it('should return early when base config is empty object', async () => {
      mockCmsManager.fetchCMSData.mockResolvedValue({ relyingParties: [] });

      request = createLocalizationRequest('sync-client', 'desktop-sync', 'es');

      const response = await route.handler(request);

      expect(response).toEqual({});

      expect(
        mockLocalization.fetchLocalizedFtlWithFallback
      ).not.toHaveBeenCalled();
      expect(mockLocalization.mergeConfigs).not.toHaveBeenCalled();

      expect(log.info).toHaveBeenCalledTimes(2);

      expect(log.info).toHaveBeenCalledWith(
        'cms.getConfig: No relying parties found',
        {
          clientId: 'sync-client',
          entrypoint: 'desktop-sync',
        }
      );

      expect(log.info).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.noBaseConfig',
        {
          clientId: 'sync-client',
          entrypoint: 'desktop-sync',
          locale: 'es',
        }
      );

      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith('cms.getConfig.empty');
    });
  });

  describe('GET /cms/legal-terms', () => {
    beforeEach(() => {
      route = getRoute(routes, '/cms/legal-terms', 'GET');
      mockLegalTermsManager.getLegalTermsByClientId.mockReset();
      mockLegalTermsManager.getLegalTermsByService.mockReset();
      mockLocalization.fetchLocalizedFtlWithFallback.mockReset();
      mockLocalization.mergeConfigs.mockReset();
      mockStatsD.increment.mockClear();
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

      mockLegalTermsManager.getLegalTermsByClientId.mockResolvedValue({
        getLegalTerms: () => mockLegalTermsResult,
      });

      const response = await route.handler(request);

      expect(
        mockLegalTermsManager.getLegalTermsByClientId
      ).toHaveBeenCalledTimes(1);
      expect(
        mockLegalTermsManager.getLegalTermsByClientId
      ).toHaveBeenCalledWith(clientId);
      expect(response).toEqual(mockLegalTermsResult);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.getLegalTerms.success'
      );
    });

    it('should return legal terms when found by service', async () => {
      const service = 'sync';
      request = {
        query: { service },
        app: { locale: 'en' },
        log: log,
      };

      mockLegalTermsManager.getLegalTermsByService.mockResolvedValue({
        getLegalTerms: () => mockLegalTermsResult,
      });

      const response = await route.handler(request);

      expect(
        mockLegalTermsManager.getLegalTermsByService
      ).toHaveBeenCalledTimes(1);
      expect(mockLegalTermsManager.getLegalTermsByService).toHaveBeenCalledWith(
        service
      );
      expect(response).toEqual(mockLegalTermsResult);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.getLegalTerms.success'
      );
    });

    it('should return null when no legal terms found', async () => {
      const clientId = '1234567890abcdef';
      request = {
        query: { clientId },
        app: { locale: 'en' },
        log: log,
      };

      mockLegalTermsManager.getLegalTermsByClientId.mockResolvedValue({
        getLegalTerms: () => null,
      });

      const response = await route.handler(request);

      expect(response).toBeNull();
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.getLegalTerms.empty'
      );
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

      mockLegalTermsManager.getLegalTermsByClientId.mockResolvedValue({
        getLegalTerms: () => mockLegalTermsResult,
      });

      mockLocalization.fetchLocalizedFtlWithFallback.mockResolvedValue(
        ftlContent
      );
      mockLocalization.mergeConfigs.mockResolvedValue({
        ...mockLegalTermsResult,
        label: 'Conditions générales',
      });

      const response = await route.handler(request);

      expect(
        mockLocalization.fetchLocalizedFtlWithFallback
      ).toHaveBeenCalledTimes(1);
      expect(
        mockLocalization.fetchLocalizedFtlWithFallback
      ).toHaveBeenCalledWith(locale);
      expect(mockLocalization.mergeConfigs).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.getLegalTerms.success'
      );
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.getLegalTerms.localized'
      );
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

      mockLegalTermsManager.getLegalTermsByClientId.mockResolvedValue({
        getLegalTerms: () => mockLegalTermsResult,
      });

      mockLocalization.fetchLocalizedFtlWithFallback.mockResolvedValue(null);

      const response = await route.handler(request);

      expect(response).toEqual(mockLegalTermsResult);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.getLegalTerms.fallback'
      );
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.getLegalTerms.success'
      );
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

      mockLegalTermsManager.getLegalTermsByClientId.mockResolvedValue({
        getLegalTerms: () => mockLegalTermsResult,
      });

      const response = await route.handler(request);

      expect(response).toEqual(mockLegalTermsResult);
      expect(
        mockLocalization.fetchLocalizedFtlWithFallback
      ).not.toHaveBeenCalled();
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.getLegalTerms.success'
      );

      mockConfig.cmsl10n.enabled = true;
    });

    it('should handle errors gracefully and return null', async () => {
      const clientId = '1234567890abcdef';
      request = {
        query: { clientId },
        app: { locale: 'en' },
        log: log,
      };

      mockLegalTermsManager.getLegalTermsByClientId.mockRejectedValue(
        new Error('Strapi error')
      );

      const response = await route.handler(request);

      expect(response).toBeNull();
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cms.getLegalTerms.error'
      );
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
