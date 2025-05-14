/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripePriceFactory } from "@fxa/payments/stripe"
import { StripePriceCurrencyOptionFactory } from "libs/payments/stripe/src/lib/factories/price.factory"
import { determinePriceUnitAmount } from "./determinePriceUnitAmount"

describe('determinePriceUnitAmount', () => {
  describe('When passed a StripePrice', () => {
    const mockPriceWithUnitAmount = StripePriceFactory({
      unit_amount: 1000,
      unit_amount_decimal: '1000.00'
    })
    const mockPriceWithUnitAmountDecimal = StripePriceFactory({
      unit_amount_decimal: '1000.31',
      unit_amount: null
    })

    it('returns unit_amount when unit_amount is present', () => {
      expect(determinePriceUnitAmount(mockPriceWithUnitAmount)).toEqual(1000);
    })

    it('returns unit_amount_decimal when unit_amount is not present', () => {
      expect(determinePriceUnitAmount(mockPriceWithUnitAmountDecimal)).toEqual(1000);
    })
  })

  describe('When passed a Stripe.Price.CurrencyOption', () => {
    const mockCurrencyOptionWithUnitAmount = StripePriceCurrencyOptionFactory({
      unit_amount: 1000,
      unit_amount_decimal: '1000.00'
    })
    const mockCurrencyOptionWithUnitAmountDecimal = StripePriceCurrencyOptionFactory({
      unit_amount: null,
      unit_amount_decimal: '1000.31'
    })

    it('returns unit_amount when unit_amount is present', () => {
      expect(determinePriceUnitAmount(mockCurrencyOptionWithUnitAmount)).toEqual(1000);
    })

    it('returns unit_amount_decimal when unit_amount is not present', () => {
      expect(determinePriceUnitAmount(mockCurrencyOptionWithUnitAmountDecimal)).toEqual(1000);
    })
  })
})
