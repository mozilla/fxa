/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { FluentDateTime, FluentNumber } from '@fluent/bundle';

/**
 * The following function are for Currency localization
 */
const baseCurrencyOptions = {
  style: 'currency',
  currencyDisplay: 'symbol',
} as any; // FIXME: satisfies should be used, but is included in builds resulting in build errors

/**
 * This method is used to provide Fluent with a localizable value that can be formatted per .ftl file based on localization requirements
 *
 * @param amountInCents
 * @param currency
 */
export function getLocalizedCurrency(
  amountInCents: number | null,
  currency: string
): FluentNumber {
  const decimal = (amountInCents || 0) / 100;
  const options = { ...baseCurrencyOptions, currency };

  return new FluentNumber(decimal, options);
}

/**
 * This method is to get a default localized currency value for displaying in fallback strings in the event of a Fluent failure.
 * This returns a string that is formatted accorning to the 'en' locale standard to match the rest of our fallback library.
 *
 * @param amountInCents
 * @param currency
 */
export function getLocalizedCurrencyString(
  amountInCents: number | null,
  currency: string,
  locale = 'en'
): string {
  const decimal = (amountInCents || 0) / 100;
  const options = { ...baseCurrencyOptions, currency };

  return new Intl.NumberFormat(locale, options).format(decimal);
}

/**
 * The following functions are for DateTime localization
 */

/**
 * Using defaultDateOptions options will result in dates with the following properties:
 *   Month - full name
 *   Day - two digits
 *   Year - full year
 *
 * The order of the values will be determined by the locale
 */
const defaultDateOptions = {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
} as any;

/**
 * Using numericDateOptions will result in dates with the following properties:
 *   Month - two digits
 *   Day - two digits
 *   Year - full year
 *
 * The date will be formatted with '/' between each value in the order dicated by the locale
 */
const numericDateOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

/**
 * This method is used to provide Fluent with a localizable value that can be formatted per .ftl file based on localization requirements
 *
 * @param unixSeconds
 * @param numericDate
 */
export function getLocalizedDate(
  unixSeconds: number,
  numericDate = false
): FluentDateTime {
  const milliseconds = unixSeconds * 1000;
  const options = numericDate ? numericDateOptions : defaultDateOptions;

  return new FluentDateTime(milliseconds, options);
}

/**
 * This method is to get a default localized datetime value for displaying in fallback strings in the event of a Fluent failure.
 * This returns a string that is formatted accorning to the 'en' locale standard to match the rest of our fallback library.
 *
 * @param unixSeconds
 * @param numericDate
 */
export function getLocalizedDateString(
  unixSeconds: number,
  numericDate = false
): string {
  const milliseconds = unixSeconds * 1000;
  const date = new Date(milliseconds);

  const options = numericDate ? numericDateOptions : defaultDateOptions;

  return new Intl.DateTimeFormat('en', options).format(date);
}
