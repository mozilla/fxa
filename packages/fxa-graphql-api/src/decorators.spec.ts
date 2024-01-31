/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { extractRequiredHeaders } from './decorators';

describe('gql decorators', () => {
  describe('header extraction for auth server', () => {
    const ip = '127.0.0.1';
    const agent = 'Mozilla/5.0';

    it('forwards ip', () => {
      const headers = extractRequiredHeaders({ ip, headers: {} });
      expect(headers.get('x-forwarded-for')).toEqual('127.0.0.1');
    });

    it('respects previous x-forwarded-for header', () => {
      const headers = extractRequiredHeaders({
        ip,
        headers: {
          'x-forwarded-for': '127.0.0.11',
        },
      });
      expect(headers.get('x-forwarded-for')).toEqual('127.0.0.11');
    });

    it('forwards relevant headers', () => {
      const headers = extractRequiredHeaders({
        ip,
        headers: { 'user-agent': agent },
      });
      expect(headers.get('user-agent')).toEqual(agent);
    });

    it('does not forward irrelevant headers', () => {
      const headers = extractRequiredHeaders({
        ip,
        headers: { Accept: '*/*' },
      });
      expect(headers.get('Accept')).toBeNull();
    });
  });
});
