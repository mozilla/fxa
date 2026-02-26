/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import crypto from 'crypto';

const Client = require('../client')();
const otplib = require('otplib');
const Redis = require('ioredis');
const { setupAccountDatabase } = require('@fxa/shared/db/mysql/account');
const { RECOVERY_PHONE_REDIS_PREFIX } = require('@fxa/accounts/recovery-phone');
const baseConfig = require('../../config').default.getProperties();

const redis = new Redis({
  ...baseConfig.redis,
  ...baseConfig.redis.recoveryPhone,
});

const redisUtil = {
  async clearAllKey(keys: string) {
    const result = await redis.keys(keys);
    if (result.length > 0) {
      await redis.del(result);
    }
  },
  recoveryPhone: {
    async getCode(uid: string) {
      const redisKey = `${RECOVERY_PHONE_REDIS_PREFIX}:${uid}:*`;
      const result = await redis.keys(redisKey);
      expect(result.length).toBe(1);
      const parts = result[0].split(':');
      return parts[parts.length - 1];
    },
    async clearAll() {
      await redisUtil.clearAllKey('recovery-phone:*');
    },
  },
  customs: {
    async clearAll() {
      await redisUtil.clearAllKey('customs:*');
    },
  },
};

const isTwilioConfiguredForTest =
  baseConfig.twilio.testAccountSid?.length >= 24 &&
  baseConfig.twilio.testAccountSid?.startsWith('AC') &&
  baseConfig.twilio.testAuthToken?.length >= 24 &&
  baseConfig.twilio.credentialMode === 'test';

const phoneNumber = '+14159929960';
const password = 'password';

describe('#integration - recovery phone', () => {
  let server: TestServerInstance;
  let client: any;
  let email: string;
  let db: any;

  beforeAll(async () => {
    if (!isTwilioConfiguredForTest) return;
    server = await createTestServer({
      configOverrides: {
        recoveryPhone: { enabled: true },
        twilio: { credentialMode: 'test' },
        securityHistory: { ipProfiling: { allowedRecency: 0 } },
        signinConfirmation: { skipForNewAccounts: { enabled: false } },
      },
    });
    db = await setupAccountDatabase(baseConfig.database.mysql.auth);
  }, 120000);

  async function cleanUp() {
    if (!db) return;
    await redisUtil.recoveryPhone.clearAll();
    await db.deleteFrom('accounts').execute();
    await db.deleteFrom('recoveryPhones').execute();
    await db.deleteFrom('sessionTokens').execute();
    await db.deleteFrom('recoveryCodes').execute();
  }

  beforeEach(async () => {
    if (!server) return;
    email = server.uniqueEmail();
    client = await Client.createAndVerify(
      server.publicUrl,
      email,
      password,
      server.mailbox,
      { version: 'V2' }
    );

    // Add totp to account
    client.totpAuthenticator = new otplib.authenticator.Authenticator();
    const totpResult = await client.createTotpToken();
    client.totpAuthenticator.options = {
      secret: totpResult.secret,
      crypto: crypto,
    };
    await client.verifyTotpSetupCode(client.totpAuthenticator.generate());
    await client.completeTotpSetup();
  });

  afterEach(async () => {
    await cleanUp();
  });

  afterAll(async () => {
    if (server) await server.stop();
    if (db) await db.destroy();
  });

  const skipIfNoTwilio = () => {
    if (!isTwilioConfiguredForTest) {
      return true;
    }
    return false;
  };

  it('sets up a recovery phone', async () => {
    if (skipIfNoTwilio()) return;

    const createResp = await client.recoveryPhoneCreate(phoneNumber);
    const codeSent = await redisUtil.recoveryPhone.getCode(client.uid);
    const confirmResp = await client.recoveryPhoneConfirmSetup(codeSent);
    const checkResp = await client.recoveryPhoneNumber();

    expect(createResp.status).toBe('success');
    expect(codeSent).toBeDefined();
    expect(confirmResp.status).toBe('success');
    expect(checkResp.exists).toBe(true);
    expect(checkResp.phoneNumber).toBe(phoneNumber);
  });

  it('can send, confirm code, verify session, and remove totp', async () => {
    if (skipIfNoTwilio()) return;

    // Add recovery phone
    await client.recoveryPhoneCreate(phoneNumber);
    await client.recoveryPhoneConfirmSetup(
      await redisUtil.recoveryPhone.getCode(client.uid)
    );

    // Log back, capture session status
    await client.destroySession();
    client = await Client.login(server.publicUrl, email, password, {
      version: 'V2',
    });
    const sessionStatus1 = await client.sessionStatus();
    const totpExistsResp1 = await client.checkTotpTokenExists();

    // Send recovery phone code and confirm
    const sendResp = await client.recoveryPhoneSendCode();
    const confirmResp2 = await client.recoveryPhoneConfirmSignin(
      await redisUtil.recoveryPhone.getCode(client.uid)
    );
    const sessionStatus2 = await client.sessionStatus();

    await client.deleteTotpToken();
    const totpExistsResp2 = await client.checkTotpTokenExists();

    expect(sendResp.status).toBe('success');
    expect(confirmResp2.status).toBe('success');
    expect(sessionStatus2.state).toBe('verified');
    expect(sessionStatus1.state).toBe('unverified');
    expect(totpExistsResp1.exists).toBe(true);
    expect(totpExistsResp2.exists).toBe(false);
  });

  it('can remove recovery phone', async () => {
    if (skipIfNoTwilio()) return;

    await client.recoveryPhoneCreate(phoneNumber);
    await client.recoveryPhoneConfirmSetup(
      await redisUtil.recoveryPhone.getCode(client.uid)
    );
    const checkResp = await client.recoveryPhoneNumber();
    const destroyResp = await client.recoveryPhoneDestroy();
    const checkResp2 = await client.recoveryPhoneNumber();

    expect(checkResp.exists).toBe(true);
    expect(destroyResp).toBeDefined();
    expect(checkResp2.exists).toBe(false);
  });

  it('fails to set up invalid phone number', async () => {
    if (skipIfNoTwilio()) return;

    const invalidNumber = '+1234567890';
    try {
      await client.recoveryPhoneCreate(invalidNumber);
      fail('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Invalid phone number');
    }
  });

  it('can recreate recovery phone number', async () => {
    if (skipIfNoTwilio()) return;

    await client.recoveryPhoneCreate(phoneNumber);
    const createResp = await client.recoveryPhoneCreate(phoneNumber);
    expect(createResp.status).toBe('success');
  });

  it('fails to send a code to an unregistered phone number', async () => {
    if (skipIfNoTwilio()) return;

    await client.recoveryPhoneCreate(phoneNumber);

    try {
      await client.recoveryPhoneSendCode();
      fail('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Recovery phone number does not exist');
    }
  });

  it('fails to register the same phone number again', async () => {
    if (skipIfNoTwilio()) return;

    await client.recoveryPhoneCreate(phoneNumber);
    const code = await redisUtil.recoveryPhone.getCode(client.uid);
    await client.recoveryPhoneConfirmSetup(code);

    try {
      await client.recoveryPhoneCreate(phoneNumber);
      const code2 = await redisUtil.recoveryPhone.getCode(client.uid);
      await client.recoveryPhoneConfirmSetup(code2);
      fail('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Recovery phone number already exists');
    }
  });

  it('fails to use the same code again', async () => {
    if (skipIfNoTwilio()) return;

    await client.recoveryPhoneCreate(phoneNumber);
    const code = await redisUtil.recoveryPhone.getCode(client.uid);
    await client.recoveryPhoneConfirmSetup(code);

    try {
      await client.recoveryPhoneConfirmSetup(code);
      fail('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Invalid or expired confirmation code');
    }
  });
});

