/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { CheckoutService } from './checkout.service';
import { faker } from '@faker-js/faker';
import {
  MockStripeConfigProvider,
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripeInvoiceFactory,
  StripeManager,
  StripePaymentIntentFactory,
  StripePaymentMethodFactory,
  StripePriceFactory,
  StripePromotionCodeFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
  TaxAddressFactory,
  InvoicePreviewFactory,
  AccountCustomerManager,
  ResultAccountCustomerFactory,
} from '@fxa/payments/stripe';
import {
  PayPalClient,
  PayPalManager,
  PaypalCustomerManager,
  ResultPaypalCustomerFactory,
} from '@fxa/payments/paypal';
import { PaypalClientConfig } from 'libs/payments/paypal/src/lib/paypal.client.config';
import {
  EligibilityManager,
  EligibilityService,
  EligibilityStatus,
} from '@fxa/payments/eligibility';
import {
  ContentfulClient,
  ContentfulClientConfig,
  ContentfulManager,
  ContentfulService,
  ContentfulServiceConfig,
} from '@fxa/shared/contentful';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import {
  CartEligibilityStatus,
  MockAccountDatabaseNestFactory,
} from '@fxa/shared/db/mysql/account';
import {
  CartManager,
  CheckoutCustomerDataFactory,
  ResultCartFactory,
  handleEligibilityStatusMap,
} from '@fxa/payments/cart';
import {
  CartEligibilityMismatchError,
  CartTotalMismatchError,
  CartEmailNotFoundError,
} from './cart.error';
import { AccountManager } from '@fxa/shared/account/account';

