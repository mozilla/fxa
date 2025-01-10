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

const { assert } = chai;
chai.use(chaiAsPromised);

const redis = new Redis({
  ...config.redis,
  ...config.recoveryPhone.redis,
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
    async getCode(uid, index) {
      const redisKey = `recovery-phone:sms-attempt:${uid}:*`;
      const result = await redis.keys(redisKey);
      assert.equal(result.length, index + 1);
      const parts = result[index].split(':');
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

const isTwilioConfigured =
  config.twilio.accountSid?.length >= 24 &&
  config.twilio.accountSid?.startsWith('AC') &&
  config.twilio.authToken?.length >= 24;

describe(`#integration - recovery phone`, function () {
  let server;
  let client;
  let email;
  let db;

  // Since ware calling the phone number lookup API, this must be a valid 'magic number' for testing.
  // Different magic numbers correspond to different scenarios. e.g. reassigned numbers, sim swapping,
  // etc. See the following documentation for info in the event tests need to consider extra states.
  // https://www.twilio.com/docs/lookup/magic-numbers-for-lookup
  const phoneNumber = '+12345678900';
  const password = 'password';

  before(async function () {
    config.securityHistory.ipProfiling.allowedRecency = 0;
    config.signinConfirmation.skipForNewAccounts.enabled = false;
    server = await TestServer.start(config);
    db = await setupAccountDatabase(config.database.mysql.auth);
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
    await db.deleteFrom('recoveryPhones').execute();
  });

  after(async () => {
    await TestServer.stop(server);
  });

  it('setups a recovery phone', async function () {
    if (!isTwilioConfigured) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }
    const createResp = await client.recoveryPhoneNumberCreate(phoneNumber);
    const codeSent = await redisUtil.recoveryPhone.getCode(client.uid, 0);
    const confirmResp = await client.recoveryPhoneConfirm(codeSent);
    const checkResp = await client.recoveryPhoneNumber();

    assert.equal(createResp.status, 'success');
    assert.isDefined(codeSent);
    assert.equal(confirmResp.status, 'success');
    assert.isTrue(checkResp.exists);
    assert.equal(checkResp.phoneNumber, phoneNumber);
  });

  it('can send, confirm code, and verify session', async function () {
    if (!isTwilioConfigured) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }
    // The phone must be registered first
    await client.recoveryPhoneNumberCreate(phoneNumber);
    const code1 = await redisUtil.recoveryPhone.getCode(client.uid, 0);
    await client.recoveryPhoneConfirm(code1);

    // Now we can send a code
    const sendResp = await client.recoveryPhoneSendCode();
    const code2 = await redisUtil.recoveryPhone.getCode(client.uid, 1);
    // TODO: FXA-10945
    // const confirmResp = await client.recoveryPhoneConfirm(code2);

    assert.equal(sendResp.status, 'success');
    assert.isDefined(code2);
    // assert.equal(confirmResp.status, 'success');
    // TODO: Check session verified.
  });

  it('can remove recovery phone', async function () {
    if (!isTwilioConfigured) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }
    await client.recoveryPhoneNumberCreate(phoneNumber);
    await client.recoveryPhoneConfirm(
      await redisUtil.recoveryPhone.getCode(client.uid, 0)
    );
    const checkResp = await client.recoveryPhoneNumber();
    const destroyResp = await client.recoveryPhoneDestroy();
    const checkResp2 = await client.recoveryPhoneNumber();

    assert.isTrue(checkResp.exists);
    assert.exists(destroyResp);
    assert.isFalse(checkResp2.exists);
  });

  it('fails to setup invalid phone number', async function () {
    if (!isTwilioConfigured) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }

    const phoneNumber = '+1234567890'; // missing digit
    let error;

    try {
      await client.recoveryPhoneNumberCreate(phoneNumber);
    } catch (err) {
      error = err;
    }

    assert.equal(error.message, 'Invalid phone number');
  });

  it('it can recreate recovery phone number', async function () {
    if (!isTwilioConfigured) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }
    await client.recoveryPhoneNumberCreate(phoneNumber);
    const createResp = await client.recoveryPhoneNumberCreate(phoneNumber);

    assert.equal(createResp.status, 'success');
  });

  it('fails to send a code to an unregistered phone number', async function () {
    if (!isTwilioConfigured) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }

    await client.recoveryPhoneNumberCreate(phoneNumber);

    let error;
    try {
      await client.recoveryPhoneSendCode();
    } catch (err) {
      error = err;
    }

    assert.equal(error.message, 'Recovery phone number does not exist');
  });

  it('fails to register the same phone number again', async function () {
    if (!isTwilioConfigured) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }
    await client.recoveryPhoneNumberCreate(phoneNumber);
    const code = await redisUtil.recoveryPhone.getCode(client.uid, 0);
    await client.recoveryPhoneConfirm(code);

    let error;
    try {
      await client.recoveryPhoneConfirm(code);
    } catch (err) {
      error = err;
    }

    assert.equal(error.message, 'Recovery phone number already exists');
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
  const phoneNumber = '+12345678900';

  before(async function () {
    config.securityHistory.ipProfiling.allowedRecency = 0;
    config.signinConfirmation.skipForNewAccounts.enabled = false;
    config.customsUrl = 'http://127.0.0.1:7000';
    server = await TestServer.start(config);
  });

  after(async () => {
    config.customsUrl = backupConfig.customsUrl;
    await TestServer.stop(server);
  });

  beforeEach(async function () {
    email = server.uniqueEmail(null, true);
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

  it('prevents excessive calls to /recovery-phone/confirm', async function () {
    if (!isTwilioConfigured) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }

    // One code gets sent here
    await client.recoveryPhoneNumberCreate(phoneNumber);

    // Send 8 more codes, for a total of 9 codes.
    for (let i = 0; i < 9; i++) {
      try {
        await client.recoveryPhoneConfirm('000001');
      } catch {}
    }

    // The 10th code should get throttled.
    let error;
    try {
      await client.recoveryPhoneConfirm('000001');
    } catch (err) {
      error = err;
    }
    assert.isDefined(error);
    assert.equal(error.message, 'Client has sent too many requests');
  });

  it('prevents excessive calls to /recovery-phone/send-code', async function () {
    if (!isTwilioConfigured) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }

    await client.recoveryPhoneNumberCreate(phoneNumber);
    const codeSent = await redisUtil.recoveryPhone.getCode(client.uid, 0);
    await client.recoveryPhoneConfirm(codeSent);

    let error;
    try {
      for (let i = 0; i < 20; i++) {
        await client.recoveryPhoneSendCode();
      }
    } catch (err) {
      error = err;
    }

    assert.isDefined(error);
    assert.equal(error.message, 'Client has sent too many requests');
  });

  it('prevents excessive calls to /recovery-phone/available', async function () {
    if (!isTwilioConfigured) {
      this.skip('Invalid twilio accountSid or authToken. Check env / config!');
    }

    for (let i = 0; i < 10; i++) {
      await client.recoveryPhoneAvailable();
    }

    let error;
    try {
      await client.recoveryPhoneAvailable();
    } catch (err) {
      error = err;
    }

    assert.isDefined(error);
    assert.equal(error.message, 'Client has sent too many requests');
  });
});
