/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../lib/error');
const jwtool = require('fxa-jwtool');
const { StatsD } = require('hot-shots');
const { Container } = require('typedi');
const { StripeHelper } = require('../lib/payments/stripe');
const { CurrencyHelper } = require('../lib/payments/currencies');

async function run(config) {
  const statsd = config.statsd.enabled
    ? new StatsD({
        ...config.statsd,
        errorHandler: (err) => {
          // eslint-disable-next-line no-use-before-define
          log.error('statsd.error', err);
        },
      })
    : {
        increment: () => {},
        timing: () => {},
        close: () => {},
      };
  Container.set(StatsD, statsd);

  const log = require('../lib/log')({ ...config.log, statsd });

  const redis = require('../lib/redis')(
    { ...config.redis, ...config.redis.sessionTokens },
    log
  );

  const DB = require('../lib/db')(
    config,
    log,
    require('../lib/tokens')(log, config),
    require('../lib/crypto/random').base32(config.signinUnblock.codeLength)
  );
  let database = null;
  try {
    database = await DB.connect(config, redis);
  } catch (err) {
    log.error('DB.connect', { err: { message: err.message } });
    process.exit(1);
  }

  // Set currencyHelper before stripe and paypal helpers, so they can use it.
  try {
    // eslint-disable-next-line
    const currencyHelper = new CurrencyHelper(config);
    Container.set(CurrencyHelper, currencyHelper);
  } catch (err) {
    log.error('Invalid currency configuration', {
      err: { message: err.message },
    });
    process.exit(1);
  }

  /** @type {undefined | import('../lib/payments/stripe').StripeHelper} */
  let stripeHelper = undefined;
  if (config.subscriptions && config.subscriptions.stripeApiKey) {
    const { createStripeHelper } = require('../lib/payments/stripe');
    stripeHelper = createStripeHelper(log, config, statsd);
    Container.set(StripeHelper, stripeHelper);

    if (config.subscriptions.paypalNvpSigCredentials.enabled) {
      const { PayPalClient } = require('../lib/payments/paypal-client');
      const { PayPalHelper } = require('../lib/payments/paypal');
      const paypalClient = new PayPalClient(
        config.subscriptions.paypalNvpSigCredentials
      );
      Container.set(PayPalClient, paypalClient);
      const paypalHelper = new PayPalHelper({ log });
      Container.set(PayPalHelper, paypalHelper);
    }
  }

  const translator = await require('../lib/senders/translator')(
    config.i18n.supportedLanguages,
    config.i18n.defaultLanguage
  );
  const profile = require('../lib/profile/client')(log, config, statsd);
  const senders = await require('../lib/senders')(
    log,
    config,
    error,
    translator,
    statsd
  );

  const serverPublicKeys = {
    primary: jwtool.JWK.fromFile(config.publicKeyFile, {
      algorithm: 'RS',
      use: 'sig',
      kty: 'RSA',
    }),
    secondary: config.oldPublicKeyFile
      ? jwtool.JWK.fromFile(config.oldPublicKeyFile, {
          algorithm: 'RS',
          use: 'sig',
          kty: 'RSA',
        })
      : null,
  };
  const signer = require('../lib/signer')(config.secretKeyFile, config.domain);
  const Password = require('../lib/crypto/password')(log, config);
  const Customs = require('../lib/customs')(log, error, statsd);
  const customs = new Customs(config.customsUrl);
  const zendeskClient = require('../lib/zendesk-client')(config);
  const routes = require('../lib/routes')(
    log,
    serverPublicKeys,
    signer,
    database,
    senders.email,
    senders.sms,
    Password,
    config,
    customs,
    zendeskClient,
    statsd,
    profile,
    stripeHelper,
    redis
  );

  const Server = require('../lib/server');
  const server = await Server.create(
    log,
    error,
    config,
    routes,
    database,
    translator,
    statsd
  );

  try {
    await server.start();
    log.info('server.start.1', {
      msg: `running on ${server.info.uri}`,
    });
  } catch (err) {
    log.error('server.start.1', {
      msg: 'failed startup with error',
      err: { message: err.message },
    });
  }

  return {
    server,
    log: log,
    async close() {
      log.info('shutdown', 'gracefully');
      await server.stop();
      await customs.close();
      statsd.close();
      senders.sms.close();
      try {
        senders.email.stop();
      } catch (e) {
        // XXX: simplesmtp module may quit early and set socket to `false`, stopping it may fail
        log.warn('shutdown', { message: 'Mailer client already disconnected' });
      }
      await database.close();
    },
  };
}

async function main() {
  const config = require('../config');
  try {
    const server = await run(config.getProperties());
    process.on('uncaughtException', (err) => {
      server.log.fatal('uncaughtException', err);
      process.exit(8);
    });
    process.on('unhandledRejection', (reason, promise) => {
      server.log.fatal('promise.unhandledRejection', { error: reason });
    });
    const shutdown = async () => {
      await server.close();
      process.exit(); //XXX: because of openid dep ಠ_ಠ
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    server.log.on('error', shutdown);

    if (config.get('env') !== 'prod') {
      server.log.info('startConfig', { config: config.toString() });
    }
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    process.exit(8);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = run;
}
