/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, type LoggerService } from '@nestjs/common';
import {
  getSubplatInterval,
  AccountCreditBalance,
  CustomerManager,
  DefaultPaymentMethod,
  InvoiceManager,
  PaymentMethodManager,
  SubscriptionManager,
  SubplatInterval,
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
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { SanitizeExceptions } from '@fxa/shared/error';
import {
  SubscriptionContentMissingIntervalInformationError,
  SubscriptionContentMissingLatestInvoiceError,
  SubscriptionContentMissingLatestInvoicePreviewError,
  SubscriptionContentMissingUpcomingInvoicePreviewError,
} from './subscriptionManagement.error';
import { SubscriptionContent } from './types';

@Injectable()
export class SubscriptionManagementService {
  constructor(
    @Inject(Logger) private log: LoggerService,
    private accountCustomerManager: AccountCustomerManager,
    private customerManager: CustomerManager,
    private invoiceManager: InvoiceManager,
    private paymentMethodManager: PaymentMethodManager,
    private productConfigurationManager: ProductConfigurationManager,
    private subscriptionManager: SubscriptionManager
  ) {}

  @SanitizeExceptions()
  async getPageContent(uid: string) {
    let defaultPaymentMethod: DefaultPaymentMethod | undefined;
    let subscriptions: SubscriptionContent[] = [];
    let accountCreditBalance: AccountCreditBalance = {
      balance: 0,
      currency: 'usd',
    };
    const accountCustomer = await this.accountCustomerManager
      .getAccountCustomerByUid(uid)
      .catch((error) => {
        if (!(error instanceof AccountCustomerNotFoundError)) {
          throw error;
        }
      });

    if (accountCustomer && accountCustomer.stripeCustomerId) {
      const [subs, customer] = await Promise.all([
        this.subscriptionManager.listForCustomer(
          accountCustomer.stripeCustomerId
        ),
        this.customerManager.retrieve(accountCustomer.stripeCustomerId),
      ]);
      const [customerBalance, paymentMethod] = await Promise.all([
        this.customerManager.getBalance(customer.id),
        this.paymentMethodManager.getDefaultPaymentMethod(customer, subs, uid),
      ]);

      defaultPaymentMethod = paymentMethod;
      accountCreditBalance = {
        balance: Math.abs(customerBalance.balance),
        currency: customerBalance.currency ?? subs[0]?.currency,
      };

      if (subs.length === 0) {
        return { accountCreditBalance, defaultPaymentMethod, subscriptions };
      }

      const priceIds = subs.flatMap((sub) =>
        sub.items.data.map((item) => item.price.id)
      );
      const productMap =
        await this.productConfigurationManager.getProductNameByPriceIds(
          priceIds
        );

      if (!productMap) {
        console.warn('Unable to retrieve product names map from CMS');
      }

      const subsContent = await Promise.all(
        subs.map(async (sub) => {
          try {
            const item = sub.items.data[0];
            const price = item.price;
            const priceId = price.id;
            const productName = productMap?.productNameForPriceId(priceId);
            if (!productName) {
              console.warn(`No product name for price id: ${priceId}`);
            }
            return this.getSubscriptionContent(
              sub,
              customer,
              price,
              productName ?? 'Mozilla Subscription'
            );
          } catch {
            return null;
          }
        })
      );
      subscriptions = subsContent.filter(
        (s): s is SubscriptionContent => s !== null
      );
    }

    return {
      accountCreditBalance,
      defaultPaymentMethod,
      subscriptions,
    };
  }

  @SanitizeExceptions()
  async getSubscriptionContent(
    subscription: StripeSubscription,
    customer: StripeCustomer,
    price: StripePrice,
    productName: string
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
      discountAmount,
      promotionName,
      taxAmounts,
      totalAmount,
      totalExcludingTax,
    } = latestInvoice;

    const {
      nextInvoiceDate,
      taxAmounts: nextInvoiceTaxAmounts,
      totalAmount: nextInvoiceTotalAmount,
      totalExcludingTax: nextInvoiceTotalExcludingTax,
    } = upcomingInvoice;

    const totalExclusiveTax = taxAmounts
      .filter((tax) => !tax.inclusive)
      .reduce((sum, tax) => sum + tax.amount, 0);

    const nextInvoiceTotalExclusiveTax = nextInvoiceTaxAmounts
      .filter((tax) => !tax.inclusive)
      .reduce((sum, tax) => sum + tax.amount, 0);

    return {
      productName,
      currency: subscription.currency,
      interval: subplatInterval ?? SubplatInterval.Monthly,
      currentInvoiceTax: creditApplied ? 0 : Math.max(0, totalExclusiveTax),
      currentInvoiceTotal:
        creditApplied || amountDue <= 0
          ? amountDue
          : (totalExcludingTax ?? totalAmount),
      currentPeriodEnd: subscription.current_period_end,
      nextInvoiceDate,
      nextInvoiceTax: nextInvoiceTotalExclusiveTax,
      nextInvoiceTotal: nextInvoiceTotalExcludingTax ?? nextInvoiceTotalAmount,
      discountApplied: discountAmount ? true : false,
      promotionName,
    };
  }
}
