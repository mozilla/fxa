/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const pick = require('lodash.pick');

module.exports = function dumpUsers(keys, dbFunc, usePretty) {
  const config = require('../../config').getProperties();
  const log = {
    error: msg => {},
    info: msg => {},
    trace: msg => {},
  };

  const Token = require('../../lib/tokens')(log, config);
  const UnblockCode = require('../../lib/crypto/random').base32(
    config.signinUnblock.codeLength
  );
  const P = require('../../lib/promise');

  const DB = require('../../lib/db')(config, log, Token, UnblockCode);

  let db;

  DB.connect(config[config.db.backend])
    .then(_db => {
      db = _db;
      return P.mapSeries(keys, item =>
        db[dbFunc](item).catch(err => {
          console.error(`${String(err)} - ${item}`);
          process.exit(1);
        })
      );
    })
    .then(marshallUserRecords)
    .then(records => {
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
  return userRecords.map(userRecord => {
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
      Object.keys(filteredRecord.devices).forEach(id => {
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
