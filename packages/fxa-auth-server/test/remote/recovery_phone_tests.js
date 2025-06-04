/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Client = require('../client')();
const TestServer = require('../test_server');
const config = require('../../config').default.getProperties();
const Redis = require('ioredis');
const { setupAccountDatabase } = require('@fxa/shared/db/mysql/account');
const { RECOVERY_PHONE_REDIS_PREFIX } = require('@fxa/accounts/recovery-phone');
const otplib = require('otplib');
const crypto = require('crypto');
const { assert } = chai;
chai.use(chaiAsPromised);

const redis = new Redis({
  ...config.redis,
  ...config.redis.recoveryPhone,
});

/**
 * Mimics phone behavior by peaking at DB state.
 */
const redisUtil = {
  async clearAllKey(keys) {
    const result = await redis.keys(keys);
    if (result.length > 0) {
      await redis.del(result);
    }
  },
  recoveryPhone: {
    async getCode(uid) {
      const redisKey = `${RECOVERY_PHONE_REDIS_PREFIX}:${uid}:*`;
      const result = await redis.keys(redisKey);
      assert.equal(result.length, 1);
      const parts = result[0].split(':');
      return parts[parts.length - 1];
    },
    async clearAll() {
      await redisUtil.clearAllKey(`recovery-phone:*`);
    },
  },
  customs: {
    async clearAll() {
      await redisUtil.clearAllKey(`customs:*`);
    },
  },
};

// Note we have to use the 'test' credentials since these integration tests
// require that we send messages to 'magic' phone numbers, which are only
// supported by the twilio testing credentials.
const isTwilioConfiguredForTest =
  config.twilio.testAccountSid?.length >= 24 &&
  config.twilio.testAccountSid?.startsWith('AC') &&
  config.twilio.testAuthToken?.length >= 24 &&
  config.twilio.credentialMode === 'test';

