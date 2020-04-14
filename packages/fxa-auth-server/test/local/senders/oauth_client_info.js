/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const { assert } = require('chai');
const sinon = require('sinon');
const P = require('../../../lib/promise');

const FIREFOX_CLIENT = {
  name: 'Firefox',
};
const OAUTH_CLIENT = {
  name: 'FxA OAuth Console',
};

describe('lib/senders/oauth_client_info:', () => {
  describe('fetch:', () => {
    let clientInfo;
    let fetch;
    let mockLog;
    let mockOAuthDB;
    const mockConfig = {
      oauth: {
        url: 'http://localhost:9000',
        clientInfoCacheTTL: 5,
      },
    };

    beforeEach(() => {
      mockLog = {
        fatal: sinon.spy(),
        trace: sinon.spy(),
        warn: sinon.spy(),
      };
      mockOAuthDB = {};
      clientInfo = require(`${ROOT_DIR}/lib/senders/oauth_client_info`)(
        mockLog,
        mockConfig,
        mockOAuthDB
      );
      fetch = clientInfo.fetch;
    });

    afterEach(() => {
      return clientInfo.__clientCache.clear();
    });

    it('returns Firefox if no client id', () => {
      return fetch().then(res => {
        assert.deepEqual(res, FIREFOX_CLIENT);
      });
    });

    it('returns Firefox if service=sync', () => {
      return fetch('sync').then(res => {
        assert.deepEqual(res, FIREFOX_CLIENT);
      });
    });

    it('falls back to Firefox if error', () => {
      mockOAuthDB.getClientInfo = sinon.spy(async () => {
        throw new Error('Request failed');
      });
      return fetch('24bdbfa45cd300c5').then(res => {
        assert.deepEqual(res, FIREFOX_CLIENT);
        assert.ok(mockLog.fatal.calledOnce, 'called fatal log');
      });
    });

    it('falls back to Firefox if non-200 response', () => {
      mockOAuthDB.getClientInfo = sinon.spy(async () => {
        throw Object.assign(new Error(), {
          statusCode: 400,
          code: 400,
          errno: 109,
        });
      });
      return fetch('f00bdbfa45cd300c5').then(res => {
        assert.deepEqual(res, FIREFOX_CLIENT);
        assert.ok(mockLog.warn.calledOnce, 'called warn log');
      });
    });

    it('fetches and memory caches client information', () => {
      mockOAuthDB.getClientInfo = sinon.spy(async clientId => {
        assert.equal(clientId, '24bdbfa45cd300c5');
        return OAUTH_CLIENT;
      });
      return fetch('24bdbfa45cd300c5')
        .then(res => {
          assert.deepEqual(res, OAUTH_CLIENT);
          assert.equal(mockLog.trace.getCall(0).args[0], 'fetch.start');
          assert.equal(mockLog.trace.getCall(1).args[0], 'fetch.usedServer');
          assert.equal(mockLog.trace.getCall(2), null);
          assert.ok(mockOAuthDB.getClientInfo.calledOnce);

          // second call is cached
          return fetch('24bdbfa45cd300c5');
        })
        .then(res => {
          assert.equal(mockLog.trace.getCall(2).args[0], 'fetch.start');
          assert.equal(mockLog.trace.getCall(3).args[0], 'fetch.usedCache');
          assert.ok(mockOAuthDB.getClientInfo.calledOnce);
          assert.deepEqual(res, OAUTH_CLIENT);
        });
    });

    it('memory cache expires', () => {
      mockOAuthDB.getClientInfo = sinon.spy(async clientId => {
        return OAUTH_CLIENT;
      });
      return P.delay(15, fetch('24bdbfa45cd300c5'))
        .then(res => {
          assert.deepEqual(res, OAUTH_CLIENT);
          assert.equal(mockLog.trace.getCall(1).args[0], 'fetch.usedServer');
          assert.ok(mockOAuthDB.getClientInfo.calledOnce);

          // second call uses server, cache expired
          return fetch('24bdbfa45cd300c5');
        })
        .then(res => {
          assert.equal(mockLog.trace.getCall(3).args[0], 'fetch.usedServer');
          assert.ok(mockOAuthDB.getClientInfo.calledTwice);
          assert.deepEqual(res, OAUTH_CLIENT);
        });
    });
  });
});
