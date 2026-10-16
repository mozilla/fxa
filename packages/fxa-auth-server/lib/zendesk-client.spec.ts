/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import nock from 'nock';
import { createZendeskClient } from './zendesk-client';

const SUBDOMAIN = 'test';
const BASE_URL = `https://${SUBDOMAIN}.zendesk.com`;
const USER_ID = '123';
const IDENTITY_ID = '456';
const USERNAME = 'agent@example.com';
const API_TOKEN = 'api-token';
const OAUTH_TOKEN = 'oauth-token';

const BEARER = `Bearer ${OAUTH_TOKEN}`;
const BASIC = `Basic ${Buffer.from(`${USERNAME}/token:${API_TOKEN}`).toString(
  'base64'
)}`;

const buildConfig = (useOAuth: boolean) => ({
  zendesk: {
    subdomain: SUBDOMAIN,
    username: USERNAME,
    token: API_TOKEN,
    oauthToken: OAUTH_TOKEN,
    useOAuth,
  },
});

describe('createZendeskClient', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it.each([
    ['OAuth access token as a Bearer header', true, BEARER],
    ['username and API token as Basic auth', false, BASIC],
  ])('sends the %s', async (_label, useOAuth, expectedAuthorization) => {
    const scope = nock(BASE_URL)
      .matchHeader('authorization', expectedAuthorization)
      .get(`/api/v2/users/${USER_ID}.json`)
      .reply(200, { user: { id: USER_ID } });

    const client = createZendeskClient(buildConfig(useOAuth));
    await client.users.show(Number(USER_ID));

    expect(scope.isDone()).toBe(true);
  });

  it('sends the OAuth access token from updateIdentity', async () => {
    const scope = nock(BASE_URL)
      .matchHeader('authorization', BEARER)
      .put(`/api/v2/users/${USER_ID}/identities/${IDENTITY_ID}.json`)
      .reply(200, { identity: { id: IDENTITY_ID } });

    const client: any = createZendeskClient(buildConfig(true));
    await client.updateIdentity(USER_ID, IDENTITY_ID, {
      identity: { value: 'new@example.com' },
    });

    expect(scope.isDone()).toBe(true);
  });
});
