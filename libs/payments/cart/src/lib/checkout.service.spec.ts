/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { CheckoutService } from './checkout.service';
import { faker } from '@faker-js/faker';
import { ResultCartFactory } from './cart.factories';
import {
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripeInvoiceFactory,
  StripeManager,
  StripePaymentIntentFactory,
  StripePaymentMethodFactory,
  StripePromotionCodeFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import {
  PayPalClient,
  PayPalManager,
  PaypalCustomerManager,
  ResultPaypalCustomerFactory,
} from '@fxa/payments/paypal';
import { MockAccountDatabaseNestFactory } from 'libs/shared/db/mysql/account/src/lib/account.provider';
import { PaypalClientConfig } from 'libs/payments/paypal/src/lib/paypal.client.config';

describe('CheckoutService', () => {
  let checkoutService: CheckoutService;
  let stripeClient: StripeClient;
  let stripeManager: StripeManager;
  let paypalCustomerManager: PaypalCustomerManager;
  let paypalManager: PayPalManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        StripeClient,
        StripeManager,
        PaypalCustomerManager,
        PayPalManager,
        CheckoutService,
        PayPalClient,
        { provide: StripeConfig, useValue: {} },
        { provide: PaypalClientConfig, useValue: {} },
        MockAccountDatabaseNestFactory,
      ],
    }).compile();

    stripeClient = moduleRef.get(StripeClient);
    stripeManager = moduleRef.get(StripeManager);
    paypalCustomerManager = moduleRef.get(PaypalCustomerManager);
    paypalManager = moduleRef.get(PayPalManager);
    checkoutService = moduleRef.get(CheckoutService);
  });

  describe('payWithStripe', () => {
    const mockCart = StripeResponseFactory(
      ResultCartFactory({
        uid: faker.string.uuid(),
        couponCode: faker.string.uuid(),
      })
    );
    const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
    let fetchActiveCustomerSpy: jest.SpyInstance;
    let isCustomerStripeTaxEligibleSpy: jest.SpyInstance;
    const mockPromotionCode = StripeResponseFactory(
      StripePromotionCodeFactory()
    );
    let getPromotionCodeByNameSpy: jest.SpyInstance;
    const mockPaymentMethod = StripeResponseFactory(
      StripePaymentMethodFactory()
    );
    let paymentMethodsAttachSpy: jest.SpyInstance;
    let customersUpdateSpy: jest.SpyInstance;
    const mockSubscription = StripeResponseFactory(StripeSubscriptionFactory());
    let subscriptionsCreateSpy: jest.SpyInstance;
    const mockInvoice = StripeResponseFactory(StripeInvoiceFactory());
    let invoicesRetrieveSpy: jest.SpyInstance;
    const mockPaymentIntent = StripeResponseFactory(
      StripePaymentIntentFactory()
    );
    let paymentIntentRetrieveSpy: jest.SpyInstance;
    let cancelSubscriptionSpy: jest.SpyInstance;

    beforeEach(async () => {
      fetchActiveCustomerSpy = jest
        .spyOn(stripeManager, 'fetchActiveCustomer')
        .mockResolvedValue(mockCustomer);
      isCustomerStripeTaxEligibleSpy = jest
        .spyOn(stripeManager, 'isCustomerStripeTaxEligible')
        .mockReturnValue(true);
      getPromotionCodeByNameSpy = jest
        .spyOn(stripeManager, 'getPromotionCodeByName')
        .mockResolvedValue(mockPromotionCode);
      paymentMethodsAttachSpy = jest
        .spyOn(stripeClient, 'paymentMethodsAttach')
        .mockResolvedValue(mockPaymentMethod);
      customersUpdateSpy = jest
        .spyOn(stripeClient, 'customersUpdate')
        .mockResolvedValue(mockCustomer);
      subscriptionsCreateSpy = jest
        .spyOn(stripeClient, 'subscriptionsCreate')
        .mockResolvedValue(mockSubscription);
      invoicesRetrieveSpy = jest
        .spyOn(stripeClient, 'invoicesRetrieve')
        .mockResolvedValue(mockInvoice);
      paymentIntentRetrieveSpy = jest
        .spyOn(stripeClient, 'paymentIntentRetrieve')
        .mockResolvedValue(mockPaymentIntent);
      cancelSubscriptionSpy = jest
        .spyOn(stripeManager, 'cancelSubscription')
        .mockResolvedValue(mockSubscription);
    });

    describe('success', () => {
      beforeEach(async () => {
        await checkoutService.payWithStripe(mockCart, mockPaymentMethod.id);
      });

      it('fetches the customer', async () => {
        expect(fetchActiveCustomerSpy).toHaveBeenCalledWith(
          mockCart.stripeCustomerId
        );
      });

      it('checks if customer is eligible for automatic tax', async () => {
        expect(isCustomerStripeTaxEligibleSpy).toHaveBeenCalledWith(
          mockCustomer
        );
      });

      it('fetches promotion code by name', async () => {
        expect(getPromotionCodeByNameSpy).toHaveBeenCalledWith(
          mockCart.couponCode,
          true
        );
      });

      it('attaches payment method to customer', async () => {
        expect(paymentMethodsAttachSpy).toHaveBeenCalledWith(
          mockPaymentMethod.id,
          {
            customer: mockCustomer.id,
          }
        );
      });

      it('updates the customer with a default payment method', async () => {
        expect(customersUpdateSpy).toHaveBeenCalledWith(mockCustomer.id, {
          invoice_settings: {
            default_payment_method: mockPaymentMethod.id,
          },
        });
      });

      it('creates the subscription', async () => {
        expect(subscriptionsCreateSpy).toHaveBeenCalledWith({
          customer: mockCustomer.id,
          automatic_tax: {
            enabled: true,
          },
          promotion_code: mockPromotionCode.id,
          items: [
            {
              price: undefined, // TODO: fetch price from cart after FXA-8893
            },
          ],
        });
      });

      it('retrieves the lastest invoice', () => {
        expect(invoicesRetrieveSpy).toHaveBeenCalledWith(
          mockSubscription.latest_invoice
        );
      });

      it('retrieves the payment intent from the latest invoice', () => {
        expect(paymentIntentRetrieveSpy).toHaveBeenCalledWith(
          mockInvoice.payment_intent
        );
      });

      it('does not cancel the subscription', () => {
        expect(cancelSubscriptionSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('payWithPaypal', () => {
    const mockToken = faker.string.uuid();
    const mockCart = StripeResponseFactory(
      ResultCartFactory({
        uid: faker.string.uuid(),
        couponCode: faker.string.uuid(),
      })
    );
    const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
    let fetchActiveCustomerSpy: jest.SpyInstance;
    let isCustomerStripeTaxEligibleSpy: jest.SpyInstance;
    const mockPromotionCode = StripeResponseFactory(
      StripePromotionCodeFactory()
    );
    let getPromotionCodeByNameSpy: jest.SpyInstance;
    let getCustomerPayPalSubscriptionsSpy: jest.SpyInstance;
    const mockBillingAgreementId = faker.string.uuid();
    let getOrCreateBillingAgreementIdSpy: jest.SpyInstance;
    const mockSubscription = StripeResponseFactory(StripeSubscriptionFactory());
    let subscriptionsCreateSpy: jest.SpyInstance;
    let deletePaypalCustomersByUidSpy: jest.SpyInstance;
    const mockPaypalCustomer = ResultPaypalCustomerFactory();
    let createPaypalCustomerSpy: jest.SpyInstance;
    const mockInvoice = StripeResponseFactory(StripeInvoiceFactory());
    let invoicesRetrieveSpy: jest.SpyInstance;
    let processInvoiceSpy: jest.SpyInstance;
    let cancelSubscriptionSpy: jest.SpyInstance;
    let cancelBillingAgreementSpy: jest.SpyInstance;

    beforeEach(async () => {
      fetchActiveCustomerSpy = jest
        .spyOn(stripeManager, 'fetchActiveCustomer')
        .mockResolvedValue(mockCustomer);
      isCustomerStripeTaxEligibleSpy = jest
        .spyOn(stripeManager, 'isCustomerStripeTaxEligible')
        .mockReturnValue(true);
      getPromotionCodeByNameSpy = jest
        .spyOn(stripeManager, 'getPromotionCodeByName')
        .mockResolvedValue(mockPromotionCode);
      getCustomerPayPalSubscriptionsSpy = jest
        .spyOn(paypalManager, 'getCustomerPayPalSubscriptions')
        .mockResolvedValue([]);
      getOrCreateBillingAgreementIdSpy = jest
        .spyOn(paypalManager, 'getOrCreateBillingAgreementId')
        .mockResolvedValue(mockBillingAgreementId);
      subscriptionsCreateSpy = jest
        .spyOn(stripeClient, 'subscriptionsCreate')
        .mockResolvedValue(mockSubscription);
      deletePaypalCustomersByUidSpy = jest
        .spyOn(paypalCustomerManager, 'deletePaypalCustomersByUid')
        .mockResolvedValue(BigInt(1));
      createPaypalCustomerSpy = jest
        .spyOn(paypalCustomerManager, 'createPaypalCustomer')
        .mockResolvedValue(mockPaypalCustomer);
      invoicesRetrieveSpy = jest
        .spyOn(stripeClient, 'invoicesRetrieve')
        .mockResolvedValue(mockInvoice);
      processInvoiceSpy = jest
        .spyOn(paypalManager, 'processInvoice')
        .mockResolvedValue();
      cancelSubscriptionSpy = jest
        .spyOn(stripeManager, 'cancelSubscription')
        .mockResolvedValue(mockSubscription);
      cancelBillingAgreementSpy = jest
        .spyOn(paypalManager, 'cancelBillingAgreement')
        .mockResolvedValue();
    });

    describe('success', () => {
      beforeEach(async () => {
        await checkoutService.payWithPaypal(mockCart, mockToken);
      });

      it('fetches the customer', async () => {
        expect(fetchActiveCustomerSpy).toHaveBeenCalledWith(
          mockCart.stripeCustomerId
        );
      });

      it('checks if customer is eligible for automatic tax', async () => {
        expect(isCustomerStripeTaxEligibleSpy).toHaveBeenCalledWith(
          mockCustomer
        );
      });

      it('fetches promotion code by name', async () => {
        expect(getPromotionCodeByNameSpy).toHaveBeenCalledWith(
          mockCart.couponCode,
          true
        );
      });

      it('fetches the customers paypal subscriptions', async () => {
        expect(getCustomerPayPalSubscriptionsSpy).toHaveBeenCalledWith(
          mockCustomer.id
        );
      });

      it('fetches/creates a billing agreement for checkout', async () => {
        expect(getOrCreateBillingAgreementIdSpy).toHaveBeenCalledWith(
          mockCart.uid,
          false,
          mockToken
        );
      });

      it('creates the subscription', async () => {
        expect(subscriptionsCreateSpy).toHaveBeenCalledWith({
          customer: mockCustomer.id,
          automatic_tax: {
            enabled: true,
          },
          collection_method: 'send_invoice',
          days_until_due: 1,
          promotion_code: mockPromotionCode.id,
          items: [
            {
              price: undefined, // TODO: fetch price from cart after FXA-8893
            },
          ],
        });
      });

      it('deletes all paypalCustomers for user by uid', () => {
        expect(deletePaypalCustomersByUidSpy).toHaveBeenCalledWith(
          mockCart.uid
        );
      });

      it('creates a paypalCustomer entry for created billing agreement', () => {
        expect(createPaypalCustomerSpy).toHaveBeenCalledWith({
          uid: mockCart.uid,
          billingAgreementId: mockBillingAgreementId,
          status: 'active',
          endedAt: null,
        });
      });

      it('retrieves the lastest invoice', () => {
        expect(invoicesRetrieveSpy).toHaveBeenCalledWith(
          mockSubscription.latest_invoice
        );
      });

      it('calls to process the latest invoice', () => {
        expect(processInvoiceSpy).toHaveBeenCalledWith(mockInvoice);
      });

      it('does not cancel the subscription', () => {
        expect(cancelSubscriptionSpy).not.toHaveBeenCalled();
      });

      it('does not cancel the billing agreement', () => {
        expect(cancelBillingAgreementSpy).not.toHaveBeenCalled();
      });
    });
  });
});
