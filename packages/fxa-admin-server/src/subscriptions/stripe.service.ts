/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ProductConfigurationManager } from '@fxa/shared/cms';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { Firestore } from '@google-cloud/firestore';
import {
  Inject,
  Injectable,
  LoggerService,
  OnModuleDestroy,
  Provider,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentConfigManager } from 'fxa-shared/payments/configuration/manager';
import {
  determineIapIdentifiers,
  STRIPE_PRICE_METADATA,
  StripeHelper,
} from 'fxa-shared/payments/stripe';
import { StripeFirestore } from 'fxa-shared/payments/stripe-firestore';
import {
  AbbrevPlan,
  MozillaSubscriptionTypes,
  SubscriptionType,
} from 'fxa-shared/subscriptions/types';
import {
  capabilitiesClientIdPattern,
  subscriptionProductMetadataBaseValidator,
} from 'fxa-shared/subscriptions/validation';
import { StatsD } from 'hot-shots';
import Stripe from 'stripe';
import { FirestoreService } from '../backend/firestore.service';
import { AppConfig } from '../config';

export const StripeFactory: Provider<Stripe> = {
  provide: 'STRIPE',
  useFactory: (configService: ConfigService) => {
    const stripeConfig = configService.get('subscriptions');
    const stripe = new Stripe(stripeConfig.stripeApiKey, {
      apiVersion: '2024-11-20.acacia',
      maxNetworkRetries: 3,
    });
    stripe.customers.list({ limit: 1 }).catch((error) => {
      if (error.type === 'StripeAuthenticationError') {
        console.error(`
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!-----------------------------------!!!
!!!-----------------------------------!!!
!!!--- Stripe Authentication Error ---!!!
!!!---- Check your Stripe API Key ----!!!
!!!-----------------------------------!!!
!!!-----------------------------------!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
`);
      }
    });

    return stripe;
  },
  inject: [ConfigService],
};

/**
 * Extends PaymentConfigManager to be service like
 */
@Injectable()
export class StripePaymentConfigManagerService
  extends PaymentConfigManager
  implements OnModuleDestroy
{
  constructor(
    configService: ConfigService<AppConfig>,
    @Inject(LOGGER_PROVIDER) logger: LoggerService,
    @Inject(FirestoreService) firestore: Firestore
  ) {
    const config = {
      subscriptions: configService.get('subscriptions'),
      authFirestore: configService.get('authFirestore'),
    };

    super(config, firestore, logger as any);
  }

  async onModuleDestroy() {
    await this.stopListeners();
  }
}

/**
 * Extends StripeFirestore to be service like
 */
@Injectable()
export class StripeFirestoreService extends StripeFirestore {
  constructor(
    configService: ConfigService<AppConfig>,
    @Inject(FirestoreService) firestore: Firestore,
    @Inject('STRIPE') stripe: Stripe
  ) {
    const config = {
      authFirestore: configService.get('authFirestore'),
    };

    const firestore_prefix = `${config.authFirestore.prefix}stripe-`;
    const customerCollectionDbRef = firestore.collection(
      `${firestore_prefix}customers`
    );

    super(firestore, customerCollectionDbRef, stripe, firestore_prefix);
  }
}

@Injectable()
export class StripeService extends StripeHelper {
  public readonly isTestingApi: boolean;
  public override readonly stripe: Stripe;
  protected override readonly stripeFirestore: StripeFirestore;
  protected override readonly paymentConfigManager?:
    | PaymentConfigManager
    | undefined;
  protected productConfigurationManager?:
    | ProductConfigurationManager
    | undefined;

  constructor(
    configService: ConfigService<AppConfig>,
    @Inject(LOGGER_PROVIDER) logger: LoggerService,
    stripeFirestore: StripeFirestoreService,
    paymentConfigManager: StripePaymentConfigManagerService,
    @Inject('STRIPE') stripe: Stripe,
    @Inject('METRICS') metrics: StatsD
  ) {
    const config = {
      env: configService.get('env'),
      subscriptions: configService.get('subscriptions'),
      authFirestore: configService.get('authFirestore'),
      subhub: configService.get('subhub'),
      redis: configService.get('redis'),
      cms: configService.get('cms'),
    };
    super(config, metrics, logger as any);

    this.isTestingApi = /sk_test/.test(config.subscriptions.stripeApiKey);
    this.stripe = stripe;
    this.stripeFirestore = stripeFirestore;
    this.paymentConfigManager = paymentConfigManager;

    // Initializes caching
    this.initRedis();

    // Listens to stripe events
    this.initStripe();
  }

  /**
   * Ensures a stripe plan has a valid state.
   */
  protected override async validatePlan(plan: Stripe.Plan): Promise<boolean> {
    return validateStripePlan(plan);
  }

  /**
   * Resolves the latest stripe invoice.
   * @param invoice - an invoice id
   * @returns a stripe invoice
   */
  public async lookupLatestInvoice(
    invoice: string
  ): Promise<Stripe.Invoice | null> {
    if (!invoice) {
      return null;
    }
    return await this.stripe.invoices.retrieve(invoice);
  }

  /**
   * Links to customer's stripe dashboard
   * @param customer - stripe customer
   * @returns link to stripe dashboard
   */
  public async createManageSubscriptionLink(
    customer: string | Stripe.Customer | Stripe.DeletedCustomer
  ) {
    let customerId = typeof customer === 'string' ? customer : customer.id;
    let test = this.isTestingApi ? 'test/' : '';
    return `https://dashboard.stripe.com/${test}customers/${customerId}`;
  }
}
export type SkuKey =
  | STRIPE_PRICE_METADATA.PLAY_SKU_IDS
  | STRIPE_PRICE_METADATA.APP_STORE_PRODUCT_IDS;

// Auxillary Functions
export function iapPurchaseToPlan(
  purchaseId: string,
  iapType: Omit<SubscriptionType, typeof MozillaSubscriptionTypes.WEB>,
  plans: AbbrevPlan[]
) {
  return plans.find((plan) => {
    const identifiers = determineIapIdentifiers(iapType, plan);
    return identifiers.some((id) => id === purchaseId.toLowerCase());
  });
}

export function validateStripePlan(plan: Partial<Stripe.Plan>) {
  const metadata = {
    ...plan.metadata,
    ...(plan.product as Stripe.Product)?.metadata,
  };

  const hasCapabilities = Object.keys(metadata).some((k) =>
    capabilitiesClientIdPattern.test(k)
  );

  if (!hasCapabilities) {
    return false;
  }

  const validationResult = subscriptionProductMetadataBaseValidator.validate(
    metadata,
    {
      abortEarly: false,
    }
  );

  // If there is no error, then result was valid.
  return !validationResult.error;
}
