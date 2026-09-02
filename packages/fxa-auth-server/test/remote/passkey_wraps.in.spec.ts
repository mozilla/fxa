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
  VirtualAuthenticator,
} from '@fxa/accounts/passkey';
import { ERRNO } from '@fxa/accounts/errors';
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

  /**
   * Registers a passkey through the real MFA + WebAuthn flow.
   */
  async function registerPasskey(): Promise<string> {
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

    return registered.credentialId;
  }

  /** POSTs a wrap. */
  async function storeWrap(payload: Record<string, unknown>) {
    return client.api.doRequest(
      'POST',
      `${client.api.baseURL}/passkey/wraps`,
      await client.api.Token.SessionToken.fromHex(client.sessionToken),
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
    credentialId = await registerPasskey();
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

  it('rejects a credential the account does not own', async () => {
    await expect(
      storeCurrentWrap({
        credentialId: Buffer.from('someone-elses-cred').toString('base64url'),
      })
    ).rejects.toMatchObject({
      code: 404,
      errno: ERRNO.PASSKEY_NOT_FOUND,
    });
  });

  it('requires a session token', async () => {
    await expect(
      client.api.doRequestWithBearerToken(
        'POST',
        `${client.api.baseURL}/passkey/wraps`,
        'invalid-token',
        { credentialId, ...envelope() }
      )
    ).rejects.toMatchObject({ code: 401 });
  });
});
