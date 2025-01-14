/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeClient } from '@fxa/payments/stripe';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerSessionManager {
  constructor(private stripeClient: StripeClient) {}

  async create(customerId: string) {
    return this.stripeClient.customersSessionsCreate({
      customer: customerId,
      components: {
        payment_element: {
          enabled: true,
          features: {
            payment_method_redisplay: 'enabled',
            payment_method_save: 'disabled',
            payment_method_remove: 'disabled',
            payment_method_allow_redisplay_filters: ['always', 'unspecified'],
          },
        },
      },
    });
  }
}
