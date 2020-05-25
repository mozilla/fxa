#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Populate the database with accounts, session tokens and devices,
// so that each new account is linked to either one, two or three
// sessions and devices.
//
// Usage:
//
//     node scripts/populate-session-tokens n
//
// Where *n* is the number of accounts to create.

var log = {
  trace: console.log,
  error: console.error,
  stat: console.log,
  info: console.log,
}; //eslint-disable-line no-console
var DB = require('../lib/db/mysql')(log, require('../db-server').errors);
var config = require('../config');
var crypto = require('crypto');
const { normalizeEmail } = require('../../fxa-shared/email/helpers');

var zeroBuffer16 = Buffer.from('00000000000000000000000000000000', 'hex');
var zeroBuffer32 = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000',
  'hex'
);

var count = parseInt(process.argv[2]);

if (count > 0) {
  DB.connect(config)
    .then(function (db) {
      iterate(0);

      function iterate(index) {
        if (index === count) {
          db.close();
          return log.info('Done: ' + index);
        }

        createRecords(index).then(iterate.bind(null, index + 1));
      }

      function createRecords(index) {
        var uid = crypto.randomBytes(16);
        return createAccount(uid)
          .then(function () {
            if (index % 6 === 0) {
              // One sixth of accounts will have three session tokens
              // and three devices. Two of the devices are attached to
              // a session token, the other one isn't.
              return createSessionTokenAndDevice(uid, 'mobile')
                .then(createSessionToken.bind(null, uid, null))
                .then(createSessionTokenAndDevice.bind(null, uid, 'mobile'))
                .then(createDevice.bind(null, uid, null, 'mobile'));
            } else if (index % 3 === 0) {
              // One sixth of accounts will have two session tokens
              // and two devices. One of the devices is attached to
              // a session token, the other one isn't.
              return createSessionToken(uid, null)
                .then(createSessionTokenAndDevice.bind(null, uid, 'mobile'))
                .then(createDevice.bind(null, uid, null, null));
            } else {
              // Two thirds of accounts will have one session token
              // and one device, connected to the session token.
              return createSessionTokenAndDevice(uid, null);
            }
          })
          .catch(function (error) {
            log.error(error);
          });
      }

      function createAccount(uid) {
        var time = Date.now();
        var email = (Math.random() + '').substr(2) + '@dummy.org';
        return db.createAccount(uid, {
          email: email,
          normalizedEmail: normalizeEmail(email),
          emailCode: zeroBuffer16,
          emailVerified: true,
          verifierVersion: 1,
          verifyHash: zeroBuffer32,
          authSalt: zeroBuffer32,
          kA: zeroBuffer32,
          wrapWrapKb: zeroBuffer32,
          verifierSetAt: time,
          createdAt: time,
          locale: 'en_US',
        });
      }

      function createSessionTokenAndDevice(uid, uaDeviceType) {
        return createSessionToken(uid, uaDeviceType).then(function (
          sessionTokenId
        ) {
          return createDevice(uid, sessionTokenId, uaDeviceType);
        });
      }

      function createSessionToken(uid, uaDeviceType) {
        var sessionTokenId = hex(32);
        return db
          .createSessionToken(sessionTokenId, {
            data: hex(32),
            uid: uid,
            createdAt: Date.now(),
            uaBrowser: 'foo',
            uaBrowserVersion: 'bar',
            uaOS: 'baz',
            uaOSVersion: 'qux',
            uaDeviceType: uaDeviceType,
          })
          .then(function () {
            return sessionTokenId;
          });
      }

      function hex(length) {
        return crypto.randomBytes(length);
      }

      function createDevice(uid, sessionTokenId, uaDeviceType) {
        return db.createDevice(uid, hex(16), {
          sessionTokenId: sessionTokenId,
          name: 'fake device name',
          type: uaDeviceType,
          createdAt: Date.now(),
        });
      }
    })
    .catch(function (err) {
      log.error(err.stack || err.message || err);
      process.exit();
    });
} else {
  throw new Error('Invalid argument');
}