describe('#integration - recovery phone - feature flag check', () => {
  let server: TestServerInstance;

  beforeAll(async () => {
    if (!isTwilioConfiguredForTest) return;
    server = await createTestServer({
      configOverrides: {
        recoveryPhone: { enabled: false },
        twilio: { credentialMode: 'test' },
        securityHistory: { ipProfiling: { allowedRecency: 0 } },
        signinConfirmation: { skipForNewAccounts: { enabled: false } },
      },
    });
  }, 120000);

  afterAll(async () => {
    if (server) await server.stop();
  });

  it('returns feature not enabled error', async () => {
    if (!isTwilioConfiguredForTest) return;

    try {
      const email = server.uniqueEmail();
      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        'topsecretz',
        server.mailbox,
        { version: 'V2' }
      );
      client.totpAuthenticator = new otplib.authenticator.Authenticator();
      const totpResult = await client.createTotpToken();
      client.totpAuthenticator.options = {
        secret: totpResult.secret,
        crypto: crypto,
      };
      await client.verifyTotpSetupCode(client.totpAuthenticator.generate());
      await client.completeTotpSetup();
      await client.recoveryPhoneCreate('+14159929960');
      fail('Should have received an error');
    } catch (err: any) {
      expect(err.message).toBe('Feature not enabled');
    }
  });
});

describe('#integration - recovery phone - customs checks', () => {
  let server: TestServerInstance;
  let email: string;
  let client: any;

  beforeAll(async () => {
    if (!isTwilioConfiguredForTest) return;
    server = await createTestServer({
      configOverrides: {
        recoveryPhone: { enabled: true },
        securityHistory: { ipProfiling: { allowedRecency: 0 } },
        signinConfirmation: { skipForNewAccounts: { enabled: false } },
        customsUrl: 'http://127.0.0.1:7000',
      },
    });
  }, 120000);

  afterAll(async () => {
    if (server) await server.stop();
  });

  beforeEach(async () => {
    if (!server) return;
    email = server.uniqueEmail();
    client = await Client.createAndVerify(
      server.publicUrl,
      email,
      password,
      server.mailbox,
      { version: 'V2' }
    );
  });

  afterEach(async () => {
    await redisUtil.recoveryPhone.clearAll();
    await redisUtil.customs.clearAll();
  });

  it('prevents excessive calls to /recovery_phone/create', async () => {
    if (!isTwilioConfiguredForTest || !server) return;

    await client.recoveryPhoneCreate(phoneNumber);

    let error: any;
    try {
      for (let i = 0; i < 9; i++) {
        await client.recoveryPhoneCreate(phoneNumber);
      }
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('Client has sent too many requests');
  });

  it('prevents excessive calls to /recovery_phone/confirm', async () => {
    if (!isTwilioConfiguredForTest || !server) return;

    await client.recoveryPhoneCreate(phoneNumber);

    for (let i = 0; i < 15; i++) {
      try {
        await client.recoveryPhoneConfirmSetup('000001');
      } catch {}
    }

    let error: any;
    try {
      await client.recoveryPhoneConfirmSetup('000001');
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.message).toBe('Client has sent too many requests');
  });

  it('prevents excessive calls to /recovery_phone/signin/send_code', async () => {
    if (!isTwilioConfiguredForTest || !server) return;

    await client.recoveryPhoneCreate(phoneNumber);
    const codeSent = await redisUtil.recoveryPhone.getCode(client.uid);
    await client.recoveryPhoneConfirmSetup(codeSent);

    let error: any;
    try {
      for (let i = 0; i < 7; i++) {
        await client.recoveryPhoneSendCode();
      }
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('Client has sent too many requests');
  });
});
