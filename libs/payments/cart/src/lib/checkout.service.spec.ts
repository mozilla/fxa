/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { StatsD } from 'hot-shots';

import {
  CartManager,
  CheckoutCustomerDataFactory,
  ResultCartFactory,
  handleEligibilityStatusMap,
} from '@fxa/payments/cart';
import {
  EligibilityManager,
  EligibilityService,
  EligibilityStatus,
} from '@fxa/payments/eligibility';
import {
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalClientConfig,
  PaypalCustomerManager,
  ResultPaypalCustomerFactory,
} from '@fxa/payments/paypal';
import {
  AccountCustomerManager,
  CustomerManager,
  InvoiceManager,
  InvoicePreviewFactory,
  MockStripeConfigProvider,
  PaymentMethodManager,
  PriceManager,
  ProductManager,
  PromotionCodeManager,
  ResultAccountCustomerFactory,
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripeInvoiceFactory,
  StripePaymentIntentFactory,
  StripePaymentMethodFactory,
  StripePriceFactory,
  StripePromotionCodeFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
  SubscriptionManager,
  TaxAddressFactory,
} from '@fxa/payments/stripe';
import { AccountManager } from '@fxa/shared/account/account';
import {
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import {
  CartEligibilityStatus,
  MockAccountDatabaseNestFactory,
} from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider, StatsDService } from '@fxa/shared/metrics/statsd';
import {
  CartEligibilityMismatchError,
  CartTotalMismatchError,
  CartEmailNotFoundError,
  CartInvalidPromoCodeError,
} from './cart.error';
import { CheckoutService } from './checkout.service';

