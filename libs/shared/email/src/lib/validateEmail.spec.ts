/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as dns from 'dns';
import { tryResolveIpv4, tryResolveMx } from './validateEmail';

const dnsError = (code: string) => Object.assign(new Error(code), { code });

describe.each([
  {
    name: 'tryResolveMx',
    method: 'resolveMx' as const,
    tryResolve: tryResolveMx,
    records: [{ exchange: 'mx.example.com', priority: 10 }],
  },
  {
    name: 'tryResolveIpv4',
    method: 'resolve4' as const,
    tryResolve: tryResolveIpv4,
    records: ['192.0.2.1'],
  },
])('$name', ({ method, tryResolve, records }) => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(dns.promises.Resolver.prototype, method);
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('returns the record count when records are found', async () => {
    spy.mockResolvedValue(records);

    expect(await tryResolve('example.com')).toBe(records.length);
    expect(spy).toHaveBeenCalledWith('example.com');
  });

  it.each([dns.NOTFOUND, dns.NODATA])('returns false for %s', async (code) => {
    spy.mockRejectedValue(dnsError(code));

    expect(await tryResolve('example.com')).toBe(false);
  });

  it('rethrows other errors', async () => {
    spy.mockRejectedValue(dnsError(dns.SERVFAIL));

    await expect(tryResolve('example.com')).rejects.toMatchObject({
      code: dns.SERVFAIL,
    });
  });
});
