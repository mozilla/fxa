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
  subscriptions: MockCallResponse<SubscriptionResponse>;
  totp: MockCallResponse<TotpTokenResponse>;
};

function createDefaults(): MockCallsResponse {
  const now = new Date().getTime();
  return {
    account: {
      response: {
        createdAt: now,
        email: 'test@example.com',
        emailVerified: true,
        locale: 'en-us',
      },
      status: 200,
    },
    devices: {
      response: [],
      status: 200,
    },
    subscriptions: {
      response: [
        {
          current_period_end: 1579716673,
          current_period_start: 1579630273,
          plan_name: 'Learn to Code (Monthly)',
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
      .query(() => true)
      .reply(obj.subscriptions.status, obj.subscriptions.response);
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
      /<th>Subscription:<\/th>\s*<td>Learn to Code \(Monthly\)<\/td>/g
    );
    cassert.isTrue(headingMatch?.length === 1 && nameMatch?.length === 1);
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
});
