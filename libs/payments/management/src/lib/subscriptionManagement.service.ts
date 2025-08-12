/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { StatsD } from 'hot-shots';

import {
  getSubplatInterval,
  AccountCreditBalance,
  CustomerManager,
  DefaultPaymentMethod,
  InvoiceManager,
  PaymentMethodManager,
  CustomerSessionManager,
  SetupIntentManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
} from '@fxa/payments/stripe';
import type {
  StripeCustomer,
  StripePrice,
  StripeSubscription,
} from '@fxa/payments/stripe';
import { SanitizeExceptions } from '@fxa/shared/error';
import { CurrencyManager } from '@fxa/payments/currency';
import {
  AppleIapPurchaseManager,
  GoogleIapPurchaseManager,
} from '@fxa/payments/iap';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import {
  CurrencyForCustomerNotFoundError,
  GetAccountCustomerMissingStripeId,
  SetDefaultPaymentAccountCustomerMissingStripeId,
  SetupIntentInvalidStatusError,
  SetupIntentMissingCustomerError,
  SetupIntentMissingPaymentMethodError,
  SubscriptionContentMissingIntervalInformationError,
  SubscriptionContentMissingLatestInvoiceError,
  SubscriptionContentMissingLatestInvoicePreviewError,
  SubscriptionContentMissingUpcomingInvoicePreviewError,
  SubscriptionManagementCouldNotRetrieveIapProductNamesFromCMSError,
  SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError,
  UpdateAccountCustomerMissingStripeId,
  CancelSubscriptionCustomerMismatch,
  ResubscribeSubscriptionCustomerMismatch,
} from './subscriptionManagement.error';
import { NotifierService } from '@fxa/shared/notifier';
import { ProfileClient } from '@fxa/profile/client';
import {
  AppleIapPurchaseResult,
  AppleIapSubscriptionContent,
  GoogleIapPurchaseResult,
  GoogleIapSubscriptionContent,
  SubscriptionContent,
} from './types';

@Injectable()
export class SubscriptionManagementService {
  constructor(
    @Inject(StatsDService) private statsd: StatsD,
    private accountCustomerManager: AccountCustomerManager,
    private appleIapPurchaseManager: AppleIapPurchaseManager,
    private currencyManager: CurrencyManager,
    private customerManager: CustomerManager,
    private customerSessionManager: CustomerSessionManager,
    private googleIapPurchaseManager: GoogleIapPurchaseManager,
    private invoiceManager: InvoiceManager,
    private notifierService: NotifierService,
    private paymentMethodManager: PaymentMethodManager,
    private profileClient: ProfileClient,
    private productConfigurationManager: ProductConfigurationManager,
    private setupIntentManager: SetupIntentManager,
    private subscriptionManager: SubscriptionManager
  ) {}

  @SanitizeExceptions()
  async cancelSubscriptionAtPeriodEnd(uid: string, subscriptionId: string) {
    const accountCustomer =
      await this.accountCustomerManager.getAccountCustomerByUid(uid);
    const subscription =
      await this.subscriptionManager.retrieve(subscriptionId);

    if (subscription.customer !== accountCustomer.stripeCustomerId) {
      throw new CancelSubscriptionCustomerMismatch(
        uid,
        accountCustomer.uid,
        subscription.customer,
        subscriptionId
      );
    }

    await this.subscriptionManager.update(subscriptionId, {
      cancel_at_period_end: true,
      metadata: {
        ...(subscription.metadata || {}),
        cancelled_for_customer_at: Math.floor(Date.now() / 1000),
      },
    });

    // Figure out where to add this, or if to just duplicate it.
    await this.customerChanged(uid);
  }

  /**
   * Reload the customer data to reflect a change.
   * NOTE: This is currently duplicated in checkout.service.ts
   */
  private async customerChanged(uid: string) {
    await this.profileClient.deleteCache(uid);

    this.notifierService.send({
      event: 'profileDataChange',
      data: {
        ts: Date.now() / 1000,
        uid,
      },
    });
  }

