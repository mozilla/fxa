/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  AuthenticatedMeteringClient,
  MeteringAuthGuard,
} from './metering-auth.guard';
import { MeteringConfig } from './metering.config';

const REQUEST_CLIENT_KEY = '__meteringClient';

function buildRequest(authorization?: string): {
  headers: { authorization?: string };
  [REQUEST_CLIENT_KEY]?: AuthenticatedMeteringClient;
} {
  return { headers: authorization ? { authorization } : {} };
}

async function buildGuard(
  clients: Record<string, string>
): Promise<MeteringAuthGuard> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      MeteringAuthGuard,
      {
        provide: MeteringConfig,
        useValue: { openmeterBaseUrl: 'http://example.com', clients },
      },
    ],
  }).compile();
  return moduleRef.get(MeteringAuthGuard);
}

describe('MeteringAuthGuard', () => {
  const RP_ID = 'vpn';
  const RP_SECRET = 'super-secret-token-with-enough-entropy-aaaaaaaa';

  describe('construction', () => {
    it('throws if two clients share the same secret', async () => {
      await expect(
        buildGuard({ vpn: RP_SECRET, relay: RP_SECRET })
      ).rejects.toThrow(/share the same secret/);
    });
  });

  describe('authorize', () => {
    it('rejects requests without an authorization header', async () => {
      const meteringAuthGuard = await buildGuard({ [RP_ID]: RP_SECRET });
      expect(() => meteringAuthGuard.authorize(buildRequest())).toThrow(
        UnauthorizedException
      );
    });

    it('rejects requests with non-bearer auth headers', async () => {
      const meteringAuthGuard = await buildGuard({ [RP_ID]: RP_SECRET });
      expect(() => meteringAuthGuard.authorize(buildRequest('Basic abc'))).toThrow(
        UnauthorizedException
      );
    });

    it('rejects unknown bearer tokens', async () => {
      const meteringAuthGuard = await buildGuard({ [RP_ID]: RP_SECRET });
      expect(() =>
        meteringAuthGuard.authorize(buildRequest('Bearer wrong-token'))
      ).toThrow(UnauthorizedException);
    });

    it('rejects when no clients are configured', async () => {
      const meteringAuthGuard = await buildGuard({});
      expect(() =>
        meteringAuthGuard.authorize(buildRequest(`Bearer ${RP_SECRET}`))
      ).toThrow(UnauthorizedException);
    });

    it('attaches the matched clientId to the request on success', async () => {
      const meteringAuthGuard = await buildGuard({ [RP_ID]: RP_SECRET });
      const request = buildRequest(`Bearer ${RP_SECRET}`);

      const result = meteringAuthGuard.authorize(request);

      expect(result).toBe(true);
      expect(request[REQUEST_CLIENT_KEY]).toEqual({ clientId: RP_ID });
    });

    it('matches case-insensitively on the Bearer prefix', async () => {
      const meteringAuthGuard = await buildGuard({ [RP_ID]: RP_SECRET });
      const request = buildRequest(`bearer ${RP_SECRET}`);

      meteringAuthGuard.authorize(request);

      expect(request[REQUEST_CLIENT_KEY]).toEqual({ clientId: RP_ID });
    });
  });
});
