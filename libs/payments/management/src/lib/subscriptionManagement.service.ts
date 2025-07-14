/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, type LoggerService } from '@nestjs/common';
import {
  CustomerManager,
  DefaultPaymentMethod,
  PaymentMethodManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
} from '@fxa/payments/stripe';
import { SanitizeExceptions } from '@fxa/shared/error';

@Injectable()
export class SubscriptionManagementService {
  constructor(
    @Inject(Logger) private log: LoggerService,
    private accountCustomerManager: AccountCustomerManager,
    private customerManager: CustomerManager,
    private paymentMethodManager: PaymentMethodManager,
    private subscriptionManager: SubscriptionManager
  ) {}

  @SanitizeExceptions()
  async getPageContent(uid: string) {
    let defaultPaymentMethod: DefaultPaymentMethod | undefined;
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

      defaultPaymentMethod =
        await this.paymentMethodManager.getDefaultPaymentMethod(
          customer,
          subs,
          uid
        );
    }

    return {
      defaultPaymentMethod,
    };
  }
}
