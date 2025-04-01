/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// Important! Must be required first to get proper hooks in place.
require('../lib/monitoring');

const { config } = require('../config');

const Redis = require('ioredis');

const { CapabilityManager } = require('@fxa/payments/capability');
const { EligibilityManager } = require('@fxa/payments/eligibility');
const {
  PriceManager,
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
const { AuthLogger, AuthFirestore, AppConfig } = require('../lib/types');
const { setupFirestore } = require('../lib/firestore-db');
const { AppleIAP } = require('../lib/payments/iap/apple-app-store/apple-iap');
const { AccountEventsManager } = require('../lib/account-events');
const { AccountDeleteManager } = require('../lib/account-delete');
const { gleanMetrics } = require('../lib/metrics/glean');
const Customs = require('../lib/customs');
const { ProfileClient } = require('@fxa/profile/client');
const { BackupCodeManager } = require('@fxa/accounts/two-factor');
const {
  DeleteAccountTasks,
  DeleteAccountTasksFactory,
} = require('@fxa/shared/cloud-tasks');
const { OtpManager } = require('@fxa/shared/otp');
const {
  RecoveryPhoneManager,
  SmsManager,
  RecoveryPhoneService,
  TwilioFactory,
} = require('@fxa/accounts/recovery-phone');
const { AccountManager } = require('@fxa/shared/account/account');
const { setupAccountDatabase } = require('@fxa/shared/db/mysql/account');
const { EmailCloudTaskManager } = require('../lib/email-cloud-tasks');

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

  const { createDB } = require('../lib/db');
  const DB = createDB(
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

  const accountDatabase = await setupAccountDatabase(
    config.database.mysql.auth
  );

  const accountManager = new AccountManager(accountDatabase);
  Container.set(AccountManager, accountManager);

  const backupCodeManager = new BackupCodeManager(accountDatabase);
  Container.set(BackupCodeManager, backupCodeManager);

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
    const stripeClient = new StripeClient(
      {
        apiKey: config.subscriptions.stripeApiKey,
      },
      statsd
    );
    const priceManager = new PriceManager(stripeClient);
    const promotionCodeManager = new PromotionCodeManager(stripeClient);
    Container.set(PromotionCodeManager, promotionCodeManager);

    if (
      config.cms.enabled ||
      (config.cms.strapiClient &&
        config.cms.strapiClient.graphqlApiUri &&
        config.cms.strapiClient.apiKey &&
        config.cms.strapiClient.firestoreCacheCollectionName)
    ) {
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
        priceManager,
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
        config.subscriptions.paypalNvpSigCredentials,
        statsd
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

  const twilio = TwilioFactory.useFactory(config.twilio);
  const recoveryPhoneRedis = new Redis({
    ...config.redis,
    ...config.redis.recoveryPhone,
  });
  const otpCodeManager = new OtpManager(
    config.recoveryPhone.otp,
    recoveryPhoneRedis
  );
  const recoveryPhoneManager = new RecoveryPhoneManager(
    accountDatabase,
    recoveryPhoneRedis
  );
  const smsManager = new SmsManager(
    twilio,
    statsd,
    log,
    config.recoveryPhone.sms
  );
  const recoveryPhoneService = new RecoveryPhoneService(
    recoveryPhoneManager,
    smsManager,
    otpCodeManager,
    config.recoveryPhone,
    config.twilio,
    statsd,
    log
  );
  Container.set(RecoveryPhoneService, recoveryPhoneService);

  const profile = new ProfileClient(log, {
    ...config.profileServer,
    serviceName: 'subhub',
  });
  Container.set(ProfileClient, profile);

  const bounces = require('../lib/bounces')(config, database);
  const senders = await require('../lib/senders')(log, config, bounces, statsd);
  const glean = gleanMetrics(config);

  // The AccountDeleteManager is dependent on some of the object set into
  // Container above.
  const accountTasks = DeleteAccountTasksFactory(config, statsd);
  Container.set(DeleteAccountTasks, accountTasks);

  const accountDeleteManager = new AccountDeleteManager({
    fxaDb: database,
    oauthDb,
    config,
    push,
    pushbox,
    mailer: senders.email,
    statsd,
    glean,
    log,
  });
  Container.set(AccountDeleteManager, accountDeleteManager);

  const emailCloudTaskManager = new EmailCloudTaskManager({
    fxaDb: database,
    oauthDb,
    mailer: senders.email,
    config,
    statsd,
    glean,
    log,
  });
  Container.set(EmailCloudTaskManager, emailCloudTaskManager);

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

      try {
        await server.stop();
      } catch (e) {
        log.warn('shutdown', {
          message: 'Server did not shut down cleanly. ' + e.message,
        });
      }

      try {
        statsd.close();
      } catch (e) {
        log.warn('shutdown', {
          message: 'Statsd did not shut down cleanly. ' + e.message,
        });
      }

      try {
        senders.email.stop();
      } catch (e) {
        // XXX: simplesmtp module may quit early and set socket to `false`, stopping it may fail
        log.warn('shutdown', {
          message: 'senders.email did not shut down cleanly. ' + e.message,
        });
      }

      try {
        await database.close();
      } catch (e) {
        log.warn('shutdown', {
          message: 'Database connection did not shutdown cleanly. ' + e.message,
        });
      }

      try {
        await accountDatabase.destroy();
      } catch (e) {
        log.warn('shutdown', {
          message:
            'Account database connection did not shutdown cleanly. ' +
            e.message,
        });
      }
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
