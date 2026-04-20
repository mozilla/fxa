/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable, NotFoundException } from '@nestjs/common';

import { CapabilityManager } from '@fxa/payments/capability';
import {
  CustomerDeletedError,
  CustomerManager,
  getCustomerPaypalAgreement,
  getPriceFromSubscription,
  hasOpenInvoiceWithPaymentAttempts,
  InvoiceManager,
  PaymentMethodManager,
  PriceManager,
  ProductManager,
  SubplatInterval,
  SubscriptionManager,
} from '@fxa/payments/customer';
import {
  AppleIapPurchaseManager,
  GoogleIapPurchaseManager,
} from '@fxa/payments/iap';
import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
  type StripeCustomer,
  type StripePrice,
  type StripeProduct,
  type StripeSubscription,
} from '@fxa/payments/stripe';
import { SanitizeExceptions } from '@fxa/shared/error';
import { ProductConfigurationManager } from '@fxa/shared/cms';

import type {
  BillingAndSubscriptionsResponse,
  Subscription,
} from './billing-and-subscriptions.schema';
import { buildBillingDetails } from './util/buildBillingDetails';
import { buildIapPriceInfoMap } from './util/buildIapPriceInfoMap';
import { hasSubscriptionRequiringPaymentMethod } from './util/hasSubscriptionRequiringPaymentMethod';
import { mapPriceInfo } from './util/mapPriceInfo';
import { transformToAppleIapSubscription } from './util/transformToAppleIapSubscription';
import { transformToGoogleIapSubscription } from './util/transformToGoogleIapSubscription';
import { transformToWebSubscription } from './util/transformToWebSubscription';

const UNKNOWN_SUBSCRIPTION_CUSTOMER_ERRNO = 176;

/**
 * This service is responsible for the `/v1/billing-and-subscriptions` endpoint in the Payments API
 */
@Injectable()
export class BillingAndSubscriptionsService {
  constructor(
    private readonly accountCustomerManager: AccountCustomerManager,
    private readonly customerManager: CustomerManager,
    private readonly subscriptionManager: SubscriptionManager,
    private readonly paymentMethodManager: PaymentMethodManager,
    private readonly invoiceManager: InvoiceManager,
    private readonly priceManager: PriceManager,
    private readonly productManager: ProductManager,
    private readonly capabilityManager: CapabilityManager,
    private readonly productConfigurationManager: ProductConfigurationManager,
    private readonly appleIapPurchaseManager: AppleIapPurchaseManager,
    private readonly googleIapPurchaseManager: GoogleIapPurchaseManager
  ) {}

