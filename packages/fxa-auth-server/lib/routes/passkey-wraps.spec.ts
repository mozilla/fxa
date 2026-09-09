/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Schema } from 'joi';
import { Container } from 'typedi';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PasskeyService, V1_WIDTHS } from '@fxa/accounts/passkey';
import type { Customs, DB } from './passkeys';
import { AuthLogger } from '../types';
import { AppError, ERRNO } from '@fxa/accounts/errors';
import { recordSecurityEvent } from './utils/security-event';
import { isWrapStale, passkeyWrapsRoutes } from './passkey-wraps';
import { ConfigType } from '../../config';

jest.mock('./utils/security-event', () => ({
  recordSecurityEvent: jest.fn(),
}));

const UID = 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6';
const TEST_EMAIL = 'test@example.com';
const CREDENTIAL_ID = Buffer.from('credential-id-xyz').toString('base64url');

/**
 * A field value of exactly the right width, distinct per field.
 */
const field = (bytes: number, fill: number) =>
  Buffer.alloc(bytes, fill).toString('base64url');

const validEnvelope = () => ({
  pkR: field(V1_WIDTHS.pkR, 0x04),
  prfWrappedSkR: field(V1_WIDTHS.prfWrappedSkR, 0x11),
  keyWrapIv: field(V1_WIDTHS.keyWrapIv, 0x22),
  hpkeEncapsulatedSecret: field(V1_WIDTHS.hpkeEncapsulatedSecret, 0x33),
  hpkeSealedKb: field(V1_WIDTHS.hpkeSealedKb, 0x44),
});

const validPayload = (overrides: Record<string, unknown> = {}) => ({
  credentialId: CREDENTIAL_ID,
  ...validEnvelope(),
  ...overrides,
});

/**
 * A `keysChangedAt` older than the stored wrap, so staleness never fires and a
 * test about some other condition can say so.
 */
const KEYS_CHANGED_AT = 1_700_000_000_000;
const WRAP_CREATED_AT = KEYS_CHANGED_AT + 10_000;

/** The stored row, binary as the repository returns it. */
const storedWrap = (overrides: Record<string, unknown> = {}) => ({
  uid: Buffer.from(UID, 'hex'),
  credentialId: Buffer.from(CREDENTIAL_ID, 'base64url'),
  pkR: Buffer.alloc(V1_WIDTHS.pkR, 0x04),
  prfWrappedSkR: Buffer.alloc(V1_WIDTHS.prfWrappedSkR, 0x11),
  keyWrapIv: Buffer.alloc(V1_WIDTHS.keyWrapIv, 0x22),
  hpkeEncapsulatedSecret: Buffer.alloc(V1_WIDTHS.hpkeEncapsulatedSecret, 0x33),
  hpkeSealedKb: Buffer.alloc(V1_WIDTHS.hpkeSealedKb, 0x44),
  createdAt: WRAP_CREATED_AT,
  ...overrides,
});

const config = {
  passkeys: { enabled: true, passwordlessSyncEnabled: true },
} as unknown as ConfigType;

const disabledConfig = {
  passkeys: { enabled: true, passwordlessSyncEnabled: false },
} as unknown as ConfigType;

