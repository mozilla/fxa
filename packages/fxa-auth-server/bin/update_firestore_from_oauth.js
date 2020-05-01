/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Firestore = require('@google-cloud/firestore');
const StatsD = require('hot-shots');
const hex = require('buf').to.hex;

const config = require('../config').getProperties();
const mysql = require('../lib/oauth/db/mysql');

const statsd = new StatsD(config.statsd);
const log = require('../lib/log')(
  config.log.level,
  'update-firestore-from-oauth',
  {
    statsd,
  }
);

const CLIENT_ID = process.env.CLIENT_ID;
const REMOVE_CLIENT = process.env.REMOVE_CLIENT === 'true';

async function main() {
  if (!CLIENT_ID) {
    throw new Error('No CLIENT_ID found in environment');
  }
  // keyFilename takes precedence over credentials
  if (config.firestore.keyFilename) {
    delete config.firestore.credentials;
  }

  // For local testing
  let firestore;
  if (process.env.NODE_ENV === 'dev') {
    firestore = new Firestore.Firestore();
  } else {
    firestore = new Firestore.Firestore(config.firestore);
  }

  const storePrefix = config.firestore.prefix;
  const oauthdb = await mysql.connect(config.oauthServer.mysql);
  const results = await oauthdb.getRefreshTokensByClientId(CLIENT_ID);
  let inserted = 0;
  for (const { userId } of results) {
    const uid = hex(userId);
    const document = firestore.doc(`${storePrefix}users/${uid}`);
    const doc = await document.get();
    if (doc.exists) {
      const data = doc.data();
      if (data && data.oauth_clients && data.oauth_clients[CLIENT_ID]) {
        if (REMOVE_CLIENT) {
          // Remove this entry
          await document.set(
            {
              oauth_clients: { [CLIENT_ID]: Firestore.FieldValue.delete() },
            },
            { merge: true }
          );
          log.info('Removed client id', { uid, clientId: CLIENT_ID });
          continue;
        } else {
          // Record is already in the database
          continue;
        }
      }
    }
    log.info('Adding missing uid for client', { uid, clientId: CLIENT_ID });
    await document.set(
      { oauth_clients: { [CLIENT_ID]: true } },
      { merge: true }
    );
    inserted += 1;
  }
  await firestore.terminate();
  log.info('Complete', { inserted });
  process.exit();
}

main().catch(err => {
  log.error('Errored out', err);
});
