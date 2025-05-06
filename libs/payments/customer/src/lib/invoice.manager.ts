/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import {
  StripeClient,
  StripeCustomer,
  StripeInvoice,
  StripePromotionCode,
  StripeSubscriptionItem,
} from '@fxa/payments/stripe';
import {
  ChargeOptions,
  ChargeResponse,
  PayPalClient,
  PayPalClientError,
} from '@fxa/payments/paypal';
import { CurrencyManager } from '@fxa/payments/currency';
import {
  InvoicePreview,
  STRIPE_CUSTOMER_METADATA,
  STRIPE_INVOICE_METADATA,
  TaxAddress,
} from './types';
import { isCustomerTaxEligible } from './util/isCustomerTaxEligible';
import { stripeInvoiceToInvoicePreviewDTO } from './util/stripeInvoiceToFirstInvoicePreviewDTO';
import { getMinimumChargeAmountForCurrency } from './util/getMinimumChargeAmountForCurrency';
import {
  InvalidInvoiceError,
  PayPalPaymentFailedError,
  StripePayPalAgreementNotFoundError,
  UpgradeCustomerMissingCurrencyInvoiceError,
} from './error';

@Injectable()
export class InvoiceManager {
  constructor(
    private stripeClient: StripeClient,
    private paypalClient: PayPalClient,
    private currencyManager: CurrencyManager
  ) {}

  async finalizeWithoutAutoAdvance(invoiceId: string) {
    return this.stripeClient.invoicesFinalizeInvoice(invoiceId, {
      auto_advance: false,
    });
  }

  async previewUpcoming({
    priceId,
    currency,
    customer,
    taxAddress,
    couponCode,
  }: {
    priceId: string;
    currency: string;
    customer?: StripeCustomer;
    taxAddress?: TaxAddress;
    couponCode?: string;
  }): Promise<InvoicePreview> {
    let promoCode: StripePromotionCode | undefined;
    if (couponCode) {
      const promotionCodes = await this.stripeClient.promotionCodesList({
        active: true,
        code: couponCode,
      });
      promoCode = promotionCodes.data.at(0);
    }
    const automaticTax = !!(
      (customer && isCustomerTaxEligible(customer)) ||
      (!customer && taxAddress)
    );

    const shipping = taxAddress
      ? {
          name: '',
          address: {
            country: taxAddress.countryCode,
            postal_code: taxAddress.postalCode,
          },
        }
      : undefined;

    const requestObject: Stripe.InvoiceRetrieveUpcomingParams = {
      currency,
      customer: customer?.id,
      automatic_tax: {
        enabled: automaticTax,
      },
      customer_details: {
        tax_exempt: 'none', // Param required when shipping address not present
        shipping,
      },
      subscription_details: {
        items: [{ price: priceId }],
      },
      discounts: [{ promotion_code: promoCode?.id }],
    };

    const upcomingInvoice =
      await this.stripeClient.invoicesRetrieveUpcoming(requestObject);

    return stripeInvoiceToInvoicePreviewDTO(upcomingInvoice);
  }

  async previewUpcomingUpgrade({
    priceId,
    customer,
    fromSubscriptionItem,
  }: {
    priceId: string;
    customer: StripeCustomer;
    fromSubscriptionItem: StripeSubscriptionItem;
  }): Promise<InvoicePreview> {
    const requestObject: Stripe.InvoiceRetrieveUpcomingParams = {
      customer: customer.id,
      subscription_details: {
        items: [
          {
            price: priceId,
            id: fromSubscriptionItem.id,
          },
        ],
        proration_behavior: 'always_invoice',
        proration_date: Math.floor(Date.now() / 1000),
      },
      subscription: fromSubscriptionItem.subscription,
    };

    const upcomingInvoice =
      await this.stripeClient.invoicesRetrieveUpcoming(requestObject);

    return stripeInvoiceToInvoicePreviewDTO(upcomingInvoice);
  }

  async previewUpcomingForUpgrade({
    priceId,
    customer,
    fromSubscriptionItem,
  }: {
    priceId: string;
    customer: StripeCustomer;
    fromSubscriptionItem: StripeSubscriptionItem;
  }): Promise<InvoicePreview> {
    if (!customer.currency) {
      throw new UpgradeCustomerMissingCurrencyInvoiceError(
        'Customer should have currency for upgrade'
      );
    }

    // This is a preview of the invoice a customer would receive for the new plan
    const previewSubsequentInvoice = await this.previewUpcoming({
      priceId,
      currency: customer.currency,
      customer,
    });

    // This is a preview of the invoice a customer would receive on checkout of an upgrade
    const previewUpcomingInvoiceOfUpgrade = await this.previewUpcomingUpgrade({
      priceId,
      customer,
      fromSubscriptionItem,
    });

    return {
      ...previewSubsequentInvoice,
      oneTimeCharge: previewUpcomingInvoiceOfUpgrade.totalAmount,
    };
  }

  /**
   * Fetch the invoice preview for the latest invoice associated with a cart
   */
  async preview(invoiceId: string): Promise<InvoicePreview> {
    const invoice = await this.retrieve(invoiceId);
    return stripeInvoiceToInvoicePreviewDTO(invoice);
  }

  /**
   * Retrieves an invoice
   */
  async retrieve(invoiceId: string) {
    return this.stripeClient.invoicesRetrieve(invoiceId);
  }

  /**
   * Deletes an invoice. Invoice must be in Draft state.
   */
  async delete(invoiceId: string) {
    return this.stripeClient.invoicesDelete(invoiceId);
  }

