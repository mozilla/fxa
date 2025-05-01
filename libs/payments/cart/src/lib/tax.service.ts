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
import { CurrencyManager } from '@fxa/payments/currency';
import { TaxChangeAllowedStatus } from './tax.types';

@Injectable()
export class TaxService {
  constructor(
    private accountCustomerManager: AccountCustomerManager,
    private customerManager: CustomerManager,
    private geodbManager: GeoDBManager,
    private subscriptionManager: SubscriptionManager,
    private currencyManager: CurrencyManager
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
   * This method determines if a tax change is allowed for a customer based on
   * the following.
   * - The Tax Address resolves to a currency
   * - They have an active subscription that would result in a currency
   *   change.
   */
  async getTaxChangeStatus(
    uid: string,
    taxAddress: TaxAddress
  ): Promise<{
    status: TaxChangeAllowedStatus;
    currentCurrency?: string;
  }> {
    const locationCurrency = this.currencyManager.getCurrencyForCountry(
      taxAddress?.countryCode
    );

    // Currently the customers currency is derived from their tax location. If the
    // currency can't be derived from the tax location, the tax location is not allowed.
    if (!locationCurrency) {
      return {
        status: TaxChangeAllowedStatus.CurrencyNotFound,
      };
    }

    const accountCustomer = await this.accountCustomerManager
      .getAccountCustomerByUid(uid)
      .catch((error) => {
        if (!(error instanceof AccountCustomerNotFoundError)) {
          throw error;
        }
      });

    if (accountCustomer && accountCustomer.stripeCustomerId) {
      const [subscriptions, customer] = await Promise.all([
        this.subscriptionManager.listForCustomer(
          accountCustomer.stripeCustomerId
        ),
        this.customerManager.retrieve(accountCustomer.stripeCustomerId),
      ]);

      const currentCurrency = String(customer.currency).toUpperCase();

      const isTaxChangeAllowed = !(
        subscriptions.length && currentCurrency !== locationCurrency
      );

      return {
        status: isTaxChangeAllowed
          ? TaxChangeAllowedStatus.Allowed
          : TaxChangeAllowedStatus.CurrencyChange,
        currentCurrency,
      };
    }

    return {
      status: TaxChangeAllowedStatus.Allowed,
    };
  }
}
