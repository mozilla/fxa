/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = async function main(items, dbFunction) {
  const butil = require('../../lib/crypto/butil');
  const config = require('../../config').default.getProperties();
  const crypto = require('crypto');
  const log = require('../../lib/log')({});
  const Token = require('../../lib/tokens')(log, config);
  const { createDB } = require('../../lib/db');
  const AuthDB = createDB(config, log, Token);
  const oauth = require('../../lib/oauth/db');
  const db = await AuthDB.connect(config);

  const users = [];
  try {
    for (const item of items) {
      users.push(await db[dbFunction](item));
    }
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }

  await Promise.all(
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
        await oauth.removeTokensAndCodes(result.uid);
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
