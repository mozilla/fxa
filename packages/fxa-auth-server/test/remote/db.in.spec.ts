/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';
import crypto from 'crypto';

const base64url = require('base64url');
const config = require('../../config').default.getProperties();
const sinon = require('sinon');
const UnblockCode = require('../../lib/crypto/random').base32(
  config.signinUnblock.codeLength
);
const uuid = require('uuid');
const { normalizeEmail } = require('fxa-shared').email.helpers;
const ioredis = require('ioredis');

const log = { debug() {}, trace() {}, info() {}, error() {} };

const lastAccessTimeUpdates = {
  enabled: true,
  sampleRate: 1,
};
const Token = require('../../lib/tokens')(log, {
  lastAccessTimeUpdates: lastAccessTimeUpdates,
  tokenLifetimes: {
    sessionTokenWithoutDevice: 2419200000,
  },
});

const tokenPruning = {
  enabled: true,
  maxAge: 1000 * 60 * 60,
};
const { createDB } = require('../../lib/db');
const DB = createDB(
  {
    lastAccessTimeUpdates,
    signinCodeSize: config.signinCodeSize,
    redis: {
      enabled: true,
      ...config.redis,
      ...config.redis.sessionTokens,
    },
    securityHistory: {
      ipHmacKey: 'test',
    },
    tokenLifetimes: {},
    tokenPruning,
    totp: {
      recoveryCodes: {
        length: 10,
      },
    },
  },
  log,
  Token,
  UnblockCode
);

const zeroBuffer16 = Buffer.from(
  '00000000000000000000000000000000',
  'hex'
).toString('hex');
const zeroBuffer32 = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000',
  'hex'
).toString('hex');

let server: TestServerInstance;
let account: any;
let secondEmail: string;
let db: any;
let redis: any;

beforeAll(async () => {
  redis = ioredis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    prefix: config.redis.sessionTokens.prefix,
    enable_offline_queue: false,
  });
  server = await createTestServer();
  db = await DB.connect(config);
}, 120000);

afterAll(async () => {
  await db.close();
  await redis.quit();
  await server.stop();
});

beforeEach(async () => {
  account = {
    uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
    email: server.uniqueEmail(),
    emailCode: zeroBuffer16,
    emailVerified: false,
    verifierVersion: 1,
    verifyHash: zeroBuffer32,
    authSalt: zeroBuffer32,
    kA: zeroBuffer32,
    wrapWrapKb: zeroBuffer32,
    tokenVerificationId: zeroBuffer16,
  };

  const createdAccount = await db.createAccount(account);
  expect(createdAccount.uid).toEqual(account.uid);

  secondEmail = server.uniqueEmail();
  const emailData = {
    email: secondEmail,
    emailCode: crypto.randomBytes(16).toString('hex'),
    normalizedEmail: normalizeEmail(secondEmail),
    isVerified: true,
    isPrimary: false,
    uid: account.uid,
  };
  await db.createEmail(account.uid, emailData);

  // Ensure redis is empty for the uid
  await redis.del(account.uid);
});

