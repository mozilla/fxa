import { FluentNumber, FluentDateTime } from '@fluent/bundle';
import { PlanInterval } from '../store/types';

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
  amountInCents: number | null,
  currency: string
): FluentNumber {
  const decimal = (amountInCents || 0) / 100;
  const options = { ...baseCurrencyOptions, currency };

  return new FluentNumber(decimal, options);
}

/**
 * This method is to get a default localized currency value for displaying in fallback strings in the event of a Fluent failure.
 * This returns a string that is formatted accorning to the 'en-US' locale standard to match the rest of our fallback library.
 *
 * @param amountInCents
 * @param currency
 */
export function getLocalizedCurrencyString(
  amountInCents: number | null,
  currency: string
): string {
  const decimal = (amountInCents || 0) / 100;
  const options = { ...baseCurrencyOptions, currency };

  return new Intl.NumberFormat('en-US', options).format(decimal);
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
 * This returns a string that is formatted accorning to the 'en-US' locale standard to match the rest of our fallback library.
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

/**
 * The following functions are for creating fallback text for Subscription Intervals
 */

/**
 * This is the base formatting to describe a plan's pricing:
 * Examples:
 *   '$2.00 daily'
 *   '$2.00 every 6 days'
 * @param amount
 * @param currency
 * @param interval
 * @param intervalCount
 */
export function formatPlanPricing(
  amount: number | null,
  currency: string,
  interval: PlanInterval,
  intervalCount: number
): string {
  const formattedAmount = getLocalizedCurrencyString(amount, currency);
  switch (interval) {
    case 'day':
      if (intervalCount === 1) return `${formattedAmount} daily`;
      return `${formattedAmount} every ${intervalCount} days`;
    case 'week':
      if (intervalCount === 1) return `${formattedAmount} weekly`;
      return `${formattedAmount} every ${intervalCount} weeks`;
    case 'month':
      if (intervalCount === 1) return `${formattedAmount} monthly`;
      return `${formattedAmount} every ${intervalCount} months`;
    case 'year':
      if (intervalCount === 1) return `${formattedAmount} yearly`;
      return `${formattedAmount} every ${intervalCount} years`;
  }
}

export function getDefaultPaymentConfirmText(
  amount: number | null,
  currency: string,
  interval: PlanInterval,
  intervalCount: number
): string {
  const planPricing = formatPlanPricing(
    amount,
    currency,
    interval,
    intervalCount
  );

  return `I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>${planPricing}</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.`;
}
