/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isCustomerTaxEligible } from './isCustomerTaxEligible';
import { StripeCustomerFactory } from '../factories/customer.factory';
import { faker } from '@faker-js/faker';

describe('isCustomerTaxEligible', () => {
  it('returns true if customer is tax eligible - not supported', () => {
    const mockCustomer = StripeCustomerFactory({
      tax: {
        location: null,
        automatic_tax: 'supported',
        ip_address: faker.internet.ipv4(),
      },
    });

    const result = isCustomerTaxEligible(mockCustomer);
    expect(result).toEqual(true);
  });

  it('returns true if customer is tax eligible - not collecting', () => {
    const mockCustomer = StripeCustomerFactory({
      tax: {
        location: null,
        automatic_tax: 'not_collecting',
        ip_address: faker.internet.ipv4(),
      },
    });

    const result = isCustomerTaxEligible(mockCustomer);
    expect(result).toEqual(true);
  });

  it('returns false if customer is not tax eligible', () => {
    const mockCustomer = StripeCustomerFactory({
      tax: {
        location: null,
        automatic_tax: 'failed',
        ip_address: faker.internet.ipv4(),
      },
    });

    const result = isCustomerTaxEligible(mockCustomer);
    expect(result).toEqual(false);
  });
});