describe('#integration - remote db', () => {
  it('ping', async () => {
    await db.ping();
  });

  it('account creation', async () => {
    const exists = await db.accountExists(account.email);
    expect(exists).toBeTruthy();

    const acct = await db.account(account.uid);
    expect(acct.uid).toEqual(account.uid);
    expect(acct.email).toBe(account.email);
    expect(acct.emailCode).toEqual(account.emailCode);
    expect(acct.emailVerified).toBe(account.emailVerified);
    expect(acct.kA).toEqual(account.kA);
    expect(acct.wrapWrapKb).toEqual(account.wrapWrapKb);
    expect(acct.verifyHash).toBeFalsy();
    expect(acct.authSalt).toEqual(account.authSalt);
    expect(acct.verifierVersion).toBe(account.verifierVersion);
    expect(acct.createdAt).toBeTruthy();
  });

  it('session token handling', async () => {
    // Fetch all sessions for the account
    let sessions = await db.sessions(account.uid);
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBe(0);

    // Fetch the email record
    let emailRecord = await db.emailRecord(account.email);
    emailRecord.createdAt = Date.now() - 1000;
    emailRecord.tokenVerificationId = account.tokenVerificationId;
    emailRecord.uaBrowser = 'Firefox';
    emailRecord.uaBrowserVersion = '41';
    emailRecord.uaOS = 'Mac OS X';
    emailRecord.uaOSVersion = '10.10';
    emailRecord.uaDeviceType = emailRecord.uaFormFactor = null;

    // Create a session token
    const sessionToken = await db.createSessionToken(emailRecord);
    expect(sessionToken.uid).toEqual(account.uid);
    const tokenId = sessionToken.id;

    // Fetch all sessions for the account
    sessions = await db.sessions(account.uid);
    expect(sessions.length).toBe(1);
    expect(typeof sessions[0].id).toBe('string');
    expect(sessions[0].uid).toBe(account.uid);
    expect(sessions[0].createdAt >= account.createdAt).toBe(true);
    expect(sessions[0].uaBrowser).toBe('Firefox');
    expect(sessions[0].uaBrowserVersion).toBe('41');
    expect(sessions[0].uaOS).toBe('Mac OS X');
    expect(sessions[0].uaOSVersion).toBe('10.10');
    expect(sessions[0].uaDeviceType).toBeNull();
    expect(sessions[0].uaFormFactor).toBeNull();
    expect(sessions[0].lastAccessTime).toBe(sessions[0].createdAt);
    expect(sessions[0].authAt).toBe(sessions[0].createdAt);
    expect(sessions[0].location).toBeUndefined();
    expect(sessions[0].deviceId).toBeNull();
    expect(sessions[0].deviceAvailableCommands).toBeNull();

    // Fetch the session token
    let fetchedToken = await db.sessionToken(tokenId);
    expect(fetchedToken.id).toBe(tokenId);
    expect(fetchedToken.uaBrowser).toBe('Firefox');
    expect(fetchedToken.uaBrowserVersion).toBe('41');
    expect(fetchedToken.uaOS).toBe('Mac OS X');
    expect(fetchedToken.uaOSVersion).toBe('10.10');
    expect(fetchedToken.uaDeviceType).toBeNull();
    expect(fetchedToken.lastAccessTime).toBe(fetchedToken.createdAt);
    expect(fetchedToken.uid).toBe(account.uid);
    expect(fetchedToken.email).toBe(account.email);
    expect(fetchedToken.emailCode).toBe(account.emailCode);
    expect(fetchedToken.emailVerified).toBe(account.emailVerified);
    expect(fetchedToken.lifetime < Infinity).toBe(true);

    // Disable session token updates
    lastAccessTimeUpdates.enabled = false;

    // Attempt to update the session token
    const result = await db.touchSessionToken(fetchedToken, {});
    expect(result).toBeUndefined();

    // Fetch all sessions for the account
    sessions = await db.sessions(account.uid);
    expect(sessions.length).toBe(1);
    expect(sessions[0].uid).toBe(account.uid);
    expect(sessions[0].lastAccessTime == null).toBe(true);
    expect(sessions[0].location == null).toBe(true);

    // Re-enable session token updates
    lastAccessTimeUpdates.enabled = true;

    // Fetch the session token
    fetchedToken = await db.sessionToken(tokenId);

    // Update the session token
    await db.touchSessionToken(
      Object.assign({}, fetchedToken, {
        lastAccessTime: Date.now(),
      }),
      {
        location: {
          city: 'Bournemouth',
          country: 'United Kingdom',
          countryCode: 'GB',
          state: 'England',
          stateCode: 'EN',
        },
        timeZone: 'Europe/London',
      }
    );

    // Fetch all sessions for the account
    sessions = await db.sessions(account.uid);
    expect(sessions.length).toBe(1);
    expect(sessions[0].uid).toBe(account.uid);
    expect(sessions[0].lastAccessTime > sessions[0].createdAt).toBe(true);
    expect(sessions[0].location.city).toBe('Bournemouth');
    expect(sessions[0].location.country).toBe('United Kingdom');
    expect(sessions[0].location.countryCode).toBe('GB');
    expect(sessions[0].location.state).toBe('England');
    expect(sessions[0].location.stateCode).toBe('EN');
    expect(sessions[0].location.timeZone).toBeUndefined();

    // Fetch the session token
    fetchedToken = await db.sessionToken(tokenId);

    // Update the session token with new UA
    await db.touchSessionToken(
      Object.assign({}, fetchedToken, {
        uaBrowser: 'Firefox Mobile',
        uaBrowserVersion: '42',
        uaOS: 'Android',
        uaOSVersion: '4.4',
        uaDeviceType: 'mobile',
        uaFormFactor: null,
      }),
      {}
    );

    // Fetch all sessions for the account
    sessions = await db.sessions(account.uid);
    expect(sessions.length).toBe(1);
    expect(sessions[0].uaBrowser).toBe('Firefox Mobile');
    expect(sessions[0].uaBrowserVersion).toBe('42');
    expect(sessions[0].uaOS).toBe('Android');
    expect(sessions[0].uaOSVersion).toBe('4.4');
    expect(sessions[0].uaDeviceType).toBe('mobile');
    expect(sessions[0].uaFormFactor).toBeNull();
    expect(sessions[0].location.country).toBe('United Kingdom');

    // Fetch the session token
    fetchedToken = await db.sessionToken(tokenId);
    // this returns previously stored data since sessionToken doesn't read from cache
    expect(fetchedToken.uaBrowser).toBe('Firefox');
    expect(fetchedToken.uaBrowserVersion).toBe('41');
    expect(fetchedToken.uaOS).toBe('Mac OS X');
    expect(fetchedToken.uaOSVersion).toBe('10.10');
    expect(fetchedToken.lastAccessTime).toBe(fetchedToken.createdAt);

    // Attempt to prune a session token that is younger than maxAge
    fetchedToken.createdAt = Date.now() - tokenPruning.maxAge + 10000;
    await db.pruneSessionTokens(account.uid, [fetchedToken]);

    // Fetch all sessions for the account
    sessions = await db.sessions(account.uid);
    expect(sessions.length).toBe(1);
    expect(sessions[0].uaBrowser).toBe('Firefox Mobile');
    expect(sessions[0].uaBrowserVersion).toBe('42');
    expect(sessions[0].uaOS).toBe('Android');
    expect(sessions[0].uaOSVersion).toBe('4.4');
    expect(sessions[0].uaDeviceType).toBe('mobile');
    expect(sessions[0].uaFormFactor).toBeNull();

    // Fetch the session token
    fetchedToken = await db.sessionToken(tokenId);

    // Prune a session token that is older than maxAge
    fetchedToken.createdAt = Date.now() - tokenPruning.maxAge - 1;
    await db.pruneSessionTokens(account.uid, [fetchedToken]);

    // Fetch all sessions for the account
    sessions = await db.sessions(account.uid);
    expect(sessions.length).toBe(1);
    expect(sessions[0].uaBrowser).toBe('Firefox');
    expect(sessions[0].uaBrowserVersion).toBe('41');
    expect(sessions[0].uaOS).toBe('Mac OS X');
    expect(sessions[0].uaOSVersion).toBe('10.10');
    expect(sessions[0].uaDeviceType).toBeNull();
    expect(sessions[0].uaFormFactor).toBeNull();

    // Fetch the session token
    fetchedToken = await db.sessionToken(tokenId);

    // Delete the session token
    await db.deleteSessionToken(fetchedToken);

    // Fetch all sessions for the account
    sessions = await db.sessions(account.uid);
    expect(sessions.length).toBe(0);

    // Attempt to fetch the deleted session token
    try {
      await db.sessionToken(tokenId);
      fail('db.sessionToken should have failed');
    } catch (err: any) {
      expect(err.errno).toBe(110);
      expect(`${err}`).toBe(
        'Error: The authentication token could not be found'
      );
    }

    // Fetch the email record again
    emailRecord = await db.emailRecord(account.email);
    emailRecord.createdAt = Date.now() - 1000;
    emailRecord.tokenVerificationId = account.tokenVerificationId;
    emailRecord.uaBrowser = 'Firefox';
    emailRecord.uaBrowserVersion = '41';
    emailRecord.uaOS = 'Mac OS X';
    emailRecord.uaOSVersion = '10.10';
    emailRecord.uaDeviceType = emailRecord.uaFormFactor = null;

    // Create a session token with the same data as the deleted token
    await db.createSessionToken(emailRecord);

    // Fetch all sessions for the account
    sessions = await db.sessions(account.uid);
    // Make sure that the data got deleted from redis too
    expect(sessions.length).toBe(1);
    expect(sessions[0].lastAccessTime).toBe(sessions[0].createdAt);
    expect(sessions[0].location).toBeUndefined();

    // Delete the session token again
    await db.deleteSessionToken(sessions[0]);

    const redisResult = await redis.get(account.uid);
    expect(redisResult).toBeNull();
  });

  it('device registration', async () => {
    let sessionToken: any;
    let anotherSessionToken: any;
    const deviceInfo: any = {
      id: crypto.randomBytes(16).toString('hex'),
      name: '',
      type: 'mobile',
      availableCommands: { foo: 'bar', wibble: 'wobble' },
      pushCallback: 'https://foo/bar',
      pushPublicKey: base64url(
        Buffer.concat([Buffer.from('\x04'), crypto.randomBytes(64)])
      ),
      pushAuthKey: base64url(crypto.randomBytes(16)),
    };
    const conflictingDeviceInfo: any = {
      id: crypto.randomBytes(16).toString('hex'),
      name: 'wibble',
    };

    let emailRecord = await db.emailRecord(account.email);
    emailRecord.tokenVerificationId = account.tokenVerificationId;
    emailRecord.uaBrowser = 'Firefox Mobile';
    emailRecord.uaBrowserVersion = '41';
    emailRecord.uaOS = 'Android';
    emailRecord.uaOSVersion = '4.4';
    emailRecord.uaDeviceType = 'mobile';
    emailRecord.uaFormFactor = null;

    // Create a session token
    sessionToken = await db.createSessionToken(emailRecord);
    deviceInfo.sessionTokenId = sessionToken.id;

    // Attempt to update a non-existent device
    try {
      await db.updateDevice(account.uid, deviceInfo);
      fail('updating a non-existent device should have failed');
    } catch (err: any) {
      expect(err.errno).toBe(123);
    }

    // Attempt to delete a non-existent device
    try {
      await db.deleteDevice(account.uid, deviceInfo.id);
      fail('deleting a non-existent device should have failed');
    } catch (err: any) {
      expect(err.errno).toBe(123);
    }

    // Fetch all of the devices for the account
    let devices = await db.devices(account.uid);
    expect(Array.isArray(devices)).toBe(true);
    expect(devices.length).toBe(0);

    // Create a device
    const device = await db.createDevice(account.uid, deviceInfo);
    expect(device.id).toBeTruthy();
    expect(device.createdAt > 0).toBe(true);
    expect(device.name).toBe(deviceInfo.name);
    expect(device.type).toBe(deviceInfo.type);
    expect(device.availableCommands).toEqual(deviceInfo.availableCommands);
    expect(device.pushCallback).toBe(deviceInfo.pushCallback);
    expect(device.pushPublicKey).toBe(deviceInfo.pushPublicKey);
    expect(device.pushAuthKey).toBe(deviceInfo.pushAuthKey);
    expect(device.pushEndpointExpired).toBe(false);

    // Fetch the session token
    sessionToken = await db.sessionToken(sessionToken.id);
    expect(sessionToken.lifetime).toBe(Infinity);
    conflictingDeviceInfo.sessionTokenId = sessionToken.id;

    // Attempt to create a device with a duplicate session token
    try {
      await db.createDevice(account.uid, conflictingDeviceInfo);
      fail('adding a device with a duplicate session token should have failed');
    } catch (err: any) {
      expect(err.errno).toBe(124);
      expect(err.output.payload.deviceId).toBe(deviceInfo.id);
    }

    // Fetch all of the devices for the account
    devices = await db.devices(account.uid);
    expect(devices.length).toBe(1);
    let fetchedDevice = devices[0];

    expect(fetchedDevice.id).toBeTruthy();
    expect(fetchedDevice.lastAccessTime > 0).toBe(true);
    expect(fetchedDevice.name).toBe(deviceInfo.name);
    expect(fetchedDevice.type).toBe(deviceInfo.type);
    expect(fetchedDevice.availableCommands).toEqual(
      deviceInfo.availableCommands
    );
    expect(fetchedDevice.pushCallback).toBe(deviceInfo.pushCallback);
    expect(fetchedDevice.pushPublicKey).toBe(deviceInfo.pushPublicKey);
    expect(fetchedDevice.pushAuthKey).toBe(deviceInfo.pushAuthKey);
    expect(fetchedDevice.pushEndpointExpired).toBe(false);
    expect(fetchedDevice.uaBrowser).toBe('Firefox Mobile');
    expect(fetchedDevice.uaBrowserVersion).toBe('41');
    expect(fetchedDevice.uaOS).toBe('Android');
    expect(fetchedDevice.uaOSVersion).toBe('4.4');
    expect(fetchedDevice.uaDeviceType).toBe('mobile');
    expect(fetchedDevice.uaFormFactor).toBeNull();
    expect(fetchedDevice.location).toBeUndefined();

    deviceInfo.id = fetchedDevice.id;
    deviceInfo.name = 'wibble';
    deviceInfo.type = 'desktop';
    deviceInfo.availableCommands = {};
    deviceInfo.pushCallback = '';
    deviceInfo.pushPublicKey = '';
    deviceInfo.pushAuthKey = '';
    deviceInfo.sessionTokenId = sessionToken.id;
    sessionToken.lastAccessTime = 42;
    sessionToken.uaBrowser = 'Firefox';
    sessionToken.uaBrowserVersion = '44';
    sessionToken.uaOS = 'Mac OS X';
    sessionToken.uaOSVersion = '10.10';
    sessionToken.uaFormFactor = null;

    // Update the device and the session token
    await Promise.all([
      db.updateDevice(account.uid, deviceInfo),
      db.touchSessionToken(sessionToken, {
        location: {
          city: 'Mountain View',
          country: 'United States',
          countryCode: 'US',
          state: 'California',
          stateCode: 'CA',
        },
        timeZone: 'America/Los_Angeles',
      }),
    ]);

    // Create another session token
    anotherSessionToken = await db.createSessionToken(sessionToken);
    conflictingDeviceInfo.sessionTokenId = anotherSessionToken.id;

    // Create another device
    await db.createDevice(account.uid, conflictingDeviceInfo);

    // Attempt to update a device with a duplicate session token
    deviceInfo.sessionTokenId = anotherSessionToken.id;
    try {
      await db.updateDevice(account.uid, deviceInfo);
      fail(
        'updating a device with a duplicate session token should have failed'
      );
    } catch (err: any) {
      expect(err.errno).toBe(124);
      expect(err.output.payload.deviceId).toBe(conflictingDeviceInfo.id);
    }

    // Fetch all of the devices for the account
    devices = await db.devices(account.uid);
    expect(devices.length).toBe(2);

    fetchedDevice =
      devices[0].id === deviceInfo.id ? devices[0] : devices[1];

    // Fetch a single device
    const singleDevice = await db.device(account.uid, fetchedDevice.id);
    expect(singleDevice).toEqual(fetchedDevice);

    expect(fetchedDevice.lastAccessTime).toBe(42);
    expect(fetchedDevice.name).toBe(deviceInfo.name);
    expect(fetchedDevice.type).toBe(deviceInfo.type);
    expect(fetchedDevice.availableCommands).toEqual(
      deviceInfo.availableCommands
    );
    expect(fetchedDevice.pushCallback).toBe(deviceInfo.pushCallback);
    expect(fetchedDevice.pushPublicKey).toBe('');
    expect(fetchedDevice.pushAuthKey).toBe('');
    expect(fetchedDevice.pushEndpointExpired).toBe(false);
    expect(fetchedDevice.uaBrowser).toBe('Firefox');
    expect(fetchedDevice.uaBrowserVersion).toBe('44');
    expect(fetchedDevice.uaOS).toBe('Mac OS X');
    expect(fetchedDevice.uaOSVersion).toBe('10.10');
    expect(fetchedDevice.uaDeviceType).toBe('mobile');
    expect(fetchedDevice.uaFormFactor).toBeNull();
    expect(fetchedDevice.location.city).toBe('Mountain View');
    expect(fetchedDevice.location.country).toBe('United States');
    expect(fetchedDevice.location.countryCode).toBe('US');
    expect(fetchedDevice.location.state).toBe('California');
    expect(fetchedDevice.location.stateCode).toBe('CA');

    // Disable session token updates
    lastAccessTimeUpdates.enabled = false;
    devices = await db.devices(account.uid);
    expect(devices.length).toBe(2);
    expect(devices[0].lastAccessTime).toBeUndefined();
    expect(devices[1].lastAccessTime).toBeUndefined();

    // Re-enable session token updates
    lastAccessTimeUpdates.enabled = true;

    // Delete the devices
    await db.deleteDevice(account.uid, deviceInfo.id);
    // Deleting these serially ensures there's no Redis WATCH conflict for account.uid
    await db.deleteDevice(account.uid, conflictingDeviceInfo.id);

    // Deleting the devices should also have cleared the data from Redis
    const redisResult = await redis.get(account.uid);
    expect(redisResult).toBeNull();

    // Fetch all of the devices for the account
    devices = await db.devices(account.uid);
    expect(devices.length).toBe(0);

    // Delete the account
    await db.deleteAccount(account);
  });

  it('keyfetch token handling', async () => {
    const emailRecord = await db.emailRecord(account.email);
    const keyFetchToken = await db.createKeyFetchToken({
      uid: emailRecord.uid,
      kA: emailRecord.kA,
      wrapKb: account.wrapWrapKb,
    });

    expect(keyFetchToken.uid).toEqual(account.uid);
    const tokenId = keyFetchToken.id;

    const fetched = await db.keyFetchToken(tokenId);
    expect(fetched.id).toEqual(tokenId);
    expect(fetched.uid).toEqual(account.uid);
    expect(fetched.emailVerified).toBe(account.emailVerified);

    await db.deleteKeyFetchToken(fetched);

    try {
      await db.keyFetchToken(tokenId);
      fail('keyFetchToken() should have failed');
    } catch (err: any) {
      expect(err.errno).toBe(110);
      expect(`${err}`).toBe(
        'Error: The authentication token could not be found'
      );
    }
  });

  it('reset token handling', async () => {
    const emailRecord = await db.emailRecord(account.email);
    const passwordForgotToken = await db.createPasswordForgotToken(emailRecord);
    const accountResetToken =
      await db.forgotPasswordVerified(passwordForgotToken);

    expect(accountResetToken.createdAt >= passwordForgotToken.createdAt).toBe(
      true
    );
    expect(accountResetToken.uid).toEqual(account.uid);
    const tokenId = accountResetToken.id;

    const fetched = await db.accountResetToken(tokenId);
    expect(fetched.id).toEqual(tokenId);
    expect(fetched.uid).toEqual(account.uid);

    await db.deleteAccountResetToken(fetched);

    try {
      await db.accountResetToken(tokenId);
      fail('accountResetToken() should have failed');
    } catch (err: any) {
      expect(err.errno).toBe(110);
      expect(`${err}`).toBe(
        'Error: The authentication token could not be found'
      );
    }
  });

  it('forgotpwd token handling', async () => {
    const emailRecord = await db.emailRecord(account.email);
    const token1 = await db.createPasswordForgotToken(emailRecord);

    expect(token1.uid).toEqual(account.uid);
    const token1tries = token1.tries;

    let fetched = await db.passwordForgotToken(token1.id);
    expect(fetched.id).toEqual(token1.id);
    expect(fetched.uid).toEqual(token1.uid);

    fetched.tries -= 1;
    await db.updatePasswordForgotToken(fetched);

    fetched = await db.passwordForgotToken(token1.id);
    expect(fetched.id).toEqual(token1.id);
    expect(fetched.tries).toBe(token1tries - 1);

    await db.deletePasswordForgotToken(fetched);

    try {
      await db.passwordForgotToken(token1.id);
      fail('passwordForgotToken() should have failed');
    } catch (err: any) {
      expect(err.errno).toBe(110);
      expect(`${err}`).toBe(
        'Error: The authentication token could not be found'
      );
    }
  });

  it('email verification', async () => {
    const emailRecord = await db.emailRecord(account.email);
    await db.verifyEmail(emailRecord, emailRecord.emailCode);

    const acct = await db.account(account.uid);
    expect(acct.emailVerified).toBeTruthy();
  });

  it('db.forgotPasswordVerified', async () => {
    const emailRecord = await db.emailRecord(account.email);
    const passwordForgotToken =
      await db.createPasswordForgotToken(emailRecord);
    const accountResetToken =
      await db.forgotPasswordVerified(passwordForgotToken);

    expect(accountResetToken.uid).toEqual(account.uid);

    const fetched = await db.accountResetToken(accountResetToken.id);
    expect(fetched.uid).toEqual(account.uid);

    await db.deleteAccountResetToken(accountResetToken);
  });

  it('db.resetAccount', async () => {
    const emailRecord = await db.emailRecord(account.email);
    emailRecord.tokenVerificationId = account.tokenVerificationId;
    emailRecord.uaBrowser = 'Firefox';
    emailRecord.uaBrowserVersion = '41';
    emailRecord.uaOS = 'Mac OS X';
    emailRecord.uaOSVersion = '10.10';
    emailRecord.uaDeviceType = emailRecord.uaFormFactor = null;

    const sessionToken = await db.createSessionToken(emailRecord);
    const accountResetToken =
      await db.forgotPasswordVerified(sessionToken);
    await db.resetAccount(accountResetToken, account);

    const redisResult = await redis.get(account.uid);
    expect(redisResult).toBeNull();

    // account should STILL exist for this email address
    const exists = await db.accountExists(account.email);
    expect(exists).toBe(true);
  });

  it('db.securityEvents', async () => {
    await db.securityEvent({
      ipAddr: '127.0.0.1',
      name: 'account.create',
      uid: account.uid,
    });

    const events = await db.securityEvents({
      ipAddr: '127.0.0.1',
      uid: account.uid,
    });
    expect(events.length).toBe(1);
  });

  it('db.securityEventsByUid', async () => {
    await db.securityEvent({
      ipAddr: '127.0.0.1',
      name: 'account.create',
      uid: account.uid,
    });

    const events = await db.securityEventsByUid({
      uid: account.uid,
    });
    expect(events.length).toBe(1);
  });

  it('unblock code', async () => {
    const unblockCode = await db.createUnblockCode(account.uid);
    expect(unblockCode).toBeTruthy();

    // Consume with invalid code
    try {
      await db.consumeUnblockCode(account.uid, 'NOTREAL');
      fail('consumeUnblockCode() with an invalid unblock code should not succeed');
    } catch (err: any) {
      expect(err.errno).toBe(127);
      expect(`${err}`).toBe('Error: Invalid unblock code');
    }

    // Consume with valid code
    await db.consumeUnblockCode(account.uid, unblockCode);

    // re-use unblock code, no longer valid
    try {
      await db.consumeUnblockCode(account.uid, unblockCode);
      fail('consumeUnblockCode() with a used unblock code should not succeed');
    } catch (err: any) {
      expect(err.errno).toBe(127);
      expect(`${err}`).toBe('Error: Invalid unblock code');
    }
  });

  it('signinCodes', async () => {
    const flowId = crypto.randomBytes(32).toString('hex');

    // Create a signinCode without a flowId
    const previousCode = await db.createSigninCode(account.uid);
    expect(typeof previousCode).toBe('string');
    expect(Buffer.from(previousCode, 'hex').length).toBe(
      config.signinCodeSize
    );

    // Stub crypto.randomBytes to return a duplicate code
    const stub = sinon
      .stub(crypto, 'randomBytes')
      .callsFake((size: number, callback?: any) => {
        if (!callback) {
          return previousCode;
        }
        callback(null, previousCode);
      });

    // Create a signinCode with crypto.randomBytes rigged to return a duplicate
    const code = await db.createSigninCode(account.uid, flowId);
    stub.restore();
    expect(typeof code).toBe('string');
    expect(code).not.toBe(previousCode);
    expect(Buffer.from(code, 'hex').length).toBe(config.signinCodeSize);

    // Consume both signinCodes
    const results = await Promise.all([
      db.consumeSigninCode(previousCode),
      db.consumeSigninCode(code),
    ]);
    expect(results[0].email).toBe(account.email);
    expect(results[1].email).toBe(account.email);
    if (results[1].flowId) {
      // This assertion is conditional so that tests pass regardless of db version
      expect(results[1].flowId).toBe(flowId);
    }

    // Attempt to consume a consumed signinCode
    try {
      await db.consumeSigninCode(previousCode);
      fail('db.consumeSigninCode should have failed');
    } catch (err: any) {
      expect(err.errno).toBe(146);
      expect(err.message).toBe('Invalid signin code');
      expect(err.output.statusCode).toBe(400);
    }
  });

  it('account deletion', async () => {
    const emailRecord = await db.emailRecord(account.email);
    expect(emailRecord.uid).toEqual(account.uid);

    await db.deleteAccount(emailRecord);

    const redisResult = await redis.get(account.uid);
    expect(redisResult).toBeNull();

    const exists = await db.accountExists(account.email);
    expect(exists).toBe(false);

    const deletedAccount = await db.deletedAccount(account.uid);
    expect(deletedAccount.uid).toBe(account.uid);
  });

  it('should create and delete linked account', async () => {
    const googleId = `goog_${Math.random().toString().substr(2)}`;
    await db.createLinkedAccount(account.uid, googleId, 'google');

    let records = await db.getLinkedAccounts(account.uid);
    expect(records.length).toBe(1);
    const record = records[0];
    expect(record.uid).toBe(account.uid);
    expect(record.providerId).toBe(1);
    expect(record.enabled).toBe(true);
    expect(record.id).toBe(googleId);

    await db.deleteAccount({ ...account });

    const exists = await db.accountExists(account.email);
    expect(exists).toBe(false);

    records = await db.getLinkedAccounts(account.uid);
    expect(records.length).toBe(0);
  });

  describe('account record', () => {
    it('can retrieve account from account email', async () => {
      const [emailRecord, accountRecord] = await Promise.all([
        db.emailRecord(account.email),
        db.accountRecord(account.email),
      ]);
      expect(emailRecord.email).toBe(accountRecord.email);
      expect(emailRecord.emails).toEqual(accountRecord.emails);
      expect(emailRecord.primaryEmail).toEqual(accountRecord.primaryEmail);
    });

    it('can retrieve account from secondary email', async () => {
      const [accountRecord, accountRecordFromSecondEmail] = await Promise.all([
        db.accountRecord(account.email),
        db.accountRecord(secondEmail),
      ]);
      expect(accountRecordFromSecondEmail.email).toBe(accountRecord.email);
      expect(accountRecordFromSecondEmail.emails).toEqual(
        accountRecord.emails
      );
      expect(accountRecordFromSecondEmail.primaryEmail).toEqual(
        accountRecord.primaryEmail
      );
    });

    it('can retrieve linked account', async () => {
      const googleId = `goog_${Math.random().toString().substr(2)}`;
      const linkedAccount = await db.createLinkedAccount(
        account.uid,
        googleId,
        'google'
      );
      // linkedAccount UID comes back as a buffer but we want a hex string
      if (linkedAccount.uid instanceof Buffer) {
        linkedAccount.uid = linkedAccount.uid.toString('hex');
      }

      const accountRecord = await db.accountRecord(account.email, {
        linkedAccounts: true,
      });
      expect(accountRecord.linkedAccounts[0]).toEqual(linkedAccount);
    });

    it('does not retrieve linked account without option specified', async () => {
      const googleId = `goog_${Math.random().toString().substr(2)}`;
      await db.createLinkedAccount(account.uid, googleId, 'google');
      const accountRecord = await db.accountRecord(account.email);
      expect(accountRecord.linkedAccounts).toBeUndefined();
    });

    it('returns unknown account', async () => {
      try {
        await db.accountRecord('idontexist@email.com');
        fail('should not have retrieved non-existent account');
      } catch (err: any) {
        expect(err.errno).toBe(102);
      }
    });
  });

  describe('set primary email', () => {
    it('can set primary email address', async () => {
      await db.setPrimaryEmail(account.uid, secondEmail);
      const acct = await db.accountRecord(secondEmail);
      expect(acct.primaryEmail.email).toBe(secondEmail);
    });
  });
});
