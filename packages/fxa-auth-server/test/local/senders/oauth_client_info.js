/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const ClientInfo = proxyquire('../../../lib/senders/oauth_client_info', {
  '../oauth/client': {
    getClientById: async function (id) {
      switch (id) {
        case '24bdbfa45cd300c5':
          return { name: 'FxA OAuth Console' };
        case '0000000000000000':
          throw new Error();
        default:
          return { name: 'Firefox' };
      }
    },
  },
});

describe('lib/senders/oauth_client_info:', () => {
  describe('fetch:', () => {
    let clientInfo;
    let fetch;
    let mockLog;
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
      clientInfo = ClientInfo(mockLog, mockConfig);
      fetch = clientInfo.fetch;
    });

    afterEach(() => {
      return clientInfo.__clientCache.clear();
    });

    it('returns Mozilla if no service', () => {
      return fetch().then((res) => {
        assert.equal(res.name, 'Mozilla');
      });
    });

    it('returns Firefox if service=sync', () => {
      return fetch('sync').then((res) => {
        assert.equal(res.name, 'Firefox');
      });
    });

    it('returns Firefox if service=relay', () => {
      return fetch('relay').then((res) => {
        assert.equal(res.name, 'Firefox');
      });
    });

    it('falls back to Mozilla if error', () => {
      return fetch('0000000000000000').then((res) => {
        assert.equal(res.name, 'Mozilla');
        assert.ok(mockLog.fatal.calledOnce, 'called fatal log');
      });
    });

    it('fetches and memory caches client information', () => {
      return fetch('24bdbfa45cd300c5')
        .then((res) => {
          assert.equal(res.name, 'FxA OAuth Console');
          assert.equal(mockLog.trace.getCall(0).args[0], 'fetch.start');
          assert.equal(mockLog.trace.getCall(1).args[0], 'fetch.usedServer');
          assert.equal(mockLog.trace.getCall(2), null);

          // second call is cached
          return fetch('24bdbfa45cd300c5');
        })
        .then((res) => {
          assert.equal(mockLog.trace.getCall(2).args[0], 'fetch.start');
          assert.equal(mockLog.trace.getCall(3).args[0], 'fetch.usedCache');
          assert.deepEqual(res.name, 'FxA OAuth Console');
        });
    });
  });
});
