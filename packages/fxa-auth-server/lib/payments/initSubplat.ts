/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AccountCustomerManager, StripeClient } from '@fxa/payments/stripe';
import {
  CustomerManager,
  PriceManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import { ChurnInterventionManager } from '@fxa/payments/cart';
import { AuthFirestore } from '@fxa/shared/db/firestore';
import { ProductConfigurationManager, StrapiClient } from '@fxa/shared/cms';
import {
  EligibilityManager,
  EligibilityService,
} from '@fxa/payments/eligibility';
import {
  AppleIapClient,
  AppleIapPurchaseManager,
  GoogleIapClient,
  GoogleIapPurchaseManager,
  type AppleIapClientConfig,
  type GoogleIapClientConfig,
} from '@fxa/payments/iap';
import { Environment } from 'app-store-server-api';
import { ChurnInterventionService } from '@fxa/payments/management';
import { NotifierService, setupSns } from '@fxa/shared/notifier';
import { setupAccountDatabase } from '@fxa/shared/db/mysql/account';
import { ProfileClient, type ProfileClientConfig } from '@fxa/profile/client';
import { winstonLogger } from '@fxa/shared/log';
import type { ConfigType } from '../../config';
import { StatsD } from 'hot-shots';
import Container from 'typedi';

export async function initSubplat({
  loggerName,
  legacyLog,
  config,
}: {
  loggerName: string;
  legacyLog: any;
  config: ConfigType;
}) {
  /**
   * Config
   */
  const googleClientConfig: GoogleIapClientConfig = {
    email: config.subscriptions.playApiServiceAccount.credentials.client_email,
    keyFilename: config.subscriptions.playApiServiceAccount.keyFilename,
    privateKey:
      config.subscriptions.playApiServiceAccount.credentials.private_key,
    collectionName: `${config.authFirestore.prefix}iap-play-purchases`,
  };
  const appleClientConfig: AppleIapClientConfig = {
    credentials: Object.entries(config.subscriptions.appStore.credentials).map(
      ([bundleKey, v]: [string, any]) => ({
        bundleId: bundleKey.replace(/_/g, '.'),
        key: v.serverApiKey,
        keyId: v.serverApiKeyId,
        issuerId: v.issuerId,
      })
    ),
    environment: config.subscriptions.appStore.sandbox
      ? Environment.Sandbox
      : Environment.Production,
    collectionName: `${config.authFirestore.prefix}iap-app-store-purchases`,
  };
  const notifierSnsConfig = {
    snsTopicEndpoint: config.snsTopicEndpoint || '',
    snsTopicArn: config.snsTopicArn,
  };
  const profileClientConfig: ProfileClientConfig = {
    url: config.profileServer.url,
    secretBearerToken: config.profileServer.secretBearerToken,
    serviceName: 'auth-server',
  };

  /**
   * Initialize repositories
   */
  const logger = winstonLogger(loggerName);
  const statsd = Container.get(StatsD);
  const firestore = Container.get(AuthFirestore);
  const accountDatabase = await setupAccountDatabase(
    config.database.mysql.auth
  );
  const notifierSnsService = setupSns(notifierSnsConfig);

  /**
   * Initialize Clients
   */
  const stripeClient = new StripeClient(
    {
      apiKey: config.subscriptions.stripeApiKey,
      webhookSecret: '',
      taxIds: {},
    },
    statsd,
    logger
  );
  const strapiClient = new StrapiClient(config.cms.strapiClient, firestore, winstonLogger(loggerName));
  const googleIapClient = new GoogleIapClient(googleClientConfig);
  const appleIapClient = new AppleIapClient(appleClientConfig);
  const profileClient = new ProfileClient(
    legacyLog,
    statsd,
    profileClientConfig
  );

  /**
   * Initialize Managers
   */
  const googleIapPurchaseManager = new GoogleIapPurchaseManager(
    googleClientConfig,
    firestore,
    googleIapClient,
    legacyLog
  );
  const appleIapPurchaseManager = new AppleIapPurchaseManager(
    appleClientConfig,
    firestore,
    appleIapClient,
    legacyLog
  );
  const priceManager = new PriceManager(stripeClient);
  const productConfigurationManager = new ProductConfigurationManager(
    strapiClient,
    priceManager,
    stripeClient,
    statsd
  );
  const subscriptionManager = new SubscriptionManager(stripeClient);
  const customerManager = new CustomerManager(stripeClient);
  const churnInterventionConfig = {
    collectionName: 'churnCollection',
    enabled: true,
  };
  const churnInterventionManager = new ChurnInterventionManager(
    churnInterventionConfig,
    firestore
  );
  const eligibilityManager = new EligibilityManager(
    productConfigurationManager,
    priceManager
  );
  const accountCustomerManager = new AccountCustomerManager(accountDatabase);
  const notifierService = new NotifierService(
    notifierSnsConfig,
    logger,
    notifierSnsService,
    statsd
  );

  /**
   * Initialize Services
   */
  const eligibilityService = new EligibilityService(
    { subscriptionsUnsupportedLocations: '["CN]' },
    productConfigurationManager,
    eligibilityManager,
    subscriptionManager,
    googleIapPurchaseManager,
    appleIapPurchaseManager
  );
  const churnInterventionService = new ChurnInterventionService(
    accountCustomerManager,
    productConfigurationManager,
    churnInterventionManager,
    eligibilityService,
    notifierService,
    profileClient,
    subscriptionManager,
    statsd,
    logger,
    churnInterventionConfig
  );

  /**
   * Add initialized instances to Container
   */
  Container.set(SubscriptionManager, subscriptionManager);
  Container.set(CustomerManager, customerManager);
  Container.set(ProductConfigurationManager, productConfigurationManager);
  Container.set(ChurnInterventionService, churnInterventionService);
}
