/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = async function main(keys, dbFunction) {
  const butil = require('../../lib/crypto/butil');
  const config = require('../../config').getProperties();
  const crypto = require('crypto');
  const log = require('../../lib/log')({});
  const P = require('../../lib/promise');
  const Token = require('../../lib/tokens')(log, config);
  const AuthDB = require('../../lib/db')(config, log, Token);
  const oauth = require('../../lib/oauth/db');
  const db = await AuthDB.connect(config[config.db.backend]);

  let users = '';
  await P.mapSeries(keys, (item) =>
    db[dbFunction](item).catch((err) => {
      console.error(`${String(err)} - ${item}`);
      process.exit(1);
    })
  ).then((result) => {
    users = result;
  });

  await P.all(
    users.map(async (result) => {
      try {
        // Removes all session tokens,
        const uid = result.uid;
        await db.resetAccount(
          { uid },
          {
            authSalt: butil.ONES.toString('hex'),
            verifyHash: butil.ONES.toString('hex'),
            wrapWrapKb: crypto.randomBytes(32).toString('hex'),
            verifierVersion: 1,
          }
        );

        // Removes oauth related tokens
        await oauth.removeUser(result.uid);
        console.info('account reset');
        console.info('  email: ', result.email);
        console.info('    uid: ', result.uid);
      } catch (err) {
        console.error('failed', result.uid, err);
        process.exit(1);
      }
    })
  );

  console.info('%s accounts reset', users.length);
  await db.close();
  process.exit();
};