  @SanitizeExceptions({
    allowlist: [
      SubscriptionContentMissingLatestInvoiceError,
      SubscriptionContentMissingIntervalInformationError,
      SubscriptionContentMissingLatestInvoicePreviewError,
      SubscriptionContentMissingUpcomingInvoicePreviewError,
      SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError,
      SubscriptionManagementCouldNotRetrieveIapProductNamesFromCMSError,
    ],
  })
  async getPageContent(
    uid: string,
    acceptLanguage?: string,
    selectedLanguage?: string
  ) {
    const subscriptions: SubscriptionContent[] = [];
    let appleIapSubscriptions: AppleIapSubscriptionContent[] = [];
    let googleIapSubscriptions: GoogleIapSubscriptionContent[] = [];
    let defaultPaymentMethod: DefaultPaymentMethod | undefined;
    let accountCreditBalance: AccountCreditBalance = {
      balance: 0,
      currency: null,
    };
    const [accountCustomer, appleIapSubs, googleIapSubs] = await Promise.all([
      this.accountCustomerManager
        .getAccountCustomerByUid(uid)
        .catch((error) => {
          if (!(error instanceof AccountCustomerNotFoundError)) {
            throw error;
          }
          return undefined;
        }),
      this.getAppleIapPurchases(uid),
      this.getGoogleIapPurchases(uid),
    ]);

    let stripeSubs: StripeSubscription[] = [];
    let stripeCustomer: StripeCustomer | undefined;

    if (accountCustomer && accountCustomer.stripeCustomerId) {
      [stripeSubs, stripeCustomer] = await Promise.all([
        this.subscriptionManager.listForCustomer(
          accountCustomer.stripeCustomerId
        ),
        this.customerManager.retrieve(accountCustomer.stripeCustomerId),
      ]);

      defaultPaymentMethod =
        await this.paymentMethodManager.getDefaultPaymentMethod(
          stripeCustomer,
          stripeSubs,
          uid
        );

      accountCreditBalance = {
        balance: Math.abs(stripeCustomer.balance),
        currency: stripeCustomer.currency ?? stripeSubs[0]?.currency ?? null,
      };
    }

    const hasStripe = stripeSubs.length > 0;
    const hasAppleIap = appleIapSubs.purchaseDetails.length > 0;
    const hasGoogleIap = googleIapSubs.purchaseDetails.length > 0;

    if (!hasStripe && !hasAppleIap && !hasGoogleIap) {
      return {
        accountCreditBalance,
        defaultPaymentMethod,
        subscriptions: [],
        appleIapSubscriptions: [],
        googleIapSubscriptions: [],
      };
    }

    if (hasStripe && stripeCustomer) {
      const stripePriceIds = stripeSubs.flatMap((sub) =>
        sub.items.data.map((item) => item.price.id)
      );
      const productMap =
        await this.productConfigurationManager.getPageContentByPriceIds(
          stripePriceIds,
          acceptLanguage,
          selectedLanguage
        );

      if (!productMap) {
        throw new SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError(
          stripePriceIds
        );
      }

      for (const sub of stripeSubs) {
        const item = sub.items.data[0];
        const price = item.price;
        const priceId = price.id;
        const cmsPurchase = productMap.purchaseForPriceId(priceId);
        const productName =
          cmsPurchase.purchaseDetails.localizations[0]?.productName ||
          cmsPurchase.purchaseDetails.productName;
        const webIcon =
          cmsPurchase.purchaseDetails.localizations[0]?.webIcon ||
          cmsPurchase.purchaseDetails.webIcon;
        const content = await this.getSubscriptionContent(
          sub,
          stripeCustomer,
          price,
          productName,
          webIcon
        );

        if (content) {
          subscriptions.push(content);
        }
      }
    }

    const storeIds = [
      ...new Set([...appleIapSubs.storeIds, ...googleIapSubs.storeIds]),
    ];

    let storeMap: Record<string, string | undefined> = {};
    if (storeIds.length > 0) {
      storeMap =
        await this.productConfigurationManager.getProductNamesByStoreIds(
          storeIds
        );

      if (!storeMap) {
        throw new SubscriptionManagementCouldNotRetrieveIapProductNamesFromCMSError(
          storeIds
        );
      }
    }

    const getIapProductName = (storeId: string, fallback: string): string => {
      if (!storeId) return fallback;
      const productName = storeMap[storeId];
      if (!productName) {
        Sentry.captureMessage('No product name for store id', {
          extra: { uid, storeId },
        });
      }
      return productName ?? fallback;
    };

    if (hasAppleIap) {
      appleIapSubscriptions = appleIapSubs.purchaseDetails.map((purchase) => ({
        ...purchase,
        productName: getIapProductName(
          purchase.storeId,
          'Apple IAP Subscription'
        ),
      }));
    }

    if (hasGoogleIap) {
      googleIapSubscriptions = googleIapSubs.purchaseDetails.map(
        (purchase) => ({
          ...purchase,
          productName: getIapProductName(
            purchase.storeId,
            'Google IAP Subscription'
          ),
        })
      );
    }

    return {
      accountCreditBalance,
      defaultPaymentMethod,
      subscriptions,
      appleIapSubscriptions,
      googleIapSubscriptions,
    };
  }

