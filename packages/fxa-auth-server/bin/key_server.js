/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// This MUST be the first require in the program.
// Only `require()` the newrelic module if explicity enabled.
// If required, modules will be instrumented.
require('../lib/newrelic')();

const error = require('../lib/error');
const jwtool = require('fxa-jwtool');
const StatsD = require('hot-shots');

async function run(config) {
  let statsd;
  if (config.statsd.enabled) {
    statsd = new StatsD({
      ...config.statsd,
      errorHandler: err => {
        // eslint-disable-next-line no-use-before-define
        log.error('statsd.error', err);
      },
    });
  }

  const log = require('../lib/log')({ ...config.log, statsd });
  require('../lib/oauth/logging')(log);
  const getGeoData = require('../lib/geodb')(log);
  // Force the geo to load and run at startup, not waiting for it to run on
  // some route later.
  const knownIp = '63.245.221.32'; // Mozilla MTV
  const location = getGeoData(knownIp);
  log.info({ op: 'geodb.check', result: location });

  // RegExp instances serialise to empty objects, display regex strings instead.
  const stringifiedConfig = JSON.stringify(config, (k, v) =>
    v && v.constructor === RegExp ? v.toString() : v
  );

  if (config.env !== 'prod') {
    log.info(stringifiedConfig, 'starting config');
  }

  const Token = require('../lib/tokens')(log, config);
  const Server = require('../lib/server');
  const Password = require('../lib/crypto/password')(log, config);
  const UnblockCode = require('../lib/crypto/random').base32(
    config.signinUnblock.codeLength
  );
  const zendeskClient = require('../lib/zendesk-client')(config);

  const signer = require('../lib/signer')(config.secretKeyFile, config.domain);
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

  const Customs = require('../lib/customs')(log, error, statsd);

  let database = null;
  let translator = null;
  /** @type {undefined | import('../lib/payments/stripe')} */
  let stripeHelper = undefined;

  if (config.subscriptions && config.subscriptions.stripeApiKey) {
    const StripeHelper = require('../lib/payments/stripe');
    stripeHelper = new StripeHelper(log, config);
  }

  const DB = require('../lib/db')(config, log, Token, UnblockCode);
  try {
    [database, translator] = await Promise.all([
      DB.connect(config[config.db.backend]),
      require('../lib/senders/translator')(
        config.i18n.supportedLanguages,
        config.i18n.defaultLanguage
      ),
    ]);
  } catch (err) {
    log.error({ op: 'DB.connect', err: { message: err.message } });
    process.exit(1);
  }

  const oauthdb = require('../lib/oauthdb')(log, config, statsd);
  const subhub = require('../lib/subhub/client').client(log, config, statsd);
  const profile = require('../lib/profile/client')(log, config, statsd);
  const senders = await require('../lib/senders')(
    log,
    config,
    error,
    translator,
    oauthdb,
    statsd
  );

  const customs = new Customs(config.customsUrl);
  const routes = require('../lib/routes')(
    log,
    serverPublicKeys,
    signer,
    database,
    oauthdb,
    senders.email,
    senders.sms,
    Password,
    config,
    customs,
    zendeskClient,
    subhub,
    statsd,
    profile,
    stripeHelper
  );

  const server = await Server.create(
    log,
    error,
    config,
    routes,
    database,
    oauthdb,
    translator
  );

  function logStatInfo() {
    log.stat(server.stat());
    log.stat(Password.stat());
  }
  const statsInterval = setInterval(logStatInfo, 15000);

  try {
    await server.start();
    log.info({
      op: 'server.start.1',
      msg: `running on ${server.info.uri}`,
    });
  } catch (err) {
    log.error({
      op: 'server.start.1',
      msg: 'failed startup with error',
      err: { message: err.message },
    });
  }

  return {
    server,
    log: log,
    async close() {
      log.info({ op: 'shutdown' });
      clearInterval(statsInterval);
      await server.stop();
      await customs.close();
      oauthdb.close();
      await subhub.close();
      if (statsd) {
        statsd.close();
      }
      try {
        senders.email.stop();
      } catch (e) {
        // XXX: simplesmtp module may quit early and set socket to `false`, stopping it may fail
        log.warn({
          op: 'shutdown',
          message: 'Mailer client already disconnected',
        });
      }
      await database.close();
    },
  };
}

function main() {
  const config = require('../config').getProperties();
  run(config)
    .then(server => {
      process.on('uncaughtException', err => {
        server.log.fatal(err);
        process.exit(8);
      });
      process.on('unhandledRejection', (reason, promise) => {
        server.log.fatal({
          op: 'promise.unhandledRejection',
          error: reason,
        });
      });
      process.on('SIGINT', shutdown);
      server.log.on('error', shutdown);

      function shutdown() {
        server.close().then(() => {
          process.exit(); //XXX: because of openid dep ಠ_ಠ
        });
      }
    })
    .catch(err => {
      console.error(err); // eslint-disable-line no-console
      process.exit(8);
    });
}

if (require.main === module) {
  main();
} else {
  module.exports = run;
}
