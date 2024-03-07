/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { AccountDatabase } from '@fxa/shared/db/mysql/account';
import { PayPalClient } from './paypal.client';
import { BillingAgreement, BillingAgreementStatus } from './paypal.types';

@Injectable()
export class PayPalManager {
  constructor(private db: AccountDatabase, private client: PayPalClient) {}

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
   * Get a token authorizing transaction to move to the next stage.
   * If the call to PayPal fails, a PayPalClientError will be thrown.
   */
  async getCheckoutToken(currencyCode: string) {
    const response = await this.client.setExpressCheckout({ currencyCode });
    return response.TOKEN;
  }
}
