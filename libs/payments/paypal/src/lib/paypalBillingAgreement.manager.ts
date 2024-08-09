/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { PayPalClient } from './paypal.client';
import { BillingAgreement, BillingAgreementStatus } from './paypal.types';
import { PaypalCustomerMultipleRecordsError } from './paypalCustomer/paypalCustomer.error';
import { PaypalCustomerManager } from './paypalCustomer/paypalCustomer.manager';
import { PaypalBillingAgreementManagerError } from './paypal.error';

@Injectable()
export class PaypalBillingAgreementManager {
  constructor(
    private client: PayPalClient,
    private paypalCustomerManager: PaypalCustomerManager
  ) {}

  public async getOrCreatePaypalBillingAgreementId(
    uid: string,
    hasSubscriptions: boolean,
    token?: string
  ) {
    const existingBillingAgreementId =
      await this.getCustomerPaypalBillingAgreementId(uid);
    if (existingBillingAgreementId) return existingBillingAgreementId;

    if (hasSubscriptions) {
      throw new PaypalBillingAgreementManagerError(
        'Customer missing billing agreement ID with active subscriptions'
      );
    }
    if (!token) {
      throw new PaypalBillingAgreementManagerError(
        'Must pay using PayPal token if customer has no existing billing agreement'
      );
    }

    const newBillingAgreementId = await this.createPaypalBillingAgreement(
      uid,
      token
    );

    return newBillingAgreementId;
  }

  /**
   * Cancels a billing agreement.
   */
  async cancelPaypalBillingAgreement(
    billingAgreementId: string
  ): Promise<void> {
    await this.client.baUpdate({ billingAgreementId, cancel: true });
  }

  /**
   * Create and verify a billing agreement is funded from the appropriate
   * country given the currency of the billing agreement.
   */
  async createPaypalBillingAgreement(uid: string, token: string) {
    const billingAgreement = await this.client.createBillingAgreement({
      token,
    });

    const billingAgreementId = billingAgreement.BILLINGAGREEMENTID;

    const paypalCustomer =
      await this.paypalCustomerManager.createPaypalCustomer({
        uid: uid,
        billingAgreementId: billingAgreementId,
        status: 'active',
        endedAt: null,
      });

    return paypalCustomer.billingAgreementId;
  }

  /**
   * Get Billing Agreement details by calling the update Billing Agreement API.
   * Parses the API call response for country code and billing agreement status
   */
  async getPaypalBillingAgreement(
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
  async getCustomerPaypalBillingAgreementId(
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
}
