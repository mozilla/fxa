/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { Stripe } from 'stripe';

import { ProductManager } from './product.manager';
import { PromotionCodeManager } from './promotionCode.manager';
import {
  StripeClient,
  StripeApiListFactory,
  StripeResponseFactory,
  StripeCustomerFactory,
  StripePriceFactory,
  StripeProductFactory,
  StripePromotionCodeFactory,
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
  MockStripeConfigProvider,
  StripeCouponFactory,
} from '@fxa/payments/stripe';
import {
  CouponErrorCannotRedeem,
  CouponErrorInvalidCurrency,
  PromotionCodeCouldNotBeAttachedError,
  PromotionCodeCustomerSubscriptionMismatchError,
  PromotionCodeNotFoundError,
  PromotionCodeSubscriptionInactiveError,
} from './customer.error';
import { STRIPE_PRICE_METADATA } from './types';
import { SubscriptionManager } from './subscription.manager';

import { assertPromotionCodeActive } from '../lib/util/assertPromotionCodeActive';
jest.mock('../lib/util/assertPromotionCodeActive');
const mockedAssertPromotionCodeActive = jest.mocked(assertPromotionCodeActive);

import { assertPromotionCodeApplicableToPrice } from '../lib/util/assertPromotionCodeApplicableToPrice';
jest.mock('../lib/util/assertPromotionCodeApplicableToPrice');
const mockedAssertPromotionCodeApplicableToPrice = jest.mocked(
  assertPromotionCodeApplicableToPrice
);

import { getPriceFromSubscription } from '../lib/util/getPriceFromSubscription';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { InvoiceManager } from './invoice.manager';
import { CurrencyManager, MockCurrencyConfigProvider } from '@fxa/payments/currency';
import { MockPaypalClientConfigProvider, PayPalClient } from '@fxa/payments/paypal';
import { InvoicePreviewFactory } from './invoice.factories';
import { TaxAddressFactory } from './factories/tax-address.factory';
jest.mock('../lib/util/getPriceFromSubscription');
const mockedGetPriceFromSubscription = jest.mocked(getPriceFromSubscription);

