/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getRemoteAddressChain } from './getRemoteAddressChain';

describe('getRemoteAddressChain', () => {
  describe('when remoteAddressChainOverride is disabled', () => {
    const remoteAddressChainOverride = '';

    it('builds remote address chain from x-forwarded-for', () => {
      const xForwardedFor = '10.0.0.1,10.0.1.1';
      const remoteAddress = '10.5.0.1';
      const mockRequest = {
        headers: {
          'x-forwarded-for': xForwardedFor,
        },
        info: {
          remoteAddress,
        },
      } as any;

      const result = getRemoteAddressChain(
        mockRequest,
        remoteAddressChainOverride
      );

      expect(result.join(',')).toBe(`${xForwardedFor},${remoteAddress}`);
    });

    it('filters invalid IP addresses', () => {
      const xForwardedFor = 'asdf,asdf';
      const remoteAddress = '10.5.0.1';
      const mockRequest = {
        headers: {
          'x-forwarded-for': xForwardedFor,
        },
        info: {
          remoteAddress,
        },
      } as any;

      const result = getRemoteAddressChain(
        mockRequest,
        remoteAddressChainOverride
      );

      expect(result.join(',')).toBe(remoteAddress);
    });
  });

  describe('when remoteAddressChainOverride is enabled', () => {
    const remoteAddressChainOverride = '192.168.1.1,192.168.2.1';

    it('returns remoteAddressChainOverride', () => {
      const xForwardedFor = '10.0.0.1,10.0.1.1';
      const remoteAddress = '10.5.0.1';
      const mockRequest = {
        headers: {
          'x-forwarded-for': xForwardedFor,
        },
        info: {
          remoteAddress,
        },
      } as any;

      const result = getRemoteAddressChain(
        mockRequest,
        remoteAddressChainOverride
      );

      expect(result.join(',')).toBe(remoteAddressChainOverride);
    });
  });
});
