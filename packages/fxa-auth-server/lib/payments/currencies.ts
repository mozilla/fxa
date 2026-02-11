/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ConfigType } from '../../config';

export class CurrencyHelper {
  currencyToCountryMap: Map<string, string[]>;
  payPalEnabled: boolean;

  constructor(config: ConfigType) {
    // Is payPalEnabled?
    this.payPalEnabled = config.subscriptions?.paypalNvpSigCredentials?.enabled;
    // Validate currencyMap
    const currencyMap = new Map(Object.entries(config.currenciesToCountries));
    const allListedCountries: string[] = [];
    for (const [currency, countries] of currencyMap) {
      // Is currency acceptable
      if (!CurrencyHelper.validCurrencyCodes.includes(currency)) {
        throw new Error(`Currency code ${currency} is invalid.`);
      }
      if (
        this.payPalEnabled &&
        !CurrencyHelper.supportedPayPalCurrencies.includes(currency)
      ) {
        throw new Error(`Currency code ${currency} is invalid.`);
      }
      // Are countries acceptable
      for (const country of countries) {
        if (!CurrencyHelper.validCountryCodes.includes(country)) {
          throw new Error(`Country code ${country} is invalid.`);
        }
        if (allListedCountries.includes(country)) {
          throw new Error(`Country code ${country} is duplicated.`);
        } else {
          allListedCountries.push(country);
        }
      }
    }
    this.currencyToCountryMap = currencyMap;
  }

  /*
   * Verify that a given source country and plan currency are compatible given configured
   * currency to country map.
   */
  isCurrencyCompatibleWithCountry(
    currency: string | null | undefined,
    country: string | null | undefined
  ): boolean {
    if (!currency || !country) {
      return false;
    }
    const currencyCountryMap = this.currencyToCountryMap;
    const countryList = currencyCountryMap.get(currency.toUpperCase());
    if (countryList && countryList.includes(country.toUpperCase())) {
      return true;
    }
    return false;
  }

  /*
   * Convert amount in cents to paypal AMT string.
   * We use Stripe to manage everything and plans are recorded in an AmountInCents
   * But PayPal AMT field requires a string, as documented here: https://developer.paypal.com/docs/nvp-soap-api/do-reference-transaction-nvp/#payment-details-fields
   */
  getPayPalAmountStringFromAmountInCents(amountInCents: number): string {
    // Must be less than 9 digits
    if (amountInCents > 999999999) {
      throw new Error('Amount must be less than 9 digits.');
    }
    // Left pad with zeros if necessary, so we always get a minimum of 0.01.
    const amountAsString = String(amountInCents).padStart(3, '0');
    const dollars = amountAsString.slice(0, -2);
    const cents = amountAsString.slice(-2);
    return `${dollars}.${cents}`;
  }

  /*
   * PayPal has specific restrictions on how currencies are handled.
   * The general documentation for the AMT field is here: https://developer.paypal.com/docs/nvp-soap-api/do-reference-transaction-nvp/#payment-details-fields
   * The documentation for currency codes and the various restrictions is here: https://developer.paypal.com/docs/nvp-soap-api/currency-codes/
   *
   * Restrictions include
   * - whether decimal point is or isn't allowed.
   * - whether there's a transaction limit for the country
   *
   * As a result, we hard code the supported PayPal currencies and additional currencies
   * can be added here as necessary, once the PayPal docs have been reviewed to ensure we've
   * handled any restrictions.
   *
   */
  static supportedPayPalCurrencies = ['USD', 'EUR', 'CHF', 'CZK', 'DKK', 'PLN'];