  @SanitizeExceptions({ allowlist: [NotFoundException] })
  async get(args: {
    uid: string;
    clientId: string;
  }): Promise<BillingAndSubscriptionsResponse> {
    const { uid, clientId } = args;

    let stripeCustomer: StripeCustomer | undefined;
    let stripeCustomerId: string | undefined;
    try {
      const accountCustomer =
        await this.accountCustomerManager.getAccountCustomerByUid(uid);
      stripeCustomerId = accountCustomer.stripeCustomerId ?? undefined;
    } catch (err) {
      if (!(err instanceof AccountCustomerNotFoundError)) {
        throw err;
      }
    }
    if (stripeCustomerId) {
      try {
        stripeCustomer = await this.customerManager.retrieve(stripeCustomerId);
      } catch (err) {
        if (!(err instanceof CustomerDeletedError)) {
          throw err;
        }
      }
    }

    const [activeStripeSubscriptions, googleIapPurchases, appleIapPurchases] =
      await Promise.all([
        stripeCustomer
          ? this.subscriptionManager.listActiveForCustomer(stripeCustomer.id)
          : Promise.resolve<StripeSubscription[]>([]),
        this.googleIapPurchaseManager.getForUser(uid),
        this.appleIapPurchaseManager.getForUser(uid),
      ]);

    if (
      !stripeCustomer &&
      googleIapPurchases.length === 0 &&
      appleIapPurchases.length === 0
    ) {
      throw new NotFoundException({
        errno: UNKNOWN_SUBSCRIPTION_CUSTOMER_ERRNO,
        message: 'Unknown subscription customer',
      });
    }

    let billingDetails: ReturnType<typeof buildBillingDetails> = {};
    if (stripeCustomer) {
      const paymentProvider =
        activeStripeSubscriptions.length === 0
          ? undefined
          : activeStripeSubscriptions.some(
              (sub) =>
                this.subscriptionManager.getPaymentProvider(sub) === 'paypal'
            )
          ? 'paypal'
          : 'stripe';

      const defaultPaymentMethodId =
        stripeCustomer.invoice_settings.default_payment_method;
      const defaultPaymentMethod = defaultPaymentMethodId
        ? await this.paymentMethodManager.retrieve(defaultPaymentMethodId)
        : undefined;

      let hasOpenInvoiceWithRetry = false;
      if (
        paymentProvider === 'paypal' &&
        hasSubscriptionRequiringPaymentMethod(activeStripeSubscriptions) &&
        getCustomerPaypalAgreement(stripeCustomer)
      ) {
        const invoiceIds = activeStripeSubscriptions
          .map((sub) => sub.latest_invoice)
          .filter((id): id is string => !!id);
        const invoices = await Promise.all(
          invoiceIds.map((id) => this.invoiceManager.retrieve(id))
        );
        hasOpenInvoiceWithRetry = invoices.some(
          hasOpenInvoiceWithPaymentAttempts
        );
      }

      billingDetails = buildBillingDetails({
        customer: stripeCustomer,
        activeSubscriptions: activeStripeSubscriptions,
        paymentProvider,
        defaultPaymentMethod,
        hasOpenInvoiceWithRetry,
      });
    }

    const subscriptions: Subscription[] = [];

    for (const sub of activeStripeSubscriptions) {
      const price = getPriceFromSubscription(sub);
      const clients =
        await this.capabilityManager.priceIdsToClientCapabilities([price.id]);
      if (!(clientId in clients)) {
        continue;
      }
      const priceInfo = mapPriceInfo(price, stripeCustomer?.currency);
      subscriptions.push(transformToWebSubscription(sub, price.id, priceInfo));
    }

    const storeIds = [
      ...googleIapPurchases.map((purchase) => purchase.sku),
      ...appleIapPurchases.map((purchase) => purchase.productId),
    ];

    let iapPriceInfoMap: ReturnType<typeof buildIapPriceInfoMap> = new Map();
    if (storeIds.length > 0) {
      const iapOfferings =
        await this.productConfigurationManager.getIapOfferings(storeIds);

      const pricesByStoreId = new Map<string, StripePrice>();
      const productsByPriceId = new Map<string, StripeProduct>();

      for (const storeId of storeIds) {
        const offering = iapOfferings.getIapPageContentByStoreId(storeId);
        if (!offering) {
          continue;
        }
        if (
          !Object.values(SubplatInterval).includes(
            offering.interval as unknown as SubplatInterval
          )
        ) {
          throw new Error(
            `Unsupported IAP interval from CMS: interval=${offering.interval} storeId=${storeId}`
          );
        }
        const priceIds =
          offering.offering.defaultPurchase.stripePlanChoices.map(
            (choice) => choice.stripePlanChoice
          );
        const price = await this.priceManager.retrieveByInterval(
          priceIds,
          offering.interval as unknown as SubplatInterval
        );
        if (!price) {
          continue;
        }
        pricesByStoreId.set(storeId, price);
        if (!productsByPriceId.has(price.id)) {
          const product = await this.productManager.retrieve(price.product);
          productsByPriceId.set(price.id, product);
        }
      }

      iapPriceInfoMap = buildIapPriceInfoMap({
        iapOfferings,
        pricesByStoreId,
        productsByPriceId,
        googlePurchases: googleIapPurchases,
        applePurchases: appleIapPurchases,
      });
    }

    for (const purchase of googleIapPurchases) {
      const iap = iapPriceInfoMap.get(purchase.sku);
      if (!iap) {
        continue;
      }
      const clients =
        await this.capabilityManager.priceIdsToClientCapabilities([iap.priceId]);
      if (!(clientId in clients)) {
        continue;
      }
      subscriptions.push(transformToGoogleIapSubscription(purchase, iap));
    }

    for (const purchase of appleIapPurchases) {
      const iap = iapPriceInfoMap.get(purchase.productId);
      if (!iap) {
        continue;
      }
      const clients =
        await this.capabilityManager.priceIdsToClientCapabilities([iap.priceId]);
      if (!(clientId in clients)) {
        continue;
      }
      subscriptions.push(transformToAppleIapSubscription(purchase, iap));
    }

    return {
      ...billingDetails,
      subscriptions,
    };
  }
}
