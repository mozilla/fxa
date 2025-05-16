/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  StripeClient,
  StripeResponseFactory,
  StripePriceFactory,
  StripePriceRecurringFactory,
  MockStripeConfigProvider,
} from '@fxa/payments/stripe';
import { PlanIntervalMultiplePlansError, PriceForCurrencyNotFoundError } from './error';
import { PriceManager } from './price.manager';
import { SubplatInterval } from './types';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { StripePriceCurrencyOptionFactory } from 'libs/payments/stripe/src/lib/factories/price.factory';
import { faker } from '@faker-js/faker/.';

describe('PriceManager', () => {
  let priceManager: PriceManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStripeConfigProvider,
        StripeClient,
        PriceManager,
        MockStatsDProvider,
      ],
    }).compile();

    priceManager = module.get(PriceManager);
    stripeClient = module.get(StripeClient);
  });

  describe('retrieve', () => {
    it('returns price', async () => {
      const mockPrice = StripeResponseFactory(StripePriceFactory());

      jest.spyOn(stripeClient, 'pricesRetrieve').mockResolvedValue(mockPrice);

      const result = await priceManager.retrieve(mockPrice.id);
      expect(result).toEqual(mockPrice);
    });
  });

  describe('retrieveByInterval', () => {
    it('returns price that matches interval', async () => {
      const mockPrice = StripeResponseFactory(
        StripePriceFactory({
          recurring: StripePriceRecurringFactory({
            interval: 'month',
          }),
        })
      );
      const subplatInterval = SubplatInterval.Monthly;

      jest.spyOn(priceManager, 'retrieve').mockResolvedValue(mockPrice);

      const result = await priceManager.retrieveByInterval(
        [mockPrice.id],
        subplatInterval
      );
      expect(result).toEqual(mockPrice);
    });

    it('throw error if interval returns multiple plans', async () => {
      const mockPrice1 = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
        }),
      });
      const mockPrice2 = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
        }),
      });
      const subplatInterval = SubplatInterval.Monthly;

      jest
        .spyOn(priceManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockPrice1));
      jest
        .spyOn(priceManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockPrice2));

      await expect(
        priceManager.retrieveByInterval(
          [mockPrice1.id, mockPrice2.id],
          subplatInterval
        )
      ).rejects.toBeInstanceOf(PlanIntervalMultiplePlansError);
    });
  });

  describe('retrievePricingForCurrency', () => {
    it('returns price data if currency matches default currency of price', async () => {
      const mockPrice = StripeResponseFactory(
        StripePriceFactory()
      );

      jest.spyOn(priceManager, 'retrieve').mockResolvedValue(mockPrice);

      const result = await priceManager.retrievePricingForCurrency(mockPrice.id, mockPrice.currency)
      expect(result).toEqual({
        price: mockPrice,
        unitAmountForCurrency: mockPrice.unit_amount,
        currencyOptionForCurrency: mockPrice.currency_options[mockPrice.currency],
      })
    })

    it('returns price currency options data if price does not match default currency of price', async () => {
      const defaultCurrency = 'usd';
      const currencyOption = 'eur';
      const mockPrice = StripeResponseFactory(
        StripePriceFactory({
          currency_options: {
            [defaultCurrency]: StripePriceCurrencyOptionFactory({
              unit_amount: faker.number.int({ max: 1000 }),
              unit_amount_decimal: faker.commerce.price({ min: 1000 }),
            }),
            [currencyOption]: StripePriceCurrencyOptionFactory({
              unit_amount: faker.number.int({ max: 1000 }),
              unit_amount_decimal: faker.commerce.price({ min: 1000 }),
            }),
          },
        })
      );

      jest.spyOn(priceManager, 'retrieve').mockResolvedValue(mockPrice);

      const result = await priceManager.retrievePricingForCurrency(mockPrice.id, currencyOption)
      expect(result).toEqual({
        price: mockPrice,
        unitAmountForCurrency: mockPrice.currency_options[currencyOption].unit_amount,
        currencyOptionForCurrency: mockPrice.currency_options[currencyOption],
      })
    })

    it('throws an error if price does not have provided currency', async () => {
      const mockPrice = StripeResponseFactory(
        StripePriceFactory()
      );

      jest.spyOn(priceManager, 'retrieve').mockResolvedValue(mockPrice);

      await expect(priceManager.retrievePricingForCurrency(mockPrice.id, 'invalid')).rejects.toBeInstanceOf(PriceForCurrencyNotFoundError)
    })
  })
});