describe('PromotionCodeManager', () => {
  let promotionCodeManager: PromotionCodeManager;
  let stripeClient: StripeClient;
  let invoiceManager: InvoiceManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CurrencyManager,
        InvoiceManager,
        MockCurrencyConfigProvider,
        MockPaypalClientConfigProvider,
        MockStatsDProvider,
        MockStripeConfigProvider,
        PayPalClient,
        ProductManager,
        PromotionCodeManager,
        StripeClient,
        SubscriptionManager,
      ],
    }).compile();

    promotionCodeManager = module.get(PromotionCodeManager);
    stripeClient = module.get(StripeClient);
    invoiceManager = module.get(InvoiceManager);
  });

  describe('retrieve', () => {
    it('retrieves promotion code', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockResponse = StripeResponseFactory(mockPromotionCode);

      jest
        .spyOn(stripeClient, 'promotionCodesRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await promotionCodeManager.retrieve(mockPromotionCode.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('retrieveByName', () => {
    it('queries for promotionCodes from stripe and returns first', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPromotionCode2 = StripePromotionCodeFactory();
      const mockPromotionCodesResponse = StripeApiListFactory([
        mockPromotionCode,
        mockPromotionCode2,
      ]);

      jest
        .spyOn(stripeClient, 'promotionCodesList')
        .mockResolvedValue(StripeResponseFactory(mockPromotionCodesResponse));

      const result = await promotionCodeManager.retrieveByName(
        mockPromotionCode.code
      );
      expect(result).toEqual(mockPromotionCode);
    });
  });

  describe('assertValidPromotionCodeForPrice', () => {
    it('resolves when valid', () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();
      const mockProduct = StripeProductFactory();

      mockedAssertPromotionCodeActive.mockReturnValue();
      mockedAssertPromotionCodeApplicableToPrice.mockReturnValue();

      jest
        .spyOn(stripeClient, 'productsRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      expect(
        promotionCodeManager.assertValidPromotionCodeForPrice(
          mockPromotionCode,
          mockPrice
        )
      ).resolves.toEqual(undefined);
    });

    it('throws an error if promotion code is invalid', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();

      mockedAssertPromotionCodeActive.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError();
      });

      await expect(
        promotionCodeManager.assertValidPromotionCodeForPrice(
          mockPromotionCode,
          mockPrice
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if promotion code is not applicable to price/product', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();
      const mockProduct = StripeProductFactory();

      mockedAssertPromotionCodeActive.mockReturnValue();
      mockedAssertPromotionCodeApplicableToPrice.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError();
      });

      jest
        .spyOn(stripeClient, 'productsRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      await expect(
        promotionCodeManager.assertValidPromotionCodeForPrice(
          mockPromotionCode,
          mockPrice
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });
  });

  describe('assertValidPromotionCodeNameForPrice', () => {
    it('resolves correctly when valid', async () => {
      const mockPrice = StripePriceFactory();
      const mockPromotionCode = StripePromotionCodeFactory({
        coupon: StripeCouponFactory({
          currency: mockPrice.currency,
        }),
      });
      const mockCartCurrency = mockPrice.currency;

      jest
        .spyOn(promotionCodeManager, 'retrieveByName')
        .mockResolvedValue(mockPromotionCode);
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeForPrice')
        .mockResolvedValue();

      await expect(
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice,
          mockCartCurrency
        )
      ).resolves.toEqual(undefined);
    });

    it('throws an error if promotion code is not found', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();
      const mockCartCurrency = mockPrice.currency;

      jest
        .spyOn(promotionCodeManager, 'retrieveByName')
        .mockResolvedValue(undefined);

      await expect(() =>
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice,
          mockCartCurrency
        )
      ).rejects.toBeInstanceOf(PromotionCodeNotFoundError);
    });

    it('throws an error if promotion code is not valid', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();
      const mockCartCurrency = mockPrice.currency;

      jest
        .spyOn(promotionCodeManager, 'retrieveByName')
        .mockResolvedValue(mockPromotionCode);
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeForPrice')
        .mockRejectedValue(new PromotionCodeCouldNotBeAttachedError());

      await expect(
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice,
          mockCartCurrency
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('resolves when cart and coupon currencies match', async () => {
      const mockPrice = StripePriceFactory({
        currency: 'cad',
      });
      const mockPromotionCode = StripePromotionCodeFactory({
        coupon: StripeCouponFactory({
          currency: 'cad',
        }),
      });
      const mockCartCurrency = 'CAD';

      jest
        .spyOn(promotionCodeManager, 'retrieveByName')
        .mockResolvedValue(mockPromotionCode);

      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeForPrice')
        .mockResolvedValue();

      await expect(
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice,
          mockCartCurrency
        )
      ).resolves.toEqual(undefined);
    });

    it('resolves when coupon currency is null', async () => {
      const mockPrice = StripePriceFactory({
        currency: 'cad',
      });
      const mockPromotionCode = StripePromotionCodeFactory({
        coupon: StripeCouponFactory({
          currency: null,
        }),
      });
      const mockCartCurrency = 'CAD';

      jest
        .spyOn(promotionCodeManager, 'retrieveByName')
        .mockResolvedValue(mockPromotionCode);

      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeForPrice')
        .mockResolvedValue();

      await expect(
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice,
          mockCartCurrency
        )
      ).resolves.toEqual(undefined);
    });

    it('throws an error if currencies do no match', async () => {
      const mockPrice = StripePriceFactory({
        currency: 'cad',
      });
      const mockPromotionCode = StripePromotionCodeFactory({
        coupon: StripeCouponFactory({
          currency: 'cad',
        }),
      });
      const mockCartCurrency = 'usd';

      jest
        .spyOn(promotionCodeManager, 'retrieveByName')
        .mockResolvedValue(mockPromotionCode);

      await expect(
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice,
          mockCartCurrency
        )
      ).rejects.toBeInstanceOf(CouponErrorInvalidCurrency);
    });
  });

  describe('applyPromoCodeToSubscription', () => {
    it('throws an error if the subscription is not active', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPromoId = faker.string.sample();
      const mockSubscription = StripeSubscriptionFactory({
        status: 'canceled',
      });
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockResponse);

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromoId
        )
      ).rejects.toBeInstanceOf(PromotionCodeSubscriptionInactiveError);
    });

    it('throws an error if the customer of the subscription does not match customerId', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPromoId = faker.string.sample();
      const mockSubscription = StripeSubscriptionFactory({
        status: 'active',
      });
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockResponse);

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromoId
        )
      ).rejects.toBeInstanceOf(PromotionCodeCustomerSubscriptionMismatchError);
    });

    it('throws an error if promotion code is invalid', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPromoResponse = StripeResponseFactory(undefined);
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
        status: 'active',
      });
      const mockSubResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoResponse);

      mockedAssertPromotionCodeActive.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError();
      });

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromotionCode.id
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if no subscription price exists', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPromoResponse = StripeResponseFactory(mockPromotionCode);
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
        status: 'active',
      });
      const mockSubResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoResponse);

      mockedAssertPromotionCodeActive.mockReturnValue();
      mockedGetPriceFromSubscription.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError();
      });

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromotionCode.id
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if the promotion code is not one from the product', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockProduct = StripeProductFactory();
      const mockPromotionCode = StripePromotionCodeFactory({
        active: true,
      });
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
        status: 'active',
      });
      const mockSubResponse = StripeResponseFactory(mockSubscription);
      const mockPromoResponse = StripeResponseFactory(mockPromotionCode);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoResponse);

      mockedAssertPromotionCodeActive.mockReturnValue();
      mockedGetPriceFromSubscription.mockReturnValue(mockPrice);

      jest
        .spyOn(stripeClient, 'productsRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      mockedAssertPromotionCodeApplicableToPrice.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError();
      });

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromotionCode.id
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if error is StripeInvalidRequestError', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockSubscriptionId = 'sub_id1';
      const mockPromotionId = 'promo_id1';

      const stripeError = new Stripe.errors.StripeInvalidRequestError({
        type: 'invalid_request_error',
      });

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockImplementation(() => {
          throw stripeError;
        });

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscriptionId,
          mockPromotionId
        )
      ).rejects.toThrow(PromotionCodeCouldNotBeAttachedError);
    });

    it('returns the updated subscription with the promotion code successfully', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockPromotionCode = StripePromotionCodeFactory({
        id: 'promo_code2',
        active: true,
      });
      const mockPromoCodeResponse = StripeResponseFactory(mockPromotionCode);
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
        items: StripeApiListFactory([
          StripeSubscriptionItemFactory({
            price: StripePriceFactory({
              metadata: {
                [STRIPE_PRICE_METADATA.PromotionCodes]: 'promo_code1',
              },
            }),
          }),
        ]),
        status: 'active',
      });
      const mockUpdatedSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
        items: StripeApiListFactory([
          StripeSubscriptionItemFactory({
            price: StripePriceFactory({
              metadata: {
                [STRIPE_PRICE_METADATA.PromotionCodes]:
                  'promo_code1,promo_code2',
              },
            }),
          }),
        ]),
        status: 'active',
      });
      const mockSubResponse1 = StripeResponseFactory(mockSubscription);
      const mockSubResponse2 = StripeResponseFactory(mockUpdatedSubscription);
      const mockProduct = StripeProductFactory();

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockSubResponse1);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoCodeResponse);

      mockedAssertPromotionCodeActive.mockReturnValue();
      mockedGetPriceFromSubscription.mockReturnValue(mockPrice);
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeForPrice')
        .mockResolvedValue();

      jest
        .spyOn(stripeClient, 'productsRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      jest
        .spyOn(stripeClient, 'subscriptionsUpdate')
        .mockResolvedValue(mockSubResponse2);

      const result = await promotionCodeManager.applyPromoCodeToSubscription(
        mockCustomer.id,
        mockSubscription.id,
        mockPromotionCode.id
      );
      expect(result).toEqual(mockSubResponse2);
    });
  });

  describe('assertValidForPriceAndCustomer', () => {
    const mockPromoCodeName = 'mockPromoCode';
    const mockPrice = StripePriceFactory();
    const mockCurrency = mockPrice.currency;
    const mockCustomer = StripeCustomerFactory();
    const mockTaxAddress = TaxAddressFactory();
    const mockPreviewUpcoming = InvoicePreviewFactory();

    beforeEach(() => {
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockResolvedValue(undefined)
      jest.spyOn(invoiceManager, 'previewUpcoming').mockResolvedValue(mockPreviewUpcoming);
    })

    it('successfully validates coupon without customer', async () => {
      await promotionCodeManager.assertValidForPriceAndCustomer(
        mockPromoCodeName,
        mockPrice,
        mockCurrency,
        mockCustomer,
        mockTaxAddress,
      )
      expect(promotionCodeManager.assertValidPromotionCodeNameForPrice).toHaveBeenCalledWith(mockPromoCodeName, mockPrice, mockCurrency)
      expect(invoiceManager.previewUpcoming).toHaveBeenCalledWith({
        priceId: mockPrice.id,
        currency: mockCurrency,
        customer: mockCustomer,
        taxAddress: mockTaxAddress,
        couponCode: mockPromoCodeName,
      })
    })

    it('successfully validates coupon for customer', async () => {
      await promotionCodeManager.assertValidForPriceAndCustomer(
        mockPromoCodeName,
        mockPrice,
        mockCurrency,
        undefined,
        mockTaxAddress,
      )
      expect(promotionCodeManager.assertValidPromotionCodeNameForPrice).toHaveBeenCalledWith(mockPromoCodeName, mockPrice, mockCurrency)
      expect(invoiceManager.previewUpcoming).not.toHaveBeenCalled()
    })

    it('rejects on assertValidPromotionCodeNameForPrice rejection', async () => {
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockRejectedValue(new Error('error'))

      await expect(promotionCodeManager.assertValidForPriceAndCustomer(
        mockPromoCodeName,
        mockPrice,
        mockCurrency,
        mockCustomer,
        mockTaxAddress,
      )).rejects.toThrow(Error);
    })

    it('rejects previewUpcoming only redeem once error', async () => {
      jest.spyOn(invoiceManager, 'previewUpcoming')
        .mockRejectedValue(new Stripe.errors.StripeInvalidRequestError({
          type: 'invalid_request_error',
          message:
            'This promotion code cannot be redeemed because the associated customer has prior transactions.',
        }));

      await expect(promotionCodeManager.assertValidForPriceAndCustomer(
        mockPromoCodeName,
        mockPrice,
        mockCurrency,
        mockCustomer,
        mockTaxAddress,
      )).rejects.toThrow(CouponErrorCannotRedeem);
    })

    it('rejects on unhandled previewUpcoming error', async () => {
      jest.spyOn(invoiceManager, 'previewUpcoming')
        .mockRejectedValue(new Error('Unhandled error'));

      await expect(promotionCodeManager.assertValidForPriceAndCustomer(
        mockPromoCodeName,
        mockPrice,
        mockCurrency,
        mockCustomer,
        mockTaxAddress,
      )).rejects.toThrow(Error);
    })
  })
});
