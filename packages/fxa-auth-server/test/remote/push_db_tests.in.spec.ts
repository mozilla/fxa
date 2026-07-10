/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import base64url from 'base64url';
import * as uuid from 'uuid';
import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const log = { trace() {}, info() {}, error() {}, debug() {}, warn() {} };
const config = require('../../config').default.getProperties();
const Token = require('../../lib/tokens')(log);
const { createDB } = require('../../lib/db');
const mockStatsD = { increment: () => {} };
const DB = createDB(config, log, Token);

const zeroBuffer16 = Buffer.from(
  '00000000000000000000000000000000',
  'hex'
).toString('hex');
const zeroBuffer32 = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000',
  'hex'
).toString('hex');

const SESSION_TOKEN_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:41.0) Gecko/20100101 Firefox/41.0';
const ACCOUNT = {
  uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
  email: `push${Math.random()}@bar.com`,
  emailCode: zeroBuffer16,
  emailVerified: false,
  verifierVersion: 1,
  verifyHash: zeroBuffer32,
  authSalt: zeroBuffer32,
  kA: zeroBuffer32,
  wrapWrapKb: zeroBuffer32,
  tokenVerificationId: zeroBuffer16,
};
const mockLog2 = {
  debug() {},
  error() {},
  warn() {},
  increment() {},
  trace() {},
  info() {},
};

let server: TestServerInstance;
let db: any;

beforeAll(async () => {
  server = await createTestServer();
  db = await DB.connect(config);
}, 120000);

afterAll(async () => {
  await db.close();
  await server.stop();
});

describe('#integration - remote push db', () => {
  it('push db tests', async () => {
    const deviceInfo: any = {
      id: crypto.randomBytes(16).toString('hex'),
      name: 'my push device',
      type: 'mobile',
      availableCommands: { foo: 'bar' },
      pushCallback: 'https://foo/bar',
      pushPublicKey: base64url(
        Buffer.concat([Buffer.from('\x04'), crypto.randomBytes(64)])
      ),
      pushAuthKey: base64url(crypto.randomBytes(16)),
      pushEndpointExpired: false,
    };

    await db.createAccount(ACCOUNT);
    const emailRecord = await db.emailRecord(ACCOUNT.email);
    emailRecord.createdAt = Date.now();
    const sessionToken = await db.createSessionToken(emailRecord, SESSION_TOKEN_UA);

    deviceInfo.sessionTokenId = sessionToken.id;
    const device = await db.createDevice(ACCOUNT.uid, deviceInfo);
    expect(device.name).toBe(deviceInfo.name);
    expect(device.pushCallback).toBe(deviceInfo.pushCallback);
    expect(device.pushPublicKey).toBe(deviceInfo.pushPublicKey);
    expect(device.pushAuthKey).toBe(deviceInfo.pushAuthKey);

    let devices = await db.devices(ACCOUNT.uid);

    // First: unknown 400 level error — device push info should stay the same
    jest.resetModules();
    jest.doMock('web-push', () => ({
      sendNotification() {
        const err: any = new Error('Failed 429 level');
        err.statusCode = 429;
        return Promise.reject(err);
      },
    }));
    const pushWithUnknown400 = require('../../lib/push')(
      mockLog2, db, {}, mockStatsD
    );
    await pushWithUnknown400.sendPush(ACCOUNT.uid, devices, 'accountVerify');

    devices = await db.devices(ACCOUNT.uid);
    let d = devices[0];
    expect(d.name).toBe(deviceInfo.name);
    expect(d.pushCallback).toBe(deviceInfo.pushCallback);
    expect(d.pushPublicKey).toBe(deviceInfo.pushPublicKey);
    expect(d.pushAuthKey).toBe(deviceInfo.pushAuthKey);
    expect(d.pushEndpointExpired).toBe(deviceInfo.pushEndpointExpired);

    // Second: known 400 error (410) — device endpoint should be marked expired
    jest.resetModules();
    jest.doMock('web-push', () => ({
      sendNotification() {
        const err: any = new Error('Failed 400 level');
        err.statusCode = 410;
        return Promise.reject(err);
      },
    }));
    const pushWithKnown400 = require('../../lib/push')(
      mockLog2, db, {}, mockStatsD
    );
    await pushWithKnown400.sendPush(ACCOUNT.uid, devices, 'accountVerify');

    devices = await db.devices(ACCOUNT.uid);
    d = devices[0];
    expect(d.name).toBe(deviceInfo.name);
    expect(d.pushEndpointExpired).toBe(true);
  });
});
