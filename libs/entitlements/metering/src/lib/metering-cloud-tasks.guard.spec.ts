/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  LoginTicket,
  OAuth2Client,
  type TokenPayload,
} from 'google-auth-library';

import { MeteringCloudTasksConfig, MeteringConfig } from './metering.config';
import { MeteringCloudTasksGuard } from './metering-cloud-tasks.guard';

describe('MeteringCloudTasksGuard', () => {
  const AUD =
    'https://payments-api.example/v1/metering/internal/threshold-check';
  const RUNNER = 'metering-task-runner@example.iam.gserviceaccount.com';

  function makeConfig(
    overrides: {
      aud?: string;
      serviceAccountEmail?: string;
      useLocalEmulator?: boolean;
    } = {}
  ): MeteringConfig {
    const cloudTasks = new MeteringCloudTasksConfig();
    Object.assign(cloudTasks, {
      useLocalEmulator: overrides.useLocalEmulator ?? false,
    });
    Object.assign(cloudTasks.oidc, {
      aud: overrides.aud ?? AUD,
      serviceAccountEmail: overrides.serviceAccountEmail ?? RUNNER,
    });
    return {
      openmeterBaseUrl: 'http://example.com',
      clients: {},
      cloudTasks,
    };
  }

  async function build(
    meteringConfig: MeteringConfig = makeConfig()
  ): Promise<MeteringCloudTasksGuard> {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringCloudTasksGuard,
        { provide: MeteringConfig, useValue: meteringConfig },
      ],
    }).compile();
    return moduleRef.get(MeteringCloudTasksGuard);
  }

  function unusedContext(): ExecutionContext {
    const fail = (): never => {
      throw new Error('ExecutionContext should not be read in emulator mode');
    };
    return {
      switchToHttp: fail,
      switchToRpc: fail,
      switchToWs: fail,
      getArgs: fail,
      getArgByIndex: fail,
      getType: fail,
      getClass: fail,
      getHandler: fail,
    };
  }

  describe('construction', () => {
    it('throws when oidc.aud is missing and not using the emulator', async () => {
      await expect(build(makeConfig({ aud: '' }))).rejects.toThrow(
        /oidc.aud and serviceAccountEmail are required/
      );
    });

    it('throws when oidc.serviceAccountEmail is missing and not using the emulator', async () => {
      await expect(
        build(makeConfig({ serviceAccountEmail: '' }))
      ).rejects.toThrow(/oidc.aud and serviceAccountEmail are required/);
    });

    it('does not require oidc when using the local emulator', async () => {
      await expect(
        build(
          makeConfig({
            aud: '',
            serviceAccountEmail: '',
            useLocalEmulator: true,
          })
        )
      ).resolves.toBeInstanceOf(MeteringCloudTasksGuard);
    });
  });

  describe('canActivate', () => {
    it('bypasses verification when using the local emulator', async () => {
      const guard = await build(
        makeConfig({ aud: '', serviceAccountEmail: '', useLocalEmulator: true })
      );
      const verifyIdTokenSpy = jest.spyOn(
        OAuth2Client.prototype,
        'verifyIdToken'
      );

      await expect(guard.canActivate(unusedContext())).resolves.toBe(true);
      expect(verifyIdTokenSpy).not.toHaveBeenCalled();

      verifyIdTokenSpy.mockRestore();
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
      const guard = await build();
      await expect(guard.authorize(withAuth())).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('rejects malformed authorization headers', async () => {
      const guard = await build();
      await expect(guard.authorize(withAuth('Token abc'))).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('rejects invalid id tokens', async () => {
      const guard = await build();
      mockVerify({ ok: false, throws: new Error('bad signature') });
      await expect(
        guard.authorize(withAuth('Bearer not-a-real-token'))
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects tokens whose email does not match the runner SA', async () => {
      const guard = await build();
      mockVerify({ ok: true, email: 'someone-else@example.com' });
      await expect(
        guard.authorize(withAuth('Bearer good-shape-token'))
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects tokens that carry no email claim', async () => {
      const guard = await build();
      mockVerify({ ok: true, email: undefined });
      await expect(
        guard.authorize(withAuth('Bearer no-email-token'))
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects tokens whose verified payload is empty', async () => {
      const guard = await build();
      verifyIdTokenSpy = jest
        .spyOn(OAuth2Client.prototype, 'verifyIdToken')
        .mockImplementation(async () => {
          const ticket = new LoginTicket();
          ticket.getPayload = () => undefined;
          return ticket;
        });
      await expect(
        guard.authorize(withAuth('Bearer empty-payload-token'))
      ).rejects.toThrow(UnauthorizedException);
    });

    it('accepts tokens issued by the configured runner SA', async () => {
      const guard = await build();
      mockVerify({ ok: true, email: RUNNER });
      await expect(
        guard.authorize(withAuth('Bearer good-token'))
      ).resolves.toBeUndefined();
    });

    it('matches a case-insensitive bearer prefix', async () => {
      const guard = await build();
      mockVerify({ ok: true, email: RUNNER });
      await expect(
        guard.authorize(withAuth('bearer lowercase-token'))
      ).resolves.toBeUndefined();
    });

    it('accepts a runner email that differs only in case', async () => {
      const guard = await build();
      mockVerify({ ok: true, email: RUNNER.toUpperCase() });
      await expect(
        guard.authorize(withAuth('Bearer mixed-case-email-token'))
      ).resolves.toBeUndefined();
    });
  });
});