  private async getAppleIapPurchases(uid: string) {
    const purchases: AppleIapPurchaseResult = {
      storeIds: [],
      purchaseDetails: [],
    };

    const appleIapSubscriptions =
      await this.appleIapPurchaseManager.getForUser(uid);

    for (const purchase of appleIapSubscriptions) {
      purchases.storeIds.push(purchase.productId);
      purchases.purchaseDetails.push({
        storeId: purchase.productId,
        expiresDate: purchase.expiresDate,
      });
    }
    return purchases;
  }

  private async getGoogleIapPurchases(uid: string) {
    const purchases: GoogleIapPurchaseResult = {
      storeIds: [],
      purchaseDetails: [],
    };

    const googleIapSubscriptions =
      await this.googleIapPurchaseManager.getForUser(uid);

    for (const purchase of googleIapSubscriptions) {
      purchases.storeIds.push(purchase.sku);
      purchases.purchaseDetails.push({
        storeId: purchase.sku,
        autoRenewing: purchase.autoRenewing,
        expiryTimeMillis: purchase.expiryTimeMillis,
        packageName: purchase.packageName,
        sku: purchase.sku,
      });
    }
    return purchases;
  }

  private async getSubscriptionContent(
    subscription: StripeSubscription,
    customer: StripeCustomer,
    price: StripePrice,
    productName: string,
    webIcon: string
  ): Promise<SubscriptionContent> {
    const currency = subscription.currency;
    const latestInvoiceId = subscription.latest_invoice;

    if (!latestInvoiceId) {
      throw new SubscriptionContentMissingLatestInvoiceError(subscription.id);
    }

    const interval = price.recurring?.interval;
    const intervalCount = price.recurring?.interval_count;

    if (!interval || !intervalCount) {
      throw new SubscriptionContentMissingIntervalInformationError(
        subscription.id,
        price.id
      );
    }

    const subplatInterval = getSubplatInterval(interval, intervalCount);
    const priceId = price.id;

    const [latestInvoice, upcomingInvoice] = await Promise.all([
      this.invoiceManager.preview(latestInvoiceId),
      this.invoiceManager.previewUpcoming({ priceId, currency, customer }),
    ]);

    if (!latestInvoice) {
      throw new SubscriptionContentMissingLatestInvoicePreviewError(
        subscription.id,
        latestInvoiceId
      );
    }

    if (!upcomingInvoice) {
      throw new SubscriptionContentMissingUpcomingInvoicePreviewError(
        subscription.id,
        price.id,
        currency,
        customer
      );
    }

    const {
      amountDue,
      creditApplied,
      promotionName,
      taxAmounts,
      totalAmount,
      totalExcludingTax,
    } = latestInvoice;

    const {
      nextInvoiceDate,
      subsequentAmount,
      subsequentAmountExcludingTax,
      subsequentTax,
    } = upcomingInvoice;

    const totalExclusiveTax = taxAmounts
      .filter((tax) => !tax.inclusive)
      .reduce((sum, tax) => sum + tax.amount, 0);

    const nextInvoiceTotalExclusiveTax =
      subsequentTax &&
      subsequentTax
        .filter((tax) => !tax.inclusive)
        .reduce((sum, tax) => sum + tax.amount, 0);

    return {
      id: subscription.id,
      productName,
      webIcon,
      canResubscribe:
        subscription.status === 'active' && subscription.cancel_at_period_end,
      currency: subscription.currency,
      interval: subplatInterval,
      currentInvoiceTax: creditApplied ? 0 : Math.max(0, totalExclusiveTax),
      currentInvoiceTotal:
        creditApplied || amountDue <= 0
          ? amountDue
          : totalExclusiveTax
            ? (totalExcludingTax ?? totalAmount)
            : totalAmount,
      currentPeriodEnd: subscription.current_period_end,
      nextInvoiceDate,
      nextInvoiceTax: nextInvoiceTotalExclusiveTax,
      nextInvoiceTotal:
        nextInvoiceTotalExclusiveTax && nextInvoiceTotalExclusiveTax > 0
          ? (subsequentAmountExcludingTax ?? subsequentAmount)
          : subsequentAmount,
      promotionName,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  }

  @SanitizeExceptions({ allowlist: [AccountCustomerNotFoundError] })
  async getStripePaymentManagementDetails(uid: string) {
    const accountCustomer =
      await this.accountCustomerManager.getAccountCustomerByUid(uid);

    if (!accountCustomer.stripeCustomerId) {
      throw new GetAccountCustomerMissingStripeId(uid);
    }

    const customerSessionPromise =
      this.customerSessionManager.createManagementSession(
        accountCustomer.stripeCustomerId
      );

    const defaultPaymentMethodPromise =
      this.customerManager.getDefaultPaymentMethod(
        accountCustomer.stripeCustomerId
      );

    const customerPromise = this.customerManager.retrieve(
      accountCustomer.stripeCustomerId
    );

    const [customerSession, customer, defaultPaymentMethod] = await Promise.all(
      [customerSessionPromise, customerPromise, defaultPaymentMethodPromise]
    );

    let currency = customer.currency;
    if (!currency && customer.shipping?.address?.country) {
      currency = this.currencyManager.getCurrencyForCountry(
        customer.shipping.address.country
      );
    }
    if (!currency && defaultPaymentMethod?.billing_details.address?.country) {
      currency = this.currencyManager.getCurrencyForCountry(
        defaultPaymentMethod.billing_details.address.country
      );
    }
    if (!currency) {
      throw new CurrencyForCustomerNotFoundError(customer.id);
    }

    return {
      clientSecret: customerSession.client_secret,
      customer: customerSession.customer,
      defaultPaymentMethodId: defaultPaymentMethod?.id,
      currency,
    };
  }

  @SanitizeExceptions()
  async resubscribeSubscription(uid: string, subscriptionId: string) {
    const accountCustomer =
      await this.accountCustomerManager.getAccountCustomerByUid(uid);
    const subscription =
      await this.subscriptionManager.retrieve(subscriptionId);

    if (subscription.customer !== accountCustomer.stripeCustomerId) {
      throw new ResubscribeSubscriptionCustomerMismatch(
        uid,
        accountCustomer.uid,
        subscription.customer,
        subscriptionId
      );
    }

    await this.subscriptionManager.update(subscriptionId, {
      cancel_at_period_end: false,
      metadata: {
        ...(subscription.metadata || {}),
        cancelled_for_customer_at: '',
      },
    });

    // Figure out where to add this, or if to just duplicate it.
    await this.customerChanged(uid);
  }

  @SanitizeExceptions()
  async updateStripePaymentDetails(uid: string, confirmationTokenId: string) {
    const accountCustomer =
      await this.accountCustomerManager.getAccountCustomerByUid(uid);

    if (!accountCustomer.stripeCustomerId) {
      throw new UpdateAccountCustomerMissingStripeId(uid);
    }

    const setupIntent = await this.setupIntentManager.createAndConfirm(
      accountCustomer.stripeCustomerId,
      confirmationTokenId
    );
    this.statsd.increment(
      'sub_management_update_stripe_payment_setupintent_status',
      { status: setupIntent.status }
    );

    if (!['succeeded', 'requires_action'].includes(setupIntent.status)) {
      throw new SetupIntentInvalidStatusError(
        setupIntent.id,
        setupIntent.status
      );
    }

    if (setupIntent.status === 'requires_action') {
      return {
        id: setupIntent.id,
        clientSecret: setupIntent.client_secret,
        status: setupIntent.status,
      };
    }

    if (!setupIntent.payment_method) {
      throw new SetupIntentMissingPaymentMethodError(
        setupIntent.id,
        setupIntent.status,
        setupIntent.customer
      );
    }

    if (!setupIntent.customer) {
      throw new SetupIntentMissingCustomerError(
        setupIntent.id,
        setupIntent.status
      );
    }

    const paymentMethod = await this.paymentMethodManager.retrieve(
      setupIntent.payment_method
    );

    await this.customerManager.update(setupIntent.customer, {
      invoice_settings: {
        default_payment_method: setupIntent.payment_method,
      },
      name: paymentMethod.billing_details.name ?? undefined,
    });

    return {
      id: setupIntent.id,
      clientSecret: setupIntent.client_secret,
      status: setupIntent.status,
    };
  }

  @SanitizeExceptions()
  async setDefaultStripePaymentDetails(
    uid: string,
    paymentMethodId: string,
    fullName: string
  ) {
    const accountCustomer =
      await this.accountCustomerManager.getAccountCustomerByUid(uid);

    if (!accountCustomer.stripeCustomerId) {
      throw new SetDefaultPaymentAccountCustomerMissingStripeId(uid);
    }

    await this.customerManager.update(accountCustomer.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
      name: fullName,
    });
  }
}
