/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import hapi from '@hapi/hapi';
import { assert as cassert } from 'chai';
import 'mocha';
import { Logger } from 'mozlog';
import nock from 'nock';
import { SinonSpy } from 'sinon';
import { stubInterface } from 'ts-sinon';

import {
  AccountResponse,
  DevicesResponse,
  SigninLocationResponse,
  SubscriptionResponse,
  TotpTokenResponse,
} from '../../lib/api';
import * as supportServer from '../../lib/server';

const uid = '4a0f70e0e32a435e8066d353e8577d2a';

type MockCallResponse<T> = {
  status: number;
  response: T;
};

type MockCallsResponse = {
  account: MockCallResponse<AccountResponse>;
  devices: MockCallResponse<DevicesResponse>;
  signinLocations: MockCallResponse<SigninLocationResponse>;
  subscriptions: MockCallResponse<SubscriptionResponse>;
  totp: MockCallResponse<TotpTokenResponse>;
};

const now = new Date().getTime();
const accountResponse = {
  createdAt: now,
  email: 'test+quux@example.com',
  emailVerified: true,
  locale: 'en-us',
};

function createDefaults(): MockCallsResponse {
  return {
    account: {
      response: accountResponse,
      status: 200,
    },
    devices: {
      response: [],
      status: 200,
    },
    signinLocations: {
      response: [
        {
          city: 'Heapolandia',
          country: 'United Devices of von Neumann',
          countryCode: 'UVN',
          lastAccessTime: 1578414423827,
          state: 'Memory Palace',
          stateCode: 'MP',
        },
        {
          city: 'Boring',
          country: 'United States',
          countryCode: 'US',
          lastAccessTime: 1578498222026,
          state: 'Oregon',
          stateCode: 'OR',
        },
      ],
      status: 200,
    },
    subscriptions: {
      response: [
        {
          created: 1555354567,
          current_period_end: 1579716673,
          current_period_start: 1579630273,
          plan_id: 'plan_123',
          product_id: 'prod_123',
          product_name: 'Example Product',
          latest_invoice: '628031D-0002',
          status: 'active',
          subscription_id: 'sub_GZ7WKEJp1YGZ86',
        },
      ],
      status: 200,
    },
    totp: {
      response: {
        enabled: true,
        epoch: now,
        sharedSecret: '',
        verified: true,
      },
      status: 200,
    },
  };
}

