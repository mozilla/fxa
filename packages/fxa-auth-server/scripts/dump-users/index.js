/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const pick = require('lodash/pick');

module.exports = function dumpUsers(keys, dbFunc, usePretty) {
  const config = require('../../config').default.getProperties();
  const log = {
    error: (msg) => {},
    info: (msg) => {},
    trace: (msg) => {},
    debug: (msg) => {},
    warn: (msg) => {},
  };

  const Token = require('../../lib/tokens')(log, config);
  const UnblockCode = require('../../lib/crypto/random').base32(
    config.signinUnblock.codeLength
  );

  const { createDB } = require('../../lib/db');
  const DB = createDB(config, log, Token, UnblockCode);

  let db;

  DB.connect(config)
    .then(async (_db) => {
      db = _db;
      const userRecords = [];
      try {
        for (const item of keys) {
          userRecords.push(await db[dbFunc](item));
        }
      } catch (err) {
        console.error(err);
        return process.exit(1);
      }
      return userRecords;
    })
    .then(marshallUserRecords)
    .then((records) => {
      if (usePretty) {
        console.log(JSON.stringify(records, null, 2));
      } else {
        console.log(JSON.stringify(records));
      }

      return db.close();
    })
    .then(() => {
      process.exit(0);
    });
};

function marshallUserRecords(userRecords) {
  return userRecords.map((userRecord) => {
    const filteredRecord = pick(
      userRecord,
      'createdAt',
      'devices',
      'email',
      'emailVerified',
      'emails',
      'locale',
      'normalizedEmail',
      'primaryEmail',
      'profileChangedAt',
      'uid'
    );

    if (filteredRecord.devices) {
      Object.keys(filteredRecord.devices).forEach((id) => {
        filteredRecord.devices[id] = pick(
          userRecord.devices[id],
          'callbackIsExpired',
          'createdAt',
          'lastAccessTime',
          'name',
          'type',
          'uaBrowser',
          'uaBrowserVersion',
          'uaDeviceType',
          'uaOS',
          'uaOSVersion'
        );
      });
    }

    return filteredRecord;
  });
}