describe('CheckoutService', () => {
  let accountCustomerManager: AccountCustomerManager;
  let accountManager: AccountManager;
  let cartManager: CartManager;
  let checkoutService: CheckoutService;
  let customerManager: CustomerManager;
  let eligibilityService: EligibilityService;
  let invoiceManager: InvoiceManager;
  let mockStatsd: StatsD;
  let paymentMethodManager: PaymentMethodManager;
  let paypalBillingAgreementManager: PaypalBillingAgreementManager;
  let paypalCustomerManager: PaypalCustomerManager;
  let productConfigurationManager: ProductConfigurationManager;
  let promotionCodeManager: PromotionCodeManager;
  let stripeClient: StripeClient;
  let subscriptionManager: SubscriptionManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountCustomerManager,
        AccountManager,
        CartManager,
        CheckoutService,
        CustomerManager,
        EligibilityManager,
        EligibilityService,
        InvoiceManager,
        MockAccountDatabaseNestFactory,
        MockFirestoreProvider,
        MockStatsDProvider,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        PaymentMethodManager,
        PaypalBillingAgreementManager,
        PayPalClient,
        PaypalClientConfig,
        PaypalCustomerManager,
        PriceManager,
        ProductConfigurationManager,
        ProductManager,
        PromotionCodeManager,
        StrapiClient,
        StripeClient,
        StripeConfig,
        SubscriptionManager,
      ],
    }).compile();

    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    accountManager = moduleRef.get(AccountManager);
    cartManager = moduleRef.get(CartManager);
    checkoutService = moduleRef.get(CheckoutService);
    customerManager = moduleRef.get(CustomerManager);
    eligibilityService = moduleRef.get(EligibilityService);
    invoiceManager = moduleRef.get(InvoiceManager);
    mockStatsd = moduleRef.get(StatsDService);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    paypalBillingAgreementManager = moduleRef.get(
      PaypalBillingAgreementManager
    );
    paypalCustomerManager = moduleRef.get(PaypalCustomerManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    promotionCodeManager = moduleRef.get(PromotionCodeManager);
    stripeClient = moduleRef.get(StripeClient);
    subscriptionManager = moduleRef.get(SubscriptionManager);
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
      jest.spyOn(customerManager, 'create').mockResolvedValue(mockCustomer);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(accountCustomerManager, 'createAccountCustomer')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(cartManager, 'updateFreshCart').mockResolvedValue();
      jest
        .spyOn(eligibilityService, 'checkEligibility')
        .mockResolvedValue(EligibilityStatus.CREATE);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest
        .spyOn(invoiceManager, 'preview')
        .mockResolvedValue(mockInvoicePreview);
      jest
        .spyOn(subscriptionManager, 'cancelIncompleteSubscriptionsToPrice')
        .mockResolvedValue();
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockResolvedValue(undefined);
      jest
        .spyOn(promotionCodeManager, 'retrieveByName')
        .mockResolvedValue(mockPromotionCode);
    });

    describe('success - with stripeCustomerId attached to cart', () => {
      beforeEach(async () => {
        await checkoutService.prePaySteps(mockCart, mockCustomerData);
      });

      it('fetches the customer', () => {
        expect(customerManager.retrieve).toHaveBeenCalledWith(
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
          subscriptionManager.cancelIncompleteSubscriptionsToPrice
        ).toHaveBeenCalledWith(mockCustomer.id, mockPrice.id);
      });

      it('checks if customer is stripe tax eligible', async () => {
        expect(customerManager.isTaxEligible).toBeTruthy();
      });

      it('fetches promotion code by name', async () => {
        expect(
          promotionCodeManager.assertValidPromotionCodeNameForPrice
        ).toHaveBeenCalledWith(mockCart.couponCode, mockPrice);
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
        expect(customerManager.create).toHaveBeenCalledWith({
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

      it('throws invalid promo code error', async () => {
        const mockCart = StripeResponseFactory(
          ResultCartFactory({
            uid: uid,
            couponCode: faker.string.uuid(),
            stripeCustomerId: null,
            eligibilityStatus: CartEligibilityStatus.CREATE,
            amount: mockInvoicePreview.subtotal,
          })
        );

        jest
          .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
          .mockRejectedValue(undefined);

        await expect(
          checkoutService.prePaySteps(mockCart, mockCustomerData)
        ).rejects.toBeInstanceOf(CartInvalidPromoCodeError);
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
    const mockPrice = StripePriceFactory();

    beforeEach(async () => {
      jest.spyOn(checkoutService, 'prePaySteps').mockResolvedValue({
        uid: mockCart.uid as string,
        customer: mockCustomer,
        enableAutomaticTax: true,
        promotionCode: mockPromotionCode,
        price: mockPrice,
      });
      jest
        .spyOn(paymentMethodManager, 'attach')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);
      jest.spyOn(mockStatsd, 'increment');
      jest
        .spyOn(subscriptionManager, 'create')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(stripeClient, 'invoicesRetrieve')
        .mockResolvedValue(mockInvoice);
      jest
        .spyOn(stripeClient, 'paymentIntentRetrieve')
        .mockResolvedValue(mockPaymentIntent);
      jest
        .spyOn(subscriptionManager, 'cancel')
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
        expect(paymentMethodManager.attach).toHaveBeenCalledWith(
          mockPaymentMethod.id,
          {
            customer: mockCustomer.id,
          }
        );
      });

      it('updates the customer with a default payment method', async () => {
        expect(customerManager.update).toHaveBeenCalledWith(mockCustomer.id, {
          invoice_settings: {
            default_payment_method: mockPaymentMethod.id,
          },
        });
      });

      it('increments the statsd counter', async () => {
        expect(mockStatsd.increment).toHaveBeenCalledWith(
          'stripe_subscription',
          {
            payment_provider: 'stripe',
          }
        );
      });

      it('creates the subscription', async () => {
        expect(subscriptionManager.create).toHaveBeenCalledWith(
          {
            customer: mockCustomer.id,
            automatic_tax: {
              enabled: true,
            },
            promotion_code: mockPromotionCode.id,
            items: [
              {
                price: mockPrice.id, // TODO: fetch price from cart after FXA-8893
              },
            ],
          },
          { idempotencyKey: mockCart.id }
        );
      });

      it('retrieves the latest invoice', () => {
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
        expect(subscriptionManager.cancel).not.toHaveBeenCalled();
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
    const mockPrice = StripePriceFactory();

    beforeEach(async () => {
      jest.spyOn(checkoutService, 'prePaySteps').mockResolvedValue({
        uid: mockCart.uid as string,
        customer: mockCustomer,
        enableAutomaticTax: true,
        promotionCode: mockPromotionCode,
        price: mockPrice,
      });
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);
      jest.spyOn(invoiceManager, 'processPayPalInvoice').mockResolvedValue();
      jest.spyOn(invoiceManager, 'retrieve').mockResolvedValue(mockInvoice);
      jest.spyOn(paypalBillingAgreementManager, 'cancel').mockResolvedValue();
      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveOrCreateId')
        .mockResolvedValue(mockBillingAgreementId);
      jest.spyOn(mockStatsd, 'increment');
      jest
        .spyOn(paypalCustomerManager, 'deletePaypalCustomersByUid')
        .mockResolvedValue(BigInt(1));
      jest
        .spyOn(paypalCustomerManager, 'createPaypalCustomer')
        .mockResolvedValue(mockPaypalCustomer);
      jest
        .spyOn(subscriptionManager, 'create')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'cancel')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getCustomerPayPalSubscriptions')
        .mockResolvedValue([]);
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
          subscriptionManager.getCustomerPayPalSubscriptions
        ).toHaveBeenCalledWith(mockCustomer.id);
      });

      it('fetches/creates a billing agreement for checkout', async () => {
        expect(
          paypalBillingAgreementManager.retrieveOrCreateId
        ).toHaveBeenCalledWith(mockCart.uid, false, mockToken);
      });

      it('increments the statsd counter', async () => {
        expect(mockStatsd.increment).toHaveBeenCalledWith(
          'stripe_subscription',
          {
            payment_provider: 'paypal',
          }
        );
      });

      it('creates the subscription', async () => {
        expect(subscriptionManager.create).toHaveBeenCalledWith(
          {
            customer: mockCustomer.id,
            automatic_tax: {
              enabled: true,
            },
            collection_method: 'send_invoice',
            days_until_due: 1,
            promotion_code: mockPromotionCode.id,
            items: [
              {
                price: mockPrice.id,
              },
            ],
          },
          { idempotencyKey: mockCart.id }
        );
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

      it('retrieves the latest invoice', () => {
        expect(invoiceManager.retrieve).toHaveBeenCalledWith(
          mockSubscription.latest_invoice
        );
      });

      it('calls to process the latest invoice', () => {
        expect(invoiceManager.processPayPalInvoice).toHaveBeenCalledWith(
          mockInvoice
        );
      });

      it('does not cancel the subscription', () => {
        expect(subscriptionManager.cancel).not.toHaveBeenCalled();
      });

      it('does not cancel the billing agreement', () => {
        expect(paypalBillingAgreementManager.cancel).not.toHaveBeenCalled();
      });
    });
  });
});
