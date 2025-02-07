/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import {
  StripeClient,
  StripeCustomer,
  MOZILLA_TAX_ID,
} from '@fxa/payments/stripe';
import { CustomerDeletedError } from './error';
import { TaxAddress } from './types';
import { isCustomerTaxEligible } from './util/isCustomerTaxEligible';

@Injectable()
export class CustomerManager {
  constructor(private stripeClient: StripeClient) {}

  /**
   * Retrieves a customer record
   */
  async retrieve(customerId: string) {
    const customer = await this.stripeClient.customersRetrieve(customerId);
    if (customer.deleted) throw new CustomerDeletedError();
    return customer;
  }

  /**
   * Updates a customer record
   */
  update(customerId: string, params?: Stripe.CustomerUpdateParams) {
    return this.stripeClient.customersUpdate(customerId, params);
  }

  /**
   * Create a customer
   */
  async create(args: {
    uid: string;
    email: string;
    displayName: string;
    taxAddress?: TaxAddress;
  }) {
    const { uid, email, displayName, taxAddress } = args;

    const shipping = taxAddress
      ? {
          name: email,
          address: {
            country: taxAddress.countryCode,
            postal_code: taxAddress.postalCode,
          },
        }
      : undefined;

    const customer = await this.stripeClient.customersCreate({
      email,
      name: displayName || '',
      description: uid,
      metadata: {
        userid: uid,
        geoip_date: taxAddress ? new Date().toString() : null,
      },
      shipping,
    });

    return customer;
  }

  /**
   * Delete a customer
   */
  delete(customerId: string) {
    return this.stripeClient.customersDelete(customerId);
  }

  async setTaxId(customerId: string, taxId: string) {
    const customerTaxId = await this.getTaxId(customerId);

    if (!customerTaxId || customerTaxId !== taxId) {
      await this.stripeClient.customersUpdate(customerId, {
        invoice_settings: {
          custom_fields: [{ name: MOZILLA_TAX_ID, value: taxId }],
        },
      });
    }

    return;
  }

  async getTaxId(customerId: string) {
    const customer = await this.retrieve(customerId);

    const customFields = customer.invoice_settings.custom_fields || [];

    const taxIdFields = customFields.filter((customField: any) => {
      return customField.name === MOZILLA_TAX_ID;
    });

    return taxIdFields.at(0)?.value;
  }

  isTaxEligible(customer: StripeCustomer) {
    return isCustomerTaxEligible(customer);
  }
}
