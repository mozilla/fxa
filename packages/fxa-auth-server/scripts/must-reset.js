#!/usr/bin/env ts-node-script

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

 Usage:

 scripts/must-reset.js -i ./reset.json

 This script is used to put user accounts into a "must reset" state. It uses the
 same config file as key_server.js so should be run from a production instance.

 /*/

'use strict';

// HACK: Prevent config falling over due to missing secrets
process.env.NODE_ENV = 'dev';

const butil = require('../lib/crypto/butil');
const commandLineOptions = require('commander');
const config = require('../config').getProperties();
const crypto = require('crypto');
const log = require('../lib/log')({});
const P = require('../lib/promise');
const path = require('path');
const Token = require('../lib/tokens')(log, config);
const AuthDB = require('../lib/db')(config, log, Token);
const oauth = require('../lib/oauth/db');

commandLineOptions
  .option('-i, --input <filename>', 'JSON input file')
  .parse(process.argv);

const requiredOptions = ['input'];

function checkRequiredOption(optionName) {
  if (!commandLineOptions[optionName]) {
    console.error(`--${optionName} required`);
    process.exit(1);
  }
}

requiredOptions.forEach(checkRequiredOption);

async function main() {
  const db = await AuthDB.connect(config[config.db.backend]);

  const json = require(path.resolve(commandLineOptions.input));

  const uids = json.map((entry) => {
    return entry.uid;
  });

  await P.all(
    uids.map(async (uid) => {
      try {
        // Removes all session tokens,
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
        await oauth.removeUser(uid);
        console.info('account reset', uid);
      } catch (err) {
        console.error('failed', uid, err);
        process.exit(1);
      }
    })
  );

  console.info('%s accounts reset', uids.length);
  await db.close();
  process.exit();
}

main();
