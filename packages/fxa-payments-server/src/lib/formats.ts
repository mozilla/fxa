import { FluentNumber, FluentDateTime } from '@fluent/bundle';

/**
 * The following function are for Currency localization
 */

const baseCurrencyOptions = {
  style: 'currency',
  currencyDisplay: 'symbol',
};

/**
 * This method is used to provide Fluent with a localizable value that can be formatted per .ftl file based on localization requirements
 *
 * @param amountInCents
 * @param currency
 */
export function getLocalizedCurrency(
  amountInCents: number,
  currency: string
): FluentNumber {
  const decimal = amountInCents / 100;
  const options = { ...baseCurrencyOptions, currency };

  return new FluentNumber(decimal, options);
}

/**
 * This method is to get a default localized currency value for displaying in fallback strings in the event of a Fluent failure.
 *
 * @param amountInCents
 * @param currency
 */
export function getLocalizedCurrencyString(
  amountInCents: number,
  currency: string
): string {
  const decimal = amountInCents / 100;
  const options = { ...baseCurrencyOptions, currency };

  return new Intl.NumberFormat('en-US', options).format(decimal);
}

/**
 * The following function are for DateTime localization
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
};

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
  numericDate: boolean = false
): FluentDateTime {
  const milliseconds = unixSeconds * 1000;
  const options = numericDate ? numericDateOptions : defaultDateOptions;

  return new FluentDateTime(milliseconds, options);
}

/**
 * This method is to get a default localized datetime value for displaying in fallback strings in the event of a Fluent failure.
 *
 * @param unixSeconds
 * @param numericDate
 */
export function getLocalizedDateString(
  unixSeconds: number,
  numericDate: boolean = false
): string {
  const milliseconds = unixSeconds * 1000;
  var date = new Date(milliseconds);

  const options = numericDate ? numericDateOptions : defaultDateOptions;

  return new Intl.DateTimeFormat('en-US', options).format(date);
}
