/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

jest.mock('../oauth/client', () => ({
  getClientById: async (id: string) => {
    switch (id) {
      case '24bdbfa45cd300c5':
        return { name: 'FxA OAuth Console' };
      case '0000000000000000':
        throw new Error();
      default:
        return { name: 'Firefox' };
    }
  },
}));

const ClientInfo = require('./oauth_client_info');

describe('lib/senders/oauth_client_info:', () => {
  describe('fetch:', () => {
    let clientInfo: any;
    let fetch: any;
    let mockLog: any;
    const mockConfig = {
      oauth: {
        url: 'http://localhost:9000',
        clientInfoCacheTTL: 5000,
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

    it('returns Mozilla if no service', async () => {
      const res = await fetch();
      expect(res.name).toBe('Mozilla');
    });

    it('returns Firefox if service=sync', async () => {
      const res = await fetch('sync');
      expect(res.name).toBe('Firefox');
    });

    it('returns Firefox if service=relay', async () => {
      const res = await fetch('relay');
      expect(res.name).toBe('Firefox');
    });

    it('falls back to Mozilla if error', async () => {
      const res = await fetch('0000000000000000');
      expect(res.name).toBe('Mozilla');
      expect(mockLog.fatal.calledOnce).toBe(true);
    });

    it('fetches and memory caches client information', async () => {
      const res = await fetch('24bdbfa45cd300c5');
      expect(res.name).toBe('FxA OAuth Console');
      expect(mockLog.trace.getCall(0).args[0]).toBe('fetch.start');
      expect(mockLog.trace.getCall(1).args[0]).toBe('fetch.usedServer');
      expect(mockLog.trace.getCall(2)).toBeNull();

      // second call is cached
      const res2 = await fetch('24bdbfa45cd300c5');
      expect(mockLog.trace.getCall(2).args[0]).toBe('fetch.start');
      expect(mockLog.trace.getCall(3).args[0]).toBe('fetch.usedCache');
      expect(res2.name).toBe('FxA OAuth Console');
    });
  });
});
