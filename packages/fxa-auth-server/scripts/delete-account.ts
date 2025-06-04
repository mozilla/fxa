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
import { StatsD } from 'hot-shots';
import readline from 'readline';
import { Container } from 'typedi';

import { PayPalClient } from '@fxa/payments/paypal';

import { AccountDeleteManager } from '../lib/account-delete';
import configProperties from '../config';
import { setupFirestore } from '../lib/firestore-db';
import { CurrencyHelper } from '../lib/payments/currencies';
import { PayPalHelper } from '../lib/payments/paypal';
import { StripeHelper } from '../lib/payments/stripe';
import { AppConfig, AuthFirestore, AuthLogger } from '../lib/types';
import {
  DeleteAccountTasks,
  DeleteAccountTasksFactory,
} from '@fxa/shared/cloud-tasks';
import { ProfileClient } from '@fxa/profile/client';
const { gleanMetrics } = require('../lib/metrics/glean');

const config = configProperties.getProperties();
const mailer = null;

const statsd = {
  increment: () => {},
  timing: () => {},
  close: () => {},
} as unknown as StatsD;
const log = require('../lib/log')(config.log.level, 'delete-account-script', {
  statsd,
});
const Token = require('../lib/tokens')(log, config);
const { createDB } = require('../lib/db');
const DB = createDB(config, log, Token);
const glean = gleanMetrics(config);

Container.set(StatsD, statsd);
Container.set(AppConfig, config);
Container.set(AuthLogger, log);
const authFirestore = setupFirestore(config);
Container.set(AuthFirestore, authFirestore);
const profile = new ProfileClient(log, {
  ...config.profileServer,
  serviceName: 'subhub',
});
Container.set(ProfileClient, profile);

DB.connect(config).then(async (db: any) => {
  // Bypass customs checks.
  const mockCustoms = {
    check: () => {
      return Promise.resolve();
    },
    v2Enabled: () => true,
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
    return Promise.resolve({ match: true, v1: true, v2: false });
  };

  // Bypass TOTP checks.
  db.totpToken = () => {
    return Promise.resolve(false);
  };

  const push = require('../lib/push')(log, db, config, statsd);
  const oauthDB = require('../lib/oauth/db');
  const { pushboxApi } = require('../lib/pushbox');
  const pushbox = pushboxApi(log, config, statsd);

  const verificationReminders = require('../lib/verification-reminders')(
    log,
    config
  );
  const subscriptionAccountReminders =
    require('../lib/subscription-account-reminders')(log, config);
  const signupUtils = require('../lib/routes/utils/signup')(
    log,
    db,
    mailer,
    push,
    verificationReminders
  );

  /** @type {undefined | import('../lib/payments/stripe').StripeHelper} */
  let stripeHelper = undefined;
  if (config.subscriptions && config.subscriptions.stripeApiKey) {
    const currencyHelper = new CurrencyHelper(config);
    Container.set(CurrencyHelper, currencyHelper);
    const paypalClient = new PayPalClient(
      config.subscriptions.paypalNvpSigCredentials,
      statsd as unknown as StatsD
    );
    Container.set(PayPalClient, paypalClient);
    const { createStripeHelper } = require('../lib/payments/stripe');
    stripeHelper = createStripeHelper(log, config, statsd);
    Container.set(StripeHelper, stripeHelper);
    const paypalHelper = new PayPalHelper({ log });
    Container.set(PayPalHelper, paypalHelper);
  }

  const accountTasks = DeleteAccountTasksFactory(config, statsd);
  Container.set(DeleteAccountTasks, accountTasks);

  const accountDeleteManager = new AccountDeleteManager({
    fxaDb: db,
    oauthDb: oauthDB,
    config,
    push,
    pushbox,
    mailer,
    statsd,
    glean,
    log,
  });
  Container.set(AccountDeleteManager, accountDeleteManager);

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
      signupUtils,
      push,
      verificationReminders,
      subscriptionAccountReminders,
      oauthDB,
      stripeHelper,
      pushbox
    )
    .find((r: any) => r.path === '/account/destroy');

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
        rl.question('Really delete this account? (y/n) ', (answer: any) => {
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
            emitMetricsEvent: async () => {
              log.activityEvent({ uid: account.uid, event: 'account.deleted' });
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