describe('CheckoutService', () => {
  let checkoutService: CheckoutService;
  let stripeClient: StripeClient;
  let stripeManager: StripeManager;
  let paypalCustomerManager: PaypalCustomerManager;
  let paypalManager: PayPalManager;
  let cartManager: CartManager;
  let eligibilityService: EligibilityService;
  let contentfulService: ContentfulService;
  let accountManager: AccountManager;
  let accountCustomerManager: AccountCustomerManager;

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
        AccountManager,
        AccountCustomerManager,
        MockAccountDatabaseNestFactory,
        CartManager,
        ContentfulManager,
        ContentfulClient,
        ContentfulClientConfig,
        ContentfulService,
        ContentfulServiceConfig,
        MockFirestoreProvider,
        MockStatsDProvider,
        EligibilityManager,
        EligibilityService,
        MockStripeConfigProvider,
      ],
    }).compile();

    cartManager = moduleRef.get(CartManager);
    eligibilityService = moduleRef.get(EligibilityService);
    paypalCustomerManager = moduleRef.get(PaypalCustomerManager);
    paypalManager = moduleRef.get(PayPalManager);
    stripeClient = moduleRef.get(StripeClient);
    stripeManager = moduleRef.get(StripeManager);
    contentfulService = moduleRef.get(ContentfulService);
    accountManager = moduleRef.get(AccountManager);
    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    checkoutService = moduleRef.get(CheckoutService);
  });

  describe('prePaySteps', () => {
    const mockCustomerData = CheckoutCustomerDataFactory();
    const uid = faker.string.uuid();

    const mockCustomer = StripeResponseFactory(
      StripeCustomerFactory({
        shipping: {
          name: '',
          address: {
            city: faker.location.city(),
            country: TaxAddressFactory().countryCode,
            line1: faker.location.streetAddress(),
            line2: '',
            postal_code: TaxAddressFactory().postalCode,
            state: faker.location.state(),
          },
        },
      })
    );

    const mockInvoicePreview = InvoicePreviewFactory();

    const mockCart = StripeResponseFactory(
      ResultCartFactory({
        uid: uid,
        couponCode: faker.string.uuid(),
        stripeCustomerId: mockCustomer.id,
        eligibilityStatus: CartEligibilityStatus.CREATE,
        amount: mockInvoicePreview.subtotal,
      })
    );

    const mockAccountCustomer = StripeResponseFactory(
      ResultAccountCustomerFactory({
        uid: uid,
        stripeCustomerId: mockCart.stripeCustomerId,
      })
    );

    const mockPrice = StripePriceFactory();

    const mockPromotionCode = StripeResponseFactory(
      StripePromotionCodeFactory()
    );

    beforeEach(async () => {
      jest.spyOn(accountManager, 'createAccountStub').mockResolvedValue(uid);
      jest
        .spyOn(stripeManager, 'createPlainCustomer')
        .mockResolvedValue(mockCustomer);
      jest
        .spyOn(stripeManager, 'fetchActiveCustomer')
        .mockResolvedValue(mockCustomer);
      jest
        .spyOn(accountCustomerManager, 'createAccountCustomer')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(cartManager, 'updateFreshCart').mockResolvedValue();
      jest
        .spyOn(eligibilityService, 'checkEligibility')
        .mockResolvedValue(EligibilityStatus.CREATE);
      jest
        .spyOn(contentfulService, 'retrieveStripePlanId')
        .mockResolvedValue(mockPrice.id);
      jest
        .spyOn(stripeManager, 'previewInvoice')
        .mockResolvedValue(mockInvoicePreview);
      jest
        .spyOn(stripeManager, 'cancelIncompleteSubscriptionsToPrice')
        .mockResolvedValue();
      jest
        .spyOn(stripeManager, 'getPromotionCodeByName')
        .mockResolvedValue(mockPromotionCode);
    });

    describe('success - with stripeCustomerId attached to cart', () => {
      beforeEach(async () => {
        await checkoutService.prePaySteps(mockCart, mockCustomerData);
      });

      it('fetches the customer', () => {
        expect(stripeManager.fetchActiveCustomer).toHaveBeenCalledWith(
          mockCart.stripeCustomerId
        );
      });

      it('checks if cart eligibility matches customer eligibility', () => {
        expect(eligibilityService.checkEligibility).toHaveBeenCalledWith(
          mockCart.interval,
          mockCart.offeringConfigId,
          mockCustomer.id
        );

        expect(handleEligibilityStatusMap[EligibilityStatus.CREATE]).toEqual(
          mockCart.eligibilityStatus
        );
      });

      it('checks that cart total matches upcoming invoice', () => {
        expect(mockInvoicePreview.subtotal).toEqual(mockCart.amount);
      });

      it('checks that customer does not have existing subscription to price', () => {
        expect(
          stripeManager.cancelIncompleteSubscriptionsToPrice
        ).toHaveBeenCalledWith(mockCustomer.id, mockPrice.id);
      });

      it('checks if customer is stripe tax eligible', async () => {
        expect(stripeManager.isCustomerStripeTaxEligible).toBeTruthy();
      });

      it('fetches promotion code by name', async () => {
        expect(stripeManager.getPromotionCodeByName).toHaveBeenCalledWith(
          mockCart.couponCode,
          true
        );
      });
    });

    describe('success - with new account customer stub account', () => {
      const mockCart = StripeResponseFactory(
        ResultCartFactory({
          uid: undefined,
          couponCode: faker.string.uuid(),
          stripeCustomerId: mockCustomer.id,
          eligibilityStatus: CartEligibilityStatus.CREATE,
          amount: mockInvoicePreview.subtotal,
        })
      );

      beforeEach(async () => {
        await checkoutService.prePaySteps(mockCart, mockCustomerData);
      });

      it('creates a new account customer stub account', () => {
        expect(accountManager.createAccountStub).toHaveBeenCalledWith(
          mockCart.email,
          1,
          mockCustomerData.locale
        );
      });

      it('updates the cart', () => {
        const { id, version } = mockCart;

        expect(cartManager.updateFreshCart).toHaveBeenCalledWith(id, version, {
          uid: uid,
          stripeCustomerId: mockCart.stripeCustomerId,
        });
      });

      it('creates an account customer', () => {
        expect(
          accountCustomerManager.createAccountCustomer
        ).toHaveBeenCalledWith({
          uid: uid,
          stripeCustomerId: mockCart.stripeCustomerId,
          updatedAt: Date.now(),
        });
      });
    });

    describe('success - with new stripe customer stub account', () => {
      const mockCart = StripeResponseFactory(
        ResultCartFactory({
          uid: uid,
          couponCode: faker.string.uuid(),
          stripeCustomerId: null,
          eligibilityStatus: CartEligibilityStatus.CREATE,
          amount: mockInvoicePreview.subtotal,
        })
      );

      beforeEach(async () => {
        await checkoutService.prePaySteps(mockCart, mockCustomerData);
      });

      it('creates a new stripe customer stub account', () => {
        expect(stripeManager.createPlainCustomer).toHaveBeenCalledWith({
          uid: uid,
          email: mockCart.email,
          displayName: mockCustomerData.displayName,
          taxAddress: mockCart.taxAddress,
        });
      });

      it('updates the cart', () => {
        const { uid, id, version } = mockCart;

        expect(cartManager.updateFreshCart).toHaveBeenCalledWith(id, version, {
          uid: uid,
          stripeCustomerId: mockCustomer.id,
        });
      });
    });

    describe('fail', () => {
      it('throws cart email not found error', async () => {
        const mockCart = StripeResponseFactory(
          ResultCartFactory({
            email: null,
          })
        );

        await expect(
          checkoutService.prePaySteps(mockCart, mockCustomerData)
        ).rejects.toBeInstanceOf(CartEmailNotFoundError);
      });

      it('throws cart eligibility mismatch error', async () => {
        const mockCart = StripeResponseFactory(
          ResultCartFactory({
            uid: uid,
            couponCode: faker.string.uuid(),
            stripeCustomerId: mockCustomer.id,
            eligibilityStatus: CartEligibilityStatus.INVALID,
            amount: mockInvoicePreview.subtotal,
          })
        );

        await expect(
          checkoutService.prePaySteps(mockCart, mockCustomerData)
        ).rejects.toBeInstanceOf(CartEligibilityMismatchError);
      });

      it('throws cart total mismatch error', async () => {
        const mockCart = StripeResponseFactory(
          ResultCartFactory({
            uid: uid,
            couponCode: faker.string.uuid(),
            stripeCustomerId: null,
            eligibilityStatus: CartEligibilityStatus.CREATE,
            amount: faker.number.int(),
          })
        );

        await expect(
          checkoutService.prePaySteps(mockCart, mockCustomerData)
        ).rejects.toBeInstanceOf(CartTotalMismatchError);
      });
    });
  });

  describe('payWithStripe', () => {
    const mockCustomerData = CheckoutCustomerDataFactory();
    const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
    const mockCart = StripeResponseFactory(
      ResultCartFactory({
        uid: faker.string.uuid(),
        stripeCustomerId: mockCustomer.id,
        couponCode: faker.string.uuid(),
      })
    );
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
    const mockPriceId = StripePriceFactory().id;

    beforeEach(async () => {
      jest.spyOn(checkoutService, 'prePaySteps').mockResolvedValue({
        uid: mockCart.uid as string,
        customer: mockCustomer,
        enableAutomaticTax: true,
        promotionCode: mockPromotionCode,
        priceId: mockPriceId,
      });
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
        await checkoutService.payWithStripe(
          mockCart,
          mockPaymentMethod.id,
          mockCustomerData
        );
      });

      it('calls prePaySteps', async () => {
        expect(checkoutService.prePaySteps).toHaveBeenCalledWith(
          mockCart,
          mockCustomerData
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
              price: mockPriceId, // TODO: fetch price from cart after FXA-8893
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
    const mockCustomerData = CheckoutCustomerDataFactory();
    const mockToken = faker.string.uuid();
    const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
    const mockCart = StripeResponseFactory(
      ResultCartFactory({
        uid: faker.string.uuid(),
        stripeCustomerId: mockCustomer.id,
        couponCode: faker.string.uuid(),
      })
    );
    const mockPromotionCode = StripeResponseFactory(
      StripePromotionCodeFactory()
    );
    const mockBillingAgreementId = faker.string.uuid();
    const mockSubscription = StripeResponseFactory(StripeSubscriptionFactory());
    const mockPaypalCustomer = ResultPaypalCustomerFactory();
    const mockInvoice = StripeResponseFactory(StripeInvoiceFactory());
    const mockPriceId = StripePriceFactory().id;

    beforeEach(async () => {
      jest.spyOn(checkoutService, 'prePaySteps').mockResolvedValue({
        uid: mockCart.uid as string,
        customer: mockCustomer,
        enableAutomaticTax: true,
        promotionCode: mockPromotionCode,
        priceId: mockPriceId,
      });
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
        await checkoutService.payWithPaypal(
          mockCart,
          mockCustomerData,
          mockToken
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
              price: mockPriceId,
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
