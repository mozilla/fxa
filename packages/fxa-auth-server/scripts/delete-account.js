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
const subhub = require('../lib/subhub/client').client(log, config);
const mailer = null;

const DB = require('../lib/db')(config, log, Token);

DB.connect(config[config.db.backend]).then(db => {
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

  const push = require('../lib/push')(log, db, config);
  const oauthdb = require('../lib/oauth/db');
  const statsd = {
    increment: () => {},
    timing: () => {},
    close: () => {},
  };
  const verificationReminders = require('../lib/verification-reminders')(
    log,
    config
  );
  /** @type {undefined | import('../lib/payments/stripe').StripeHelper} */
  let stripeHelper = undefined;
  if (config.subscriptions && config.subscriptions.stripeApiKey) {
    const createStripeHelper = require('../lib/payments/stripe');
    stripeHelper = createStripeHelper(log, config, statsd);
  }

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
    push,
    verificationReminders,
    oauthdb,
    stripeHelper
  ).find(r => r.path === '/account/destroy');

  let retval = 0;

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
        retval = 0;
        console.log('ok');
      },
      err => {
        retval = 1;
        console.log('ERROR:', err.message || err);
      }
    )
    .finally(() => {
      db.close();
      process.exit(retval);
    });
});
