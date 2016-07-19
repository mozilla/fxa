#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Populate the database with accounts and session tokens,
// so that each new account is linked to either one, two or
// three sessions.

var log = { trace: console.log, error: console.log, stat: console.log, info: console.log } //eslint-disable-line no-console
var DB = require('../lib/db/mysql')(log, require('../fxa-auth-db-server').errors)
var config = require('../config')
var crypto = require('crypto')

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')
var zeroBuffer32 = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')

var count = parseInt(process.argv[2])

if (count > 0) {
  DB.connect(config).then(function (db) {
    iterate(0)

    function iterate (index) {
      if (index === count) {
        db.close()
        return log.info('Done: ' + index)
      }

      createRecords(index).then(iterate.bind(null, index + 1))
    }

    function createRecords (index) {
      var uid = crypto.randomBytes(16)
      return createAccount(uid)
        .then(function () {
          if (index % 6 === 0) {
            return createSessionToken(uid, 'mobile')
              .then(createSessionToken.bind(null, uid, null))
              .then(createSessionToken.bind(null, uid, 'mobile'))
          } else if (index % 3 === 0) {
            return createSessionToken(uid, null)
              .then(createSessionToken.bind(null, uid, 'mobile'))
          } else {
            return createSessionToken(uid, null)
          }
        })
        .catch(function (error) {
          log.error(error)
        })
    }

    function createAccount (uid) {
      var time = Date.now()
      var email = (Math.random() + '').substr(2) + '@dummy.org'
      return db.createAccount(uid, {
        email: email,
        normalizedEmail: email.toLowerCase(),
        emailCode: zeroBuffer16,
        emailVerified: true,
        verifierVersion: 1,
        verifyHash: zeroBuffer32,
        authSalt: zeroBuffer32,
        kA: zeroBuffer32,
        wrapWrapKb: zeroBuffer32,
        verifierSetAt: time,
        createdAt: time,
        locale: 'en_US'
      })
    }

    function createSessionToken (uid, uaDeviceType) {
      return db.createSessionToken(hex(32), {
        data: hex(32),
        uid: uid,
        createdAt: Date.now(),
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz',
        uaOSVersion: 'qux',
        uaDeviceType: uaDeviceType
      })
    }

    function hex (length) {
      return Buffer(crypto.randomBytes(length).toString('hex'), 'hex')
    }
  })
} else {
  throw new Error('Invalid argument')
}

