/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// This MUST be the first require in the program.
// Only `require()` the newrelic module if explicity enabled.
// If required, modules will be instrumented.
require('../lib/newrelic')();

const jwtool = require('fxa-jwtool');
const P = require('../lib/promise');

function run(config) {
  const log = require('../lib/log')(config.log);
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

  const error = require('../lib/error');
  const Token = require('../lib/tokens')(log, config);
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

  const Customs = require('../lib/customs')(log, error);

  const Server = require('../lib/server');
  let server = null;
  let senders = null;
  let statsInterval = null;
  let database = null;
  let customs = null;
  let oauthdb = null;

  function logStatInfo() {
    log.stat(server.stat());
    log.stat(Password.stat());
  }

  const DB = require('../lib/db')(config, log, Token, UnblockCode);

  return P.all([
    DB.connect(config[config.db.backend]),
    require('../lib/senders/translator')(
      config.i18n.supportedLanguages,
      config.i18n.defaultLanguage
    ),
  ])
    .spread(
      (db, translator) => {
        database = db;
        const bounces = require('../lib/bounces')(config, db);
        oauthdb = require('../lib/oauthdb')(log, config);

        return require('../lib/senders')(
          log,
          config,
          error,
          bounces,
          translator,
          oauthdb
        ).then(result => {
          senders = result;
          customs = new Customs(config.customsUrl);
          const routes = require('../lib/routes')(
            log,
            serverPublicKeys,
            signer,
            db,
            oauthdb,
            senders.email,
            senders.sms,
            Password,
            config,
            customs,
            zendeskClient
          );

          statsInterval = setInterval(logStatInfo, 15000);

          async function init() {
            server = await Server.create(
              log,
              error,
              config,
              routes,
              db,
              oauthdb,
              translator
            );
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
          }

          init();
        });
      },
      err => {
        log.error({ op: 'DB.connect', err: { message: err.message } });
        process.exit(1);
      }
    )
    .then(() => {
      return {
        log: log,
        close() {
          return new P(resolve => {
            log.info({ op: 'shutdown' });
            clearInterval(statsInterval);
            server.stop().then(() => {
              customs.close();
              oauthdb.close();
              try {
                senders.email.stop();
              } catch (e) {
                // XXX: simplesmtp module may quit early and set socket to `false`, stopping it may fail
                log.warn({
                  op: 'shutdown',
                  message: 'Mailer client already disconnected',
                });
              }
              database.close();
              resolve();
            });
          });
        },
      };
    });
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
