/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import hapi from '@hapi/hapi';
import { assert as cassert } from 'chai';
import { FxaRedisClient } from 'fxa-shared/redis';
import 'mocha';
import { Logger } from 'mozlog';
import nock from 'nock';
import { SinonSpy, SinonStub } from 'sinon';
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
      response: [],
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
  let redis: FxaRedisClient;
  let server: hapi.Server;

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
  };

  beforeEach(async () => {
    logger = stubInterface<Logger>();
    redis = stubInterface<FxaRedisClient>();

    server = await supportServer.init(
      {
        authHeader: 'testing',
        authdbUrl: 'http://authdb.firefox.com',
        env: 'development',
        listen: {
          host: 'localhost',
          port: 8099,
        },
        redis: {
          host: '127.0.0.1',
          port: 6379,
          sessionTokens: {
            enabled: false,
            maxConnections: 1,
            minConnections: 1,
            prefix: 'tests',
          },
        },
      },
      logger,
      redis
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

  describe('uses signin locations', () => {
    describe('when there are no signin locations', () => {
      it('does not display a signin location row', async () => {
        (redis.get as SinonStub).resolves(JSON.stringify({}));
        const defaults = createDefaults();
        mockCalls(defaults);
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
        (redis.get as SinonStub).resolves(
          JSON.stringify({
            quux: {
              lastAccessTime: 1578414423827,
              location: {
                city: 'Heapolandia',
                country: 'United Devices of von Neumann',
                countryCode: 'UVN',
                state: 'Memory Palace',
                stateCode: 'MP',
              },
            },
            quuz: {
              lastAccessTime: 1578498222026,
              location: {
                city: 'Boring',
                country: 'United States',
                countryCode: 'US',
                state: 'Oregon',
                stateCode: 'OR',
              },
            },
            wibble: { no: 'location' },
          })
        );

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
