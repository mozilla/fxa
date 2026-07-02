/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {
  createTestServer,
  getMailHelperConfig,
  TestServerInstance,
} from '../support/helpers/test-server';
import { createMailbox, Mailbox } from '../support/helpers/mailbox';
import {
  createProfileHelper,
  ProfileHelper,
  PROFILE_HELPER_HOST,
} from '../support/helpers/profile-helper';
import net from 'net';

// ---------------------------------------------------------------------------
// Mutable mock objects shared between jest.mock factories and test code.
// Variables prefixed with "mock" are exempt from jest.mock hoisting restrictions.
// ---------------------------------------------------------------------------
const mockStripeHelper: Record<string, any> = {};

// Mock ESM-only node_modules to avoid CJS transform issues when loading
// the auth server in-process.
jest.mock('@octokit/rest', () => ({ Octokit: class MockOctokit {} }));
jest.mock('p-queue', () => {
  const MockPQueue = class {
    async add(fn: () => Promise<unknown>) {
      return fn();
    }
    async onIdle() {}
  };
  return { default: MockPQueue, __esModule: true };
});

// Mock only createStripeHelper — keep StripeHelper class intact since it's used
// as a typedi Container token throughout the codebase.
jest.mock('../../lib/payments/stripe', () => {
  const actual = jest.requireActual('../../lib/payments/stripe');
  return {
    ...actual,
    createStripeHelper: () => mockStripeHelper,
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client = require('../client')();

interface OAuthClient {
  id: string;
  trusted: boolean;
  canGrant: boolean;
  publicClient: boolean;
}

// Load config to extract client IDs and constants
jest.resetModules();
const localConfig = require('../../config').default.getProperties();

const validClients: OAuthClient[] = localConfig.oauthServer.clients.filter(
  (c: OAuthClient) => c.trusted && c.canGrant && c.publicClient
);
const CLIENT_ID = (validClients.pop() as OAuthClient).id;
const CLIENT_ID_FOR_DEFAULT = (validClients.pop() as OAuthClient).id;

const PLAN_ID = 'allDoneProMonthly';
const PRODUCT_ID = 'megaProductHooray';
const PRODUCT_NAME = 'All Done Pro';

/** Find an available TCP port starting from `startPort`. */
function findFreePort(startPort: number, host = '127.0.0.1'): Promise<number> {
  return new Promise((resolve, reject) => {
    let port = startPort;
    const maxPort = startPort + 99;
    function tryPort() {
      if (port > maxPort) {
        reject(new Error(`No available port in range ${startPort}-${maxPort}`));
        return;
      }
      const srv = net.createServer();
      srv.listen(port, host, () => {
        const bound = (srv.address() as net.AddressInfo).port;
        srv.close(() => resolve(bound));
      });
      srv.on('error', () => {
        port++;
        tryPort();
      });
    }
    tryPort();
  });
}

// ---------------------------------------------------------------------------
// Subscriptions ENABLED — in-process server with mocked Stripe
// ---------------------------------------------------------------------------
describe('#integration - remote subscriptions (enabled)', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { OAUTH_SCOPE_SUBSCRIPTIONS } = require('fxa-shared/oauth/constants');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { AppError: error } = require('@fxa/accounts/errors');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const EventEmitter = require('events');

  // Container and its token classes are required INSIDE beforeAll after
  // jest.resetModules() so they share module identity with key_server's
  // runtime view of the same modules. Requiring them here at describe scope
  // (before any resetModules) would let the Container.set token classes
  // drift out of sync with what key_server re-requires after the reset,
  // making Container.get() silently miss on class identity.
  // See GUIDELINES.md Rule 7.
  let Container: any;
  let CapabilityService: any;
  let StripeHelper: any;
  let AuthLogger: any;
  let AppConfig: any;
  let ProfileClient: any;
  let PlaySubscriptions: any;
  let AppStoreSubscriptions: any;
  let CapabilityManager: any;
  let BackupCodeManager: any;
  let RecoveryPhoneService: any;
  let PriceManager: any;
  let ProductConfigurationManager: any;

  let server: any;
  let serverUrl: string;
  let mailbox: Mailbox;
  let profileServer: ProfileHelper;

  const mockPlaySubscriptions: Record<string, any> = {};
  const mockAppStoreSubscriptions: Record<string, any> = {};
  const mockCapabilityManager: Record<string, any> = {
    getClients: async () => [
      {
        clientId: CLIENT_ID,
        capabilities: ['123donePro', 'FooBar', 'ILikePie', 'MechaMozilla'],
      },
    ],
    priceIdsToClientCapabilities: async (priceIds: string[]) => {
      const result: Record<string, string[]> = {};
      if (priceIds.includes(PLAN_ID)) {
        result[CLIENT_ID] = ['123donePro', 'ILikePie'];
      }
      if (priceIds.includes('plan_1b')) {
        const existing = result[CLIENT_ID] || [];
        result[CLIENT_ID] = [
          ...new Set([...existing, 'MechaMozilla', 'FooBar']),
        ];
      }
      return result;
    },
  };
  const mockProfileClient: Record<string, any> = {};

  beforeAll(async () => {
    // Fresh config for the in-process server. resetModules() before any
    // typedi or token-class requires ensures the modules we capture here
    // share identity with what key_server re-requires below — Container.set
    // tokens line up with Container.get inside the in-process server.
    jest.resetModules();
    /* eslint-disable @typescript-eslint/no-require-imports */
    ({ default: Container } = require('typedi'));
    ({ CapabilityService } = require('../../lib/payments/capability'));
    ({ StripeHelper } = require('../../lib/payments/stripe'));
    ({ AuthLogger, AppConfig } = require('../../lib/types'));
    ({ ProfileClient } = require('@fxa/profile/client'));
    ({
      PlaySubscriptions,
    } = require('../../lib/payments/iap/google-play/subscriptions'));
    ({
      AppStoreSubscriptions,
    } = require('../../lib/payments/iap/apple-app-store/subscriptions'));
    ({ CapabilityManager } = require('@fxa/payments/capability'));
    ({ BackupCodeManager } = require('@fxa/accounts/two-factor'));
    ({ RecoveryPhoneService } = require('@fxa/accounts/recovery-phone'));
    ({ PriceManager } = require('@fxa/payments/customer'));
    ({ ProductConfigurationManager } = require('@fxa/shared/cms'));
    /* eslint-enable @typescript-eslint/no-require-imports */
    const config = require('../../config').default.getProperties();

    // Override specific subscription properties (preserve defaults)
    config.subscriptions.sharedSecret = 'wibble';
    config.subscriptions.enabled = true;
    config.subscriptions.stripeApiKey = 'sk_test_fake';
    config.subscriptions.paypalNvpSigCredentials = { enabled: false };
    config.subscriptions.productConfigsFirestore = { enabled: true };
    // bin/key_server.js throws "Missing required configuration for CMS
    // Strapi Client" when `cms.enabled` is true but apiKey is empty. The
    // managers that talk to Strapi are mocked above (CapabilityManager,
    // ProductConfigurationManager etc.), so no network calls are issued
    // — we just satisfy the guard with placeholder values.
    config.cms = {
      ...config.cms,
      enabled: true,
      strapiClient: {
        ...config.cms.strapiClient,
        graphqlApiUri:
          config.cms.strapiClient?.graphqlApiUri ||
          'http://localhost:1337/graphql',
        apiKey: config.cms.strapiClient?.apiKey || 'test-fake-strapi-key',
        firestoreCacheCollectionName:
          config.cms.strapiClient?.firestoreCacheCollectionName ||
          'test-cms-cache',
      },
    };
    config.customsUrl = 'none';
    config.rateLimit = {
      ...config.rateLimit,
      rules: '',
      checkAllEndpoints: false,
      ignoreIPs: ['127.0.0.1', '::1', 'localhost'],
    };

    // Silence logs
    config.log.level = 'critical';
    config.log.stdout = new EventEmitter();
    config.log.stdout.write = function () {};
    config.log.stderr = new EventEmitter();
    config.log.stderr.write = function () {};

    // Disable Glean
    if (config.gleanMetrics) {
      config.gleanMetrics.enabled = false;
    }

    const mailHelperConfig = getMailHelperConfig(config);
    config.smtp.host = mailHelperConfig.smtpHost;
    config.smtp.port = mailHelperConfig.smtpPort;
    config.smtp.api.host = mailHelperConfig.apiHost;
    config.smtp.api.port = mailHelperConfig.apiPort;

    // Dynamically allocate ports to avoid conflicts with parallel Jest workers.
    // Workers use 9200-9599 (via allocatePorts in test-server.ts), so start at 9700.
    const port = await findFreePort(9700);
    config.listen = { host: '127.0.0.1', port };
    config.publicUrl = `http://localhost:${port}`;
    config.oauth.url = `http://localhost:${port}`;
    config.oauthServer.audience = `http://localhost:${port}`;
    config.oauthServer.browserid = {
      ...config.oauthServer.browserid,
      issuer: `localhost:${port}`,
    };

    // Profile server
    const profilePort = await findFreePort(port + 1, PROFILE_HELPER_HOST);
    profileServer = await createProfileHelper(profilePort);
    config.profileServer.url = `http://${PROFILE_HELPER_HOST}:${profilePort}`;

    // Set up mock plan data
    mockStripeHelper.allAbbrevPlans = async () => [
      {
        plan_id: PLAN_ID,
        product_id: PRODUCT_ID,
        product_name: PRODUCT_NAME,
        interval: 'month',
        amount: 50,
        currency: 'usd',
        product_metadata: {
          [`capabilities:${CLIENT_ID}`]: '123donePro, ILikePie',
        },
      },
      {
        plan_id: 'plan_1a',
        product_id: 'prod_1a',
        product_name: 'product 1a',
        interval: 'month',
        amount: 50,
        currency: 'usd',
      },
      {
        plan_id: 'plan_1b',
        product_id: 'prod_1b',
        product_name: 'product 1b',
        interval: 'month',
        amount: 50,
        currency: 'usd',
        plan_metadata: {
          [`capabilities:${CLIENT_ID}`]: 'MechaMozilla,FooBar',
        },
      },
    ];
    mockStripeHelper.fetchCustomer = async () => ({});
    mockStripeHelper.allMergedPlanConfigs = async () => [];
    mockProfileClient.deleteCache = () => {};

    // Register mocks in Container.
    // StripeHelper must be set BEFORE creating CapabilityService, since the
    // CapabilityService constructor reads it from the Container.
    Container.set(AppConfig, config);
    Container.set(AuthLogger, { error: () => {} });
    Container.set(StripeHelper, mockStripeHelper);
    Container.set(PlaySubscriptions, mockPlaySubscriptions);
    Container.set(AppStoreSubscriptions, mockAppStoreSubscriptions);
    Container.set(ProfileClient, mockProfileClient);
    Container.set(CapabilityManager, mockCapabilityManager);
    Container.set(BackupCodeManager, {
      getCountForUserId: async () => ({ hasBackupCodes: false, count: 0 }),
    });
    Container.set(RecoveryPhoneService, {
      hasConfirmed: async () => ({ exists: false, phoneNumber: null }),
    });
    Container.set(PriceManager, { retrieve: jest.fn() });
    Container.set(ProductConfigurationManager, {
      getIapOfferings: jest.fn(),
      getPurchaseWithDetailsOfferingContentByPlanIds: jest.fn(async () => ({
        transformedPurchaseWithCommonContentForPlanId: jest.fn(() => ({
          offering: {
            commonContent: {
              privacyNoticeDownloadUrl:
                'https://payments-next.example.com/privacy',
              termsOfServiceDownloadUrl:
                'https://payments-next.example.com/tos',
              localizations: [
                {
                  privacyNoticeDownloadUrl:
                    'https://payments-next.example.com/privacy',
                  termsOfServiceDownloadUrl:
                    'https://payments-next.example.com/tos',
                },
              ],
            },
          },
        })),
      })),
    });

    // Create and register CapabilityService (reads mocks from Container)
    Container.remove(CapabilityService);
    Container.set(CapabilityService, new CapabilityService());

    serverUrl = `http://localhost:${port}`;

    // Load key_server. jest.mock at module scope ensures stripe-module
    // requires return our mock. No resetModules here: key_server's deps
    // share the module graph established at the top of beforeAll, so their
    // token classes line up with the ones we registered in Container.
    const createAuthServer = require('../../bin/key_server');
    server = await createAuthServer(config);

    // Set up mailbox against the repo-local mail_helper started in globalSetup.
    mailbox = createMailbox(mailHelperConfig.apiHost, mailHelperConfig.apiPort);
  }, 120000);

  afterAll(async () => {
    if (server) {
      await server.close();
    }
    if (profileServer) {
      await profileServer.close();
    }
    Container.remove(AppConfig);
    Container.remove(AuthLogger);
    Container.remove(StripeHelper);
    Container.remove(PlaySubscriptions);
    Container.remove(AppStoreSubscriptions);
    Container.remove(ProfileClient);
    Container.remove(CapabilityManager);
    Container.remove(BackupCodeManager);
    Container.remove(RecoveryPhoneService);
    Container.remove(PriceManager);
    Container.remove(ProductConfigurationManager);
    Container.remove(CapabilityService);
  });

  const testVersions = [
    { version: '', tag: '' },
    { version: 'V2', tag: 'V2' },
  ];

  describe.each(testVersions)('$tag', ({ version, tag }) => {
    const testOptions = { version };
    let client: any;
    let tokens: string[];

    beforeEach(async () => {
      const email = `${require('crypto').randomBytes(10).toString('hex')}@restmail.net`;
      client = await Client.createAndVerify(
        serverUrl,
        email,
        'wibble',
        mailbox,
        testOptions
      );

      const tokenResponse1 = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID_FOR_DEFAULT,
        scope: 'profile:subscriptions',
      });

      const tokenResponse2 = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID,
        scope: 'profile:subscriptions',
      });

      const tokenResponse3 = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID,
        scope: `profile ${OAUTH_SCOPE_SUBSCRIPTIONS}`,
      });

      tokens = [
        tokenResponse1.access_token,
        tokenResponse2.access_token,
        tokenResponse3.access_token,
      ];

      // Reset per-test mock behaviors
      mockStripeHelper.subscriptionsToResponse = async () => [];
      mockPlaySubscriptions.getActiveGooglePlaySubscriptions = async () => [];
    });

    it('should return client capabilities with shared secret', async () => {
      const response = await client.getSubscriptionClients('wibble');
      expect(response).toEqual([
        {
          clientId: CLIENT_ID,
          capabilities: ['123donePro', 'FooBar', 'ILikePie', 'MechaMozilla'],
        },
      ]);
    });

    it('should not return client capabilities with invalid shared secret', async () => {
      let succeeded = false;
      try {
        await client.getSubscriptionClients('blee');
        succeeded = true;
      } catch (err: any) {
        expect(err.code).toBe(401);
        expect(err.errno).toBe(error.ERRNO.INVALID_TOKEN);
      }
      expect(succeeded).toBe(false);
    });

    describe('with no subscriptions', () => {
      beforeEach(() => {
        mockStripeHelper.fetchCustomer = async () => ({
          subscriptions: { data: [] },
        });
      });

      it('should not return any subscription capabilities by default with session token', async () => {
        const response = await client.accountProfile();
        expect(response.subscriptions).toBeUndefined();
      });

      it('should not return any subscription capabilities for client without capabilities', async () => {
        const response = await client.accountProfile(tokens[0]);
        expect(response.subscriptions).toBeUndefined();
      });

      it('should not return any subscription capabilities for client with capabilities', async () => {
        const response = await client.accountProfile(tokens[1]);
        expect(response.subscriptions).toBeUndefined();
      });

      it('should return no active subscriptions', async () => {
        let result = await client.getActiveSubscriptions(tokens[2]);
        expect(result).toEqual([]);

        result = await client.account();
        expect(result.subscriptions).toEqual([]);
      });
    });

    describe('with a subscription', () => {
      const subscriptionId = 'sub_12345';
      const date = Date.now();

      beforeEach(() => {
        mockStripeHelper.fetchCustomer = async () => ({
          subscriptions: {
            data: [
              {
                id: subscriptionId,
                created: date,
                cancelled_at: null,
                plan: { id: PLAN_ID, product: PRODUCT_ID },
                items: {
                  data: [
                    {
                      price: { id: PLAN_ID, product: PRODUCT_ID },
                      plan: { id: PLAN_ID, product: PRODUCT_ID },
                    },
                  ],
                },
                status: 'active',
              },
            ],
          },
        });
        mockStripeHelper.subscriptionsToResponse = async () => [
          {
            subscription_id: subscriptionId,
            plan_id: PLAN_ID,
            product_name: PRODUCT_NAME,
            product_id: PRODUCT_ID,
            created: date,
            current_period_end: date,
            current_period_start: date,
            cancel_at_period_end: false,
            end_at: null,
            latest_invoice: '628031D-0002',
            latest_invoice_items: {
              line_items: [
                {
                  amount: 599,
                  currency: 'usd',
                  id: 'plan_G93lTs8hfK7NNG',
                  name: 'testo',
                  period: { end: date, start: date },
                },
              ],
              subtotal: 599,
              subtotal_excluding_tax: null,
              total: 599,
              total_excluding_tax: null,
            },
            status: 'active',
            failure_code: undefined,
            failure_message: undefined,
          },
        ];
      });

      it('should return all subscription capabilities with session token', async () => {
        const response = await client.accountProfile();
        expect(response.subscriptionsByClientId).toEqual({
          [CLIENT_ID]: ['123donePro', 'ILikePie'],
        });
      });

      it('should return all subscription capabilities for client without capabilities', async () => {
        const response = await client.accountProfile(tokens[0]);
        expect(response.subscriptionsByClientId).toEqual({
          [CLIENT_ID]: ['123donePro', 'ILikePie'],
        });
      });

      it('should return all subscription capabilities for client with capabilities', async () => {
        const response = await client.accountProfile(tokens[1]);
        expect(response.subscriptionsByClientId).toEqual({
          [CLIENT_ID]: ['123donePro', 'ILikePie'],
        });
      });

      it('should return active subscriptions', async () => {
        let result = await client.getActiveSubscriptions(tokens[2]);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0].createdAt).toBe(date * 1000);
        expect(result[0].productId).toBe(PRODUCT_ID);
        expect(result[0].uid).toBe(client.uid);
        expect(result[0].cancelledAt).toBeNull();

        result = await client.account();
        expect(Array.isArray(result.subscriptions)).toBe(true);
        expect(result.subscriptions).toHaveLength(1);
        expect(result.subscriptions[0].subscription_id).toBe(subscriptionId);
        expect(result.subscriptions[0].plan_id).toBe(PLAN_ID);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Subscriptions DISABLED — child-process server (existing, unchanged)
// ---------------------------------------------------------------------------

let disabledServer: TestServerInstance;

beforeAll(async () => {
  disabledServer = await createTestServer({
    configOverrides: {
      subscriptions: {
        enabled: false,
        productConfigsFirestore: { enabled: true },
      },
    },
  });
}, 120000);

afterAll(async () => {
  await disabledServer.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - remote subscriptions (disabled)',
  ({ version, tag }) => {
    const testOptions = { version };
    let client: any;
    let refreshToken: string;

    beforeEach(async () => {
      client = await Client.createAndVerify(
        disabledServer.publicUrl,
        disabledServer.uniqueEmail(),
        'wibble',
        disabledServer.mailbox,
        testOptions
      );

      const tokenResponse = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID,
        scope: 'profile:subscriptions',
      });

      refreshToken = tokenResponse.access_token;
    });

    it('should not include subscriptions with session token', async () => {
      const response = await client.accountProfile();
      expect(response.subscriptions).toBeUndefined();
    });

    it('should not include subscriptions with refresh token', async () => {
      const response = await client.accountProfile(refreshToken);
      expect(response.subscriptions).toBeUndefined();
    });

    it('should not return subscriptions from client.account', async () => {
      const response = await client.account();
      expect(response.subscriptions).toEqual([]);
    });
  }
);
