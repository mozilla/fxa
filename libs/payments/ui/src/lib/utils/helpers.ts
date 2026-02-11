/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getLocalizedCurrencyString } from '@fxa/shared/l10n';
import { StripePrice } from '@fxa/payments/stripe';

export type PriceIntervalType = NonNullable<
  StripePrice['recurring']
>['interval']; // TODO - Replace once FXA-7507 lands

/**
 * The following functions are for creating fallback text for Subscription Intervals
 */

export function formatPriceAmount(
  amount: number | null,
  currency: string,
  showTax: boolean,
  tax: number | null,
  locale: string
) {
  return showTax
    ? `${getLocalizedCurrencyString(
        amount,
        currency,
        locale
      )} + ${getLocalizedCurrencyString(tax, currency, locale)} tax`
    : getLocalizedCurrencyString(amount, currency, locale);
}

/**
 * This is the base formatting to describe a plan's pricing:
 * Examples:
 *   '$2.00 daily'
 *   '$2.00 every 6 days'
 *   '$2.00 + $0.45 tax daily'
 *   '$2.00 + $0.45 tax every 6 days'
 * @param amount
 * @param currency
 * @param interval
 * @param showTax
 * @param tax
 */
export function formatPlanPricing(
  amount: number | null,
  currency: string,
  interval: string,
  showTax = false,
  tax = 0,
  locale: string
): string {
  const formattedAmount = formatPriceAmount(amount, currency, showTax, tax, locale);
  switch (interval) {
    case 'daily':
    case 'day':
      return `${formattedAmount} daily`;
    case 'weekly':
      return `${formattedAmount} weekly`;
    case 'monthly':
      return `${formattedAmount} monthly`;
    case 'halfyearly':
      return `${formattedAmount} every 6 months`;
    case 'yearly':
      return `${formattedAmount} yearly`;
    default:
      return `${formattedAmount} monthly`;
  }
}

/**
 * Helper function to format the plan interval
 * Examples:
 *   'daily' to 'Daily'
 *   'monthly' to 'Monthly'
 *   'halfyearly' to '6-month'
 *   'yearly' or 'Yearly'
 * @param interval
 */
export function formatPlanInterval(interval: string): string {
  return interval === 'halfyearly'
    ? '6-month'
    : interval.replace(/\w/, (firstLetter) => firstLetter.toUpperCase());
}
