/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { setupAuthDatabase } from 'fxa-shared/db';
import { StatsD } from 'hot-shots';
import Container from 'typedi';

import error from '../error';
import { CurrencyHelper } from '../payments/currencies';
import { StripeHelper } from './stripe';
import { configureSentry } from '../sentry';

const config = require('../../config').getProperties();

export async function setupProcesingTaskObjects() {
  configureSentry(undefined, config);
  // Establish database connection and bind instance to Model using Knex
  setupAuthDatabase(config.database.mysql.auth);

  const statsd = config.statsd.enabled
    ? new StatsD({
        ...config.statsd,
        errorHandler: (err) => {
          // eslint-disable-next-line no-use-before-define
          log.error('statsd.error', err);
        },
      })
    : (({
        increment: () => {},
        timing: () => {},
        close: () => {},
      } as unknown) as StatsD);
  Container.set(StatsD, statsd);

  const log = require('../log')({ ...config.log, statsd });

  const translator = await require('../senders/translator')(
    config.i18n.supportedLanguages,
    config.i18n.defaultLanguage
  );
  const senders = await require('../senders')(
    log,
    config,
    error,
    translator,
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

  const currencyHelper = new CurrencyHelper(config);
  Container.set(CurrencyHelper, currencyHelper);
  const stripeHelper = new StripeHelper(log, config, statsd);
  Container.set(StripeHelper, stripeHelper);

  return {
    log,
    database,
    senders,
    stripeHelper,
  };
}
