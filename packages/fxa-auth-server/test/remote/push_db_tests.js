/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const P = require('../../lib/promise');
const uuid = require('uuid');
const crypto = require('crypto');
const base64url = require('base64url');
const proxyquire = require('proxyquire');
const log = { trace() {}, info() {}, error() {} };

const config = require('../../config').getProperties();
const TestServer = require('../test_server');
const Token = require('../../lib/tokens')(log);
const DB = require('../../lib/db')(config, log, Token);
const mockStatsD = { increment: () => {} };

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
  uid: uuid.v4('binary').toString('hex'),
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
const mockLog = {
  error: function () {},
  warn: function () {},
  increment: function () {},
  trace: function () {},
  info: function () {},
};

describe('remote push db', function () {
  this.timeout(15000);

  let dbServer, db;
  before(() => {
    return TestServer.start(config)
      .then((s) => {
        dbServer = s;
        return DB.connect(config[config.db.backend]);
      })
      .then((x) => {
        db = x;
      });
  });

  it('push db tests', () => {
    let sessionTokenId;
    const deviceInfo = {
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
    // two tests below, first for unknown 400 level error the device push info will stay the same
    // second, for a known 400 error we reset the device
    const mocksKnown400 = {
      'web-push': {
        sendNotification: function (endpoint, params) {
          const err = new Error('Failed 400 level');
          err.statusCode = 410;
          return P.reject(err);
        },
      },
    };
    const mocksUnknown400 = {
      'web-push': {
        sendNotification: function (endpoint, params) {
          const err = new Error('Failed 429 level');
          err.statusCode = 429;
          return P.reject(err);
        },
      },
    };

    return db
      .createAccount(ACCOUNT)
      .then(() => {
        return db.emailRecord(ACCOUNT.email);
      })
      .then((emailRecord) => {
        emailRecord.createdAt = Date.now();
        return db.createSessionToken(emailRecord, SESSION_TOKEN_UA);
      })

      .then((sessionToken) => {
        sessionTokenId = sessionToken.id;
        deviceInfo.sessionTokenId = sessionTokenId;
        return db.createDevice(ACCOUNT.uid, deviceInfo);
      })
      .then((device) => {
        assert.equal(device.name, deviceInfo.name);
        assert.equal(device.pushCallback, deviceInfo.pushCallback);
        assert.equal(device.pushPublicKey, deviceInfo.pushPublicKey);
        assert.equal(device.pushAuthKey, deviceInfo.pushAuthKey);
      })
      .then(() => {
        return db.devices(ACCOUNT.uid);
      })
      .then((devices) => {
        const pushWithUnknown400 = proxyquire(
          '../../lib/push',
          mocksUnknown400
        )(mockLog, db, {}, mockStatsD);
        return pushWithUnknown400.sendPush(
          ACCOUNT.uid,
          devices,
          'accountVerify'
        );
      })
      .then(() => {
        return db.devices(ACCOUNT.uid);
      })
      .then((devices) => {
        const device = devices[0];
        assert.equal(device.name, deviceInfo.name);
        assert.equal(device.pushCallback, deviceInfo.pushCallback);
        assert.equal(
          device.pushPublicKey,
          deviceInfo.pushPublicKey,
          'device.pushPublicKey is correct'
        );
        assert.equal(
          device.pushAuthKey,
          deviceInfo.pushAuthKey,
          'device.pushAuthKey is correct'
        );
        assert.equal(
          device.pushEndpointExpired,
          deviceInfo.pushEndpointExpired,
          'device.pushEndpointExpired is correct'
        );

        const pushWithKnown400 = proxyquire("../../lib/push", mocksKnown400)(
          mockLog,
          db,
          {},
          mockStatsD,
        );
        return pushWithKnown400.sendPush(ACCOUNT.uid, devices, 'accountVerify');
      })
      .then(() => {
        return db.devices(ACCOUNT.uid);
      })
      .then((devices) => {
        const device = devices[0];
        assert.equal(device.name, deviceInfo.name);
        assert.equal(
          device.pushEndpointExpired,
          true,
          'device.pushEndpointExpired is correct'
        );
      });
  });

  after(() => {
    return P.all([TestServer.stop(dbServer), db.close()]);
  });
});
