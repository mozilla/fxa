/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LoginTicket, OAuth2Client, type TokenPayload } from 'google-auth-library';

import { CloudTasksOidcConfig } from '@fxa/shared/cloud-tasks';

import {
  MeteringCloudTasksConfig,
  MeteringConfig,
} from './metering.config';
import { MeteringCloudTaskGuard } from './metering-cloudtask.guard';

describe('MeteringCloudTaskGuard', () => {
  const AUD = 'https://payments-api.example/v1/metering/internal/threshold-check';
  const RUNNER = 'metering-task-runner@example.iam.gserviceaccount.com';

  function makeConfig(
    overrides: Partial<CloudTasksOidcConfig> = {}
  ): MeteringConfig {
    const cloudTasks = new MeteringCloudTasksConfig();
    Object.assign(cloudTasks.oidc, {
      aud: AUD,
      serviceAccountEmail: RUNNER,
      ...overrides,
    });
    return {
      openmeterBaseUrl: 'http://example.com',
      clients: {},
      cloudTasks,
    };
  }

  async function build(
    meteringConfig: MeteringConfig = makeConfig()
  ): Promise<MeteringCloudTaskGuard> {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringCloudTaskGuard,
        { provide: MeteringConfig, useValue: meteringConfig },
      ],
    }).compile();
    return moduleRef.get(MeteringCloudTaskGuard);
  }

  describe('construction', () => {
    it('throws when oidc.aud is missing', async () => {
      await expect(build(makeConfig({ aud: '' }))).rejects.toThrow(
        /oidc.aud and serviceAccountEmail are required/
      );
    });

    it('throws when oidc.serviceAccountEmail is missing', async () => {
      await expect(
        build(makeConfig({ serviceAccountEmail: '' }))
      ).rejects.toThrow(/oidc.aud and serviceAccountEmail are required/);
    });
  });

  describe('authorize', () => {
    let verifyIdTokenSpy: jest.SpyInstance;

    afterEach(() => {
      verifyIdTokenSpy?.mockRestore();
    });

    function withAuth(authorization?: string) {
      return { headers: { authorization } };
    }

    function payload(email: string | undefined): TokenPayload {
      return {
        iss: 'https://accounts.google.com',
        aud: AUD,
        sub: '1234567890',
        iat: 1_700_000_000,
        exp: 1_700_003_600,
        email,
      };
    }

    function mockVerify(
      result:
        | { ok: true; email: string | undefined }
        | { ok: false; throws?: Error }
    ): void {
      verifyIdTokenSpy = jest
        .spyOn(OAuth2Client.prototype, 'verifyIdToken')
        .mockImplementation(async () => {
          if (!result.ok) {
            throw result.throws ?? new Error('invalid token');
          }
          const ticket = new LoginTicket();
          ticket.getPayload = () => payload(result.email);
          return ticket;
        });
    }

    it('rejects requests without a bearer header', async () => {
      const meteringCloudTaskGuard = await build();
      await expect(meteringCloudTaskGuard.authorize(withAuth())).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('rejects malformed authorization headers', async () => {
      const meteringCloudTaskGuard = await build();
      await expect(meteringCloudTaskGuard.authorize(withAuth('Token abc'))).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('rejects invalid id tokens', async () => {
      const meteringCloudTaskGuard = await build();
      mockVerify({ ok: false, throws: new Error('bad signature') });
      await expect(
        meteringCloudTaskGuard.authorize(withAuth('Bearer not-a-real-token'))
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects tokens whose email does not match the runner SA', async () => {
      const meteringCloudTaskGuard = await build();
      mockVerify({ ok: true, email: 'someone-else@example.com' });
      await expect(
        meteringCloudTaskGuard.authorize(withAuth('Bearer good-shape-token'))
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects tokens that carry no email claim', async () => {
      const meteringCloudTaskGuard = await build();
      mockVerify({ ok: true, email: undefined });
      await expect(
        meteringCloudTaskGuard.authorize(withAuth('Bearer no-email-token'))
      ).rejects.toThrow(UnauthorizedException);
    });

    it('accepts tokens issued by the configured runner SA', async () => {
      const meteringCloudTaskGuard = await build();
      mockVerify({ ok: true, email: RUNNER });
      await expect(
        meteringCloudTaskGuard.authorize(withAuth('Bearer good-token'))
      ).resolves.toBeUndefined();
    });

    it('matches case-insensitive bearer prefix', async () => {
      const meteringCloudTaskGuard = await build();
      mockVerify({ ok: true, email: RUNNER });
      await expect(
        meteringCloudTaskGuard.authorize(withAuth('bearer lowercase-token'))
      ).resolves.toBeUndefined();
    });
  });
});
