/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import Redis from 'ioredis';
import { setupAccountDatabase } from '@fxa/shared/db/mysql/account';
import {
  PasskeyService,
  PasskeyChallengeManager,
  PasskeyManager,
} from '@fxa/accounts/passkey';
import Config from '../../config';
import {
  createTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';

const Client = require('../client')();
let server: TestServerInstance;

beforeAll(async () => {
  const redis = new Redis({ host: 'localhost' });
  const mockStatsD = { increment: jest.fn() };
  const mockLog = {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
  };
  const config = Config.getProperties();
  const db = setupAccountDatabase(config.database.mysql.auth);
  const passkeyManager = new PasskeyManager(db, config, mockStatsD, mockLog);
  const passkeyChallengeManager = new PasskeyChallengeManager(
    redis,
    config,
    mockLog,
    mockStatsD
  );
  const passkeyService = new PasskeyService(
    passkeyManager,
    passkeyChallengeManager,
    mockStatsD,
    mockLog
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
      },
    },
  });
}, 120000);

afterAll(async () => {
  await server.stop();
});

beforeEach(() => {
  jest.clearAllMocks();
});

const password = 'pssssst';

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
});
