/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// Important! Must be required first to get proper hooks in place.
import '../lib/monitoring';

import { config } from '../config';
import { CapabilityManager } from '@fxa/payments/capability';
import { EligibilityManager } from '@fxa/payments/eligibility';

import {
  ProductManager,
  PriceManager,
  SubscriptionManager,
  PromotionCodeManager
} from '@fxa/payments/customer';
import { StripeClient } from '@fxa/payments/stripe';

import {
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';

import { ProductConfigurationManager, StrapiClient } from '@fxa/shared/cms';
import TracingProvider from 'fxa-shared/tracing/node-tracing';
import error from '../lib/error';
import { JWTool } from '@fxa/vendored/jwtool';
import { StatsD } from 'hot-shots';
import { Container } from 'typedi';
import { StripeHelper } from '../lib/payments/stripe';
import { PlayBilling } from '../lib/payments/iap/google-play';
import { CurrencyHelper } from '../lib/payments/currencies';
import {
  AuthLogger,
  AuthFirestore,
  AppConfig,
} from '../lib/types';
import { ProfileClient } from '@fxa/profile/client';
import { setupFirestore } from '../lib/firestore-db';
import { AppleIAP } from '../lib/payments/iap/apple-app-store/apple-iap';
import { AccountEventsManager } from '../lib/account-events';
import { AccountDeleteManager } from '../lib/account-delete';
import { gleanMetrics } from '../lib/metrics/glean';
import Customs from '../lib/customs';
import Profile from '../lib/profile/client';
import { AccountTasks, AccountTasksFactory } from '@fxa/shared/cloud-tasks';
import logMoudle from '../lib/log';
import redisModule from '../lib/redis';
import dbModule from '../lib/db';
import tokensModule from '../lib/tokens';
import pushModule from '../lib/push';
import oauthDbModule from '../lib/oauth/db';
import { pushboxApi } from '../lib/pushbox';
import cryptoRandom from '../lib/crypto/random';
import { createStripeHelper } from '../lib/payments/stripe';
import { PayPalClient } from '@fxa/payments/paypal';
import { PayPalHelper } from '../lib/payments/paypal/helper';
import bouncesModule from '../lib/bounces';
import sendersModule from '../lib/senders';
import signerModule from '../lib/signer';
import cryptoPasswordModule from '../lib/crypto/password';
import { createZendeskClient } from '../lib/zendesk-client';
import routesModule from '../lib/routes';
import Server from '../lib/server';

async function run(config) {
  Container.set(AppConfig, config);

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

  const log = logMoudle({
    ...config.log,
    statsd,
    nodeTracer: TracingProvider.getCurrent(),
  });
  Container.set(AuthLogger, log);

  if (!Container.has(AuthFirestore)) {
    const authFirestore = setupFirestore(config);
    Container.set(AuthFirestore, authFirestore);
  }

  const sessionTokensRedis = redisModule(
    { ...config.redis, ...config.redis.sessionTokens },
    log
  );
  const authServerCacheRedis = redisModule(
    { ...config.redis, ...config.redis.authServerCache },
    log
  );

  const DB = dbModule(
    config,
    log,
    tokensModule(log, config),
    cryptoRandom.base32(config.signinUnblock.codeLength)
  );
  let database = null;
  try {
    database = await DB.connect(config, sessionTokensRedis);
  } catch (err) {
    log.error('DB.connect', { err: { message: err.message } });
    process.exit(1);
  }

  const oauthDb = oauthDbModule;
  const push = pushModule(log, database, config, statsd);

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

    stripeHelper = createStripeHelper(log, config, statsd);
    Container.set(StripeHelper, stripeHelper);

    if (config.subscriptions.paypalNvpSigCredentials.enabled) {
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
  const bounces = bouncesModule(config, database);
  const senders = await sendersModule(log, config, bounces, statsd);

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
  const signer = signerModule(config.secretKeyFile, config.domain);
  const Password = cryptoPasswordModule(log, config);
  const customs = new Customs(config.customsUrl, log, error, statsd);

  const zendeskClient = createZendeskClient(config);
  const glean = gleanMetrics(config);

  const routes = routesModule(
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
