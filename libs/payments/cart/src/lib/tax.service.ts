/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CustomerManager,
  TaxAddress,
  SubscriptionManager,
} from '@fxa/payments/customer';
import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
} from '@fxa/payments/stripe';
import { Injectable } from '@nestjs/common';
import { GeoDBManager } from '@fxa/shared/geodb';

@Injectable()
export class TaxService {
  constructor(
    private accountCustomerManager: AccountCustomerManager,
    private customerManager: CustomerManager,
    private geodbManager: GeoDBManager,
    private subscriptionManager: SubscriptionManager
  ) {}

  async getTaxAddress(ipAddress: string, uid?: string) {
    if (uid) {
      const accountCustomer = await this.accountCustomerManager
        .getAccountCustomerByUid(uid)
        .catch((error) => {
          if (!(error instanceof AccountCustomerNotFoundError)) {
            throw error;
          }
        });

      if (accountCustomer?.stripeCustomerId) {
        const stripeCustomer = await this.customerManager.retrieve(
          accountCustomer.stripeCustomerId
        );

        if (
          stripeCustomer.shipping?.address &&
          stripeCustomer.shipping?.address.country &&
          stripeCustomer.shipping?.address.postal_code
        ) {
          return {
            countryCode: stripeCustomer.shipping.address.country,
            postalCode: stripeCustomer.shipping.address.postal_code,
          } satisfies TaxAddress;
        }
      }
    }

    const location = this.geodbManager.getTaxAddress(ipAddress);

    if (location) {
      return {
        countryCode: location.countryCode,
        postalCode: location.postalCode,
      } satisfies TaxAddress;
    }

    return undefined;
  }

  /**
   * This method is temporary until we have the ability to update tax location via subscription management.
   * We consider any customer with a subscription to be tax locked.
   */
  async getIsTaxLocked(uid: string): Promise<{
    isTaxLocked: boolean;
  }> {
    const accountCustomer = await this.accountCustomerManager
      .getAccountCustomerByUid(uid)
      .catch((error) => {
        if (!(error instanceof AccountCustomerNotFoundError)) {
          throw error;
        }
      });

    if (accountCustomer && accountCustomer.stripeCustomerId) {
      const subscriptions = await this.subscriptionManager.listForCustomer(
        accountCustomer.stripeCustomerId
      );

      return {
        isTaxLocked: !!subscriptions.length,
      };
    }

    return {
      isTaxLocked: false,
    };
  }
}
