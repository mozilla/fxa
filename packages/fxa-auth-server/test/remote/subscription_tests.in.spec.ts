/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client = require('../client')();

interface OAuthClient {
  id: string;
  trusted: boolean;
  canGrant: boolean;
  publicClient: boolean;
}

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      subscriptions: {
        enabled: false,
        productConfigsFirestore: { enabled: true },
      },
    },
  });
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

// Determine a valid client ID from config for OAuth token grants
const configPath = require.resolve('../../config');
delete require.cache[configPath];
const localConfig = require('../../config').default.getProperties();
const validClients: OAuthClient[] = localConfig.oauthServer.clients.filter(
  (c: OAuthClient) => c.trusted && c.canGrant && c.publicClient
);
const CLIENT_ID = validClients.pop()!.id;

describe.each(testVersions)(
  '#integration$tag - remote subscriptions (disabled)',
  ({ version, tag }) => {
    const testOptions = { version };
    let client;
    let refreshToken: string;

    beforeEach(async () => {
      client = await Client.createAndVerify(
        server.publicUrl,
        server.uniqueEmail(),
        'wibble',
        server.mailbox,
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

// The "subscriptions enabled with Stripe" section from the original Mocha test
// uses heavy in-process mocking (StripeHelper, CapabilityManager, PlaySubscriptions,
// etc.) via Container.set() and authServerMockDependencies (proxyquire). Since
// createTestServer() spawns the auth server as a child process, these in-process
// mocks won't cross process boundaries. Migrating this section requires either:
// 1. Mock HTTP infrastructure (e.g., nock or a mock Stripe server)
// 2. In-process server support in the Jest test harness
describe.skip('subscriptions enabled with Stripe (not yet migrated)', () => {
  it('placeholder - see subscription_tests.js for original tests', () => {
    // Original tests cover:
    // - getSubscriptionClients with shared secret
    // - getSubscriptionClients with invalid shared secret
    // - accountProfile with no subscriptions (session token, default client, client with capabilities)
    // - getActiveSubscriptions with no subscriptions
    // - accountProfile with subscriptions (session token, default client, client with capabilities)
    // - getActiveSubscriptions with subscriptions
  });
});