describe('Support Controller', () => {
  let logger: Logger;
  let server: hapi.Server;

  const authServerConfig = {
    secretBearerToken: '',
    signinLocationsSearchPath: '/v1/account/sessions/locations',
    subscriptionsSearchPath: '/v1/oauth/subscriptions/search',
    url: 'http://localhost:9000',
  };

  const mockCalls = (obj: MockCallsResponse) => {
    nock('http://authdb.firefox.com')
      .get(`/account/${uid}`)
      .reply(obj.account.status, obj.account.response);
    nock('http://authdb.firefox.com')
      .get(`/account/${uid}/devices`)
      .reply(obj.devices.status, obj.devices.response);
    nock('http://authdb.firefox.com')
      .get(`/account/${uid}/subscriptions`)
      .reply(obj.subscriptions.status, obj.subscriptions.response);
    nock('http://authdb.firefox.com')
      .get(`/totp/${uid}`)
      .reply(obj.totp.status, obj.totp.response);
    nock(authServerConfig.url)
      .get(authServerConfig.subscriptionsSearchPath)
      .query(
        queryParams =>
          queryParams.uid === uid && queryParams.email === accountResponse.email
      )
      .reply(obj.subscriptions.status, obj.subscriptions.response);
    nock(authServerConfig.url)
      .get(authServerConfig.signinLocationsSearchPath)
      .query(() => true)
      .reply(obj.signinLocations.status, obj.signinLocations.response);
  };

  beforeEach(async () => {
    logger = stubInterface<Logger>();

    server = await supportServer.init(
      {
        authHeader: 'testing',
        authServer: authServerConfig,
        authdbUrl: 'http://authdb.firefox.com',
        env: 'development',
        listen: {
          host: 'localhost',
          port: 8099,
        },
      },
      logger
    );
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
    nock.cleanAll();
  });

  it('has a heartbeat', async () => {
    const result = await server.inject({
      method: 'GET',
      url: '/__lbheartbeat__',
    });
    cassert.equal(result.statusCode, 200);
  });

  describe('query parameters validation', () => {
    beforeEach(() => {
      mockCalls(createDefaults());
    });

    const getWithUrl = (url: string): Promise<hapi.ServerInjectResponse> => {
      return server.inject({
        headers: {
          testing: 'example@example.com',
        },
        method: 'GET',
        url,
      });
    };

    const assertValidateErrorMessage = (payload: string) => {
      cassert.equal(JSON.parse(payload).message, 'Invalid request query input');
    };

    it('requires a uid', async () => {
      const result = await getWithUrl('/?');
      cassert.equal(result.statusCode, 400);
      assertValidateErrorMessage(result.payload);
    });

    it('rejects an empty uid', async () => {
      const result = await getWithUrl('/?uid');
      cassert.equal(result.statusCode, 400);
      assertValidateErrorMessage(result.payload);
    });

    it('rejects a uid with non-hex characters', async () => {
      const result = await getWithUrl('/?uid=4a0z70e0q32a435x8066d353e8577d2a');
      cassert.equal(result.statusCode, 400);
      assertValidateErrorMessage(result.payload);
    });

    it('rejects a uid that is too short', async () => {
      const result = await getWithUrl('/?uid=4a0z70e0q2a435x8066d353e8577d2a');
      cassert.equal(result.statusCode, 400);
      assertValidateErrorMessage(result.payload);
    });

    it('rejects a uid that is too long', async () => {
      const result = await getWithUrl(
        '/?uid=4a0f70e0e32a435e8066d353e8577d22a'
      );
      cassert.equal(result.statusCode, 400);
      assertValidateErrorMessage(result.payload);
    });

    it('accepts a valid uid', async () => {
      const result = await getWithUrl(`/?uid=${uid}`);
      cassert.equal(result.statusCode, 200);
    });

    it('rejects an empty requestTicket', async () => {
      const result = await getWithUrl(`/?uid=${uid}&requestTicket=`);
      cassert.equal(result.statusCode, 400);
      assertValidateErrorMessage(result.payload);
    });

    it('rejects a non-numeric requestTicket', async () => {
      const result = await getWithUrl(`/?uid=${uid}&requestTicket=123xyz`);
      cassert.equal(result.statusCode, 400);
      assertValidateErrorMessage(result.payload);
    });

    it('rejects a non-int requestTicket', async () => {
      const result = await getWithUrl(`/?uid=${uid}&requestTicket=123.99`);
      cassert.equal(result.statusCode, 400);
      assertValidateErrorMessage(result.payload);
    });

    it('accepts a valid requestTicket', async () => {
      const result = await getWithUrl(`/?uid=${uid}&requestTicket=123`);
      cassert.equal(result.statusCode, 200);
    });
  });

  it('returns the default user template', async () => {
    mockCalls(createDefaults());
    const result = await server.inject({
      headers: {
        testing: 'example@example.com',
      },
      method: 'GET',
      url: `/?uid=${uid}`,
    });
    cassert.equal(result.statusCode, 200);
    const calls = (logger.info as SinonSpy).getCalls();
    cassert.equal(calls.length, 1);
    cassert.deepEqual(calls[0].args, [
      'infoRequest',
      {
        authUser: 'example@example.com',
        requestTicket: 'ticket-unknown',
        uid: '4a0f70e0e32a435e8066d353e8577d2a',
      },
    ]);
  });

  it('renders the subscription info', async () => {
    mockCalls(createDefaults());
    const result = await server.inject({
      headers: {
        testing: 'example@example.com',
      },
      method: 'GET',
      url: `/?uid=${uid}`,
    });
    cassert.equal(result.statusCode, 200);
    const headingMatch = result.payload.match(/<h3>Subscriptions<\/h3>/g);
    const nameMatch = result.payload.match(
      /<th>Subscription:<\/th>\s*<td>Example Product<\/td>/g
    );
    cassert.isTrue(headingMatch?.length === 1 && nameMatch?.length === 1);
  });

  it('renders the created element', async () => {
    mockCalls(createDefaults());
    const result = await server.inject({
      headers: {
        testing: 'example@example.com',
      },
      method: 'GET',
      url: `/?uid=${uid}`,
    });
    cassert.equal(result.statusCode, 200);
    const createdInfo = result.payload.match(
      /<th>Created:<\/th>\s+<td>\w{3} \w{3} \d{1,2} \d{4} \d{1,2}:\d{2}:\d{2} GMT(-|\+)\d{4} \((\w\s?)+\)<\/td>/g
    );
    cassert.isTrue(createdInfo?.length === 1);
  });

  it('gracefully handles 404s/500', async () => {
    const defaults = createDefaults();
    defaults.account.status = 404;
    mockCalls(defaults);
    let result = await server.inject({
      method: 'GET',
      url: `/?uid=${uid}`,
    });
    cassert.equal(result.statusCode, 500);

    nock.cleanAll();

    defaults.account.status = 500;
    mockCalls(defaults);
    result = await server.inject({
      method: 'GET',
      url: `/?uid=${uid}`,
    });
    cassert.equal(result.statusCode, 500);
  });

  it('handles users with no totp', async () => {
    const defaults = createDefaults();
    defaults.totp.status = 404;
    mockCalls(defaults);
    const result = await server.inject({
      method: 'GET',
      url: `/?uid=${uid}`,
    });
    cassert.equal(result.statusCode, 200);
    const payloadMatch = result.payload.match(
      /2FA enabled\?<\/th>\s*<td>\s*no/g
    );
    cassert.isTrue(payloadMatch && payloadMatch.length === 1);
  });

  it('gracefully handles totp service returning 500', async () => {
    const defaults = createDefaults();
    defaults.totp.status = 500;
    mockCalls(defaults);
    const result = await server.inject({
      method: 'GET',
      url: `/?uid=${uid}`,
    });
    cassert.equal(result.statusCode, 500);
  });

  it('gracefully handles auth server subscriptions search returning 500', async () => {
    const defaults = createDefaults();
    defaults.subscriptions.status = 500;
    mockCalls(defaults);
    const result = await server.inject({
      method: 'GET',
      url: `/?uid=${uid}`,
    });
    cassert.equal(result.statusCode, 500);
  });

  describe('uses signin locations', () => {
    describe('when there are no signin locations', () => {
      it('does not display a signin location row', async () => {
        const defaults = createDefaults();
        mockCalls({
          ...defaults,
          signinLocations: { response: [], status: 200 },
        });
        const result = await server.inject({
          method: 'GET',
          url: `/?uid=${uid}`,
        });
        cassert.equal(result.statusCode, 200);
        const payloadMatch = result.payload.match(/Signin Location/);
        cassert.isNull(payloadMatch);
      });
    });

    describe('when there are signin locations', () => {
      it('displays a row per location', async () => {
        const defaults = createDefaults();
        mockCalls(defaults);
        const result = await server.inject({
          method: 'GET',
          url: `/?uid=${uid}`,
        });
        cassert.equal(result.statusCode, 200);
        const tableHeadingMatch = result.payload.match(/Signin Location/g);
        cassert.equal(tableHeadingMatch?.length, 2);
        const locationsMatch = result.payload.match(
          /Heapolandia, MP|Boring, OR/g
        );
        cassert.equal(locationsMatch?.length, 2);
      });
    });
  });
});
