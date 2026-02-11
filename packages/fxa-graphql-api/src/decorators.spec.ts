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
      const lang = 'en-US';
      const traceId = '00b30317128040e29364590a05812bb0';
      const baggage = `sentry-environment=local,sentry-release=0.0.0,sentry-public_key=adb27d09f83f43b8852e61ce4c8a487b,sentry-trace_id=${traceId}`;

      const headers = extractRequiredHeaders({
        ip,
        headers: {
          'user-agent': agent,
          'Accept-Language': lang,
          'sentry-trace': traceId,
          baggage,
        },
      });
      expect(headers.get('user-agent')).toEqual(agent);
      expect(headers.get('accept-language')).toEqual(lang);
      expect(headers.get('sentry-trace')).toEqual(traceId);
      expect(headers.get('baggage')).toEqual(baggage);
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
