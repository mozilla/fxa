#!/usr/bin/env node -r esbuild-register

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

 Usage:

 scripts/delete-account.js user@example.com [...]

 This script is used to manually delete a user's account,
 e.g. in response to a GDPR deletion request.  It uses the
 same config file as key_server.js so should be run from a
 production instance, and it tries to re-use as much of the
 actual delete-account route code as possible.

/*/

'use strict';

const { StatsD } = require('hot-shots');
const { Container } = require('typedi');
const {
  AppConfig,
  AuthLogger,
  AuthFirestore,
  ProfileClient,
} = require('../lib/types');
const readline = require('readline');
const config = require('../config').getProperties();
const log = require('../lib/log')(config.log.level);
const Token = require('../lib/tokens')(log, config);
const mailer = null;
const { setupFirestore } = require('../lib/firestore-db');

const statsd = {
  increment: () => {},
  timing: () => {},
  close: () => {},
};
Container.set(StatsD, statsd);
Container.set(AppConfig, config);
Container.set(AuthLogger, log);
const authFirestore = setupFirestore(config);
Container.set(AuthFirestore, authFirestore);
const profile = require('../lib/profile/client')(log, config, statsd);
Container.set(ProfileClient, profile);

const DB = require('../lib/db')(config, log, Token);

DB.connect(config).then(async (db) => {
  // Bypass customs checks.
  const mockCustoms = {
    check: () => {
      return Promise.resolve();
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
  signinUtils.checkPassword = function () {
    return Promise.resolve(true);
  };

  // Bypass TOTP checks.
  db.totpToken = () => {
    return Promise.resolve(false);
  };

  const push = require('../lib/push')(log, db, config);
  const oauthDB = require('../lib/oauth/db');

  const verificationReminders = require('../lib/verification-reminders')(
    log,
    config
  );
  /** @type {undefined | import('../lib/payments/stripe').StripeHelper} */
  let stripeHelper = undefined;
  if (config.subscriptions && config.subscriptions.stripeApiKey) {
    const { CurrencyHelper } = require('../lib/payments/currencies');
    const { StripeHelper } = require('../lib/payments/stripe');
    const { PayPalClient } = require('../lib/payments/paypal-client');
    const { PayPalHelper } = require('../lib/payments/paypal');
    const currencyHelper = new CurrencyHelper(config);
    Container.set(CurrencyHelper, currencyHelper);
    const paypalClient = new PayPalClient(
      config.subscriptions.paypalNvpSigCredentials
    );
    Container.set(PayPalClient, paypalClient);
    const { createStripeHelper } = require('../lib/payments/stripe');
    stripeHelper = createStripeHelper(log, config, statsd);
    Container.set(StripeHelper, stripeHelper);
    const paypalHelper = new PayPalHelper({ log });
    Container.set(PayPalHelper, paypalHelper);
  }

  // Load the account-deletion route, so we can use its logic directly.
  const accountDestroyRoute = require('../lib/routes/account')
    ['accountRoutes'](
      log,
      db,
      mailer,
      MockPassword,
      config,
      mockCustoms,
      signinUtils,
      push,
      verificationReminders,
      oauthDB,
      stripeHelper
    )
    .find((r) => r.path === '/account/destroy');

  let retval = 0;

  try {
    for (const email of process.argv.slice(2)) {
      const account = await db.accountRecord(email);
      console.log('Found account record:');
      console.log('    uid:', account.uid);
      console.log('    email:', account.email);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      await new Promise((resolve, reject) => {
        rl.question('Really delete this account? (y/n) ', (answer) => {
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
              return Promise.resolve();
            },
            gatherMetricsContext: () => {
              return Promise.resolve({});
            },
            payload: {
              email: email,
              authPW: 'mock password',
            },
          };
          accountDestroyRoute.handler(mockRequest).then(resolve, reject);
        });
      });
    }
    retval = 0;
    console.log('ok');
  } catch (err) {
    retval = 1;
    // we like stack traces
    console.error(err);
  }

  db.close();
  process.exit(retval);
});
