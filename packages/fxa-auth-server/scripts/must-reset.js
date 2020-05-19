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

const butil = require('../lib/crypto/butil');
const commandLineOptions = require('commander');
const config = require('../config').getProperties();
const crypto = require('crypto');
const log = require('../lib/log')(config.log.level);
const P = require('../lib/promise');
const path = require('path');
const Token = require('../lib/tokens')(log, config);

commandLineOptions
  .option('-i, --input <filename>', 'JSON input file')
  .parse(process.argv);

const requiredOptions = ['input'];

requiredOptions.forEach(checkRequiredOption);

const DB = require('../lib/db')(config, log, Token);

DB.connect(config[config.db.backend]).then(db => {
  const json = require(path.resolve(commandLineOptions.input));

  const uids = json.map(entry => {
    return entry.uid;
  });

  return P.all(
    uids.map(uid => {
      return db
        .resetAccount(
          { uid: uid },
          {
            authSalt: butil.ONES.toString('hex'),
            verifyHash: butil.ONES.toString('hex'),
            wrapWrapKb: crypto.randomBytes(32).toString('hex'),
            verifierVersion: 1,
          }
        )
        .catch(err => {
          log.error({ op: 'reset.failed', uid: uid, err: err });
          process.exit(1);
        });
    })
  )
    .then(
      () => {
        log.info({ complete: true, uidsReset: uids.length });
      },
      err => {
        log.error(err);
      }
    )
    .then(db.close.bind(db));
});

function checkRequiredOption(optionName) {
  if (!commandLineOptions[optionName]) {
    console.error(`--${optionName} required`);
    process.exit(1);
  }
}
