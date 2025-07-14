/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { PaymentMethodManager } from './paymentMethod.manager';
import { determinePaymentMethodType } from './util/determinePaymentMethodType';
import {
  MockPaypalClientConfigProvider,
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  StripeClient,
  MockStripeConfigProvider,
  StripeResponseFactory,
  StripeCustomerFactory,
  StripePaymentMethodFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

jest.mock('./util/determinePaymentMethodType');
const mockDeterminePaymentMethodType = jest.mocked(determinePaymentMethodType);

describe('PaymentMethodManager', () => {
  let paymentMethodManager: PaymentMethodManager;
  let paypalBillingAgreementManager: PaypalBillingAgreementManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockAccountDatabaseNestFactory,
        MockPaypalClientConfigProvider,
        MockStripeConfigProvider,
        PaymentMethodManager,
        PaypalBillingAgreementManager,
        PayPalClient,
        PaypalCustomerManager,
        StripeClient,
        MockStatsDProvider,
      ],
    }).compile();

    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    paypalBillingAgreementManager = moduleRef.get(
      PaypalBillingAgreementManager
    );
    stripeClient = moduleRef.get(StripeClient);
  });

  describe('attach', () => {
    it('should attach a payment method to a customer', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPaymentMethod = StripePaymentMethodFactory();
      const mockResponse = StripeResponseFactory(mockPaymentMethod);

      jest
        .spyOn(stripeClient, 'paymentMethodsAttach')
        .mockResolvedValue(mockResponse);

      const result = await paymentMethodManager.attach(mockPaymentMethod.id, {
        customer: mockCustomer.id,
      });

      expect(stripeClient.paymentMethodsAttach).toHaveBeenCalledWith(
        mockPaymentMethod.id,
        {
          customer: mockCustomer.id,
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('retrieve', () => {
    it('should retrieve a payment method', async () => {
      const mockPaymentMethod = StripePaymentMethodFactory();
      const mockResponse = StripeResponseFactory(mockPaymentMethod);

      jest
        .spyOn(stripeClient, 'paymentMethodRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await paymentMethodManager.retrieve(mockPaymentMethod.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDefaultPaymentMethod', () => {
    it('returns payment method information - card', async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({})
      );
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscriptions = [StripeSubscriptionFactory()];
      const mockUid = faker.string.uuid();

      mockDeterminePaymentMethodType.mockReturnValue({
        type: 'stripe',
        paymentMethodId: 'pm_id',
      });
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);

      const result = await paymentMethodManager.getDefaultPaymentMethod(
        mockStripeCustomer,
        mockSubscriptions,
        mockUid
      );
      expect(result).toEqual({
        type: mockPaymentMethod.type,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
      });
    });

    it('returns payment method information - paypal', async () => {
      const mockPaypalBillingAgreementId = faker.string.sample();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscriptions = [StripeSubscriptionFactory()];
      const mockUid = faker.string.uuid();

      mockDeterminePaymentMethodType.mockReturnValue({
        type: 'external_paypal',
      });
      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(mockPaypalBillingAgreementId);

      const result = await paymentMethodManager.getDefaultPaymentMethod(
        mockStripeCustomer,
        mockSubscriptions,
        mockUid
      );
      expect(result).toEqual({
        type: 'external_paypal',
        brand: 'paypal',
        billingAgreementId: mockPaypalBillingAgreementId,
      });
    });
  });
});
