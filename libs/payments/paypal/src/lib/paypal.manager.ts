/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  StripeCustomer,
  StripeInvoice,
  StripeManager,
} from '@fxa/payments/stripe';
import { PayPalClient } from './paypal.client';
import { BillingAgreement, BillingAgreementStatus } from './paypal.types';
import { PaypalCustomerMultipleRecordsError } from './paypalCustomer/paypalCustomer.error';
import { PaypalCustomerManager } from './paypalCustomer/paypalCustomer.manager';
import { PaypalManagerError } from './paypal.error';

@Injectable()
export class PayPalManager {
  constructor(
    private client: PayPalClient,
    private stripeManager: StripeManager,
    private paypalCustomerManager: PaypalCustomerManager
  ) {}

  /**
   * Create billing agreement using the ExpressCheckout token.
   *
   * If the call to PayPal fails, a PayPalClientError will be thrown.
   */
  public async createBillingAgreement(token: string): Promise<string> {
    const response = await this.client.createBillingAgreement({
      token,
    });
    return response.BILLINGAGREEMENTID;
  }

  public async getOrCreateBillingAgreementId(
    uid: string,
    hasSubscriptions: boolean,
    token?: string
  ) {
    const existingBillingAgreementId = await this.getCustomerBillingAgreementId(
      uid
    );
    if (existingBillingAgreementId) return existingBillingAgreementId;

    if (hasSubscriptions) {
      throw new PaypalManagerError(
        'Customer missing billing agreement ID with active subscriptions'
      );
    }
    if (!token) {
      throw new PaypalManagerError(
        'Must pay using PayPal token if customer has no existing billing agreement'
      );
    }

    const newBillingAgreementId = await this.createBillingAgreement(token);

    return newBillingAgreementId;
  }

  /**
   * Cancels a billing agreement.
   */
  async cancelBillingAgreement(billingAgreementId: string): Promise<void> {
    await this.client.baUpdate({ billingAgreementId, cancel: true });
  }

  /**
   * Get Billing Agreement details by calling the update Billing Agreement API.
   * Parses the API call response for country code and billing agreement status
   */
  async getBillingAgreement(
    billingAgreementId: string
  ): Promise<BillingAgreement> {
    const response = await this.client.baUpdate({ billingAgreementId });
    return {
      city: response.CITY,
      countryCode: response.COUNTRYCODE,
      firstName: response.FIRSTNAME,
      lastName: response.LASTNAME,
      state: response.STATE,
      status:
        response.BILLINGAGREEMENTSTATUS === 'Canceled'
          ? BillingAgreementStatus.Cancelled
          : BillingAgreementStatus.Active,
      street: response.STREET,
      street2: response.STREET2,
      zip: response.ZIP,
    };
  }

  /**
   * Retrieves the customer’s current paypal billing agreement ID from the
   * auth database via the Paypal repository
   */
  async getCustomerBillingAgreementId(
    uid: string
  ): Promise<string | undefined> {
    const paypalCustomer =
      await this.paypalCustomerManager.fetchPaypalCustomersByUid(uid);
    const firstRecord = paypalCustomer.at(0);

    if (!firstRecord) return;
    if (paypalCustomer.length > 1)
      throw new PaypalCustomerMultipleRecordsError(uid);

    return firstRecord.billingAgreementId;
  }

  /**
   * Retrieves PayPal subscriptions
   */
  async getCustomerPayPalSubscriptions(customerId: string) {
    const subscriptions = await this.stripeManager.getSubscriptions(customerId);
    if (!subscriptions.data) return [];
    return subscriptions.data.filter(
      (sub) =>
        ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status) &&
        sub.collection_method === 'send_invoice'
    );
  }

  /**
   * Get a token authorizing transaction to move to the next stage.
   * If the call to PayPal fails, a PayPalClientError will be thrown.
   */
  async getCheckoutToken(currencyCode: string) {
    const response = await this.client.setExpressCheckout({ currencyCode });
    return response.TOKEN;
  }

  /**
   * Process an invoice when amount is greater than minimum amount
   */
  async processNonZeroInvoice(
    customer: StripeCustomer,
    invoice: StripeInvoice,
    ipaddress?: string
  ) {
    // TODO in M3b: Implement legacy processInvoice as processNonZeroInvoice here
    // TODO: Add spec
    console.log(customer, invoice, ipaddress);
  }

  /**
   * Finalize and process a draft invoice that has no amounted owed.
   */
  async processZeroInvoice(invoiceId: string) {
    // It appears for subscriptions that do not require payment, the invoice
    // transitions to paid automatially.
    // https://stripe.com/docs/billing/invoices/subscription#sub-invoice-lifecycle
    return this.stripeManager.finalizeInvoiceWithoutAutoAdvance(invoiceId);
  }

  /**
   * Process an invoice
   * If amount is less than minimum amount, call processZeroInvoice
   * If amount is greater than minimum amount, call processNonZeroInvoice (legacy PaypalHelper processInvoice)
   */
  async processInvoice(invoice: StripeInvoice) {
    if (!invoice.customer) throw new Error('Customer not present on invoice');
    const amountInCents = invoice.amount_due;

    if (amountInCents < this.stripeManager.getMinimumAmount(invoice.currency)) {
      return await this.processZeroInvoice(invoice.id);
    } else {
      const customer = await this.stripeManager.fetchActiveCustomer(
        invoice.customer
      );
      return await this.processNonZeroInvoice(customer, invoice);
    }
  }
}
