/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {
  createTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';
import { createMailbox, Mailbox } from '../support/helpers/mailbox';
import {
  createProfileHelper,
  ProfileHelper,
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
const configPath = require.resolve('../../config');
delete require.cache[configPath];
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
function findFreePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    let port = startPort;
    const maxPort = startPort + 99;
    function tryPort() {
      if (port > maxPort) {
        reject(new Error(`No available port in range ${startPort}-${maxPort}`));
        return;
      }
      const srv = net.createServer();
      srv.listen(port, '0.0.0.0', () => {
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
  const { default: Container } = require('typedi');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CapabilityService } = require('../../lib/payments/capability');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { AuthLogger, AppConfig } = require('../../lib/types');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ProfileClient } = require('@fxa/profile/client');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const {
    PlaySubscriptions,
  } = require('../../lib/payments/iap/google-play/subscriptions');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const {
    AppStoreSubscriptions,
  } = require('../../lib/payments/iap/apple-app-store/subscriptions');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CapabilityManager } = require('@fxa/payments/capability');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { BackupCodeManager } = require('@fxa/accounts/two-factor');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RecoveryPhoneService } = require('@fxa/accounts/recovery-phone');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PriceManager } = require('@fxa/payments/customer');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ProductConfigurationManager } = require('@fxa/shared/cms');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { AppError: error } = require('@fxa/accounts/errors');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const EventEmitter = require('events');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sinon = require('sinon');

  let server: any;
  let serverUrl: string;
  let mailbox: Mailbox;
  let profileServer: ProfileHelper;

  const mockPlaySubscriptions: Record<string, any> = {};
  const mockAppStoreSubscriptions: Record<string, any> = {};
  const mockCapabilityManager: Record<string, any> = { getClients: () => {} };
  const mockProfileClient: Record<string, any> = {};

  beforeAll(async () => {
    // Fresh config for the in-process server
    delete require.cache[require.resolve('../../config')];
    const config = require('../../config').default.getProperties();

    // Override specific subscription properties (preserve defaults)
    config.subscriptions.sharedSecret = 'wibble';
    config.subscriptions.enabled = true;
    config.subscriptions.stripeApiKey = 'sk_test_fake';
    config.subscriptions.paypalNvpSigCredentials = { enabled: false };
    config.subscriptions.productConfigsFirestore = { enabled: true };
    config.cms = { ...config.cms, enabled: false };
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
    const profilePort = await findFreePort(port + 1);
    profileServer = await createProfileHelper(profilePort);
    config.profileServer.url = `http://localhost:${profilePort}`;

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
    // With jest.mock, StripeHelper export === mockStripeHelper (the token IS the mock object).
    const { StripeHelper } = require('../../lib/payments/stripe');
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
    Container.set(PriceManager, { retrieve: sinon.stub() });
    Container.set(ProductConfigurationManager, {
      getIapOfferings: sinon.stub(),
      getPurchaseWithDetailsOfferingContentByPlanIds: sinon.spy(async () => ({
        transformedPurchaseWithCommonContentForPlanId: sinon.spy(() => ({
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

    // Load key_server — jest.mock above ensures the stripe module returns our mock.
    // Clear cache to get a fresh load.
    delete require.cache[require.resolve('../../bin/key_server')];
    const createAuthServer = require('../../bin/key_server');
    server = await createAuthServer(config);

    // Set up mailbox (connects to the shared mail_helper on port 9001)
    mailbox = createMailbox(
      config.smtp.api.host || 'localhost',
      config.smtp.api.port || 9001
    );
  }, 120000);

  afterAll(async () => {
    if (server) {
      await server.close();
    }
    if (profileServer) {
      await profileServer.close();
    }
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
