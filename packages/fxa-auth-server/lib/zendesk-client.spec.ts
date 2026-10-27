/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import nock from 'nock';
import { ZendeskClientProvider } from './zendesk-client';

const SUBDOMAIN = 'test';
const BASE_URL = `https://${SUBDOMAIN}.zendesk.com`;
const TOKEN_URL = `${BASE_URL}/oauth/tokens`;
const USER_ID = '123';
const IDENTITY_ID = '456';
const USERNAME = 'agent@example.com';
const API_TOKEN = 'api-token';
const CLIENT_ID = 'fxa-auth-server';
const CLIENT_SECRET = 'client-secret';
const ACCESS_TOKEN = 'access-token-1';
const NEXT_ACCESS_TOKEN = 'access-token-2';
const OAUTH_SCOPE = 'read requests:write users:write';
const EXPIRES_IN_SECONDS = 1800;
const MOCK_NOW = 1_700_000_000_000;

const BASIC = `Basic ${Buffer.from(`${USERNAME}/token:${API_TOKEN}`).toString(
  'base64'
)}`;

const buildConfig = (useOAuth: boolean) => ({
  zendesk: {
    subdomain: SUBDOMAIN,
    username: USERNAME,
    token: API_TOKEN,
    oauthClientId: CLIENT_ID,
    oauthClientSecret: CLIENT_SECRET,
    useOAuth,
  },
});

const tokenResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const expectAuthorization = async (client: any, authorization: string) => {
  const scope = nock(BASE_URL)
    .matchHeader('authorization', authorization)
    .get(`/api/v2/users/${USER_ID}.json`)
    .reply(200, { user: { id: USER_ID } });

  await client.users.show(Number(USER_ID));

  expect(scope.isDone()).toBe(true);
};

