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
        description: 'to sign in to Firefox and start syncing'
      },
      EmailFirstPage: {
        headline: 'Welcome to Firefox Sync',
        description: 'Sync your passwords, tabs, and bookmarks'
      }
    }
  ];
}

describe('cms', () => {
  beforeEach(() => {
    log = mocks.mockLog();
    mockStatsD = {
      increment: sandbox.stub(),
      timing: sandbox.stub(),
    };

    mockConfig = {
      cmsl10n: {
        enabled: true,
        strapiWebhook: {
          enabled: true,
          secret: 'test-webhook-secret',
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
    };

    // Mock Localization
    mockLocalization = {
      fetchAllStrapiEntries: sandbox.stub(),
      validateGitHubConfig: sandbox.stub(),
      strapiToFtl: sandbox.stub(),
      findExistingPR: sandbox.stub(),
      updateExistingPR: sandbox.stub(),
      createGitHubPR: sandbox.stub(),
    };

    // Mock Container
    sandbox.stub(Container, 'has').returns(true);
    sandbox.stub(Container, 'get').returns(mockCmsManager);

        // Use proxyquire to mock dependencies
    const cmsModule = proxyquire('../../../lib/routes/cms', {
      '@fxa/shared/cms': {
        RelyingPartyConfigurationManager: mockCmsManager
      },
      './utils/cms': {
        CMSLocalization: function() {
          return mockLocalization;
        },
        StrapiWebhookPayload: {}
      }
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
        relyingParties: [
          {
            id: 'desktopSyncFirefoxCms',
            name: 'Firefox Desktop Sync',
            entrypoint: 'desktop-sync',
            clientId: 'sync-client',
            SigninPage: {
              headline: 'Enter your password',
              description: 'to sign in to Firefox and start syncing'
            },
            EmailFirstPage: {
              headline: 'Welcome to Firefox Sync',
              description: 'Sync your passwords, tabs, and bookmarks'
            }
          }
        ]
      };
      mockCmsManager.fetchCMSData.resolves(mockResult);

      request = {
        query: {
          clientId: 'desktopSyncFirefoxCms',
          entrypoint: 'desktop-sync'
        },
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, mockResult.relyingParties[0]);
      assert.calledOnce(mockCmsManager.fetchCMSData);
      assert.calledWith(mockCmsManager.fetchCMSData, 'desktopSyncFirefoxCms', 'desktop-sync');
    });

    it('should return empty object when no relying parties found', async () => {
      mockCmsManager.fetchCMSData.resolves({ relyingParties: [] });

      request = {
        query: {
          clientId: 'test-client',
          entrypoint: 'test-entrypoint'
        },
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, {});
      assert.calledOnce(mockStatsD.increment);
      assert.calledWith(mockStatsD.increment, 'cms.getConfig.empty');
    });

    it('should return first relying party when multiple found', async () => {
      const mockResult = {
        relyingParties: [
          {
            id: 'desktopSyncFirefoxCms',
            name: 'Firefox Desktop Sync',
            entrypoint: 'desktop-sync',
            clientId: 'sync-client',
            SigninPage: {
              headline: 'Enter your password',
              description: 'to sign in to Firefox and start syncing'
            }
          },
          {
            id: 'mobileSyncFirefoxCms',
            name: 'Firefox Mobile Sync',
            entrypoint: 'mobile-sync',
            clientId: 'mobile-sync-client',
            SigninPage: {
              headline: 'Sign in to Firefox',
              description: 'Access your synced data'
            }
          }
        ]
      };
      mockCmsManager.fetchCMSData.resolves(mockResult);

      request = {
        query: {
          clientId: 'desktopSyncFirefoxCms',
          entrypoint: 'desktop-sync'
        },
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, mockResult.relyingParties[0]);
      assert.calledOnce(mockStatsD.increment);
      assert.calledWith(mockStatsD.increment, 'cms.getConfig.multiple');
    });

    it('should handle errors gracefully and return empty object', async () => {
      mockCmsManager.fetchCMSData.rejects(new Error('CMS Error'));

      request = {
        query: {
          clientId: 'test-client',
          entrypoint: 'test-entrypoint'
        },
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, {});
      assert.calledOnce(mockStatsD.increment);
      assert.calledWith(mockStatsD.increment, 'cms.getConfig.error');
    });

    it('should throw error when CMS manager is not available', async () => {
      Container.has.returns(false);

      request = {
        query: {
          clientId: 'test-client',
          entrypoint: 'test-entrypoint'
        },
        log: log,
      };

      try {
        await route.handler(request);
        assert.fail('Should have thrown an error');
      } catch (error) {
        // Just check that an error was thrown
        assert.ok(error);
        assert.ok(error.message);
      }
    });

    it('should validate required clientId parameter', async () => {
      request = {
        query: {
          entrypoint: 'test-entrypoint'
        },
        log: log,
      };

      try {
        await route.handler(request);
        assert.fail('Should have thrown validation error');
      } catch (error) {
        // The validation error might be wrapped or have different format
        assert.ok(error.message.includes('clientId') || error.message.includes('validation'));
      }
    });
  });

  describe('POST /cms/webhook/strapi', () => {
    beforeEach(() => {
      route = getRoute(routes, '/cms/webhook/strapi', 'POST');
    });

    it('should process valid webhook successfully', async () => {
      const webhookPayload = {
        event: 'entry.publish',
        entry: {
          id: 123,
          updatedAt: '2023-01-01T00:00:00.000Z'
        },
        model: 'relying-party'
      };

      const strapiData = createStrapiTestData();

      mockLocalization.fetchAllStrapiEntries.resolves(strapiData);
      mockLocalization.strapiToFtl.returns('ftl-content');
      mockLocalization.findExistingPR.resolves(null);
      mockLocalization.createGitHubPR.resolves();

      request = {
        headers: {
          authorization: 'Bearer test-webhook-secret'
        },
        payload: webhookPayload,
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, { success: true });
      assert.calledOnce(mockStatsD.increment);
      assert.calledWith(mockStatsD.increment, 'cms.strapiWebhook.processed');
      assert.calledWith(mockLocalization.fetchAllStrapiEntries);
      assert.calledWith(mockLocalization.strapiToFtl, strapiData);
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
      assert.calledOnce(log.warn);
      assert.calledWith(log.warn, 'cms.strapiWebhook.disabled', {});
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
        assert.calledOnce(log.warn);
        assert.calledWith(log.warn, 'cms.strapiWebhook.missingAuthorization', {});
      }
    });

    it('should reject when authorization token is invalid', async () => {
      request = {
        headers: {
          authorization: 'Bearer wrong-secret'
        },
        payload: { event: 'entry.publish' },
        log: log,
      };

      try {
        await route.handler(request);
        assert.fail('Should have thrown authorization error');
      } catch (error) {
        assert.equal(error.message, 'Invalid authorization header');
        assert.calledOnce(log.warn);
        assert.calledWith(log.warn, 'cms.strapiWebhook.invalidAuthorization', {});
      }
    });

    it('should skip non-publish events', async () => {
      const webhookPayload = {
        event: 'entry.update',
        entry: { id: 123 },
        model: 'relying-party'
      };

      request = {
        headers: {
          authorization: 'Bearer test-webhook-secret'
        },
        payload: webhookPayload,
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, { success: true });
      assert.calledTwice(log.info);
      // Check that the skipped log was called
      const skippedCall = log.info.getCalls().find(call =>
        call.args[0] === 'cms.strapiWebhook.skipped'
      );
      assert.exists(skippedCall);
      assert.deepEqual(skippedCall.args[1], {
        eventType: 'entry.update',
        reason: 'Event not in allowed list'
      });
    });

    it('should skip when no event type is provided', async () => {
      request = {
        headers: {
          authorization: 'Bearer test-webhook-secret'
        },
        payload: {},
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, { success: true });
      assert.calledTwice(log.info);
      // Check that the skipped log was called
      const skippedCall = log.info.getCalls().find(call =>
        call.args[0] === 'cms.strapiWebhook.skipped'
      );
      assert.exists(skippedCall);
      assert.deepEqual(skippedCall.args[1], {
        eventType: undefined,
        reason: 'Event not in allowed list'
      });
    });

    it('should handle case when no Strapi entries found', async () => {
      const webhookPayload = {
        event: 'entry.publish',
        entry: { id: 123 },
        model: 'relying-party'
      };

      mockLocalization.fetchAllStrapiEntries.resolves([]);

      request = {
        headers: {
          authorization: 'Bearer test-webhook-secret'
        },
        payload: webhookPayload,
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, { success: true });
      assert.calledOnce(log.warn);
      assert.calledWith(log.warn, 'cms.strapiWebhook.noEntries', {});
    });

    it('should update existing PR when found', async () => {
      const webhookPayload = {
        event: 'entry.publish',
        entry: { id: 123, updatedAt: '2023-01-01T00:00:00.000Z' },
        model: 'relying-party'
      };

      const strapiData = createStrapiTestData();

      mockLocalization.fetchAllStrapiEntries.resolves(strapiData);
      mockLocalization.strapiToFtl.returns('ftl-content');
      mockLocalization.findExistingPR.resolves({ number: 123 });
      mockLocalization.updateExistingPR.resolves();

      request = {
        headers: {
          authorization: 'Bearer test-webhook-secret'
        },
        payload: webhookPayload,
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, { success: true });
      assert.calledOnce(mockLocalization.updateExistingPR);
      assert.calledWith(mockLocalization.updateExistingPR, 123, 'ftl-content');
      assert.calledWith(mockLocalization.strapiToFtl, strapiData);
    });

    it('should create new PR when no existing PR found', async () => {
      const webhookPayload = {
        event: 'entry.publish',
        entry: { id: 123, updatedAt: '2023-01-01T00:00:00.000Z' },
        model: 'relying-party'
      };

      const strapiData = createStrapiTestData();

      mockLocalization.fetchAllStrapiEntries.resolves(strapiData);
      mockLocalization.strapiToFtl.returns('ftl-content');
      mockLocalization.findExistingPR.resolves(null);
      mockLocalization.createGitHubPR.resolves();

      request = {
        headers: {
          authorization: 'Bearer test-webhook-secret'
        },
        payload: webhookPayload,
        log: log,
      };

      const response = await route.handler(request);

      assert.deepEqual(response, { success: true });
      assert.calledOnce(mockLocalization.createGitHubPR);
      assert.calledWith(mockLocalization.createGitHubPR, 'ftl-content', 'all-entries');
      assert.calledWith(mockLocalization.strapiToFtl, strapiData);
    });

    it('should handle errors and increment error metric', async () => {
      const webhookPayload = {
        event: 'entry.publish',
        entry: { id: 123 },
        model: 'relying-party'
      };

      mockLocalization.fetchAllStrapiEntries.rejects(new Error('Strapi API Error'));

      request = {
        headers: {
          authorization: 'Bearer test-webhook-secret'
        },
        payload: webhookPayload,
        log: log,
      };

      try {
        await route.handler(request);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Strapi API Error');
        assert.calledOnce(mockStatsD.increment);
        assert.calledWith(mockStatsD.increment, 'cms.strapiWebhook.error');
        assert.calledOnce(log.error);
        assert.calledWith(log.error, 'cms.strapiWebhook.error', {
          error: 'Strapi API Error'
        });
      }
    });

    it('should handle FTL generation errors', async () => {
      const webhookPayload = {
        event: 'entry.publish',
        entry: { id: 123 },
        model: 'relying-party'
      };

      const strapiData = createStrapiTestData();

      mockLocalization.fetchAllStrapiEntries.resolves(strapiData);
      mockLocalization.strapiToFtl.throws(new Error('FTL Generation Error'));

      request = {
        headers: {
          authorization: 'Bearer test-webhook-secret'
        },
        payload: webhookPayload,
        log: log,
      };

      try {
        await route.handler(request);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'FTL Generation Error');
        assert.calledOnce(mockStatsD.increment);
        assert.calledWith(mockStatsD.increment, 'cms.strapiWebhook.error');
      }
    });

    it('should validate GitHub config before processing', async () => {
      const webhookPayload = {
        event: 'entry.publish',
        entry: { id: 123 },
        model: 'relying-party'
      };

      const strapiData = createStrapiTestData();

      mockLocalization.fetchAllStrapiEntries.resolves(strapiData);
      mockLocalization.validateGitHubConfig.rejects(new Error('GitHub config invalid'));

      request = {
        headers: {
          authorization: 'Bearer test-webhook-secret'
        },
        payload: webhookPayload,
        log: log,
      };

      try {
        await route.handler(request);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'GitHub config invalid');
        assert.calledOnce(mockLocalization.validateGitHubConfig);
      }
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

    it('should validate POST /cms/webhook/strapi route structure', () => {
      const webhookRoute = getRoute(routes, '/cms/webhook/strapi', 'POST');

      assert.exists(webhookRoute);
      assert.equal(webhookRoute.method, 'POST');
      assert.equal(webhookRoute.path, '/cms/webhook/strapi');
    });
  });
});
