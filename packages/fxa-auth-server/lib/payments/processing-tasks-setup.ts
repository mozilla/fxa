/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { setupAuthDatabase } from 'fxa-shared/db';
import { StatsD } from 'hot-shots';
import Container from 'typedi';

import { setupFirestore } from '../firestore-db';
import { CurrencyHelper } from '../payments/currencies';
import { configureSentry } from '../sentry';
import { AppConfig, AuthFirestore, AuthLogger, ProfileClient } from '../types';
import { StripeHelper, createStripeHelper } from './stripe';

import convictConf from '../../config';
import error from '../../lib/error';

const Profile = require('../profile/client');
const { AccountEventsManager } = require('../../lib/account-events');

const config = convictConf.getProperties();

export async function setupProcessingTaskObjects(processName: string) {
  configureSentry(undefined, config, processName);

  Container.set(AppConfig, config);

  const statsd = config.statsd.enabled
    ? new StatsD({
        ...config.statsd,
        errorHandler: (err) => {
          // eslint-disable-next-line no-use-before-define
          log.error('statsd.error', err);
        },
      })
    : ({
        increment: () => {},
        timing: () => {},
        close: () => {},
      } as unknown as StatsD);
  Container.set(StatsD, statsd);

  if (!Container.has(AuthFirestore)) {
    const authFirestore = setupFirestore(config);
    Container.set(AuthFirestore, authFirestore);
  }

  const log = require('../log')({ ...config.log, statsd });
  Container.set(AuthLogger, log);

  // Establish database connection and bind instance to Model using Knex
  setupAuthDatabase(config.database.mysql.auth, log, statsd);

  const profile = new Profile(log, config, error, statsd);
  Container.set(ProfileClient, profile);

  const senders = await require('../senders')(
    log,
    config,
    { check: () => Promise.resolve() },
    statsd
  );
  const redis = require('../redis')(
    { ...config.redis, ...config.redis.sessionTokens },
    log
  );
  const DB = require('../db')(
    config,
    log,
    require('../tokens')(log, config),
    require('../crypto/random').base32(config.signinUnblock.codeLength)
  );
  let database = null;
  try {
    database = await DB.connect(config, redis);
  } catch (err) {
    log.error('DB.connect', { err: { message: err.message } });
    process.exit(1);
  }

  if (!Container.has(AccountEventsManager)) {
    const accountEventsManager = config.accountEvents.enabled
      ? new AccountEventsManager(database)
      : {
          recordEmailEvent: async () => Promise.resolve(),
          recordSecurityEvent: async () => Promise.resolve(),
        };
    Container.set(AccountEventsManager, accountEventsManager);
  }

  const currencyHelper = new CurrencyHelper(config);
  Container.set(CurrencyHelper, currencyHelper);
  const stripeHelper = createStripeHelper(log, config, statsd);
  Container.set(StripeHelper, stripeHelper);

  return {
    log,
    database,
    senders,
    stripeHelper,
  };
}
