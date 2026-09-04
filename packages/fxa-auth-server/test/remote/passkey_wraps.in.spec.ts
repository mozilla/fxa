/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import Redis from 'ioredis';
import { setupAccountDatabase } from '@fxa/shared/db/mysql/account';
import {
  PasskeyChallengeManager,
  PasskeyConfig,
  PasskeyManager,
  PasskeyService,
  V1_WIDTHS,
} from '@fxa/accounts/passkey';
import {
  VirtualAuthenticator,
  VirtualCredential,
} from '@fxa/accounts/passkey/testing';
import { ERRNO } from '@fxa/accounts/errors';
import { uuidTransformer } from 'fxa-shared/db/transformers';
import Config from '../../config';

import {
  createTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';

const Client = require('../client')();

const password = 'pssssst';

let server: TestServerInstance;
let redis: Redis.Redis | undefined;
let db: Awaited<ReturnType<typeof setupAccountDatabase>> | undefined;
let passkeyManager: PasskeyManager;
let passkeyRpId: string;
let passkeyOrigin: string;

/**
 * A field value of the right width, varied so a swap is visible.
 */
const field = (bytes: number, fill: number) =>
  Buffer.alloc(bytes, fill).toString('base64url');

const envelope = (fill = 0x11) => ({
  pkR: field(V1_WIDTHS.pkR, 0x04),
  prfWrappedSkR: field(V1_WIDTHS.prfWrappedSkR, fill),
  keyWrapIv: field(V1_WIDTHS.keyWrapIv, fill),
  hpkeEncapsulatedSecret: field(V1_WIDTHS.hpkeEncapsulatedSecret, 0x04),
  hpkeSealedKb: field(V1_WIDTHS.hpkeSealedKb, fill),
});

beforeAll(async () => {
  redis = new Redis({ host: 'localhost' });
  const mockStatsD = { increment: jest.fn() };
  const mockLog = {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
  };
  const config = Config.getProperties();
  db = await setupAccountDatabase(config.database.mysql.auth);

  const passkeyConfig = new PasskeyConfig(config.passkeys as PasskeyConfig);
  passkeyRpId = passkeyConfig.rpId;
  passkeyOrigin = passkeyConfig.allowedOrigins[0];

  passkeyManager = new PasskeyManager(
    db,
    passkeyConfig,
    mockStatsD as any,
    mockLog as any
  );
  const challengeManager = new PasskeyChallengeManager(
    redis,
    passkeyConfig,
    mockLog as any,
    mockStatsD as any
  );
  Container.set(
    PasskeyService,
    new PasskeyService(
      passkeyManager,
      challengeManager,
      passkeyConfig,
      mockStatsD as any,
      mockLog as any
    )
  );

  server = await createTestServer({
    configOverrides: {
      securityHistory: { ipProfiling: {} },
      signinConfirmation: { skipForNewAccounts: { enabled: false } },
      mfa: { enabled: true, actions: ['passkey'] },
      passkeys: {
        enabled: true,
        registrationEnabled: true,
        authenticationEnabled: true,
        passwordlessSyncEnabled: true,
      },
    },
  });
}, 120000);

afterAll(async () => {
  await server.stop();
  await redis?.quit();
  await db?.destroy();
  Container.remove(PasskeyService);
});

describe('#integration - remote passkey wrap storage', () => {
  let client: any;
  let credentialId: string;
  let credential: VirtualCredential;

  /**
   * Registers a passkey through the real MFA + WebAuthn flow.
   */
  async function registerPasskey(): Promise<{
    credentialId: string;
    credential: VirtualCredential;
  }> {
    await client.api.doRequest(
      'POST',
      `${client.api.baseURL}/mfa/otp/request`,
      await client.api.Token.SessionToken.fromHex(client.sessionToken),
      { action: 'passkey' }
    );
    const code = await server.mailbox.waitForMfaCode(client.email);
    const { accessToken } = await client.api.doRequest(
      'POST',
      `${client.api.baseURL}/mfa/otp/verify`,
      await client.api.Token.SessionToken.fromHex(client.sessionToken),
      { action: 'passkey', code }
    );

    const options = await client.api.doRequestWithBearerToken(
      'POST',
      `${client.api.baseURL}/passkey/registration/start`,
      accessToken,
      {}
    );
    const cred = VirtualAuthenticator.createCredential();
    const response = VirtualAuthenticator.createAttestationResponse(cred, {
      challenge: options.challenge,
      origin: passkeyOrigin,
      rpId: passkeyRpId,
    });
    const registered = await client.api.doRequestWithBearerToken(
      'POST',
      `${client.api.baseURL}/passkey/registration/finish`,
      accessToken,
      { response, challenge: options.challenge }
    );

    return { credentialId: registered.credentialId, credential: cred };
  }

  /**
   * Signs in with the passkey, asking for the passkey scope, and returns the
   * token that mints.
   */
  async function mintWrapToken(
    assertWith: VirtualCredential = credential
  ): Promise<string> {
    const { challenge } = await client.api.doRequest(
      'POST',
      `${client.api.baseURL}/passkey/authentication/start`,
      null,
      { keysRequired: true, scope: 'passkey' }
    );
    const response = VirtualAuthenticator.createAssertionResponse(assertWith, {
      challenge,
      origin: passkeyOrigin,
      rpId: passkeyRpId,
    });
    const { mfaToken } = await client.api.doRequest(
      'POST',
      `${client.api.baseURL}/passkey/authentication/finish`,
      null,
      { response, challenge, keysRequired: true }
    );
    return mfaToken;
  }

  /** POSTs a wrap with a freshly minted token. */
  async function storeWrap(payload: Record<string, unknown>, token?: string) {
    return client.api.doRequestWithBearerToken(
      'POST',
      `${client.api.baseURL}/passkey/wraps`,
      token ?? (await mintWrapToken()),
      payload
    );
  }

  async function storeCurrentWrap(overrides: Record<string, unknown> = {}) {
    return storeWrap({ credentialId, ...envelope(), ...overrides });
  }

  beforeEach(async () => {
    client = await Client.createAndVerify(
      server.publicUrl,
      server.uniqueEmail(),
      password,
      server.mailbox,
      { version: 'V2' }
    );
    ({ credentialId, credential } = await registerPasskey());
  });

  it('stores the envelope and records a security event', async () => {
    const result = await storeCurrentWrap();

    expect(result).toEqual({ created: true });

    const stored = await passkeyManager.findPasskeyWrap(
      client.uid,
      credentialId
    );
    expect(stored?.hpkeSealedKb).toEqual(
      Buffer.alloc(V1_WIDTHS.hpkeSealedKb, 0x11)
    );

    const events = await client.securityEvents();
    expect(events.map((e: any) => e.name)).toContain(
      'account.passkey.wrap_created'
    );
  });

  it('reports an identical repeat as unchanged', async () => {
    await storeCurrentWrap();

    const repeat = await storeCurrentWrap();

    expect(repeat).toEqual({ created: false });
    const events = await client.securityEvents();
    expect(
      events.filter((e: any) => e.name === 'account.passkey.wrap_created')
    ).toHaveLength(1);
  });

  it('rejects a different envelope and leaves the stored one intact', async () => {
    await storeCurrentWrap();

    await expect(storeCurrentWrap(envelope(0x99))).rejects.toMatchObject({
      code: 409,
      errno: ERRNO.PASSKEY_WRAP_CONFLICT,
    });

    const stored = await passkeyManager.findPasskeyWrap(
      client.uid,
      credentialId
    );
    expect(stored?.hpkeSealedKb).toEqual(
      Buffer.alloc(V1_WIDTHS.hpkeSealedKb, 0x11)
    );
  });

  it('rejects a malformed envelope at the route boundary', async () => {
    await expect(
      storeCurrentWrap({
        // One byte short of the fixed v1 width.
        keyWrapIv: field(V1_WIDTHS.keyWrapIv - 1, 0x22),
      })
    ).rejects.toMatchObject({ code: 400 });

    const stored = await passkeyManager.findPasskeyWrap(
      client.uid,
      credentialId
    );
    expect(stored).toBeUndefined();
  });

  it('requires an mfa token', async () => {
    await expect(
      client.api.doRequestWithBearerToken(
        'POST',
        `${client.api.baseURL}/passkey/wraps`,
        'invalid-token',
        { credentialId, ...envelope() }
      )
    ).rejects.toMatchObject({ code: 401 });
  });

  it('refuses a token earned on a different credential', async () => {
    const other = await registerPasskey();
    const token = await mintWrapToken(other.credential);

    await expect(
      storeWrap({ credentialId, ...envelope() }, token)
    ).rejects.toMatchObject({ code: 401 });
  });

  describe('GET /passkey/wraps/{credentialId}', () => {
    /** GETs a wrap with a freshly minted token. */
    async function fetchWrap(id = credentialId, token?: string) {
      return client.api.doRequestWithBearerToken(
        'GET',
        `${client.api.baseURL}/passkey/wraps/${id}`,
        token ?? (await mintWrapToken())
      );
    }

    /** Moves the account's `keysChangedAt` past every stored wrap. */
    async function rotateKeys() {
      await db
        ?.updateTable('accounts')
        .set({ keysChangedAt: Date.now() + 60_000 })
        .where('uid', '=', uuidTransformer.to(client.uid))
        .execute();
    }

    it('returns the stored envelope and records a security event', async () => {
      await storeCurrentWrap();

      const result = await fetchWrap();

      expect(result).toMatchObject(envelope());
      expect(result.createdAt).toEqual(expect.any(Number));

      const events = await client.securityEvents();
      expect(events.map((e: any) => e.name)).toContain(
        'account.passkey.wrap_retrieved'
      );
    });

    it('404s when the passkey has no wrap', async () => {
      await expect(fetchWrap()).rejects.toMatchObject({
        code: 404,
        errno: ERRNO.PASSKEY_WRAP_NOT_FOUND,
      });

      const events = await client.securityEvents();
      expect(events.map((e: any) => e.name)).toContain(
        'account.passkey.wrap_retrieval_failure'
      );
    });

    it('withholds a wrap that predates the current kB', async () => {
      await storeCurrentWrap();
      await rotateKeys();

      await expect(fetchWrap()).rejects.toMatchObject({
        code: 404,
        errno: ERRNO.PASSKEY_WRAP_STALE,
      });
    });

    it('requires an mfa token', async () => {
      await storeCurrentWrap();

      await expect(
        fetchWrap(credentialId, 'invalid-token')
      ).rejects.toMatchObject({ code: 401 });
    });

    it('refuses a token earned on a different credential', async () => {
      await storeCurrentWrap();
      const other = await registerPasskey();
      const token = await mintWrapToken(other.credential);

      await expect(fetchWrap(credentialId, token)).rejects.toMatchObject({
        code: 401,
      });
    });
  });
});
