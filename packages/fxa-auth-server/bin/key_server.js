/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// Important! Must be required first to get proper hooks in place.
require('../lib/monitoring');

// Use nest as a DI framework. This lets us configure and reuse our
// shared libs in hapi as well as nestjs.
const { bridgeTypeDi } = require('../lib/bridge-nestjs');

const { config } = require('../config');

const { CapabilityManager } = require('@fxa/payments/capability');
const { EligibilityManager } = require('@fxa/payments/eligibility');
const {
  ProductManager,
  PriceManager,
  SubscriptionManager,
  PromotionCodeManager,
} = require('@fxa/payments/customer');
const { StripeClient } = require('@fxa/payments/stripe');
const {
  ProductConfigurationManager,
  StrapiClient,
} = require('@fxa/shared/cms');
const TracingProvider = require('fxa-shared/tracing/node-tracing');

const error = require('../lib/error');
const { JWTool } = require('@fxa/vendored/jwtool');
const { StatsD } = require('hot-shots');
const { Container } = require('typedi');
const { StripeHelper } = require('../lib/payments/stripe');
const { PlayBilling } = require('../lib/payments/iap/google-play');
const { CurrencyHelper } = require('../lib/payments/currencies');
const { AuthLogger, AuthFirestore } = require('../lib/types');
const { setupFirestore } = require('../lib/firestore-db');
const { AppleIAP } = require('../lib/payments/iap/apple-app-store/apple-iap');
const { AccountEventsManager } = require('../lib/account-events');
const { AccountDeleteManager } = require('../lib/account-delete');
const { gleanMetrics } = require('../lib/metrics/glean');
const Customs = require('../lib/customs');
const { ProfileClient } = require('@fxa/profile/client');
const {
  AccountTasks,
  AccountTasksFactory,
} = require('@fxa/shared/cloud-tasks');
async function run(config) {
  // Tranfers DI from nest to typedi
  await bridgeTypeDi();
  const statsd = Container.get(StatsD);

  const log = require('../lib/log')({
    ...config.log,
    statsd,
    nodeTracer: TracingProvider.getCurrent(),
  });
  Container.set(AuthLogger, log);

  if (!Container.has(AuthFirestore)) {
    const authFirestore = setupFirestore(config);
    Container.set(AuthFirestore, authFirestore);
  }

  const sessionTokensRedis = require('../lib/redis')(
    { ...config.redis, ...config.redis.sessionTokens },
    log
  );
  const authServerCacheRedis = require('../lib/redis')(
    { ...config.redis, ...config.redis.authServerCache },
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
    database = await DB.connect(config, sessionTokensRedis);
  } catch (err) {
    log.error('DB.connect', { err: { message: err.message } });
    process.exit(1);
  }

  const oauthDb = require('../lib/oauth/db');
  const push = require('../lib/push')(log, database, config, statsd);
  const { pushboxApi } = require('../lib/pushbox');
  const pushbox = pushboxApi(log, config, statsd);

  const accountEventsManager = config.accountEvents.enabled
    ? new AccountEventsManager(database)
    : {
        recordEmailEvent: async () => Promise.resolve(),
        recordSecurityEvent: async () => Promise.resolve(),
      };
  Container.set(AccountEventsManager, accountEventsManager);

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
    const stripeClient = new StripeClient({
      apiKey: config.subscriptions.stripeApiKey,
    });
    const productManager = new ProductManager(stripeClient);
    const priceManager = new PriceManager(stripeClient);
    const subscriptionManager = new SubscriptionManager(stripeClient);
    const promotionCodeManager = new PromotionCodeManager(
      stripeClient,
      productManager,
      subscriptionManager
    );
    Container.set(PromotionCodeManager, promotionCodeManager);

    if (config.cms.enabled) {
      const strapiClientConfig = config.cms.strapiClient;
      const { graphqlApiUri, apiKey, firestoreCacheCollectionName } =
        strapiClientConfig;
      if (!(graphqlApiUri && apiKey && firestoreCacheCollectionName)) {
        throw new Error('Missing required configuration for CMS Strapi Client');
      }
      const firestore = Container.get(AuthFirestore);
      const strapiClient = new StrapiClient(strapiClientConfig, firestore);
      const productConfigurationManager = new ProductConfigurationManager(
        strapiClient,
        statsd
      );
      Container.set(ProductConfigurationManager, productConfigurationManager);
      const capabilityManager = new CapabilityManager(
        productConfigurationManager
      );
      const eligibilityManager = new EligibilityManager(
        productConfigurationManager,
        priceManager
      );
      Container.set(CapabilityManager, capabilityManager);
      Container.set(EligibilityManager, eligibilityManager);
    }

    const { createStripeHelper } = require('../lib/payments/stripe');
    stripeHelper = createStripeHelper(log, config, statsd);
    Container.set(StripeHelper, stripeHelper);

    if (config.subscriptions.paypalNvpSigCredentials.enabled) {
      const { PayPalClient } = require('@fxa/payments/paypal');
      const { PayPalHelper } = require('../lib/payments/paypal/helper');
      const paypalClient = new PayPalClient(
        config.subscriptions.paypalNvpSigCredentials
      );
      Container.set(PayPalClient, paypalClient);
      const paypalHelper = new PayPalHelper({ log });
      Container.set(PayPalHelper, paypalHelper);
    }
  }

  // Create PlayBilling if enabled by fetching it.
  if (
    config.subscriptions &&
    config.subscriptions.playApiServiceAccount &&
    config.subscriptions.playApiServiceAccount.enabled
  ) {
    Container.get(PlayBilling);
  }

  // Create AppleIAP if enabled by fetching it.
  if (config?.subscriptions?.appStore?.enabled) {
    Container.get(AppleIAP);
  }

  // The AccountDeleteManager is dependent on some of the object set into
  // Container above.
  const accountTasks = AccountTasksFactory(config, statsd);
  Container.set(AccountTasks, accountTasks);

  const accountDeleteManager = new AccountDeleteManager({
    fxaDb: database,
    oauthDb,
    config,
    push,
    pushbox,
  });
  Container.set(AccountDeleteManager, accountDeleteManager);

  const profile = new ProfileClient(log, {
    ...config.profileServer,
    serviceName: 'subhub',
  });
  Container.set(ProfileClient, profile);
  const bounces = require('../lib/bounces')(config, database);
  const senders = await require('../lib/senders')(log, config, bounces, statsd);

  const serverPublicKeys = {
    primary: JWTool.JWK.fromFile(config.publicKeyFile, {
      algorithm: 'RS',
      use: 'sig',
      kty: 'RSA',
    }),
    secondary: config.oldPublicKeyFile
      ? JWTool.JWK.fromFile(config.oldPublicKeyFile, {
          algorithm: 'RS',
          use: 'sig',
          kty: 'RSA',
        })
      : null,
  };
  const signer = require('../lib/signer').default(
    config.secretKeyFile,
    config.domain
  );
  const Password = require('../lib/crypto/password')(log, config);
  const customs = new Customs(config.customsUrl, log, error, statsd);
  const zendeskClient = require('../lib/zendesk-client').createZendeskClient(
    config
  );
  const glean = gleanMetrics(config);

  const routes = require('../lib/routes')(
    log,
    serverPublicKeys,
    signer,
    database,
    senders.email,
    Password,
    config,
    customs,
    zendeskClient,
    statsd,
    profile,
    stripeHelper,
    sessionTokensRedis,
    glean,
    push,
    pushbox,
    authServerCacheRedis
  );

  const Server = require('../lib/server');
  const server = await Server.create(
    log,
    error,
    config,
    routes,
    database,
    statsd,
    glean
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
      log.info('shutdown');
      await server.stop();
      statsd.close();
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
