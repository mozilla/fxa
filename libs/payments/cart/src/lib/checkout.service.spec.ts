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
        StripeConfig,
        PaypalClientConfig,
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
    const mockPromotionCode = StripeResponseFactory(
      StripePromotionCodeFactory()
    );
    const mockPaymentMethod = StripeResponseFactory(
      StripePaymentMethodFactory()
    );
    const mockSubscription = StripeResponseFactory(StripeSubscriptionFactory());
    const mockInvoice = StripeResponseFactory(StripeInvoiceFactory());
    const mockPaymentIntent = StripeResponseFactory(
      StripePaymentIntentFactory()
    );

    beforeEach(async () => {
      jest
        .spyOn(stripeManager, 'fetchActiveCustomer')
        .mockResolvedValue(mockCustomer);
      jest
        .spyOn(stripeManager, 'isCustomerStripeTaxEligible')
        .mockReturnValue(true);
      jest
        .spyOn(stripeManager, 'getPromotionCodeByName')
        .mockResolvedValue(mockPromotionCode);
      jest
        .spyOn(stripeClient, 'paymentMethodsAttach')
        .mockResolvedValue(mockPaymentMethod);
      jest
        .spyOn(stripeClient, 'customersUpdate')
        .mockResolvedValue(mockCustomer);
      jest
        .spyOn(stripeClient, 'subscriptionsCreate')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(stripeClient, 'invoicesRetrieve')
        .mockResolvedValue(mockInvoice);
      jest
        .spyOn(stripeClient, 'paymentIntentRetrieve')
        .mockResolvedValue(mockPaymentIntent);
      jest
        .spyOn(stripeManager, 'cancelSubscription')
        .mockResolvedValue(mockSubscription);
    });

    describe('success', () => {
      beforeEach(async () => {
        await checkoutService.payWithStripe(mockCart, mockPaymentMethod.id);
      });

      it('fetches the customer', async () => {
        expect(stripeManager.fetchActiveCustomer).toHaveBeenCalledWith(
          mockCart.stripeCustomerId
        );
      });

      it('checks if customer is eligible for automatic tax', async () => {
        expect(stripeManager.isCustomerStripeTaxEligible).toHaveBeenCalledWith(
          mockCustomer
        );
      });

      it('fetches promotion code by name', async () => {
        expect(stripeManager.getPromotionCodeByName).toHaveBeenCalledWith(
          mockCart.couponCode,
          true
        );
      });

      it('attaches payment method to customer', async () => {
        expect(stripeClient.paymentMethodsAttach).toHaveBeenCalledWith(
          mockPaymentMethod.id,
          {
            customer: mockCustomer.id,
          }
        );
      });

      it('updates the customer with a default payment method', async () => {
        expect(stripeClient.customersUpdate).toHaveBeenCalledWith(
          mockCustomer.id,
          {
            invoice_settings: {
              default_payment_method: mockPaymentMethod.id,
            },
          }
        );
      });

      it('creates the subscription', async () => {
        expect(stripeClient.subscriptionsCreate).toHaveBeenCalledWith({
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
        expect(stripeClient.invoicesRetrieve).toHaveBeenCalledWith(
          mockSubscription.latest_invoice
        );
      });

      it('retrieves the payment intent from the latest invoice', () => {
        expect(stripeClient.paymentIntentRetrieve).toHaveBeenCalledWith(
          mockInvoice.payment_intent
        );
      });

      it('does not cancel the subscription', () => {
        expect(stripeManager.cancelSubscription).not.toHaveBeenCalled();
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
    const mockPromotionCode = StripeResponseFactory(
      StripePromotionCodeFactory()
    );
    const mockBillingAgreementId = faker.string.uuid();
    const mockSubscription = StripeResponseFactory(StripeSubscriptionFactory());
    const mockPaypalCustomer = ResultPaypalCustomerFactory();
    const mockInvoice = StripeResponseFactory(StripeInvoiceFactory());

    beforeEach(async () => {
      jest
        .spyOn(stripeManager, 'fetchActiveCustomer')
        .mockResolvedValue(mockCustomer);
      jest
        .spyOn(stripeManager, 'isCustomerStripeTaxEligible')
        .mockReturnValue(true);
      jest
        .spyOn(stripeManager, 'getPromotionCodeByName')
        .mockResolvedValue(mockPromotionCode);
      jest
        .spyOn(paypalManager, 'getCustomerPayPalSubscriptions')
        .mockResolvedValue([]);
      jest
        .spyOn(paypalManager, 'getOrCreateBillingAgreementId')
        .mockResolvedValue(mockBillingAgreementId);
      jest
        .spyOn(stripeClient, 'subscriptionsCreate')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(paypalCustomerManager, 'deletePaypalCustomersByUid')
        .mockResolvedValue(BigInt(1));
      jest
        .spyOn(paypalCustomerManager, 'createPaypalCustomer')
        .mockResolvedValue(mockPaypalCustomer);
      jest
        .spyOn(stripeClient, 'invoicesRetrieve')
        .mockResolvedValue(mockInvoice);
      jest.spyOn(paypalManager, 'processInvoice').mockResolvedValue();
      jest
        .spyOn(stripeManager, 'cancelSubscription')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(paypalManager, 'cancelBillingAgreement').mockResolvedValue();
    });

    describe('success', () => {
      beforeEach(async () => {
        await checkoutService.payWithPaypal(mockCart, mockToken);
      });

      it('fetches the customer', async () => {
        expect(stripeManager.fetchActiveCustomer).toHaveBeenCalledWith(
          mockCart.stripeCustomerId
        );
      });

      it('checks if customer is eligible for automatic tax', async () => {
        expect(stripeManager.isCustomerStripeTaxEligible).toHaveBeenCalledWith(
          mockCustomer
        );
      });

      it('fetches promotion code by name', async () => {
        expect(stripeManager.getPromotionCodeByName).toHaveBeenCalledWith(
          mockCart.couponCode,
          true
        );
      });

      it('fetches the customers paypal subscriptions', async () => {
        expect(
          paypalManager.getCustomerPayPalSubscriptions
        ).toHaveBeenCalledWith(mockCustomer.id);
      });

      it('fetches/creates a billing agreement for checkout', async () => {
        expect(
          paypalManager.getOrCreateBillingAgreementId
        ).toHaveBeenCalledWith(mockCart.uid, false, mockToken);
      });

      it('creates the subscription', async () => {
        expect(stripeClient.subscriptionsCreate).toHaveBeenCalledWith({
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
        expect(
          paypalCustomerManager.deletePaypalCustomersByUid
        ).toHaveBeenCalledWith(mockCart.uid);
      });

      it('creates a paypalCustomer entry for created billing agreement', () => {
        expect(paypalCustomerManager.createPaypalCustomer).toHaveBeenCalledWith(
          {
            uid: mockCart.uid,
            billingAgreementId: mockBillingAgreementId,
            status: 'active',
            endedAt: null,
          }
        );
      });

      it('retrieves the lastest invoice', () => {
        expect(stripeClient.invoicesRetrieve).toHaveBeenCalledWith(
          mockSubscription.latest_invoice
        );
      });

      it('calls to process the latest invoice', () => {
        expect(paypalManager.processInvoice).toHaveBeenCalledWith(mockInvoice);
      });

      it('does not cancel the subscription', () => {
        expect(stripeManager.cancelSubscription).not.toHaveBeenCalled();
      });

      it('does not cancel the billing agreement', () => {
        expect(paypalManager.cancelBillingAgreement).not.toHaveBeenCalled();
      });
    });
  });
});
