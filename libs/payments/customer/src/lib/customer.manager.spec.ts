/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';

import {
  StripeClient,
  StripeResponseFactory,
  StripeCustomerFactory,
  MockStripeConfigProvider,
  MOZILLA_TAX_ID,
} from '@fxa/payments/stripe';
import { TaxAddressFactory } from './factories/tax-address.factory';
import { CustomerManager } from './customer.manager';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { STRIPE_CUSTOMER_METADATA } from './types';

describe('CustomerManager', () => {
  let customerManager: CustomerManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStripeConfigProvider,
        StripeClient,
        CustomerManager,
        MockStatsDProvider,
      ],
    }).compile();

    customerManager = module.get(CustomerManager);
    stripeClient = module.get(StripeClient);
  });

  describe('retrieve', () => {
    it('returns an existing, non-deleted customer from Stripe', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());

      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValueOnce(mockCustomer);

      const result = await customerManager.retrieve(mockCustomer.id);
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('update', () => {
    const mockParams = {
      address: {
        city: faker.location.city(),
        country: faker.location.countryCode(),
        line1: faker.location.streetAddress(),
        line2: '',
        postal_code: faker.location.zipCode(),
        state: faker.location.state(),
      },
    };
    const existingMetadata = { userid: 'some-uid' };
    const mockCustomer = StripeCustomerFactory({
      ...mockParams,
      metadata: existingMetadata,
    });
    const mockCustomerResponse = StripeResponseFactory(mockCustomer);
    beforeEach(() => {
      jest
        .spyOn(stripeClient, 'customersUpdate')
        .mockResolvedValue(mockCustomerResponse);
    });

    it('should update an existing customer from Stripe', async () => {
      const result = await customerManager.update(mockCustomer.id, mockParams);

      expect(result).toEqual(mockCustomerResponse);
    });

    it('updates metadata', async () => {
      const mockParams = {
        metadata: {
          [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: 'paypal_agreement_id',
        },
      };

      await customerManager.update(mockCustomer.id, mockParams);

      expect(stripeClient.customersUpdate).toHaveBeenCalledWith(
        mockCustomer.id,
        mockParams
      );
    });
  });

  describe('create', () => {
    it('creates a customer within Stripe', async () => {
      const taxAddress = TaxAddressFactory();
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          name: faker.person.fullName(),
          shipping: {
            name: '',
            address: {
              city: faker.location.city(),
              country: taxAddress.countryCode,
              line1: faker.location.streetAddress(),
              line2: '',
              postal_code: taxAddress.postalCode,
              state: faker.location.state(),
            },
          },
        })
      );

      jest
        .spyOn(stripeClient, 'customersCreate')
        .mockResolvedValue(mockCustomer);

      const result = await customerManager.create({
        uid: faker.string.uuid(),
        email: faker.internet.email(),
        displayName: faker.person.fullName(),
        taxAddress: taxAddress,
      });

      expect(result).toEqual(mockCustomer);
    });
  });

  describe('isTaxEligible', () => {
    it('should return true for a taxable customer', async () => {
      const mockCustomer = StripeCustomerFactory({
        tax: {
          automatic_tax: 'supported',
          ip_address: null,
          location: { country: 'US', state: 'CA', source: 'billing_address' },
        },
      });

      const result = customerManager.isTaxEligible(mockCustomer);
      expect(result).toEqual(true);
    });

    it('should return true for a customer in a not-collecting location', async () => {
      const mockCustomer = StripeCustomerFactory({
        tax: {
          automatic_tax: 'not_collecting',
          ip_address: null,
          location: null,
        },
      });

      const result = customerManager.isTaxEligible(mockCustomer);
      expect(result).toEqual(true);
    });
  });

  describe('getTaxId', () => {
    it('returns customer tax id if found', async () => {
      const mockTaxIdValue = faker.string.uuid();
      const mockCustomer = StripeCustomerFactory({
        invoice_settings: {
          custom_fields: [{ name: 'Tax ID', value: mockTaxIdValue }],
          default_payment_method: null,
          footer: null,
          rendering_options: null,
        },
      });

      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockCustomer));

      const result = await customerManager.getTaxId(mockCustomer.id);

      expect(result).toEqual(mockTaxIdValue);
    });

    it('returns undefined when customer tax id not found', async () => {
      const mockCustomer = StripeCustomerFactory();

      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockCustomer));

      const result = await customerManager.getTaxId(mockCustomer.id);

      expect(result).toBeUndefined();
    });
  });

  describe('setTaxId', () => {
    it('updates customer object with incoming tax id when match is not found', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockTaxId = 'EU1234';
      const mockUpdatedCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          invoice_settings: {
            custom_fields: [{ name: 'Tax ID', value: mockTaxId }],
            default_payment_method: null,
            footer: null,
            rendering_options: null,
          },
        })
      );

      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValue(mockCustomer);

      jest
        .spyOn(stripeClient, 'customersUpdate')
        .mockResolvedValue(mockUpdatedCustomer);

      await customerManager.setTaxId(mockCustomer.id, mockTaxId);

      expect(stripeClient.customersUpdate).toHaveBeenCalledWith(
        mockCustomer.id,
        {
          invoice_settings: {
            custom_fields: [{ name: MOZILLA_TAX_ID, value: mockTaxId }],
          },
        }
      );
    });

    it('does not update customer object when incoming tax id matches existing tax id', async () => {
      const mockTaxId = 'T43CAK315A713';
      const mockCustomer = StripeCustomerFactory({
        invoice_settings: {
          custom_fields: [{ name: 'Tax ID', value: mockTaxId }],
          default_payment_method: null,
          footer: null,
          rendering_options: null,
        },
      });

      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockCustomer));

      jest
        .spyOn(stripeClient, 'customersUpdate')
        .mockResolvedValue(StripeResponseFactory(mockCustomer));

      await customerManager.setTaxId(mockCustomer.id, mockTaxId);

      expect(stripeClient.customersUpdate).not.toHaveBeenCalled();
    });
  });
});