  /*
   * List of valid country codes taken from https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
   * Stripe docs: https://stripe.com/docs/radar/rules/reference#country-attributes
   */
  static validCountryCodes = [
    'AD',
    'AE',
    'AF',
    'AG',
    'AI',
    'AL',
    'AM',
    'AO',
    'AQ',
    'AR',
    'AS',
    'AT',
    'AU',
    'AW',
    'AX',
    'AZ',
    'BA',
    'BB',
    'BD',
    'BE',
    'BF',
    'BG',
    'BH',
    'BI',
    'BJ',
    'BL',
    'BM',
    'BN',
    'BO',
    'BQ',
    'BR',
    'BS',
    'BT',
    'BV',
    'BW',
    'BY',
    'BZ',
    'CA',
    'CC',
    'CD',
    'CF',
    'CG',
    'CH',
    'CI',
    'CK',
    'CL',
    'CM',
    'CN',
    'CO',
    'CR',
    'CU',
    'CV',
    'CW',
    'CX',
    'CY',
    'CZ',
    'DE',
    'DJ',
    'DK',
    'DM',
    'DO',
    'DZ',
    'EC',
    'EE',
    'EG',
    'EH',
    'ER',
    'ES',
    'ET',
    'FI',
    'FJ',
    'FK',
    'FM',
    'FO',
    'FR',
    'GA',
    'GB',
    'GD',
    'GE',
    'GF',
    'GG',
    'GH',
    'GI',
    'GL',
    'GM',
    'GN',
    'GP',
    'GQ',
    'GR',
    'GS',
    'GT',
    'GU',
    'GW',
    'GY',
    'HK',
    'HM',
    'HN',
    'HR',
    'HT',
    'HU',
    'ID',
    'IE',
    'IL',
    'IM',
    'IN',
    'IO',
    'IQ',
    'IR',
    'IS',
    'IT',
    'JE',
    'JM',
    'JO',
    'JP',
    'KE',
    'KG',
    'KH',
    'KI',
    'KM',
    'KN',
    'KP',
    'KR',
    'KW',
    'KY',
    'KZ',
    'LA',
    'LB',
    'LC',
    'LI',
    'LK',
    'LR',
    'LS',
    'LT',
    'LU',
    'LV',
    'LY',
    'MA',
    'MC',
    'MD',
    'ME',
    'MF',
    'MG',
    'MH',
    'MK',
    'ML',
    'MM',
    'MN',
    'MO',
    'MP',
    'MQ',
    'MR',
    'MS',
    'MT',
    'MU',
    'MV',
    'MW',
    'MX',
    'MY',
    'MZ',
    'NA',
    'NC',
    'NE',
    'NF',
    'NG',
    'NI',
    'NL',
    'NO',
    'NP',
    'NR',
    'NU',
    'NZ',
    'OM',
    'PA',
    'PE',
    'PF',
    'PG',
    'PH',
    'PK',
    'PL',
    'PM',
    'PN',
    'PR',
    'PS',
    'PT',
    'PW',
    'PY',
    'QA',
    'RE',
    'RO',
    'RS',
    'RU',
    'RW',
    'SA',
    'SB',
    'SC',
    'SD',
    'SE',
    'SG',
    'SH',
    'SI',
    'SJ',
    'SK',
    'SL',
    'SM',
    'SN',
    'SO',
    'SR',
    'SS',
    'ST',
    'SV',
    'SX',
    'SY',
    'SZ',
    'TC',
    'TD',
    'TF',
    'TG',
    'TH',
    'TJ',
    'TK',
    'TL',
    'TM',
    'TN',
    'TO',
    'TR',
    'TT',
    'TV',
    'TW',
    'TZ',
    'UA',
    'UG',
    'UM',
    'US',
    'UY',
    'UZ',
    'VA',
    'VC',
    'VE',
    'VG',
    'VI',
    'VN',
    'VU',
    'WF',
    'WS',
    'YE',
    'YT',
    'ZA',
    'ZM',
    'ZW',
  ];

  /*
   * List of valid currency codes taken from https://stripe.com/docs/currencies
   */
  static validCurrencyCodes = [
    'USD',
    'AED',
    'AFN',
    'ALL',
    'AMD',
    'ANG',
    'AOA',
    'ARS',
    'AUD',
    'AWG',
    'AZN',
    'BAM',
    'BBD',
    'BDT',
    'BGN',
    'BIF',
    'BMD',
    'BND',
    'BOB',
    'BRL',
    'BSD',
    'BWP',
    'BZD',
    'CAD',
    'CDF',
    'CHF',
    'CLP',
    'CNY',
    'COP',
    'CRC',
    'CVE',
    'CZK',
    'DJF',
    'DKK',
    'DOP',
    'DZD',
    'EGP',
    'ETB',
    'EUR',
    'FJD',
    'FKP',
    'GBP',
    'GEL',
    'GIP',
    'GMD',
    'GNF',
    'GTQ',
    'GYD',
    'HKD',
    'HNL',
    'HRK',
    'HTG',
    'HUF',
    'IDR',
    'ILS',
    'INR',
    'ISK',
    'JMD',
    'JPY',
    'KES',
    'KGS',
    'KHR',
    'KMF',
    'KRW',
    'KYD',
    'KZT',
    'LAK',
    'LBP',
    'LKR',
    'LRD',
    'LSL',
    'MAD',
    'MDL',
    'MGA',
    'MKD',
    'MMK',
    'MNT',
    'MOP',
    'MRO',
    'MUR',
    'MVR',
    'MWK',
    'MXN',
    'MYR',
    'MZN',
    'NAD',
    'NGN',
    'NIO',
    'NOK',
    'NPR',
    'NZD',
    'PAB',
    'PEN',
    'PGK',
    'PHP',
    'PKR',
    'PLN',
    'PYG',
    'QAR',
    'RON',
    'RUB',
    'RWF',
    'SAR',
    'SBD',
    'SCR',
    'SEK',
    'SGD',
    'SHP',
    'SLL',
    'SOS',
    'SRD',
    'STD',
    'SZL',
    'THB',
    'TJS',
    'TOP',
    'TRY',
    'TTD',
    'TWD',
    'TZS',
    'UAH',
    'UGX',
    'UYU',
    'UZS',
    'VND',
    'VUV',
    'WST',
    'XAF',
    'XCD',
    'XOF',
    'XPF',
    'YER',
    'ZAR',
    'ZMW',
  ];
}
