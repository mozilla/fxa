/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import zendesk from 'node-zendesk';

const OAUTH_SCOPE = 'read requests:write users:write';
const OAUTH_TOKEN_REQUEST_TIMEOUT_MS = 10_000;
const OAUTH_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const OAUTH_REQUIRED_CONFIG = [
  'subdomain',
  'oauthClientId',
  'oauthClientSecret',
] as const;

const buildClient = (
  config: Record<string, any>,
  token: string,
  oauth: boolean
): zendesk.Client => {
  const zendeskClient = zendesk.createClient({
    username: config.zendesk.username,
    token,
    oauth,
    remoteUri: `https://${config.zendesk.subdomain}.zendesk.com/api/v2`,
    disableGlobalState: true,
  });

  (zendeskClient as any).updateIdentity = (
    userId: string,
    userIdentityID: string,
    payload: Record<string, any>
  ) =>
    new Promise((resolve, reject) =>
      // A very ugly call in to get the actual Zendesk API call because the
      // update call used in this library hardcodes a payload rather than
      // accepting one.
      (zendeskClient.useridentities as any).__proto__.request.call(
        zendeskClient.useridentities,
        'PUT',
        ['users', userId, 'identities', userIdentityID],
        payload,
        (err: any, req: any, result: any) =>
          err ? reject(err) : resolve({ req, result })
      )
    );

  return zendeskClient;
};

export class ZendeskClientProvider {
  private readonly basicClient?: zendesk.Client;
  private oauthClient?: { client: zendesk.Client; refreshAt: number };
  private pendingOAuthClient?: Promise<zendesk.Client>;

  constructor(
    private readonly config: Record<string, any>,
    private readonly now: () => number = Date.now
  ) {
    if (!config.zendesk.useOAuth) {
      this.basicClient = buildClient(config, config.zendesk.token, false);
      return;
    }

    const missing = OAUTH_REQUIRED_CONFIG.filter((key) => !config.zendesk[key]);
    if (missing.length) {
      throw new Error(
        `Zendesk OAuth is enabled but config is missing: ${missing
          .map((key) => `zendesk.${key}`)
          .join(', ')}`
      );
    }
  }

  async getClient(): Promise<zendesk.Client> {
    if (this.basicClient) {
      return this.basicClient;
    }
    if (this.oauthClient && this.now() < this.oauthClient.refreshAt) {
      return this.oauthClient.client;
    }
    if (!this.pendingOAuthClient) {
      this.pendingOAuthClient = this.createOAuthClient().finally(() => {
        this.pendingOAuthClient = undefined;
      });
    }
    return this.pendingOAuthClient;
  }

  private async createOAuthClient(): Promise<zendesk.Client> {
    const { subdomain, oauthClientId, oauthClientSecret } = this.config.zendesk;
    const response = await fetch(
      `https://${subdomain}.zendesk.com/oauth/tokens`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: oauthClientId,
          client_secret: oauthClientSecret,
          scope: OAUTH_SCOPE,
        }),
        signal: AbortSignal.timeout(OAUTH_TOKEN_REQUEST_TIMEOUT_MS),
      }
    );
    if (!response.ok) {
      throw new Error(
        `Zendesk OAuth token request failed with status ${response.status}`
      );
    }

    const { access_token, expires_in } = await response.json();
    if (typeof access_token !== 'string' || !access_token) {
      throw new Error('Zendesk OAuth token response is missing access_token');
    }

    const client = buildClient(this.config, access_token, true);
    let refreshAt = Infinity;
    if (typeof expires_in === 'number') {
      const lifetimeMs = expires_in * 1000;
      refreshAt =
        this.now() +
        lifetimeMs -
        Math.min(OAUTH_REFRESH_MARGIN_MS, lifetimeMs / 2);
    }
    this.oauthClient = { client, refreshAt };
    return client;
  }
}
