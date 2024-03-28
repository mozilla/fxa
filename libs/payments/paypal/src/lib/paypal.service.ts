/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { PayPalManager } from './paypal.manager';
import { PaypalCustomerManager } from './paypalCustomer/paypalCustomer.manager';
import { CreatePaypalCustomer } from './paypalCustomer/paypalCustomer.types';
import { CurrencyManager } from '@fxa/payments/currency';

@Injectable()
export class PayPalService {
  constructor(
    private paypalManager: PayPalManager,
    private paypalCustomerManager: PaypalCustomerManager,
    private currencyManager: CurrencyManager
  ) {}

  /**
   * Create and verify a billing agreement is funded from the appropriate
   * country given the currency of the billing agreement.
   */
  async createBillingAgreement(options: {
    uid: string;
    token: string;
    currency: string;
  }) {
    const { uid, token, currency } = options;

    const billingAgreementId = await this.paypalManager.createBillingAgreement({
      token,
    });

    const agreementDetails = await this.paypalManager.getBillingAgreement(
      billingAgreementId
    );

    const country = agreementDetails.countryCode;

    this.currencyManager.assertCurrencyCompatibleWithCountry(currency, country);

    const customerDetails: CreatePaypalCustomer = {
      uid: uid,
      billingAgreementId: billingAgreementId,
      status: 'active',
      endedAt: null,
    };

    return this.paypalCustomerManager.createPaypalCustomer(customerDetails);
  }
}
