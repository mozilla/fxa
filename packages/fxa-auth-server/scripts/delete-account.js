#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

 Usage:

 node scripts/delete-account.js user@example.com [...]

 This script is used to manually delete a user's account,
 e.g. in response to a GDPR deletion request.  It uses the
 same config file as key_server.js so should be run from a
 production instance, and it tries to re-use as much of the
 actual delete-account route code as possible.

/*/

'use strict';

const readline = require('readline');
const P = require('../lib/promise');
const config = require('../config').getProperties();
const log = require('../lib/log')(config.log.level);
const Token = require('../lib/tokens')(log, config);
const subhub = require('../lib/subhub/client')(log, config);
const mailer = null;

const DB = require('../lib/db')(config, log, Token);

return DB.connect(config[config.db.backend]).then(db => {
  // Bypass customs checks.
  const mockCustoms = {
    check: () => {
      return P.resolve();
    },
  };

  // Bypass password checks.
  function MockPassword() {}
  const signinUtils = require('../lib/routes/utils/signin')(
    log,
    config,
    mockCustoms,
    db,
    mailer
  );
  signinUtils.checkPassword = function() {
    return P.resolve(true);
  };

  // Bypass TOTP checks.
  db.totpToken = () => {
    return P.resolve(false);
  };

  // Load the account-deletion route, so we can use its logic directly.
  const accountDestroyRoute = require('../lib/routes/account')(
    log,
    db,
    mailer,
    MockPassword,
    config,
    mockCustoms,
    subhub,
    signinUtils,
    require('../lib/push')(log, db, config)
  ).find(r => r.path === '/account/destroy');

  P.each(process.argv.slice(2), email => {
    return db.accountRecord(email).then(account => {
      // This is a pretty destructive action, ask the operator
      // to confirm each individual account deletion in turn.
      console.log('Found account record:');
      console.log('    uid:', account.uid);
      console.log('    email:', account.email);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      return new P((resolve, reject) => {
        rl.question('Really delete this account? (y/n) ', answer => {
          rl.close();
          if (['y', 'yes'].indexOf(answer.toLowerCase()) === -1) {
            return reject('Cancelled');
          }

          // Issue a mock request to the /account/destroy route
          // to action the deletion.
          const mockRequest = {
            app: {
              clientAddress: '0.0.0.0',
            },
            emitMetricsEvent: () => {
              return P.resolve();
            },
            gatherMetricsContext: () => {
              return P.resolve({});
            },
            payload: {
              email: email,
              authPW: 'mock password',
            },
          };
          accountDestroyRoute.handler(mockRequest).then(resolve, reject);
        });
      });
    });
  })
    .then(
      () => {
        console.log('ok');
      },
      err => {
        console.log('ERROR:', err.message || err);
      }
    )
    .finally(() => {
      return db.close();
    });
});