describe('passkey wraps routes', () => {
  let log: DeepMocked<AuthLogger>;
  let db: DeepMocked<DB>;
  let customs: DeepMocked<Customs>;
  let service: DeepMocked<PasskeyService>;

  const buildRoute = (cfg: ConfigType = config) =>
    passkeyWrapsRoutes(customs, db, cfg, log).find(
      (r) => r.path === '/passkey/wraps' && r.method === 'POST'
    ) as any;

  async function run(
    payload: Record<string, unknown> = validPayload(),
    // An options object so a test can pass no binding at all; a positional
    // default would swallow `undefined` and assert nothing.
    { cid }: { cid?: string } = { cid: CREDENTIAL_ID }
  ) {
    const route = buildRoute();
    const request = {
      headers: { 'user-agent': 'test-agent' },
      auth: { credentials: { uid: UID, id: 'session-token-id', cid } },
      payload,
      app: {
        clientAddress: '127.0.0.1',
        geo: { location: { country: 'United States', countryCode: 'US' } },
      },
    };
    return route.handler(request);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    log = createMock<AuthLogger>();
    db = createMock<DB>();
    db.account.mockResolvedValue({
      primaryEmail: { email: TEST_EMAIL },
      keysChangedAt: KEYS_CHANGED_AT,
    } as Awaited<ReturnType<DB['account']>>);
    customs = createMock<Customs>();
    service = createMock<PasskeyService>();
    service.storePasskeyWrap.mockResolvedValue('created');
    service.getPasskeyWrap.mockResolvedValue(
      storedWrap() as Awaited<ReturnType<PasskeyService['getPasskeyWrap']>>
    );
    Container.set(PasskeyService, service);
  });

  afterEach(() => {
    Container.reset();
  });

  describe('POST /passkey/wraps', () => {
    it('stores the envelope and reports it as created', async () => {
      const result = await run();

      expect(result).toEqual({ created: true });
      expect(service.storePasskeyWrap).toHaveBeenCalledWith(
        UID,
        CREDENTIAL_ID,
        {
          pkR: Buffer.alloc(V1_WIDTHS.pkR, 0x04),
          prfWrappedSkR: Buffer.alloc(V1_WIDTHS.prfWrappedSkR, 0x11),
          keyWrapIv: Buffer.alloc(V1_WIDTHS.keyWrapIv, 0x22),
          hpkeEncapsulatedSecret: Buffer.alloc(
            V1_WIDTHS.hpkeEncapsulatedSecret,
            0x33
          ),
          hpkeSealedKb: Buffer.alloc(V1_WIDTHS.hpkeSealedKb, 0x44),
        },
        expect.any(Number)
      );
    });

    it('records a wrap_created event on a new wrap', async () => {
      await run();

      expect(recordSecurityEvent).toHaveBeenCalledWith(
        'account.passkey.wrap_created',
        expect.objectContaining({ db, request: expect.any(Object) })
      );
    });

    // Returned bare rather than through the toolkit, so Hapi's default 200
    // applies; only the 201 needs an explicit code.
    it('reports an unchanged wrap without re-emitting the event', async () => {
      service.storePasskeyWrap.mockResolvedValue('unchanged');

      const result = await run();

      expect(result).toEqual({ created: false });
      expect(recordSecurityEvent).not.toHaveBeenCalledWith(
        'account.passkey.wrap_created',
        expect.anything()
      );
    });

    it('refuses a token minted for a different credential', async () => {
      await expect(
        run(validPayload(), { cid: 'some-other-cred' })
      ).rejects.toThrow();
      expect(service.storePasskeyWrap).not.toHaveBeenCalled();
    });

    it('accepts a binding that differs only in base64url encoding', async () => {
      const padded = `${Buffer.from(CREDENTIAL_ID, 'base64url').toString(
        'base64url'
      )}=`;

      await expect(run(validPayload(), { cid: padded })).resolves.toEqual({
        created: true,
      });
    });

    it('refuses a token with no credential binding', async () => {
      await expect(run(validPayload(), {})).rejects.toThrow();
      expect(service.storePasskeyWrap).not.toHaveBeenCalled();
    });

    it('rate-limits against the current primary email', async () => {
      await run();

      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        expect.any(Object),
        UID,
        TEST_EMAIL,
        'passkeyWrapsCreate'
      );
    });

    // The handler does not branch on the error, so one case covers the rethrow.
    // Which errno belongs to which cause is PasskeyService's contract and is
    // tested there.
    it('propagates a store failure with its errno intact', async () => {
      service.storePasskeyWrap.mockRejectedValue(
        AppError.passkeyWrapConflict()
      );

      await expect(run()).rejects.toMatchObject({
        errno: ERRNO.PASSKEY_WRAP_CONFLICT,
      });
    });

    // One event for every cause, matching the other passkey routes. Which cause
    // it was lives in statsd, emitted by PasskeyService.wrapFailure.
    it('records a wrap_creation_failure event when the store throws', async () => {
      service.storePasskeyWrap.mockRejectedValue(new Error('db is down'));

      await expect(run()).rejects.toThrow('db is down');

      expect(recordSecurityEvent).toHaveBeenCalledWith(
        'account.passkey.wrap_creation_failure',
        expect.objectContaining({ db, request: expect.any(Object) })
      );
    });

    it('surfaces the store error even when the audit write fails', async () => {
      service.storePasskeyWrap.mockRejectedValue(
        AppError.passkeyWrapConflict()
      );
      (recordSecurityEvent as jest.Mock).mockRejectedValueOnce(
        new Error('audit write failed')
      );

      await expect(run()).rejects.toMatchObject({
        errno: ERRNO.PASSKEY_WRAP_CONFLICT,
      });
    });

    it('propagates a customs rejection without writing', async () => {
      customs.checkAuthenticated.mockRejectedValue(AppError.tooManyRequests(1));

      await expect(run()).rejects.toThrow();
      expect(service.storePasskeyWrap).not.toHaveBeenCalled();
    });
  });

  describe('GET /passkey/wraps/{credentialId}', () => {
    const buildGetRoute = (cfg: ConfigType = config) =>
      passkeyWrapsRoutes(customs, db, cfg, log).find(
        (r) => r.path === '/passkey/wraps/{credentialId}' && r.method === 'GET'
      ) as any;

    const runGet = (
      params = { credentialId: CREDENTIAL_ID },
      { cid }: { cid?: string } = { cid: CREDENTIAL_ID }
    ) =>
      buildGetRoute().handler({
        headers: { 'user-agent': 'test-agent' },
        auth: { credentials: { uid: UID, id: 'session-token-id', cid } },
        params,
        app: { clientAddress: '127.0.0.1' },
      });

    it('returns the envelope base64url-encoded, with its createdAt', async () => {
      await expect(runGet()).resolves.toEqual({
        pkR: Buffer.alloc(V1_WIDTHS.pkR, 0x04).toString('base64url'),
        prfWrappedSkR: Buffer.alloc(V1_WIDTHS.prfWrappedSkR, 0x11).toString(
          'base64url'
        ),
        keyWrapIv: Buffer.alloc(V1_WIDTHS.keyWrapIv, 0x22).toString(
          'base64url'
        ),
        hpkeEncapsulatedSecret: Buffer.alloc(
          V1_WIDTHS.hpkeEncapsulatedSecret,
          0x33
        ).toString('base64url'),
        hpkeSealedKb: Buffer.alloc(V1_WIDTHS.hpkeSealedKb, 0x44).toString(
          'base64url'
        ),
        createdAt: WRAP_CREATED_AT,
      });
    });

    it('never returns uid or credentialId from the stored row', async () => {
      const result = await runGet();

      expect(result).not.toHaveProperty('uid');
      expect(result).not.toHaveProperty('credentialId');
    });

    it('withholds a wrap stored before keysChangedAt', async () => {
      db.account.mockResolvedValue({
        primaryEmail: { email: TEST_EMAIL },
        keysChangedAt: WRAP_CREATED_AT + 1,
      } as Awaited<ReturnType<DB['account']>>);

      await expect(runGet()).rejects.toMatchObject({
        code: 404,
        errno: ERRNO.PASSKEY_WRAP_STALE,
      });
    });

    it('serves a wrap stored in the same millisecond as keysChangedAt', async () => {
      db.account.mockResolvedValue({
        primaryEmail: { email: TEST_EMAIL },
        keysChangedAt: WRAP_CREATED_AT,
      } as Awaited<ReturnType<DB['account']>>);

      await expect(runGet()).resolves.toHaveProperty(
        'createdAt',
        WRAP_CREATED_AT
      );
    });

    it('records a wrap_retrieved event on a returned envelope', async () => {
      await runGet();

      expect(recordSecurityEvent).toHaveBeenCalledWith(
        'account.passkey.wrap_retrieved',
        expect.objectContaining({ db, request: expect.any(Object) })
      );
    });

    it('records a wrap_retrieval_failure event when the fetch throws', async () => {
      service.getPasskeyWrap.mockRejectedValue(AppError.passkeyWrapNotFound());

      await expect(runGet()).rejects.toMatchObject({
        errno: ERRNO.PASSKEY_WRAP_NOT_FOUND,
      });
      expect(recordSecurityEvent).toHaveBeenCalledWith(
        'account.passkey.wrap_retrieval_failure',
        expect.objectContaining({ db, request: expect.any(Object) })
      );
    });

    it('records a wrap_retrieval_failure event on a stale wrap', async () => {
      db.account.mockResolvedValue({
        primaryEmail: { email: TEST_EMAIL },
        keysChangedAt: WRAP_CREATED_AT + 1,
      } as Awaited<ReturnType<DB['account']>>);

      await expect(runGet()).rejects.toMatchObject({
        errno: ERRNO.PASSKEY_WRAP_STALE,
      });
      expect(recordSecurityEvent).toHaveBeenCalledWith(
        'account.passkey.wrap_retrieval_failure',
        expect.objectContaining({ db, request: expect.any(Object) })
      );
    });

    it('records a wrap_retrieval_failure event for an unbound token', async () => {
      await expect(
        runGet({ credentialId: CREDENTIAL_ID }, { cid: 'some-other-cred' })
      ).rejects.toThrow();

      expect(recordSecurityEvent).toHaveBeenCalledWith(
        'account.passkey.wrap_retrieval_failure',
        expect.objectContaining({ db, request: expect.any(Object) })
      );
    });

    it('surfaces the fetch error even when the audit write fails', async () => {
      service.getPasskeyWrap.mockRejectedValue(AppError.passkeyWrapNotFound());
      (recordSecurityEvent as jest.Mock).mockRejectedValueOnce(
        new Error('audit write failed')
      );

      await expect(runGet()).rejects.toMatchObject({
        errno: ERRNO.PASSKEY_WRAP_NOT_FOUND,
      });
    });

    it('returns the envelope even when the audit write fails', async () => {
      (recordSecurityEvent as jest.Mock).mockRejectedValueOnce(
        new Error('audit write failed')
      );

      await expect(runGet()).resolves.toHaveProperty(
        'createdAt',
        WRAP_CREATED_AT
      );
    });

    it('rate-limits against the current primary email', async () => {
      await runGet();

      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        expect.any(Object),
        UID,
        TEST_EMAIL,
        'passkeyWrapsGet'
      );
    });

    it('refuses a token minted for a different credential', async () => {
      await expect(
        runGet({ credentialId: CREDENTIAL_ID }, { cid: 'some-other-cred' })
      ).rejects.toMatchObject({ errno: ERRNO.INVALID_MFA_TOKEN });
      expect(service.getPasskeyWrap).not.toHaveBeenCalled();
    });

    it('refuses a token with no credential binding', async () => {
      await expect(
        runGet({ credentialId: CREDENTIAL_ID }, {})
      ).rejects.toMatchObject({ errno: ERRNO.INVALID_MFA_TOKEN });
      expect(service.getPasskeyWrap).not.toHaveBeenCalled();
    });

    it('accepts a binding that differs only in base64url encoding', async () => {
      const padded = `${CREDENTIAL_ID}=`;

      await expect(
        runGet({ credentialId: CREDENTIAL_ID }, { cid: padded })
      ).resolves.toHaveProperty('createdAt', WRAP_CREATED_AT);
    });

    // `payload: false` is load-bearing: the mfa scheme implements no payload
    // method, and Hapi refuses to register the route without the opt-out.
    it('requires an mfa:passkey token', () => {
      expect(buildGetRoute().options.auth).toEqual({
        strategy: 'mfa',
        scope: ['mfa:passkey'],
        payload: false,
      });
    });

    it('gates on the passwordless sync flag', () => {
      expect(() =>
        buildGetRoute(disabledConfig).options.pre[0].method()
      ).toThrow();
    });

    describe('params validation', () => {
      let schema: Schema;

      beforeEach(() => {
        schema = buildGetRoute().options.validate.params;
      });

      it('accepts a base64url credential id', () => {
        expect(
          schema.validate({ credentialId: CREDENTIAL_ID }).error
        ).toBeUndefined();
      });

      it('rejects standard base64 in place of base64url', () => {
        expect(
          schema.validate({ credentialId: 'AAAA/AAAAAAAAAA+' }).error
        ).toBeDefined();
      });

      it('requires a credential id', () => {
        expect(schema.validate({}).error).toBeDefined();
      });
    });
  });

  describe('isWrapStale', () => {
    it('is not stale when the wrap is newer than the keys', () => {
      expect(isWrapStale(1_000, 500)).toBe(false);
    });

    it('is not stale when the two are equal', () => {
      expect(isWrapStale(1_000, 1_000)).toBe(false);
    });

    it('is stale when the keys are newer than the wrap', () => {
      expect(isWrapStale(500, 1_000)).toBe(true);
    });

    it('is stale when keysChangedAt is not a number', () => {
      expect(isWrapStale(1_000, Number.NaN)).toBe(true);
    });
  });

  describe('route configuration', () => {
    it('requires an mfa:passkey token', () => {
      expect(buildRoute().options.auth).toEqual({
        strategy: 'mfa',
        scope: ['mfa:passkey'],
        payload: false,
      });
    });

    it('gates on the passwordless sync flag', () => {
      expect(buildRoute().options.pre[0].method()).toBe(true);
    });

    it('refuses to serve when the passwordless sync flag is off', () => {
      const routes = passkeyWrapsRoutes(
        customs,
        db as any,
        disabledConfig,
        log
      );
      const route = routes.find(
        (r) => r.path === '/passkey/wraps' && r.method === 'POST'
      ) as any;

      expect(() => route.options.pre[0].method()).toThrow();
    });
  });

  describe('payload validation', () => {
    let schema: Schema;

    beforeEach(() => {
      schema = buildRoute().options.validate.payload;
    });

    it('accepts a well-formed payload', () => {
      expect(schema.validate(validPayload()).error).toBeUndefined();
    });

    it.each(Object.keys(V1_WIDTHS))(
      'rejects %s one byte short and one byte long',
      (name) => {
        const bytes = V1_WIDTHS[name as keyof typeof V1_WIDTHS];

        expect(
          schema.validate(validPayload({ [name]: field(bytes - 1, 0x01) }))
            .error
        ).toBeDefined();
        expect(
          schema.validate(validPayload({ [name]: field(bytes + 1, 0x01) }))
            .error
        ).toBeDefined();
      }
    );

    it.each(['credentialId', ...Object.keys(V1_WIDTHS)])(
      'requires %s',
      (name) => {
        const payload = validPayload();
        delete (payload as Record<string, unknown>)[name];

        expect(schema.validate(payload).error).toBeDefined();
      }
    );

    it('rejects standard base64 in place of base64url', () => {
      expect(
        schema.validate(validPayload({ keyWrapIv: 'AAAA/AAAAAAAAAA+' })).error
      ).toBeDefined();
    });

    it('strips an unknown field rather than rejecting it', () => {
      // The server validates with `stripUnknown: true` (lib/server.js), so an
      // unknown key never reaches the handler and never 400s. Asserting joi's
      // default here would document behaviour production does not have.
      const { error, value } = schema.validate(validPayload({ notAField: 1 }), {
        stripUnknown: true,
      });

      expect(error).toBeUndefined();
      expect(value).not.toHaveProperty('notAField');
    });
  });
});
