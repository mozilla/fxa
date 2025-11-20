/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
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
  CustomerDeletedError,
  STRIPE_SUBSCRIPTION_METADATA,
  STRIPE_CUSTOMER_METADATA,
} from '@fxa/payments/customer';
import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
} from '@fxa/payments/stripe';
import type {
  ResultAccountCustomer,
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
  SubscriptionManagementCouldNotRetrieveIapContentFromCMSError,
  SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError,
  UpdateAccountCustomerMissingStripeId,
  CancelSubscriptionCustomerMismatch,
  SubscriptionCustomerMismatch,
  ResubscribeSubscriptionCustomerMismatch,
  CreateBillingAgreementAccountCustomerMissingStripeId,
  CreateBillingAgreementActiveBillingAgreement,
  CreateBillingAgreementCurrencyNotFound,
  CreateBillingAgreementPaypalSubscriptionNotFound,
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
import {
  PaypalBillingAgreementManager,
  PaypalCustomerManager,
  ResultPaypalCustomer,
} from '@fxa/payments/paypal';

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
    private subscriptionManager: SubscriptionManager,
    private paypalBillingAgreementManager: PaypalBillingAgreementManager,
    private paypalCustomerManager: PaypalCustomerManager
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
        [STRIPE_SUBSCRIPTION_METADATA.CancelledForCustomerAt]: Math.floor(
          Date.now() / 1000
        ),
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
      SubscriptionManagementCouldNotRetrieveIapContentFromCMSError,
    ],
  })
  async getPageContent(
    uid: string,
    acceptLanguage?: string,
    selectedLanguage?: string
  ) {
    const subscriptions: SubscriptionContent[] = [];
    const appleIapSubscriptions: AppleIapSubscriptionContent[] = [];
    const googleIapSubscriptions: GoogleIapSubscriptionContent[] = [];
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
        this.customerManager
          .retrieve(accountCustomer.stripeCustomerId)
          .catch((error) => {
            if (!(error instanceof CustomerDeletedError)) {
              throw error;
            }
            return undefined;
          }),
      ]);

      defaultPaymentMethod = stripeCustomer
        ? await this.paymentMethodManager.getDefaultPaymentMethod(
            stripeCustomer,
            stripeSubs,
            uid
          )
        : undefined;

      accountCreditBalance = {
        balance: Math.abs(stripeCustomer?.balance ?? 0),
        currency: stripeCustomer?.currency ?? stripeSubs[0]?.currency ?? null,
      };
    }

    const hasStripe = stripeSubs.length > 0;
    const hasAppleIap = appleIapSubs.purchaseDetails.length > 0;
    const hasGoogleIap = googleIapSubs.purchaseDetails.length > 0;

    if (!hasStripe && !hasAppleIap && !hasGoogleIap) {
      return {
        accountCreditBalance,
        defaultPaymentMethod,
        isStripeCustomer: stripeCustomer ? true : false,
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
        const webIcon = cmsPurchase.purchaseDetails.webIcon;
        const supportUrl = cmsPurchase.offering.commonContent.supportUrl;
        const content = await this.getSubscriptionContent(
          sub,
          stripeCustomer,
          price,
          productName,
          webIcon,
          supportUrl
        );

        if (content) {
          subscriptions.push(content);
        }
      }
    }

    if (hasAppleIap || hasGoogleIap) {
      const storeIds = [
        ...new Set([...appleIapSubs.storeIds, ...googleIapSubs.storeIds]),
      ];

      const storeMap =
        await this.productConfigurationManager.getIapPageContentByStoreIds(
          storeIds
        );

      if (!storeMap) {
        throw new SubscriptionManagementCouldNotRetrieveIapContentFromCMSError(
          storeIds
        );
      }

      if (hasAppleIap) {
        for (const purchase of appleIapSubs.purchaseDetails) {
          const cmsContent = storeMap[purchase.storeId];
          const productName =
            cmsContent.offering.defaultPurchase.purchaseDetails.localizations[0]
              ?.productName ||
            cmsContent.offering.defaultPurchase.purchaseDetails.productName;
          const supportUrl = cmsContent.offering.commonContent.supportUrl;
          const webIcon =
            cmsContent.offering.defaultPurchase.purchaseDetails.webIcon;

          appleIapSubscriptions.push({
            ...purchase,
            productName,
            supportUrl,
            webIcon,
          });
        }
      }

      if (hasGoogleIap) {
        for (const purchase of googleIapSubs.purchaseDetails) {
          const cmsContent = storeMap[purchase.storeId];
          const productName =
            cmsContent.offering.defaultPurchase.purchaseDetails.localizations[0]
              ?.productName ||
            cmsContent.offering.defaultPurchase.purchaseDetails.productName;
          const supportUrl = cmsContent.offering.commonContent.supportUrl;
          const webIcon =
            cmsContent.offering.defaultPurchase.purchaseDetails.webIcon;

          googleIapSubscriptions.push({
            ...purchase,
            productName,
            supportUrl,
            webIcon,
          });
        }
      }
    }

    return {
      accountCreditBalance,
      defaultPaymentMethod,
      isStripeCustomer: stripeCustomer ? true : false,
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
    webIcon: string,
    supportUrl: string
  ): Promise<SubscriptionContent> {
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

    const [latestInvoice, upcomingInvoice] = await Promise.all([
      this.invoiceManager.preview(latestInvoiceId),
      this.invoiceManager.previewUpcomingSubscription({
        customer,
        subscription,
      }),
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
        customer
      );
    }

    const {
      amountDue,
      creditApplied,
      invoiceDate: currentInvoiceDate,
      invoiceUrl: currentInvoiceUrl,
      promotionName,
      taxAmounts,
      totalAmount,
      totalExcludingTax,
    } = latestInvoice;

    const {
      nextInvoiceDate,
      promotionName: nextPromotionName,
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
      supportUrl,
      webIcon,
      canResubscribe:
        subscription.status === 'active' && subscription.cancel_at_period_end,
      creditApplied,
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
      currentInvoiceDate,
      currentInvoiceUrl,
      nextInvoiceDate,
      nextInvoiceTax: nextInvoiceTotalExclusiveTax,
      nextInvoiceTotal:
        nextInvoiceTotalExclusiveTax && nextInvoiceTotalExclusiveTax > 0
          ? (subsequentAmountExcludingTax ?? subsequentAmount)
          : subsequentAmount,
      nextPromotionName,
      promotionName,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  }

  @SanitizeExceptions()
  async getSubscriptionStatus(
    uid: string,
    subscriptionId: string
  ): Promise<{
    active: boolean;
    cancelAtPeriodEnd: boolean;
  }> {
    const accountCustomer =
      await this.accountCustomerManager.getAccountCustomerByUid(uid);
    const subscription = await this.subscriptionManager.retrieve(subscriptionId);

    if (subscription.customer !== accountCustomer.stripeCustomerId) {
      throw new SubscriptionCustomerMismatch(
        uid,
        accountCustomer.uid,
        subscription.customer,
        subscriptionId
      );
    }

    return {
      active: subscription.status === 'active',
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  }

  async getCurrencyForCustomer(uid: string) {
    const accountCustomer =
      await this.accountCustomerManager.getAccountCustomerByUid(uid);

    if (!accountCustomer.stripeCustomerId) {
      throw new GetAccountCustomerMissingStripeId(uid);
    }

    const defaultPaymentMethodPromise =
      this.customerManager.getDefaultPaymentMethod(
        accountCustomer.stripeCustomerId
      );

    const customerPromise = this.customerManager.retrieve(
      accountCustomer.stripeCustomerId
    );

    const [customer, defaultPaymentMethod] = await Promise.all([
      customerPromise,
      defaultPaymentMethodPromise,
    ]);

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

    return currency;
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
        [STRIPE_SUBSCRIPTION_METADATA.CancelledForCustomerAt]: '',
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

  @SanitizeExceptions()
  async createPaypalBillingAgreementId(uid: string, token: string) {
    let billingAgreementId: string | undefined;
    let accountCustomer: ResultAccountCustomer | undefined;
    let deletedPaypalCustomer: bigint | undefined;
    let recentActivePaypalCustomer: ResultPaypalCustomer | undefined;
    try {
      if (await this.paypalBillingAgreementManager.retrieveActiveId(uid)) {
        throw new CreateBillingAgreementActiveBillingAgreement(uid);
      }

      accountCustomer =
        await this.accountCustomerManager.getAccountCustomerByUid(uid);
      if (!accountCustomer.stripeCustomerId) {
        throw new CreateBillingAgreementAccountCustomerMissingStripeId(uid);
      }

      recentActivePaypalCustomer = (
        await this.paypalCustomerManager.fetchPaypalCustomersByUid(uid)
      )
        .filter((record) => record.endedAt !== null)
        .sort(
          (recordA, recordB) =>
            (recordB.endedAt as number) - (recordA.endedAt as number)
        )
        .at(0);

      const currency = await this.getCurrencyForCustomer(uid);

      if (!currency) {
        throw new CreateBillingAgreementCurrencyNotFound(uid);
      }

      const hasPaypalSubscription = (
        await this.subscriptionManager.listForCustomer(
          accountCustomer.stripeCustomerId
        )
      ).some((sub) => sub.collection_method === 'send_invoice');

      if (!hasPaypalSubscription) {
        throw new CreateBillingAgreementPaypalSubscriptionNotFound(uid);
      }

      deletedPaypalCustomer =
        await this.paypalCustomerManager.deletePaypalCustomersByUid(uid);
      billingAgreementId = await this.paypalBillingAgreementManager.create(
        uid,
        token
      );

      const billingAgreement =
        await this.paypalBillingAgreementManager.retrieve(billingAgreementId);
      this.currencyManager.assertCurrencyCompatibleWithCountry(
        currency,
        billingAgreement.countryCode
      );

      await this.customerManager.update(accountCustomer.stripeCustomerId, {
        metadata: {
          [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: billingAgreementId,
        },
      });

      await this.customerChanged(uid);
    } catch (error) {
      // clean up
      if (billingAgreementId) {
        // reinstate the paypal customer if it was deleted before the update occurred
        if (accountCustomer) {
          const currentBillingAgreementId =
            await this.paypalBillingAgreementManager.retrieveActiveId(uid);
          if (
            deletedPaypalCustomer &&
            currentBillingAgreementId &&
            currentBillingAgreementId !== billingAgreementId
          ) {
            await this.paypalCustomerManager.createPaypalCustomer({
              uid,
              billingAgreementId,
              status: 'Cancelled',
              endedAt: Date.now(),
              ...(recentActivePaypalCustomer ?? {}),
            });
          }
        }

        // cancel the newly created paypal billing agreement
        await this.paypalBillingAgreementManager.cancel(billingAgreementId);
      }

      throw error;
    }
  }
}
