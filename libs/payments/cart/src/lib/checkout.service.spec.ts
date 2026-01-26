/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { StatsD } from 'hot-shots';

import {
  AsyncLocalStorageCart,
  AsyncLocalStorageCartProvider,
  CartManager,
  CartService,
  InvalidInvoiceStateCheckoutError,
  ResultCartFactory,
  SubscriptionAttributionFactory,
  UpgradeForSubscriptionNotFoundError,
  handleEligibilityStatusMap,
} from '@fxa/payments/cart';
import {
  EligibilityManager,
  EligibilityService,
  EligibilityStatus,
  SubscriptionEligibilityResultFactory,
  SubscriptionEligibilityUpgradeDowngradeResultFactory,
} from '@fxa/payments/eligibility';
import {
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalClientConfig,
  PaypalCustomerManager,
  ResultPaypalCustomerFactory,
} from '@fxa/payments/paypal';
import {
  CustomerManager,
  CustomerSessionManager,
  InvoiceManager,
  InvoicePreviewFactory,
  PaymentIntentManager,
  PaymentMethodManager,
  PriceManager,
  PricingForCurrencyFactory,
  ProductManager,
  PromotionCodeManager,
  SetupIntentManager,
  PromotionCodeNotFoundError,
  STRIPE_SUBSCRIPTION_METADATA,
  SubscriptionManager,
  TaxAddressFactory,
  SubPlatPaymentMethodType,
} from '@fxa/payments/customer';
import {
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
  ResultAccountCustomerFactory,
  MockStripeConfigProvider,
  AccountCustomerManager,
  StripeConfirmationTokenFactory,
  StripeSetupIntentFactory,
} from '@fxa/payments/stripe';
import {
  MockProfileClientConfigProvider,
  ProfileClient,
} from '@fxa/profile/client';
import {
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import {
  AccountFactory,
  CartEligibilityStatus,
  MockAccountDatabaseNestFactory,
} from '@fxa/shared/db/mysql/account';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { MockStatsDProvider, StatsDService } from '@fxa/shared/metrics/statsd';
import {
  MockNotifierSnsConfigProvider,
  NotifierService,
  NotifierSnsProvider,
} from '@fxa/shared/notifier';
import {
  CartEligibilityMismatchError,
  CartTotalMismatchError,
  CartAccountNotFoundError,
  CartCurrencyNotFoundError,
  CartUidNotFoundError,
  CartNoTaxAddressError,
  CartUidMismatchError,
} from './cart.error';
import { CheckoutService } from './checkout.service';
import { PrePayStepsResultFactory } from './checkout.factories';
import { AccountManager } from '@fxa/shared/account/account';
import { CurrencyManager } from '@fxa/payments/currency';
import {
  LocationConfig,
  MockLocationConfigProvider,
} from '@fxa/payments/eligibility';
import {
  GeoDBManager,
  GeoDBManagerConfig,
  MockGeoDBNestFactory,
} from '@fxa/shared/geodb';
import { MockCurrencyConfigProvider } from 'libs/payments/currency/src/lib/currency.config';
import {
  AppleIapClient,
  AppleIapPurchaseManager,
  GoogleIapClient,
  GoogleIapPurchaseManager,
  MockAppleIapClientConfigProvider,
  MockGoogleIapClientConfigProvider,
} from '@fxa/payments/iap';
import { Logger } from '@nestjs/common';
import type { AsyncLocalStorage } from 'async_hooks';
import type { CartStore } from './cart-als.types';
import {
  CommonMetricsFactory,
  MockPaymentsGleanConfigProvider,
  MockPaymentsGleanFactory,
  PaymentsGleanManager,
  PaymentsGleanService,
} from '@fxa/payments/metrics';
import {
  MockNimbusManagerConfigProvider,
  NimbusManager,
} from '@fxa/payments/experiments';
import {
  MockNimbusClientConfigProvider,
  NimbusClient,
} from '@fxa/shared/experiments';

describe('CheckoutService', () => {
  let accountCustomerManager: AccountCustomerManager;
  let accountManager: AccountManager;
  let asyncLocalStorage: AsyncLocalStorage<CartStore>;
  let cartManager: CartManager;
  let checkoutService: CheckoutService;
  let customerManager: CustomerManager;
  let eligibilityService: EligibilityService;
  let invoiceManager: InvoiceManager;
  let paymentIntentManager: PaymentIntentManager;
  let setupIntentManager: SetupIntentManager;
  let paypalBillingAgreementManager: PaypalBillingAgreementManager;
  let paypalCustomerManager: PaypalCustomerManager;
  let priceManager: PriceManager;
  let privateMethod: any;
  let productConfigurationManager: ProductConfigurationManager;
  let profileClient: ProfileClient;
  let promotionCodeManager: PromotionCodeManager;
  let statsd: StatsD;
  let subscriptionManager: SubscriptionManager;
  let paymentMethodManager: PaymentMethodManager;
  let gleanService: PaymentsGleanService;

  const mockLogger = {
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountCustomerManager,
        AccountManager,
        AsyncLocalStorageCartProvider,
        CartManager,
        CartService,
        CheckoutService,
        CustomerManager,
        CustomerSessionManager,
        CurrencyManager,
        EligibilityManager,
        EligibilityService,
        AppleIapPurchaseManager,
        AppleIapClient,
        MockAppleIapClientConfigProvider,
        GoogleIapPurchaseManager,
        GoogleIapClient,
        MockGoogleIapClientConfigProvider,
        Logger,
        GeoDBManager,
        GeoDBManagerConfig,
        MockGeoDBNestFactory,
        InvoiceManager,
        LocationConfig,
        MockAccountDatabaseNestFactory,
        MockCurrencyConfigProvider,
        MockFirestoreProvider,
        MockPaymentsGleanFactory,
        MockLocationConfigProvider,
        MockNimbusManagerConfigProvider,
        MockNimbusClientConfigProvider,
        MockNotifierSnsConfigProvider,
        MockPaymentsGleanConfigProvider,
        MockProfileClientConfigProvider,
        MockStatsDProvider,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        NotifierService,
        NotifierSnsProvider,
        NimbusManager,
        NimbusClient,
        PaymentIntentManager,
        PaymentMethodManager,
        PaymentsGleanManager,
        PaymentsGleanService,
        PaypalBillingAgreementManager,
        PayPalClient,
        PaypalClientConfig,
        PaypalCustomerManager,
        PriceManager,
        ProductConfigurationManager,
        ProductManager,
        ProfileClient,
        PromotionCodeManager,
        SetupIntentManager,
        StrapiClient,
        StripeClient,
        StripeConfig,
        SubscriptionManager,
        {
          provide: LOGGER_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    accountManager = moduleRef.get(AccountManager);
    asyncLocalStorage = moduleRef.get(AsyncLocalStorageCart);
    cartManager = moduleRef.get(CartManager);
    checkoutService = moduleRef.get(CheckoutService);
    customerManager = moduleRef.get(CustomerManager);
    eligibilityService = moduleRef.get(EligibilityService);
    invoiceManager = moduleRef.get(InvoiceManager);
    paymentIntentManager = moduleRef.get(PaymentIntentManager);
    setupIntentManager = moduleRef.get(SetupIntentManager);
    paypalBillingAgreementManager = moduleRef.get(
      PaypalBillingAgreementManager
    );
    paypalCustomerManager = moduleRef.get(PaypalCustomerManager);
    priceManager = moduleRef.get(PriceManager);
    privateMethod = jest
      .spyOn(checkoutService as any, 'customerChanged')
      .mockResolvedValue({});
    profileClient = moduleRef.get(ProfileClient);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    promotionCodeManager = moduleRef.get(PromotionCodeManager);
    statsd = moduleRef.get(StatsDService);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    gleanService = moduleRef.get(PaymentsGleanService);
  });

  describe('prePaySteps', () => {
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
    const mockAccount = StripeResponseFactory(
      AccountFactory({ uid: Buffer.from(uid, 'hex') })
    );

    const mockPrice = StripePriceFactory();

    const mockPromotionCode = StripeResponseFactory(
      StripePromotionCodeFactory()
    );

    beforeEach(async () => {
      jest.spyOn(customerManager, 'create').mockResolvedValue(mockCustomer);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);
      jest
        .spyOn(accountCustomerManager, 'createAccountCustomer')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(cartManager, 'updateFreshCart').mockResolvedValue();
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      });
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
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
      jest
        .spyOn(accountManager, 'getAccounts')
        .mockResolvedValue([mockAccount]);
    });

    describe('success - with stripeCustomerId attached to cart', () => {
      beforeEach(async () => {
        await checkoutService.prePaySteps(mockCart, mockCart.uid);
      });

      it('fetches the customer', () => {
        expect(customerManager.retrieve).toHaveBeenCalledWith(
          mockCart.stripeCustomerId
        );
      });

      it('updates the tax location of the customer', () => {
        expect(customerManager.update).toHaveBeenCalledWith(
          mockCart.stripeCustomerId,
          {
            shipping: {
              name: mockAccount.email,
              address: {
                country: mockCart.taxAddress?.countryCode,
                postal_code: mockCart.taxAddress?.postalCode,
              },
            },
          }
        );
      });

      it('checks if cart eligibility matches customer eligibility', () => {
        expect(eligibilityService.checkEligibility).toHaveBeenCalledWith(
          mockCart.interval,
          mockCart.offeringConfigId,
          mockCart.uid,
          mockCustomer.id
        );

        expect(handleEligibilityStatusMap[EligibilityStatus.CREATE]).toEqual(
          mockCart.eligibilityStatus
        );
      });

      it('checks that cart total matches upcoming invoice', () => {
        expect(mockInvoicePreview.subtotal).toEqual(mockCart.amount);
      });

      it('does not update the cart', () => {
        expect(cartManager.updateFreshCart).not.toHaveBeenCalled();
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
        ).toHaveBeenCalledWith(
          mockCart.couponCode,
          mockPrice,
          mockCart.currency
        );
      });
    });

    describe('fail', () => {
      it('throws cart account not found error', async () => {
        jest.spyOn(accountManager, 'getAccounts').mockResolvedValue([]);

        await expect(
          checkoutService.prePaySteps(mockCart, mockCart.uid)
        ).rejects.toBeInstanceOf(CartAccountNotFoundError);
      });

      it('throws cart uid not found error', async () => {
        const mockCart = StripeResponseFactory(
          ResultCartFactory({
            uid: undefined,
          })
        );

        await expect(
          checkoutService.prePaySteps(mockCart, mockCart.uid)
        ).rejects.toBeInstanceOf(CartUidNotFoundError);
      });

      it('throws cart uid mismatch error', async () => {
        const mockCart = StripeResponseFactory(
          ResultCartFactory({
            uid: faker.string.uuid(),
          })
        );

        await expect(
          checkoutService.prePaySteps(mockCart, 'randomSession')
        ).rejects.toBeInstanceOf(CartUidMismatchError);
      });

      it('throws cart tax location missing error', async () => {
        await expect(
          checkoutService.prePaySteps(
            {
              ...mockCart,
              taxAddress: null,
            },
            mockCart.uid
          )
        ).rejects.toBeInstanceOf(CartNoTaxAddressError);
      });

      it('throws cart currency invalid error', async () => {
        const mockCart = StripeResponseFactory(
          ResultCartFactory({
            currency: undefined,
          })
        );

        await expect(
          checkoutService.prePaySteps(mockCart, mockCart.uid)
        ).rejects.toBeInstanceOf(CartCurrencyNotFoundError);
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
          checkoutService.prePaySteps(mockCart, mockCart.uid)
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
          .mockRejectedValue(
            new PromotionCodeNotFoundError(
              mockCart.couponCode ?? faker.string.uuid(),
              faker.string.uuid(),
              mockCart.currency
            )
          );

        await expect(
          checkoutService.prePaySteps(mockCart, mockCart.uid)
        ).rejects.toBeInstanceOf(PromotionCodeNotFoundError);
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
          checkoutService.prePaySteps(mockCart, mockCart.uid)
        ).rejects.toBeInstanceOf(CartTotalMismatchError);
      });
    });
  });

  describe('postPaySteps', () => {
    const mockUid = faker.string.uuid();
    const mockSubscription = StripeResponseFactory(StripeSubscriptionFactory());
    const mockCart = ResultCartFactory();
    const paymentProvider = 'stripe';
    const paymentForm = SubPlatPaymentMethodType.Card;
    const mockRequestArgs = CommonMetricsFactory();

    beforeEach(async () => {
      jest.spyOn(customerManager, 'setTaxId').mockResolvedValue();
      jest.spyOn(profileClient, 'deleteCache').mockResolvedValue('test');
      jest.spyOn(cartManager, 'finishCart').mockResolvedValue();
      jest.spyOn(statsd, 'increment');
      jest
        .spyOn(gleanService, 'recordGenericSubManageEvent')
        .mockResolvedValue();
    });

    it('success', async () => {
      await checkoutService.postPaySteps({
        cart: mockCart,
        version: mockCart.version,
        subscription: mockSubscription,
        uid: mockUid,
        paymentProvider,
        paymentForm,
        isCancelInterstitialOffer: false,
      });

      expect(customerManager.setTaxId).toHaveBeenCalledWith(
        mockSubscription.customer,
        mockSubscription.currency
      );

      expect(privateMethod).toHaveBeenCalled();
      expect(cartManager.finishCart).toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith('subscription_success', {
        payment_provider: paymentProvider,
        payment_form: paymentForm,
        offering_id: mockCart.offeringConfigId,
        interval: mockCart.interval,
      });
      expect(gleanService.recordGenericSubManageEvent).not.toHaveBeenCalled();
    });

    it('success - adds coupon code to subscription metadata if it exists', async () => {
      const mockCart = ResultCartFactory({
        couponCode: faker.string.uuid(),
      });
      const mockUpdatedSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          metadata: {
            [STRIPE_SUBSCRIPTION_METADATA.SubscriptionPromotionCode]:
              mockCart.couponCode as string,
          },
        })
      );
      const paymentProvider = 'stripe';
      const paymentForm = SubPlatPaymentMethodType.Card;

      jest
        .spyOn(subscriptionManager, 'update')
        .mockResolvedValue(mockUpdatedSubscription);

      await checkoutService.postPaySteps({
        cart: mockCart,
        version: mockCart.version,
        subscription: mockSubscription,
        uid: mockUid,
        paymentProvider,
        paymentForm,
        isCancelInterstitialOffer: false,
      });

      expect(customerManager.setTaxId).toHaveBeenCalledWith(
        mockSubscription.customer,
        mockSubscription.currency
      );
      expect(privateMethod).toHaveBeenCalled();
      expect(subscriptionManager.update).toHaveBeenCalledWith(
        mockSubscription.id,
        {
          metadata: {
            [STRIPE_SUBSCRIPTION_METADATA.SubscriptionPromotionCode]:
              mockCart.couponCode,
          },
        }
      );
    });

    it('success - records cancel interstitial offer redeemed event', async () => {
      await checkoutService.postPaySteps({
        cart: mockCart,
        version: mockCart.version,
        subscription: mockSubscription,
        uid: mockUid,
        paymentProvider,
        paymentForm,
        isCancelInterstitialOffer: true,
        requestArgs: mockRequestArgs,
      });

      expect(gleanService.recordGenericSubManageEvent).toHaveBeenCalledWith({
        eventName: 'recordCancelInterstitialOfferRedeemed',
        uid: mockUid,
        subscriptionId: mockSubscription.id,
        commonMetrics: mockRequestArgs,
      });
    });
  });

  describe('payWithStripe', () => {
    const mockAttributionData = SubscriptionAttributionFactory();
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
    const mockSubscription = StripeResponseFactory(StripeSubscriptionFactory());
    const mockPaymentIntent = StripeResponseFactory(
      StripePaymentIntentFactory({
        status: 'succeeded',
        payment_method: StripePaymentMethodFactory().id,
      })
    );
    const mockPrice = StripePriceFactory();
    const mockConfirmationToken = StripeConfirmationTokenFactory();
    const mockInvoice = StripeResponseFactory(
      StripeInvoiceFactory({
        payment_intent: mockPaymentIntent.id,
      })
    );
    const mockEligibilityResult = SubscriptionEligibilityResultFactory({
      subscriptionEligibilityResult: EligibilityStatus.CREATE,
    });
    const mockPrePayStepsResult = PrePayStepsResultFactory({
      uid: mockCart.uid,
      customer: mockCustomer,
      promotionCode: mockPromotionCode,
      price: mockPrice,
      eligibility: mockEligibilityResult,
    });
    const mockPricingForCurrency = PricingForCurrencyFactory();
    const mockPaymentMethod = StripeResponseFactory(
      StripePaymentMethodFactory()
    );
    const mockRequestArgs = CommonMetricsFactory();

    beforeEach(async () => {
      jest
        .spyOn(checkoutService, 'prePaySteps')
        .mockResolvedValue(mockPrePayStepsResult);
      jest
        .spyOn(priceManager, 'retrievePricingForCurrency')
        .mockResolvedValue(mockPricingForCurrency);
      jest
        .spyOn(subscriptionManager, 'create')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(cartManager, 'updateFreshCart').mockResolvedValue();
      jest.spyOn(cartManager, 'setNeedsInputCart').mockResolvedValue();
      jest.spyOn(invoiceManager, 'retrieve').mockResolvedValue(mockInvoice);
      jest
        .spyOn(paymentIntentManager, 'confirm')
        .mockResolvedValue(mockPaymentIntent);
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);
      jest.spyOn(statsd, 'increment');
      jest.spyOn(checkoutService, 'postPaySteps').mockResolvedValue();
      jest.spyOn(asyncLocalStorage, 'getStore');
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);
    });

    describe('succeeded', () => {
      beforeEach(async () => {
        await checkoutService.payWithStripe(
          mockCart,
          mockConfirmationToken.id,
          mockAttributionData,
          mockRequestArgs,
          mockCart.uid
        );
      });

      it('calls prePaySteps', async () => {
        expect(checkoutService.prePaySteps).toHaveBeenCalledWith(
          mockCart,
          mockCart.uid
        );
      });

      it('increments the statsd counter', async () => {
        expect(statsd.increment).toHaveBeenCalledWith('stripe_subscription', {
          payment_provider: 'stripe',
        });
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
            payment_behavior: 'default_incomplete',
            currency: mockCart.currency,
            metadata: {
              amount: mockPricingForCurrency.unitAmountForCurrency,
              currency: mockCart.currency,
              utm_campaign: mockAttributionData.utm_campaign,
              utm_content: mockAttributionData.utm_content,
              utm_medium: mockAttributionData.utm_medium,
              utm_source: mockAttributionData.utm_source,
              utm_term: mockAttributionData.utm_term,
              session_flow_id: mockAttributionData.session_flow_id,
              session_entrypoint: mockAttributionData.session_entrypoint,
              session_entrypoint_experiment:
                mockAttributionData.session_entrypoint_experiment,
              session_entrypoint_variation:
                mockAttributionData.session_entrypoint_variation,
            },
          },
          { idempotencyKey: mockCart.id }
        );
      });

      it('calls asyncLocalStorage.getStore', () => {
        expect(asyncLocalStorage.getStore).toHaveBeenCalled();
      });

      it('calls updateFreshCart', async () => {
        expect(cartManager.updateFreshCart).toHaveBeenCalledWith(
          mockCart.id,
          mockPrePayStepsResult.version,
          {
            stripeSubscriptionId: mockSubscription.id,
            stripeIntentId: mockPaymentIntent.id,
          }
        );
      });

      it('calls calls paymentIntentManager.confirm', async () => {
        expect(paymentIntentManager.confirm).toHaveBeenCalledWith(
          mockInvoice.payment_intent,
          { confirmation_token: mockConfirmationToken.id, off_session: false }
        );
      });

      it('calls customerManager.update', async () => {
        expect(customerManager.update).toHaveBeenCalledWith(mockCustomer.id, {
          invoice_settings: {
            default_payment_method: mockPaymentIntent.payment_method,
          },
        });
      });

      it('calls postPaySteps', async () => {
        expect(checkoutService.postPaySteps).toHaveBeenCalledWith({
          cart: mockCart,
          version: mockPrePayStepsResult.version + 1,
          subscription: mockSubscription,
          uid: mockCart.uid,
          paymentProvider: 'stripe',
          paymentForm: SubPlatPaymentMethodType.Card,
          requestArgs: mockRequestArgs,
          isCancelInterstitialOffer: false,
        });
      });

      it('handles free payments for customers with default payment method', async () => {
        const freeInvoice = StripeResponseFactory(
          StripeInvoiceFactory({
            payment_intent: mockPaymentIntent.id,
            amount_due: 0,
            status: 'paid',
          })
        );
        const existingPayentMethod = StripeResponseFactory(
          StripePaymentMethodFactory()
        );
        jest.spyOn(invoiceManager, 'retrieve').mockResolvedValue(freeInvoice);
        jest
          .spyOn(customerManager, 'getDefaultPaymentMethod')
          .mockResolvedValue(existingPayentMethod);
        expect(
          checkoutService.payWithStripe(
            mockCart,
            mockConfirmationToken.id,
            mockAttributionData,
            mockRequestArgs,
            mockCart.uid
          )
        ).resolves;
      });

      describe('upgrade', () => {
        const mockEligibilityResult =
          SubscriptionEligibilityUpgradeDowngradeResultFactory({
            redundantOverlaps: [
              SubscriptionEligibilityUpgradeDowngradeResultFactory(),
            ],
          });
        const mockPrePayStepsResult = PrePayStepsResultFactory({
          uid: mockCart.uid,
          customer: mockCustomer,
          promotionCode: mockPromotionCode,
          price: mockPrice,
          version: mockCart.version + 1,
          eligibility: mockEligibilityResult,
        });
        const mockPricingForCurrency = PricingForCurrencyFactory();

        beforeEach(async () => {
          jest
            .spyOn(checkoutService, 'prePaySteps')
            .mockResolvedValue(PrePayStepsResultFactory(mockPrePayStepsResult));
          jest
            .spyOn(priceManager, 'retrievePricingForCurrency')
            .mockResolvedValue(mockPricingForCurrency);
          jest
            .spyOn(checkoutService, 'upgradeSubscription')
            .mockResolvedValue(mockSubscription);
        });

        beforeEach(async () => {
          await checkoutService.payWithStripe(
            mockCart,
            mockConfirmationToken.id,
            mockAttributionData,
            mockRequestArgs,
            mockCart.uid
          );
        });

        it('updates the subscription', async () => {
          expect(checkoutService.upgradeSubscription).toHaveBeenCalledWith(
            mockCustomer.id,
            mockPrice.id,
            mockEligibilityResult.fromPrice.id,
            mockCart,
            mockEligibilityResult.redundantOverlaps,
            mockAttributionData
          );
        });
      });

      describe('calls setup intent manager', () => {
        const mockInvoice = StripeResponseFactory(
          StripeInvoiceFactory({
            payment_intent: null,
            amount_due: 0,
          })
        );
        const mockSetupIntent = StripeResponseFactory(
          StripeSetupIntentFactory({
            status: 'succeeded',
            payment_method: StripePaymentMethodFactory().id,
          })
        );

        beforeEach(async () => {
          jest.spyOn(invoiceManager, 'retrieve').mockResolvedValue(mockInvoice);
          jest
            .spyOn(setupIntentManager, 'createAndConfirm')
            .mockResolvedValue(mockSetupIntent);
        });

        beforeEach(async () => {
          await checkoutService.payWithStripe(
            mockCart,
            mockConfirmationToken.id,
            mockAttributionData,
            mockRequestArgs,
            mockCart.uid
          );
        });

        it('calls createAndConfirm', async () => {
          expect(setupIntentManager.createAndConfirm).toHaveBeenCalledWith(
            mockCustomer.id,
            mockConfirmationToken.id
          );
        });

        it('calls updateFreshCart', async () => {
          expect(cartManager.updateFreshCart).toHaveBeenCalledWith(
            mockCart.id,
            mockPrePayStepsResult.version,
            {
              stripeSubscriptionId: mockSubscription.id,
              stripeIntentId: mockSetupIntent.id,
            }
          );
        });
      });

      describe('payment intent error', () => {
        beforeEach(async () => {
          jest
            .spyOn(paymentIntentManager, 'confirm')
            .mockRejectedValue(new Error('Payment Intent Error'));
        });

        it('updates the subscription', async () => {
          await expect(
            checkoutService.payWithStripe(
              mockCart,
              mockConfirmationToken.id,
              mockAttributionData,
              mockRequestArgs,
              mockCart.uid
            )
          ).rejects.toThrow();

          expect(cartManager.updateFreshCart).toHaveBeenCalledWith(
            mockCart.id,
            mockPrePayStepsResult.version,
            {
              stripeSubscriptionId: mockSubscription.id,
            }
          );
        });
      });
    });

    describe('requires_action', () => {
      it('calls setNeedsInputCart', async () => {
        const mockAttributionData = SubscriptionAttributionFactory();
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
        const mockSubscription = StripeResponseFactory(
          StripeSubscriptionFactory()
        );
        const mockPaymentIntent = StripeResponseFactory(
          StripePaymentIntentFactory({
            status: 'requires_action',
            payment_method: StripePaymentMethodFactory().id,
          })
        );
        const mockPrice = StripePriceFactory();
        const mockConfirmationToken = StripeConfirmationTokenFactory();
        const mockInvoice = StripeResponseFactory(
          StripeInvoiceFactory({
            payment_intent: mockPaymentIntent.id,
          })
        );
        const mockEligibilityResult = SubscriptionEligibilityResultFactory({
          subscriptionEligibilityResult: EligibilityStatus.CREATE,
        });
        const mockPrePayStepsResult = PrePayStepsResultFactory({
          uid: mockCart.uid,
          customer: mockCustomer,
          promotionCode: mockPromotionCode,
          price: mockPrice,
          eligibility: mockEligibilityResult,
        });
        const mockPricingForCurrency = PricingForCurrencyFactory({
          unitAmountForCurrency: 1000,
        });

        jest
          .spyOn(checkoutService, 'prePaySteps')
          .mockResolvedValue(mockPrePayStepsResult);
        jest
          .spyOn(priceManager, 'retrievePricingForCurrency')
          .mockResolvedValue(mockPricingForCurrency);
        jest
          .spyOn(subscriptionManager, 'create')
          .mockResolvedValue(mockSubscription);
        jest.spyOn(cartManager, 'updateFreshCart').mockResolvedValue();
        jest.spyOn(cartManager, 'setNeedsInputCart').mockResolvedValue();
        jest.spyOn(invoiceManager, 'retrieve').mockResolvedValue(mockInvoice);
        jest
          .spyOn(paymentIntentManager, 'confirm')
          .mockResolvedValue(mockPaymentIntent);
        jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);
        jest.spyOn(statsd, 'increment');
        jest.spyOn(checkoutService, 'postPaySteps').mockResolvedValue();

        await checkoutService.payWithStripe(
          mockCart,
          mockConfirmationToken.id,
          mockAttributionData,
          mockRequestArgs,
          mockCart.uid
        );

        expect(cartManager.setNeedsInputCart).toHaveBeenCalledWith(mockCart.id);
      });
    });

    describe('error', () => {
      it('assertNotNull on prices unitAmountForCurrency', async () => {
        const localMockPricingForCurrency = {
          ...mockPricingForCurrency,
          unitAmountForCurrency: null,
        };
        jest
          .spyOn(priceManager, 'retrievePricingForCurrency')
          .mockResolvedValue(localMockPricingForCurrency);
        await expect(
          checkoutService.payWithStripe(
            mockCart,
            mockConfirmationToken.id,
            mockAttributionData,
            mockRequestArgs,
            mockCart.uid
          )
        ).rejects.toThrow(/PayWithStripeNullCurrencyError/);
      });

      it('subscription latest_invoice not found', async () => {
        const localMockSubscription = {
          ...mockSubscription,
          latest_invoice: null,
        };
        jest
          .spyOn(subscriptionManager, 'create')
          .mockResolvedValue(localMockSubscription);
        await expect(
          checkoutService.payWithStripe(
            mockCart,
            mockConfirmationToken.id,
            mockAttributionData,
            mockRequestArgs,
            mockCart.uid
          )
        ).rejects.toThrow(
          /PayWithStripeLatestInvoiceNotFoundOnSubscriptionError/
        );
      });
    });
  });

  describe('payWithPaypal', () => {
    describe('success', () => {
      const mockAttributionData = SubscriptionAttributionFactory();
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
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockPaypalCustomer = ResultPaypalCustomerFactory();
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          status: 'paid',
        })
      );
      const mockPrice = StripePriceFactory();
      const mockEligibilityResult = SubscriptionEligibilityResultFactory({
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      });
      const mockPrePayStepsResult = PrePayStepsResultFactory({
        uid: mockCart.uid,
        customer: mockCustomer,
        promotionCode: mockPromotionCode,
        price: mockPrice,
        version: mockCart.version + 1,
        eligibility: mockEligibilityResult,
      });
      const mockPricingForCurrency = PricingForCurrencyFactory();
      const mockRequestArgs = CommonMetricsFactory();

      beforeEach(async () => {
        jest
          .spyOn(checkoutService, 'prePaySteps')
          .mockResolvedValue(PrePayStepsResultFactory(mockPrePayStepsResult));
        jest
          .spyOn(subscriptionManager, 'getCustomerPayPalSubscriptions')
          .mockResolvedValue([]);
        jest
          .spyOn(paypalBillingAgreementManager, 'retrieveOrCreateId')
          .mockResolvedValue(mockBillingAgreementId);
        jest
          .spyOn(priceManager, 'retrievePricingForCurrency')
          .mockResolvedValue(mockPricingForCurrency);
        jest.spyOn(statsd, 'increment');
        jest
          .spyOn(subscriptionManager, 'create')
          .mockResolvedValue(mockSubscription);
        jest
          .spyOn(paypalCustomerManager, 'deletePaypalCustomersByUid')
          .mockResolvedValue(BigInt(1));
        jest
          .spyOn(paypalCustomerManager, 'createPaypalCustomer')
          .mockResolvedValue(mockPaypalCustomer);
        jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);
        jest.spyOn(invoiceManager, 'retrieve').mockResolvedValue(mockInvoice);
        jest
          .spyOn(invoiceManager, 'processPayPalInvoice')
          .mockResolvedValue(mockInvoice);
        jest.spyOn(subscriptionManager, 'cancel');
        jest.spyOn(paypalBillingAgreementManager, 'cancel').mockResolvedValue();
        jest.spyOn(checkoutService, 'postPaySteps').mockResolvedValue();
        jest.spyOn(cartManager, 'updateFreshCart').mockResolvedValue();
        jest.spyOn(asyncLocalStorage, 'getStore');
      });

      beforeEach(async () => {
        await checkoutService.payWithPaypal(
          mockCart,
          mockAttributionData,
          mockRequestArgs,
          mockCart.uid,
          mockToken
        );
      });

      it('calls prePaySteps', async () => {
        expect(checkoutService.prePaySteps).toHaveBeenCalledWith(
          mockCart,
          mockCart.uid
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
        expect(statsd.increment).toHaveBeenCalledWith('stripe_subscription', {
          payment_provider: 'paypal',
        });
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
            currency: mockCart.currency,
            metadata: {
              amount: mockPricingForCurrency.unitAmountForCurrency,
              currency: mockCart.currency,
              utm_campaign: mockAttributionData.utm_campaign,
              utm_content: mockAttributionData.utm_content,
              utm_medium: mockAttributionData.utm_medium,
              utm_source: mockAttributionData.utm_source,
              utm_term: mockAttributionData.utm_term,
              session_flow_id: mockAttributionData.session_flow_id,
              session_entrypoint: mockAttributionData.session_entrypoint,
              session_entrypoint_experiment:
                mockAttributionData.session_entrypoint_experiment,
              session_entrypoint_variation:
                mockAttributionData.session_entrypoint_variation,
            },
          },
          { idempotencyKey: mockCart.id }
        );
      });

      it('calls asyncLocalStorage.getStore', () => {
        expect(asyncLocalStorage.getStore).toHaveBeenCalled();
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

      it('calls customermanager.update', () => {
        expect(customerManager.update).toHaveBeenCalledWith(mockCustomer.id, {
          metadata: {
            paypalAgreementId: mockBillingAgreementId,
          },
        });
      });
      it('calls cartManager.updateFreshCart', () => {
        expect(cartManager.updateFreshCart).toHaveBeenCalledWith(
          mockCart.id,
          mockPrePayStepsResult.version,
          { stripeSubscriptionId: mockSubscription.id }
        );
      });
      it('calls invoiceManager.processPayPalInvoice', async () => {
        expect(invoiceManager.processPayPalInvoice).toHaveBeenCalledWith(
          mockInvoice
        );
      });
      it('calls postPaySteps', async () => {
        expect(checkoutService.postPaySteps).toHaveBeenCalledWith({
          cart: mockCart,
          version: mockPrePayStepsResult.version + 1,
          subscription: mockSubscription,
          uid: mockCart.uid,
          paymentProvider: 'paypal',
          paymentForm: SubPlatPaymentMethodType.PayPal,
          requestArgs: mockRequestArgs,
          isCancelInterstitialOffer: false,
        });
      });

      describe('upgrade', () => {
        const mockEligibilityResult =
          SubscriptionEligibilityUpgradeDowngradeResultFactory({
            redundantOverlaps: [
              SubscriptionEligibilityUpgradeDowngradeResultFactory(),
            ],
          });
        const mockPrePayStepsResult = PrePayStepsResultFactory({
          uid: mockCart.uid,
          customer: mockCustomer,
          promotionCode: mockPromotionCode,
          price: mockPrice,
          version: mockCart.version + 1,
          eligibility: mockEligibilityResult,
        });
        const mockPricingForCurrency = PricingForCurrencyFactory();

        beforeEach(async () => {
          jest
            .spyOn(checkoutService, 'prePaySteps')
            .mockResolvedValue(PrePayStepsResultFactory(mockPrePayStepsResult));
          jest
            .spyOn(priceManager, 'retrievePricingForCurrency')
            .mockResolvedValue(mockPricingForCurrency);
          jest
            .spyOn(checkoutService, 'upgradeSubscription')
            .mockResolvedValue(mockSubscription);
          await checkoutService.payWithPaypal(
            mockCart,
            mockAttributionData,
            mockRequestArgs,
            mockCart.uid,
            mockToken
          );
        });

        it('updates the subscription', async () => {
          expect(checkoutService.upgradeSubscription).toHaveBeenCalledWith(
            mockCustomer.id,
            mockPrice.id,
            mockEligibilityResult.fromPrice.id,
            mockCart,
            mockEligibilityResult.redundantOverlaps,
            mockAttributionData
          );
        });
      });

      describe('uncollectible', () => {
        it('throws a CheckoutPaymentError', async () => {
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
          const mockSubscription = StripeResponseFactory(
            StripeSubscriptionFactory()
          );
          const mockPaypalCustomer = ResultPaypalCustomerFactory();
          const mockInvoice = StripeResponseFactory(
            StripeInvoiceFactory({
              status: 'uncollectible',
            })
          );
          const mockPrice = StripePriceFactory();
          const mockEligibilityResult = SubscriptionEligibilityResultFactory({
            subscriptionEligibilityResult: EligibilityStatus.CREATE,
          });
          const mockPrePayStepsResult = PrePayStepsResultFactory({
            uid: mockCart.uid,
            customer: mockCustomer,
            promotionCode: mockPromotionCode,
            price: mockPrice,
            version: mockCart.version + 1,
            eligibility: mockEligibilityResult,
          });

          jest
            .spyOn(checkoutService, 'prePaySteps')
            .mockResolvedValue(PrePayStepsResultFactory(mockPrePayStepsResult));
          jest
            .spyOn(subscriptionManager, 'getCustomerPayPalSubscriptions')
            .mockResolvedValue([]);
          jest
            .spyOn(paypalBillingAgreementManager, 'retrieveOrCreateId')
            .mockResolvedValue(mockBillingAgreementId);
          jest.spyOn(statsd, 'increment');
          jest
            .spyOn(subscriptionManager, 'create')
            .mockResolvedValue(mockSubscription);
          jest
            .spyOn(paypalCustomerManager, 'deletePaypalCustomersByUid')
            .mockResolvedValue(BigInt(1));
          jest
            .spyOn(paypalCustomerManager, 'createPaypalCustomer')
            .mockResolvedValue(mockPaypalCustomer);
          jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);
          jest.spyOn(invoiceManager, 'retrieve').mockResolvedValue(mockInvoice);
          jest
            .spyOn(invoiceManager, 'processPayPalInvoice')
            .mockResolvedValue(mockInvoice);
          jest.spyOn(subscriptionManager, 'cancel');
          jest
            .spyOn(paypalBillingAgreementManager, 'cancel')
            .mockResolvedValue();
          jest.spyOn(checkoutService, 'postPaySteps').mockResolvedValue();
          jest.spyOn(cartManager, 'updateFreshCart').mockResolvedValue();

          await expect(
            checkoutService.payWithPaypal(
              mockCart,
              mockAttributionData,
              mockRequestArgs,
              mockCart.uid,
              mockToken
            )
          ).rejects.toBeInstanceOf(InvalidInvoiceStateCheckoutError);
        });
      });

      describe('error', () => {
        it('assertsNotNull', async () => {
          const localMockPricingForCurrency = {
            ...mockPricingForCurrency,
            unitAmountForCurrency: null,
          };
          jest
            .spyOn(priceManager, 'retrievePricingForCurrency')
            .mockResolvedValue(localMockPricingForCurrency);
          await expect(
            checkoutService.payWithPaypal(
              mockCart,
              mockAttributionData,
              mockRequestArgs,
              mockCart.uid,
              mockToken
            )
          ).rejects.toThrow(/PayWithPaypalNullCurrencyError/);
        });
      });
    });
  });

  describe('upgradeSubscription', () => {
    const customerId = 'cus_123';
    const toPriceId = 'price_123';
    const fromPriceId = 'price_321';
    const cart = ResultCartFactory();
    const redundantOverlaps = [
      SubscriptionEligibilityUpgradeDowngradeResultFactory(),
    ];
    const subscription = StripeSubscriptionFactory();
    const redundantSubscription = StripeResponseFactory(
      StripeSubscriptionFactory()
    );
    const mockPricingForCurrency = PricingForCurrencyFactory();
    const mockAttributionData = SubscriptionAttributionFactory();

    beforeEach(() => {
      jest
        .spyOn(priceManager, 'retrievePricingForCurrency')
        .mockResolvedValueOnce(mockPricingForCurrency);
      jest
        .spyOn(subscriptionManager, 'update')
        .mockResolvedValueOnce(StripeResponseFactory(subscription))
        .mockResolvedValueOnce(StripeResponseFactory(redundantSubscription));
      jest
        .spyOn(subscriptionManager, 'cancel')
        .mockResolvedValue(StripeResponseFactory(subscription));
      jest
        .spyOn(subscriptionManager, 'retrieveForCustomerAndPrice')
        .mockResolvedValueOnce(subscription)
        .mockResolvedValueOnce(redundantSubscription);
    });

    it('successfully calls subscription update', async () => {
      await checkoutService.upgradeSubscription(
        customerId,
        toPriceId,
        fromPriceId,
        cart,
        [],
        mockAttributionData
      );
      expect(priceManager.retrievePricingForCurrency).toHaveBeenCalled();
      expect(subscriptionManager.update).toHaveBeenCalledTimes(1);
    });

    it('successfully updates and cancels redundant subscriptions when present', async () => {
      await checkoutService.upgradeSubscription(
        customerId,
        toPriceId,
        fromPriceId,
        cart,
        redundantOverlaps,
        mockAttributionData
      );
      expect(subscriptionManager.update).toHaveBeenCalledTimes(2);
      expect(subscriptionManager.update).toHaveBeenNthCalledWith(
        2,
        redundantSubscription.id,
        {
          metadata: {
            redundantCancellation: 'true',
            autoCancelledRedundantFor: subscription.id,
            cancelled_for_customer_at: expect.anything(),
          },
        }
      );
      expect(subscriptionManager.cancel).toHaveBeenCalledWith(
        redundantSubscription.id,
        { prorate: true }
      );
    });

    it('throws an error upgrade subscription could not be found', async () => {
      jest
        .spyOn(subscriptionManager, 'retrieveForCustomerAndPrice')
        .mockReset()
        .mockResolvedValue(undefined);
      await expect(
        checkoutService.upgradeSubscription(
          customerId,
          toPriceId,
          fromPriceId,
          cart,
          redundantOverlaps,
          mockAttributionData
        )
      ).rejects.toBeInstanceOf(UpgradeForSubscriptionNotFoundError);
    });

    it('throws unhandled error', async () => {
      jest
        .spyOn(subscriptionManager, 'retrieveForCustomerAndPrice')
        .mockReset()
        .mockRejectedValue(new Error('unhandled error'));
      await expect(
        checkoutService.upgradeSubscription(
          customerId,
          toPriceId,
          fromPriceId,
          cart,
          redundantOverlaps,
          mockAttributionData
        )
      ).rejects.toBeInstanceOf(Error);
    });

    it('assertsNotNull', async () => {
      const localMockPricingForCurrency = {
        ...mockPricingForCurrency,
        unitAmountForCurrency: null,
      };
      jest
        .spyOn(priceManager, 'retrievePricingForCurrency')
        .mockReset()
        .mockResolvedValue(localMockPricingForCurrency);
      await expect(
        checkoutService.upgradeSubscription(
          customerId,
          toPriceId,
          fromPriceId,
          cart,
          [],
          mockAttributionData
        )
      ).rejects.toThrow(/UpgradeSubscriptionNullCurrencyError/);
    });
  });

  describe('determineCheckoutAmount', () => {
    const mockEligibility = SubscriptionEligibilityResultFactory();
    const mockEligibilityUpgrade =
      SubscriptionEligibilityUpgradeDowngradeResultFactory();
    const mockCustomer = StripeCustomerFactory();
    const mockPrice = StripePriceFactory();
    const mockTaxAddress = TaxAddressFactory();
    const mockCurrency = mockPrice.currency;
    const mockInvoicePreview = InvoicePreviewFactory();
    const mockInvoicePreviewForUpgrade = InvoicePreviewFactory();
    const mockSubscription = StripeSubscriptionFactory();

    beforeEach(() => {
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockInvoicePreview);
      jest
        .spyOn(invoiceManager, 'previewUpcomingForUpgrade')
        .mockResolvedValue(mockInvoicePreviewForUpgrade);
      jest
        .spyOn(subscriptionManager, 'retrieveForCustomerAndPrice')
        .mockResolvedValue(mockSubscription);
    });

    it('successfully returns subtotal for checkout', async () => {
      const result = await checkoutService.determineCheckoutAmount({
        eligibility: mockEligibility,
        customer: mockCustomer,
        priceId: mockPrice.id,
        currency: mockCurrency,
        taxAddress: mockTaxAddress,
      });
      expect(invoiceManager.previewUpcoming).toHaveBeenCalled();
      expect(invoiceManager.previewUpcomingForUpgrade).not.toHaveBeenCalled();
      expect(result).toEqual(mockInvoicePreview.subtotal);
    });

    it('successfully returns subtotal for an upgrade', async () => {
      const result = await checkoutService.determineCheckoutAmount({
        eligibility: mockEligibilityUpgrade,
        customer: mockCustomer,
        priceId: mockPrice.id,
        currency: mockCurrency,
        taxAddress: mockTaxAddress,
      });
      expect(invoiceManager.previewUpcoming).not.toHaveBeenCalled();
      expect(invoiceManager.previewUpcomingForUpgrade).toHaveBeenCalled();
      expect(result).toEqual(mockInvoicePreviewForUpgrade.subtotal);
    });

    it('rejects with customer assertion failure', async () => {
      // An issue with node assert.ok() and jest prevents testing that the
      // correct error is thrown.
      // https://github.com/nodejs/node/issues/50780
      await expect(
        checkoutService.determineCheckoutAmount({
          eligibility: mockEligibilityUpgrade,
          customer: undefined,
          priceId: mockPrice.id,
          currency: mockCurrency,
          taxAddress: mockTaxAddress,
        })
      ).rejects.toThrow(/DetermineCheckoutAmountCustomerRequiredError/);
    });

    it('rejects with fromSubscription assertion failure', async () => {
      jest
        .spyOn(subscriptionManager, 'retrieveForCustomerAndPrice')
        .mockResolvedValue(undefined);
      // An issue with node assert.ok() and jest prevents testing that the
      // correct error is thrown.
      // https://github.com/nodejs/node/issues/50780
      await expect(
        checkoutService.determineCheckoutAmount({
          eligibility: mockEligibilityUpgrade,
          customer: mockCustomer,
          priceId: mockPrice.id,
          currency: mockCurrency,
          taxAddress: mockTaxAddress,
        })
      ).rejects.toThrow(/DetermineCheckoutAmountSubscriptionRequiredError/);
    });
  });
});