describe(`#integration - recovery phone`, function () {
  // TODO: Something flakes... figure out where the slowdown is.
  this.timeout(10000);

  let server;
  let client;
  let email;
  let db;

  // Since ware calling the phone number lookup API, this must be a valid 'magic number' for testing.
  // Different magic numbers correspond to different scenarios. e.g. reassigned numbers, sim swapping,
  // etc. See the following documentation for info in the event tests need to consider extra states.
  // https://www.twilio.com/docs/lookup/magic-numbers-for-lookup
  const phoneNumber = '+14159929960';
  const password = 'password';
  const temp = {};

  before(async function () {
    config.recoveryPhone.enabled = true;

    // We set our config to be in 'testing' mode so we can use twilio magic
    // testing phone numbers.
    temp.credentialMode = config.twilio.credentialMode;
    config.twilio.credentialMode = 'test';

    config.securityHistory.ipProfiling.allowedRecency = 0;
    config.signinConfirmation.skipForNewAccounts.enabled = false;
    server = await TestServer.start(config);
    db = await setupAccountDatabase(config.database.mysql.auth);
  });

  async function cleanUp() {
    await redisUtil.recoveryPhone.clearAll();
    await db.deleteFrom('accounts').execute();
    await db.deleteFrom('recoveryPhones').execute();
    await db.deleteFrom('sessionTokens').execute();
    await db.deleteFrom('recoveryCodes').execute();
  }

  beforeEach(async function () {
    email = server.uniqueEmail();
    client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      {
        version: 'V2',
      }
    );

    // Add totp to account
    client.totpAuthenticator = new otplib.authenticator.Authenticator();
    const totpResult = await client.createTotpToken();
    client.totpAuthenticator.options = {
      secret: totpResult.secret,
      crypto: crypto,
    };
    await client.verifyTotpCode(client.totpAuthenticator.generate());
  });

  afterEach(async function () {
    await cleanUp();
  });

  after(async () => {
    config.twilio.credentialMode = temp.credentialMode;
    await TestServer.stop(server);
    await db.destroy();
  });

  it('sets up a recovery phone', async function () {
    if (!isTwilioConfiguredForTest) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }
    const createResp = await client.recoveryPhoneCreate(phoneNumber);
    const codeSent = await redisUtil.recoveryPhone.getCode(client.uid);
    const confirmResp = await client.recoveryPhoneConfirmSetup(codeSent);
    const checkResp = await client.recoveryPhoneNumber();

    assert.equal(createResp.status, 'success');
    assert.isDefined(codeSent);
    assert.equal(confirmResp.status, 'success');
    assert.isTrue(checkResp.exists);
    assert.equal(checkResp.phoneNumber, phoneNumber);
  });

  it('can send, confirm code, verify session, and remove totp', async function () {
    if (!isTwilioConfiguredForTest) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }

    // Add recovery phone
    await client.recoveryPhoneCreate(phoneNumber);
    await client.recoveryPhoneConfirmSetup(
      await redisUtil.recoveryPhone.getCode(client.uid)
    );

    // Log back capture session status. It should be unverified, since we
    // added totp
    await client.destroySession();
    client = await Client.login(config.publicUrl, email, password, {
      version: 'V2',
    });
    const sessionStatus1 = await client.sessionStatus();
    const totpExistsResp1 = await client.checkTotpTokenExists();

    // Try sending a recovery phone code and confirming it. This should
    // Put the session back into a verified state acting as a fallback
    // for totp
    const sendResp = await client.recoveryPhoneSendCode();
    const confirmResp2 = await client.recoveryPhoneConfirmSignin(
      await redisUtil.recoveryPhone.getCode(client.uid)
    );
    const sessionStatus2 = await client.sessionStatus();

    await client.deleteTotpToken();
    const totpExistsResp2 = await client.checkTotpTokenExists();

    assert.equal(sendResp.status, 'success');
    assert.equal(confirmResp2.status, 'success');
    assert.equal(sessionStatus2.state, 'verified');
    assert.equal(sessionStatus1.state, 'unverified');
    assert.equal(totpExistsResp1.exists, true);
    assert.equal(totpExistsResp2.exists, false);
  });

  it('can remove recovery phone', async function () {
    if (!isTwilioConfiguredForTest) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }
    await client.recoveryPhoneCreate(phoneNumber);
    await client.recoveryPhoneConfirmSetup(
      await redisUtil.recoveryPhone.getCode(client.uid)
    );
    const checkResp = await client.recoveryPhoneNumber();
    const destroyResp = await client.recoveryPhoneDestroy();
    const checkResp2 = await client.recoveryPhoneNumber();

    assert.isTrue(checkResp.exists);
    assert.exists(destroyResp);
    assert.isFalse(checkResp2.exists);
  });

  it('fails to set up invalid phone number', async function () {
    if (!isTwilioConfiguredForTest) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }

    const phoneNumber = '+1234567890'; // missing digit
    let error;

    try {
      await client.recoveryPhoneCreate(phoneNumber);
    } catch (err) {
      error = err;
    }

    assert.equal(error.message, 'Invalid phone number');
  });

  it('can recreate recovery phone number', async function () {
    if (!isTwilioConfiguredForTest) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }
    await client.recoveryPhoneCreate(phoneNumber);
    const createResp = await client.recoveryPhoneCreate(phoneNumber);

    assert.equal(createResp.status, 'success');
  });

  it('fails to send a code to an unregistered phone number', async function () {
    if (!isTwilioConfiguredForTest) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }

    await client.recoveryPhoneCreate(phoneNumber);

    let error;
    try {
      await client.recoveryPhoneSendCode();
    } catch (err) {
      error = err;
    }

    assert.equal(error.message, 'Recovery phone number does not exist');
  });

  it('fails to register the same phone number again', async function () {
    if (!isTwilioConfiguredForTest) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }
    await client.recoveryPhoneCreate(phoneNumber);
    const code = await redisUtil.recoveryPhone.getCode(client.uid);
    await client.recoveryPhoneConfirmSetup(code);

    let error;
    try {
      await client.recoveryPhoneCreate(phoneNumber);
      const code = await redisUtil.recoveryPhone.getCode(client.uid);
      await client.recoveryPhoneConfirmSetup(code);
    } catch (err) {
      error = err;
    }

    assert.equal(error.message, 'Recovery phone number already exists');
  });

  it('fails to use the same code again', async function () {
    if (!isTwilioConfiguredForTest) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }
    await client.recoveryPhoneCreate(phoneNumber);
    const code = await redisUtil.recoveryPhone.getCode(client.uid);
    await client.recoveryPhoneConfirmSetup(code);

    let error;
    try {
      await client.recoveryPhoneConfirmSetup(code);
    } catch (err) {
      error = err;
    }

    assert.equal(error.message, 'Invalid or expired confirmation code');
  });
});