describe('ZendeskClientProvider', () => {
  let fetchSpy: jest.SpiedFunction<typeof fetch>;
  let nowMs: number;
  const now = () => nowMs;

  beforeEach(() => {
    nowMs = MOCK_NOW;
    fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Unexpected fetch'));
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  describe('with useOAuth false', () => {
    it('does not throw when credentials are empty', () => {
      const config = buildConfig(false);
      Object.assign(config.zendesk, {
        username: '',
        token: '',
        oauthClientId: '',
        oauthClientSecret: '',
      });

      expect(() => new ZendeskClientProvider(config, now)).not.toThrow();
    });

    it('sends the username and API token as Basic auth', async () => {
      const provider = new ZendeskClientProvider(buildConfig(false), now);

      await expectAuthorization(await provider.getClient(), BASIC);
    });

    it('resolves to the same client on every call', async () => {
      const provider = new ZendeskClientProvider(buildConfig(false), now);

      expect(await provider.getClient()).toBe(await provider.getClient());
    });

    it('does not request an OAuth token', async () => {
      const provider = new ZendeskClientProvider(buildConfig(false), now);

      await provider.getClient();

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('with useOAuth true', () => {
    it.each([
      ['zendesk.subdomain', { subdomain: '' }],
      ['zendesk.oauthClientId', { oauthClientId: '' }],
      ['zendesk.oauthClientSecret', { oauthClientSecret: '' }],
      [
        'zendesk.oauthClientId, zendesk.oauthClientSecret',
        { oauthClientId: '', oauthClientSecret: '' },
      ],
    ])('throws when %s is missing', (missing, overrides) => {
      const config = buildConfig(true);
      Object.assign(config.zendesk, overrides);

      expect(() => new ZendeskClientProvider(config, now)).toThrow(
        `Zendesk OAuth is enabled but config is missing: ${missing}`
      );
    });

    it('does not require the username or API token', () => {
      const config = buildConfig(true);
      Object.assign(config.zendesk, { username: '', token: '' });

      expect(() => new ZendeskClientProvider(config, now)).not.toThrow();
    });

    const mockToken = (
      accessToken = ACCESS_TOKEN,
      expiresIn: number | null = EXPIRES_IN_SECONDS
    ) =>
      fetchSpy.mockResolvedValueOnce(
        tokenResponse({
          access_token: accessToken,
          token_type: 'bearer',
          scope: OAUTH_SCOPE,
          ...(expiresIn === null ? {} : { expires_in: expiresIn }),
        })
      );

    it('requests a client credentials token from the Zendesk OAuth endpoint', async () => {
      mockToken();
      const provider = new ZendeskClientProvider(buildConfig(true), now);

      await provider.getClient();

      expect(fetchSpy).toHaveBeenCalledWith(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          scope: OAUTH_SCOPE,
        }),
        signal: expect.any(AbortSignal),
      });
    });

    it('sends the access token as a Bearer header', async () => {
      mockToken();
      const provider = new ZendeskClientProvider(buildConfig(true), now);

      await expectAuthorization(
        await provider.getClient(),
        `Bearer ${ACCESS_TOKEN}`
      );
    });

    it('sends the access token as a Bearer header from updateIdentity', async () => {
      mockToken();
      const provider = new ZendeskClientProvider(buildConfig(true), now);
      const scope = nock(BASE_URL)
        .matchHeader('authorization', `Bearer ${ACCESS_TOKEN}`)
        .put(`/api/v2/users/${USER_ID}/identities/${IDENTITY_ID}.json`)
        .reply(200, { identity: { id: IDENTITY_ID } });

      const client: any = await provider.getClient();
      await client.updateIdentity(USER_ID, IDENTITY_ID, {
        identity: { value: 'new@example.com' },
      });

      expect(scope.isDone()).toBe(true);
    });

    it('reuses the token until five minutes before it expires', async () => {
      mockToken();
      const provider = new ZendeskClientProvider(buildConfig(true), now);
      const first = await provider.getClient();

      nowMs += (EXPIRES_IN_SECONDS - 5 * 60) * 1000 - 1;

      expect(await provider.getClient()).toBe(first);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('requests a new token five minutes before it expires', async () => {
      mockToken();
      mockToken(NEXT_ACCESS_TOKEN);
      const provider = new ZendeskClientProvider(buildConfig(true), now);
      await provider.getClient();

      nowMs += (EXPIRES_IN_SECONDS - 5 * 60) * 1000;

      await expectAuthorization(
        await provider.getClient(),
        `Bearer ${NEXT_ACCESS_TOKEN}`
      );
    });

    it('requests a new token halfway through a token shorter than ten minutes', async () => {
      mockToken(ACCESS_TOKEN, 300);
      mockToken(NEXT_ACCESS_TOKEN);
      const provider = new ZendeskClientProvider(buildConfig(true), now);
      await provider.getClient();

      nowMs += 150 * 1000;

      await expectAuthorization(
        await provider.getClient(),
        `Bearer ${NEXT_ACCESS_TOKEN}`
      );
    });

    it('keeps a token without expires_in for the life of the process', async () => {
      mockToken(ACCESS_TOKEN, null);
      const provider = new ZendeskClientProvider(buildConfig(true), now);
      const first = await provider.getClient();

      nowMs += 365 * 24 * 60 * 60 * 1000;

      expect(await provider.getClient()).toBe(first);
    });

    it('shares one token request between concurrent calls', async () => {
      mockToken();
      const provider = new ZendeskClientProvider(buildConfig(true), now);

      const [first, second] = await Promise.all([
        provider.getClient(),
        provider.getClient(),
      ]);

      expect(first).toBe(second);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('rejects with the status code when the token request fails', async () => {
      fetchSpy.mockResolvedValueOnce(
        tokenResponse({ error: 'invalid_client' }, 401)
      );
      const provider = new ZendeskClientProvider(buildConfig(true), now);

      await expect(provider.getClient()).rejects.toThrow(
        'Zendesk OAuth token request failed with status 401'
      );
    });

    it('rejects when the token response has no access_token', async () => {
      fetchSpy.mockResolvedValueOnce(tokenResponse({ token_type: 'bearer' }));
      const provider = new ZendeskClientProvider(buildConfig(true), now);

      await expect(provider.getClient()).rejects.toThrow(
        'Zendesk OAuth token response is missing access_token'
      );
    });

    it('requests a token again after a failed request', async () => {
      fetchSpy.mockResolvedValueOnce(tokenResponse({}, 503));
      mockToken();
      const provider = new ZendeskClientProvider(buildConfig(true), now);
      await expect(provider.getClient()).rejects.toThrow(
        'Zendesk OAuth token request failed with status 503'
      );

      await expectAuthorization(
        await provider.getClient(),
        `Bearer ${ACCESS_TOKEN}`
      );
    });
  });
});
