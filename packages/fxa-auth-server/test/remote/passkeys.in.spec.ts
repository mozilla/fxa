/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import Redis from 'ioredis';
import { setupAccountDatabase } from '@fxa/shared/db/mysql/account';
import {
  PasskeyConfig,
  PasskeyService,
  PasskeyChallengeManager,
  PasskeyManager,
  VirtualAuthenticator,
  VirtualCredential,
} from '@fxa/accounts/passkey';
import Config from '../../config';
import {
  createTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';

const Client = require('../client')();
let server: TestServerInstance;
let redis: Redis | undefined;
let db: Awaited<ReturnType<typeof setupAccountDatabase>> | undefined;
let passkeyRpId: string;
let passkeyOrigin: string;

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

  const passkeyManager = new PasskeyManager(
    db,
    passkeyConfig,
    mockStatsD as any,
    mockLog as any
  );
  const passkeyChallengeManager = new PasskeyChallengeManager(
    redis,
    passkeyConfig,
    mockLog as any,
    mockStatsD as any
  );
  const passkeyService = new PasskeyService(
    passkeyManager,
    passkeyChallengeManager,
    passkeyConfig,
    mockStatsD as any,
    mockLog as any
  );

  // Register the PasskeyService instance before the server starts so that the
  // passkey routes can resolve it from the TypeDI container (FXA-13069).
  Container.set(PasskeyService, passkeyService);

  server = await createTestServer({
    configOverrides: {
      securityHistory: { ipProfiling: {} },
      signinConfirmation: { skipForNewAccounts: { enabled: false } },
      mfa: {
        enabled: true,
        actions: ['passkey'],
      },
      passkeys: {
        enabled: true,
        registrationEnabled: true,
        authenticationEnabled: true,
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

const password = 'pssssst';

async function getMfaAccessTokenForPasskey(clientInstance: any) {
  // Request an OTP email for the passkey MFA action
  await clientInstance.api.doRequest(
    'POST',
    `${clientInstance.api.baseURL}/mfa/otp/request`,
    await clientInstance.api.Token.SessionToken.fromHex(
      clientInstance.sessionToken
    ),
    { action: 'passkey' }
  );

  // Read OTP code from mailbox
  const code = await server.mailbox.waitForMfaCode(clientInstance.email);

  // Verify OTP and get back a JWT access token
  const verifyRes = await clientInstance.api.doRequest(
    'POST',
    `${clientInstance.api.baseURL}/mfa/otp/verify`,
    await clientInstance.api.Token.SessionToken.fromHex(
      clientInstance.sessionToken
    ),
    { action: 'passkey', code }
  );
  return verifyRes.accessToken;
}

describe('#integration - remote passkey registration', () => {
  let passkeyEmail: string;
  let passkeyClient: any;

  beforeEach(async () => {
    passkeyEmail = server.uniqueEmail();
    passkeyClient = await Client.createAndVerify(
      server.publicUrl,
      passkeyEmail,
      password,
      server.mailbox,
      {
        version: 'V2',
      }
    );
  });

  it('POST /passkey/registration/start - without auth returns 401', async () => {
    await expect(async () => {
      await passkeyClient.api.doRequestWithBearerToken(
        'POST',
        `${passkeyClient.api.baseURL}/passkey/registration/start`,
        'invalid-token',
        {}
      );
    }).rejects.toMatchObject({
      code: 401,
    });
  });

  it('POST /passkey/registration/finish - without auth returns 401', async () => {
    await expect(async () => {
      await passkeyClient.api.doRequestWithBearerToken(
        'POST',
        `${passkeyClient.api.baseURL}/passkey/registration/finish`,
        'invalid-token',
        {
          response: { id: 'cred', response: { attestationObject: 'abc' } },
          challenge: 'challenge-abc',
        }
      );
    }).rejects.toMatchObject({
      code: 401,
    });
  });

  it('POST /passkey/registration/finish - bad payload returns 400', async () => {
    const accessToken = await getMfaAccessTokenForPasskey(passkeyClient);
    await expect(async () => {
      await passkeyClient.api.doRequestWithBearerToken(
        'POST',
        `${passkeyClient.api.baseURL}/passkey/registration/finish`,
        accessToken,
        {
          // missing required 'challenge' field
          response: { id: 'cred' },
        }
      );
    }).rejects.toMatchObject({
      code: 400,
    });
  });

  it('happy path: /passkey/registration/start then /passkey/registration/finish', async () => {
    const accessToken = await getMfaAccessTokenForPasskey(passkeyClient);

    const options = await passkeyClient.api.doRequestWithBearerToken(
      'POST',
      `${passkeyClient.api.baseURL}/passkey/registration/start`,
      accessToken,
      {}
    );
    expect(options.challenge).toBeDefined();
    expect(options.rp).toBeDefined();

    // Step 2: simulate authenticator
    const cred = VirtualAuthenticator.createCredential();
    const response = VirtualAuthenticator.createAttestationResponse(cred, {
      challenge: options.challenge,
      origin: passkeyOrigin,
      rpId: passkeyRpId,
    });

    // Step 3: finish registration
    const result = await passkeyClient.api.doRequestWithBearerToken(
      'POST',
      `${passkeyClient.api.baseURL}/passkey/registration/finish`,
      accessToken,
      { response, challenge: options.challenge }
    );

    expect(result.credentialId).toBeDefined();
    expect(result.name).toBeDefined();
    expect(result.createdAt).toEqual(expect.any(Number));
  });
});

describe('#integration - remote passkey authentication', () => {
  let authEmail: string;
  let authClient: any;
  let registeredCred: VirtualCredential;

  beforeEach(async () => {
    authEmail = server.uniqueEmail();
    authClient = await Client.createAndVerify(
      server.publicUrl,
      authEmail,
      password,
      server.mailbox,
      { version: 'V2' }
    );

    // Register a passkey so authentication tests have a credential to use
    const accessToken = await getMfaAccessTokenForPasskey(authClient);
    const options = await authClient.api.doRequestWithBearerToken(
      'POST',
      `${authClient.api.baseURL}/passkey/registration/start`,
      accessToken,
      {}
    );
    registeredCred = VirtualAuthenticator.createCredential();
    const registrationResponse = VirtualAuthenticator.createAttestationResponse(
      registeredCred,
      {
        challenge: options.challenge,
        origin: passkeyOrigin,
        rpId: passkeyRpId,
      }
    );
    await authClient.api.doRequestWithBearerToken(
      'POST',
      `${authClient.api.baseURL}/passkey/registration/finish`,
      accessToken,
      { response: registrationResponse, challenge: options.challenge }
    );
  });

  it('POST /passkey/authentication/start - returns challenge and options', async () => {
    const result = await authClient.api.doRequest(
      'POST',
      `${authClient.api.baseURL}/passkey/authentication/start`,
      null,
      {}
    );
    expect(result.challenge).toBeDefined();
    expect(result.rpId).toBeDefined();
  });

  it('happy path: /passkey/authentication/start then /passkey/authentication/finish', async () => {
    const startResult = await authClient.api.doRequest(
      'POST',
      `${authClient.api.baseURL}/passkey/authentication/start`,
      null,
      {}
    );
    expect(startResult.challenge).toBeDefined();

    const assertionResponse = VirtualAuthenticator.createAssertionResponse(
      registeredCred,
      {
        challenge: startResult.challenge,
        origin: passkeyOrigin,
        rpId: passkeyRpId,
      }
    );

    const finishResult = await authClient.api.doRequest(
      'POST',
      `${authClient.api.baseURL}/passkey/authentication/finish`,
      null,
      { response: assertionResponse, challenge: startResult.challenge }
    );

    expect(finishResult.uid).toBeDefined();
    expect(finishResult.sessionToken).toBeDefined();
    expect(finishResult.verified).toBe(true);
    expect(finishResult.hasPassword).toBe(true);
    expect(finishResult.requiresPasswordForSync).toBe(false);
  });

  it('POST /passkey/authentication/finish - mismatched challenge returns error', async () => {
    const startResult = await authClient.api.doRequest(
      'POST',
      `${authClient.api.baseURL}/passkey/authentication/start`,
      null,
      {}
    );
    const assertionResponse = VirtualAuthenticator.createAssertionResponse(
      registeredCred,
      {
        challenge: startResult.challenge,
        origin: passkeyOrigin,
        rpId: passkeyRpId,
      }
    );
    // The assertion was signed for startResult.challenge but we submit a
    // different challenge string, so verifyAuthenticationResponse must fail.
    await expect(async () => {
      await authClient.api.doRequest(
        'POST',
        `${authClient.api.baseURL}/passkey/authentication/finish`,
        null,
        {
          response: assertionResponse,
          challenge: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        }
      );
    }).rejects.toBeDefined();
  });
});

describe('#integration - remote passkey-then-password fallback via /session/reauth', () => {
  let authEmail: string;
  let authClient: any;
  let registeredCred: VirtualCredential;

  async function authenticateWithPasskey(): Promise<string> {
    const startResult = await authClient.api.doRequest(
      'POST',
      `${authClient.api.baseURL}/passkey/authentication/start`,
      null,
      {}
    );
    const assertionResponse = VirtualAuthenticator.createAssertionResponse(
      registeredCred,
      {
        challenge: startResult.challenge,
        origin: passkeyOrigin,
        rpId: passkeyRpId,
      }
    );
    const finishResult = await authClient.api.doRequest(
      'POST',
      `${authClient.api.baseURL}/passkey/authentication/finish`,
      null,
      { response: assertionResponse, challenge: startResult.challenge }
    );
    return finishResult.sessionToken;
  }

  beforeEach(async () => {
    authEmail = server.uniqueEmail();
    authClient = await Client.createAndVerify(
      server.publicUrl,
      authEmail,
      password,
      server.mailbox,
      { version: 'V2' }
    );

    const accessToken = await getMfaAccessTokenForPasskey(authClient);
    const options = await authClient.api.doRequestWithBearerToken(
      'POST',
      `${authClient.api.baseURL}/passkey/registration/start`,
      accessToken,
      {}
    );
    registeredCred = VirtualAuthenticator.createCredential();
    const registrationResponse = VirtualAuthenticator.createAttestationResponse(
      registeredCred,
      {
        challenge: options.challenge,
        origin: passkeyOrigin,
        rpId: passkeyRpId,
      }
    );
    await authClient.api.doRequestWithBearerToken(
      'POST',
      `${authClient.api.baseURL}/passkey/registration/finish`,
      accessToken,
      { response: registrationResponse, challenge: options.challenge }
    );
  });

  it('passkey-verified session can call /session/reauth?keys=true to obtain a keyFetchToken', async () => {
    const passkeySessionTokenHex = await authenticateWithPasskey();
    const reauthClient = await Client.login(
      server.publicUrl,
      authEmail,
      password,
      { version: 'V2' }
    );
    reauthClient.sessionToken = passkeySessionTokenHex;

    await reauthClient.reauth({ keys: true });

    const keyFetchToken =
      reauthClient.keyFetchTokenVersion2 || reauthClient.keyFetchToken;
    expect(keyFetchToken).toMatch(/^[0-9a-f]{64}$/);
  });
});
