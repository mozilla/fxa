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
} from '@fxa/payments/stripe';
import {
  ChargeOptions,
  ChargeResponse,
  PayPalClient,
  PayPalClientError,
} from '@fxa/payments/paypal';
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
} from './error';

@Injectable()
export class InvoiceManager {
  constructor(
    private stripeClient: StripeClient,
    private paypalClient: PayPalClient
  ) {}

  async finalizeWithoutAutoAdvance(invoiceId: string) {
    return this.stripeClient.invoicesFinalizeInvoice(invoiceId, {
      auto_advance: false,
    });
  }

  async previewUpcoming({
    priceId,
    customer,
    taxAddress,
    couponCode,
  }: {
    priceId: string;
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

    const shipping =
      !customer && taxAddress
        ? {
            name: '',
            address: {
              country: taxAddress.countryCode,
              postal_code: taxAddress.postalCode,
            },
          }
        : undefined;

    const requestObject: Stripe.InvoiceRetrieveUpcomingParams = {
      customer: customer?.id,
      automatic_tax: {
        enabled: automaticTax,
      },
      customer_details: {
        tax_exempt: 'none', // Param required when shipping address not present
        shipping,
      },
      subscription_items: [{ price: priceId }],
      discounts: [{ promotion_code: promoCode?.id }],
    };

    const upcomingInvoice = await this.stripeClient.invoicesRetrieveUpcoming(
      requestObject
    );

    return stripeInvoiceToInvoicePreviewDTO(upcomingInvoice);
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
    if (!['draft', 'open'].includes(invoice.status ?? '')) {
      throw new InvalidInvoiceError();
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
      idempotencyKey,
      ...(ipaddress && { ipaddress }),
      ...(invoice.tax && { taxAmountInCents: invoice.tax }),
    } satisfies ChargeOptions;
    let paypalCharge: ChargeResponse;
    try {
      [paypalCharge] = await Promise.all([
        this.paypalClient.chargeCustomer(chargeOptions),
        this.stripeClient.invoicesFinalizeInvoice(invoice.id),
      ]);
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

        return updatedInvoice;
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
      await this.processPayPalZeroInvoice(invoice.id);
      return;
    }

    const customer = await this.stripeClient.customersRetrieve(
      invoice.customer
    );
    if (customer.deleted)
      throw new Error('Processing paypal invoice on deleted customer');

    await this.processPayPalNonZeroInvoice(customer, invoice);
  }
}