  /**
   * Voids an invoice. Invoice must be in Open or Uncollectable states.
   */
  async void(invoiceId: string) {
    return this.stripeClient.invoicesVoid(invoiceId);
  }

  /**
   * Process an invoice when amount is greater than minimum amount
   */
  async processPayPalNonZeroInvoice(
    customer: StripeCustomer,
    invoice: StripeInvoice,
    ipaddress?: string
  ) {
    if (!customer.metadata[STRIPE_CUSTOMER_METADATA.PaypalAgreement]) {
      throw new StripePayPalAgreementNotFoundError(customer.id);
    }
    if (invoice.status === 'paid') {
      if (!invoice.metadata?.[STRIPE_INVOICE_METADATA.PaypalTransactionId]) {
        throw new InvalidInvoiceError(
          `Invoice ${invoice.id} is marked paid without a transaction id`
        );
      }
      return invoice;
    } else if (!['draft', 'open'].includes(invoice.status ?? '')) {
      throw new InvalidInvoiceError(
        `Invoice is in ${invoice.status} state, expected draft or open`
      );
    }

    const countryCode =
      invoice.customer_shipping?.address?.country ??
      this.currencyManager.getDefaultCountryForCurrency(
        invoice.currency.toUpperCase()
      );
    if (!countryCode) {
      throw new Error(
        'No valid country code could be found for invoice or currency'
      );
    }

    // PayPal allows for idempotent retries on payment attempts to prevent double charging.
    const paymentAttemptCount = parseInt(
      invoice?.metadata?.[STRIPE_INVOICE_METADATA.RetryAttempts] ?? '0'
    );
    const idempotencyKey = `${invoice.id}-${paymentAttemptCount}`;

    // Charge the customer on PayPal
    const chargeOptions = {
      amountInCents: invoice.amount_due,
      billingAgreementId:
        customer.metadata[STRIPE_CUSTOMER_METADATA.PaypalAgreement],
      invoiceNumber: invoice.id,
      currencyCode: invoice.currency,
      countryCode,
      idempotencyKey,
      ...(ipaddress && { ipaddress }),
      ...(invoice.tax !== null && { taxAmountInCents: invoice.tax }),
    } satisfies ChargeOptions;
    let paypalCharge: ChargeResponse;
    try {
      // Charge the PayPal customer after the invoice is finalized to prevent charges with a failed invoice
      try {
        // Duplicate calls to finalizeInvoice can be made due to race conditions. Failures from re-finalizing an invoice can be ignored.
        await this.finalizeWithoutAutoAdvance(invoice.id);
      } catch (err) {
        // This is Stripe's only unique way of identifying this error. Remove as part of FXA-11460
        if (
          err?.raw?.message !==
          "This invoice is already finalized, you can't re-finalize a non-draft invoice."
        ) {
          throw err;
        }
      }

      paypalCharge = await this.paypalClient.chargeCustomer(chargeOptions);
    } catch (error) {
      if (PayPalClientError.hasPayPalNVPError(error)) {
        PayPalClientError.throwPaypalCodeError(error);
      }
      throw error;
    }

    // update Stripe payment charge attempt count
    const updatedPaymentAttemptCount = paymentAttemptCount + 1;
    let updatedInvoice = await this.stripeClient.invoicesUpdate(invoice.id, {
      metadata: {
        [STRIPE_INVOICE_METADATA.RetryAttempts]: updatedPaymentAttemptCount,
      },
    });

    // Process the transaction by PayPal charge status
    switch (paypalCharge.paymentStatus) {
      case 'Completed':
      case 'Processed':
        [updatedInvoice] = await Promise.all([
          this.stripeClient.invoicesUpdate(invoice.id, {
            metadata: {
              [STRIPE_INVOICE_METADATA.PaypalTransactionId]:
                paypalCharge.transactionId,
            },
          }),
          this.stripeClient.invoicesPay(invoice.id),
        ]);

        return await this.stripeClient.invoicesRetrieve(updatedInvoice.id);
      case 'Pending':
      case 'In-Progress':
        return updatedInvoice;
      case 'Denied':
      case 'Failed':
      case 'Voided':
      case 'Expired':
      default:
        throw new PayPalPaymentFailedError(paypalCharge.paymentStatus);
    }
  }

  /**
   * Finalize and process a draft invoice that has no amounted owed.
   */
  async processPayPalZeroInvoice(invoiceId: string) {
    // It appears for subscriptions that do not require payment, the invoice
    // transitions to paid automatially.
    // https://stripe.com/docs/billing/invoices/subscription#sub-invoice-lifecycle
    return this.finalizeWithoutAutoAdvance(invoiceId);
  }

  /**
   * Process an invoice
   * If amount is less than minimum amount, call processZeroInvoice
   * If amount is greater than minimum amount, call processNonZeroInvoice (legacy PaypalHelper processInvoice)
   */
  async processPayPalInvoice(invoice: StripeInvoice) {
    if (!invoice.customer) throw new Error('Customer not present on invoice');
    const amountInCents = invoice.amount_due;

    if (amountInCents < getMinimumChargeAmountForCurrency(invoice.currency)) {
      return await this.processPayPalZeroInvoice(invoice.id);
    }

    const customer = await this.stripeClient.customersRetrieve(
      invoice.customer
    );
    if (customer.deleted)
      throw new Error('Processing paypal invoice on deleted customer');

    return await this.processPayPalNonZeroInvoice(customer, invoice);
  }
}
