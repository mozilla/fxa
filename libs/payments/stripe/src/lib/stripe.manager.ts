/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { StripeClient } from './stripe.client';

@Injectable()
export class StripeManager {
  constructor(private client: StripeClient) {}

  async isCustomerStripeTaxEligible(customer: Stripe.Customer) {
    if (!customer.tax) {
      // TODO: FXA-8891
      throw new Error('customer.tax is not present');
    }

    return (
      customer.tax?.automatic_tax === 'supported' ||
      customer.tax?.automatic_tax === 'not_collecting'
    );
  }
}