describe('#integration - recovery phone - feature flag check', () => {
  let server;
  const temp = {};

  before(async function () {
    temp.enabled = config.recoveryPhone.enabled;
    temp.credentialMode = config.twilio.credentialMode;

    config.recoveryPhone.enabled = false;
    config.twilio.credentialMode = 'test';
    config.securityHistory.ipProfiling.allowedRecency = 0;
    config.signinConfirmation.skipForNewAccounts.enabled = false;
    server = await TestServer.start(config, true);
  });

  after(async function () {
    config.recoveryPhone.enabled = temp.enabled;
    config.twilio.credentialMode = temp.credentialMode;
    await TestServer.stop(server);
  });

  it('returns feature not enabled error', async () => {
    try {
      const email = server.uniqueEmail();
      const client = await Client.createAndVerify(
        config.publicUrl,
        email,
        'topsecretz',
        server.mailbox,
        {
          version: 'V2',
        }
      );
      client.totpAuthenticator = new otplib.authenticator.Authenticator();
      const totpResult = await client.createTotpToken();
      client.totpAuthenticator.options = {
        secret: totpResult.secret,
        crypto: crypto,
      };
      await client.verifyTotpCode(client.totpAuthenticator.generate());
      await client.recoveryPhoneCreate('+14159929960');
      assert.fail('Should have received an error');
    } catch (err) {
      assert.equal(err.message, 'Feature not enabled');
    }
  });
});

describe(`#integration - recovery phone - customs checks`, function () {
  let email;
  let client;
  let server;

  const backupConfig = {
    customsUrl: config.customsUrl,
  };
  const password = 'password';
  const phoneNumber = '+14159929960';

  before(async function () {
    config.recoveryPhone.enabled = true;
    config.securityHistory.ipProfiling.allowedRecency = 0;
    config.signinConfirmation.skipForNewAccounts.enabled = false;
    config.customsUrl = 'http://127.0.0.1:7000';
    server = await TestServer.start(config, undefined, {
      enableCustomsChecks: true,
    });
  });

  after(async () => {
    config.customsUrl = backupConfig.customsUrl;
    await TestServer.stop(server);
  });

  beforeEach(async function () {
    email = server.uniqueEmail();
    client = await Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox,
      {
        version: 'V2',
      }
    );
  });

  afterEach(async function () {
    await redisUtil.recoveryPhone.clearAll();
    await redisUtil.customs.clearAll();
  });

  it('prevents excessive calls to /recovery_phone/create', async function () {
    if (!isTwilioConfiguredForTest) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }

    await client.recoveryPhoneCreate(phoneNumber);

    let error;
    try {
      for (let i = 0; i < 9; i++) {
        await client.recoveryPhoneCreate(phoneNumber);
      }
    } catch (err) {
      error = err;
    }

    assert.isDefined(error);
    assert.equal(error.message, 'Client has sent too many requests');
  });

  it('prevents excessive calls to /recovery_phone/confirm', async function () {
    if (!isTwilioConfiguredForTest) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }

    // One code gets sent here
    await client.recoveryPhoneCreate(phoneNumber);

    // Send 15 more codes, for a total of 16 codes.
    for (let i = 0; i < 15; i++) {
      try {
        await client.recoveryPhoneConfirmSetup('000001');
      } catch {}
    }

    // The 16th code should get throttled.
    let error;
    try {
      await client.recoveryPhoneConfirmSetup('000001');
    } catch (err) {
      error = err;
    }
    assert.isDefined(error);
    assert.equal(error.message, 'Client has sent too many requests');
  });

  it('prevents excessive calls to /recovery_phone/signin/send_code', async function () {
    if (!isTwilioConfiguredForTest) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }

    await client.recoveryPhoneCreate(phoneNumber);
    const codeSent = await redisUtil.recoveryPhone.getCode(client.uid, 0);
    await client.recoveryPhoneConfirmSetup(codeSent);

    let error;
    try {
      for (let i = 0; i < 7; i++) {
        await client.recoveryPhoneSendCode();
      }
    } catch (err) {
      error = err;
    }

    assert.isDefined(error);
    assert.equal(error.message, 'Client has sent too many requests');
  });
});
