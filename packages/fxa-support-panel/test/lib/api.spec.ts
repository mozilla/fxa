/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as hapi from '@hapi/hapi';
import { assert as cassert } from 'chai';
import 'mocha';
import { Logger } from 'mozlog';
import * as nock from 'nock';
import { assert, SinonSpy } from 'sinon';
import * as sinon from 'sinon';
import { stubInterface } from 'ts-sinon';

import Config from '../../config';
import {
  AccountResponse,
  DevicesResponse,
  SubscriptionResponse,
  TotpTokenResponse
} from '../../lib/api';
import * as supportServer from '../../lib/server';

const uid = 'asdf12345';

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
        locale: 'en-us'
      },
      status: 200
    },
    devices: {
      response: [],
      status: 200
    },
    subscriptions: {
      response: [],
      status: 200
    },
    totp: {
      response: {
        enabled: true,
        epoch: now,
        sharedSecret: '',
        verified: true
      },
      status: 200
    }
  };
}

describe('Support Controller', () => {
  let logger: Logger;
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

    server = await supportServer.init(
      {
        authHeader: 'testing',
        authdbUrl: 'http://authdb.firefox.com',
        env: 'development',
        listen: {
          host: 'localhost',
          port: 8099
        }
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
      url: '/__lbheartbeat__'
    });
    cassert.equal(result.statusCode, 200);
  });

  it('returns the default user template', async () => {
    mockCalls(createDefaults());
    const result = await server.inject({
      headers: {
        testing: 'example@example.com'
      },
      method: 'GET',
      url: `/?uid=${uid}`
    });
    cassert.equal(result.statusCode, 200);
    const calls = (logger.info as SinonSpy).getCalls();
    cassert.equal(calls.length, 1);
    cassert.deepEqual(calls[0].args, [
      'infoRequest',
      { authUser: 'example@example.com', requestTicket: 'ticket-unknown', uid: 'asdf12345' }
    ]);
  });

  it('gracefully handles 404s/500', async () => {
    const defaults = createDefaults();
    defaults.account.status = 404;
    mockCalls(defaults);
    let result = await server.inject({
      method: 'GET',
      url: `/?uid=${uid}`
    });
    cassert.equal(result.statusCode, 500);

    nock.cleanAll();

    defaults.account.status = 500;
    mockCalls(defaults);
    result = await server.inject({
      method: 'GET',
      url: `/?uid=${uid}`
    });
    cassert.equal(result.statusCode, 500);
  });

  it('handles users with no totp', async () => {
    const defaults = createDefaults();
    defaults.totp.status = 404;
    mockCalls(defaults);
    const result = await server.inject({
      method: 'GET',
      url: `/?uid=${uid}`
    });
    cassert.equal(result.statusCode, 200);
    const payloadMatch = result.payload.match(/2FA enabled\?<\/th>\s*<td>\s*no/g);
    cassert.isTrue(payloadMatch && payloadMatch.length === 1);
  });

  it('gracefully handles totp service returning 500', async () => {
    const defaults = createDefaults();
    defaults.totp.status = 500;
    mockCalls(defaults);
    const result = await server.inject({
      method: 'GET',
      url: `/?uid=${uid}`
    });
    cassert.equal(result.statusCode, 500);
  });
});
