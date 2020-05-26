#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// For testing purposes only, generate traffic and table size for fxa.accounts.

const { assert } = require('chai');
const dbServer = require('../db-server');
const log = require('../test/lib/log');
const DB = require('../lib/db/mysql')(log, dbServer.errors);
const config = require('../config');
const crypto = require('crypto');
const { normalizeEmail } = require('fxa-shared/email/helpers');

function randomBuffer16() {
  return crypto.randomBytes(16);
}

function randomBuffer32() {
  return crypto.randomBytes(32);
}

function now() {
  return Date.now();
}

let count = 0;
let db;

function create() {
  var uid = crypto.randomBytes(16);
  var account = {
    uid: uid,
    email: ('' + Math.random()).substr(2) + '@bar.com',
    emailCode: randomBuffer16(),
    emailVerified: false,
    verifierVersion: 1,
    verifyHash: randomBuffer32(),
    authSalt: randomBuffer32(),
    kA: randomBuffer32(),
    wrapWrapKb: randomBuffer32(),
    verifierSetAt: now(),
    createdAt: now(),
    locale: 'en_US',
  };
  account.normalizedEmail = normalizeEmail(account.email);

  return db
    .createAccount(uid, account)
    .then(function (result) {
      assert.deepEqual(
        result,
        {},
        'Returned an empty object on account creation'
      );
      return db.emailRecord(account.email);
    })
    .then(function (result) {
      assert.equal(result.createdAt, account.createdAt, 'createdAt set');
      assert.equal(result.email, account.email, 'email set');
      assert.equal(result.emailVerified, 0, 'emailVerified set');
      assert.equal(
        result.normalizedEmail,
        account.normalizedEmail,
        'normalizedEmail set'
      );
      assert.equal(
        result.verifierSetAt,
        account.verifierSetAt,
        'verifierSetAt set'
      );
      assert.equal(
        result.verifierVersion,
        account.verifierVersion,
        'verifierVersion set'
      );
    });
}

function init() {
  return DB.connect(config).then((db_) => {
    db = db_;
    return db.ping();
  });
}

function createAccount() {
  return create()
    .then(() => {
      console.log('done', ++count); //eslint-disable-line no-console
      if (count >= 50000) {
        process.exit(0);
      }
    })
    .catch((err) => console.error(err)); //eslint-disable-line no-console
}

init().then(() => {
  setInterval(createAccount, 5);
});
