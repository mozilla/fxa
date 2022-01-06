/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Logger } from 'mozlog';

// Region codes from: https://en.wikipedia.org/wiki/ISO_3166-2:US and https://en.wikipedia.org/wiki/ISO_3166-2:CA
import STATES_LONG_NAME_TO_SHORT_NAME_MAP from './states-long-name-to-short-name-map.json';
import { StripeHelper } from './stripe';

type PayPalUserLocationResult = {
  uid: string;
  state: string;
  country: string;
  count: number;
};

const stateNames = STATES_LONG_NAME_TO_SHORT_NAME_MAP as {
  [key: string]: { [key: string]: string };
};

// The countries we need region data for
export const COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP = {
  // The long name is used in the BigQuery metrics logs; the short name is used
  // in the Stripe customer billing address
  'United States': 'US',
  Canada: 'CA',
} as { [key: string]: string };

export class CustomerLocations {
  private log: Logger;
  private stripeHelper: StripeHelper;

  constructor(log: Logger, stripeHelper: StripeHelper) {
    this.log = log;
    this.stripeHelper = stripeHelper;
  }

  // countryCode is an ISO 3166-2 code e.g. 'US' or 'CA'.
  isCountryNeeded(countryCode: string) {
    return Object.values(COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP).includes(
      countryCode
    );
  }

  /**
   * For PayPal customers, their payment method country is stored in the
   * customer's billing address. This will return an ISO 3166-2 country
   * code. 'US' and 'CA' are the only ones we're interested in.
   *
   * This method assumes the uid passed in is for a known current or past
   * PayPal user. See
   * https://mozilla-hub.atlassian.net/browse/FXA-4224?focusedCommentId=493802.
   */
  async getPayPalCustomerCountry(uid: string): Promise<string | null> {
    // 1. Get the Stripe customer object from Firestore else Stripe
    const customer = await this.stripeHelper.fetchCustomer(uid);
    if (!customer) {
      this.log.debug('customerLocations.getPayPalCustomerCountry', {
        message: 'No customer found in Stripe for the user.',
        uid,
      });
      return null;
    }
    // 2. Get the Stripe customer billing address; should be `address.country`
    const { address } = customer;
    const country = address?.country;
    if (!country) {
      this.log.debug('customerLocations.getPayPalCustomerCountry', {
        message: 'No country found on customer address.',
        customerId: customer.id,
      });
      return null;
    }
    return country;
  }

  /**
   * Transform country long name into country short name.
   */
  mapLongToShortCountryName(country: string): string {
    if (Object.keys(COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP).includes(country)) {
      return COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP[country];
    }
    // We don't care about any other countries.
    this.log.debug('customerLocations.mapLongToShortCountryName', {
      message: 'Country not found in long name to short name map.',
      country,
    });
    return country;
  }

  /**
   * Transform state long name into state short name.
   */
  mapLongToShortStateName(country: string, state: string): string {
    if (
      Object.keys(stateNames).includes(country) &&
      Object.keys(stateNames[country]).includes(state)
    ) {
      return stateNames[country][state];
    }
    // We don't care about any other country/state combos.
    this.log.debug('customerLocations.mapLongToShortStateName', {
      message: 'State not found in long name to short name map.',
      state,
    });
    return state;
  }

  /**
   * Finds the best `country` and `state` location for the user based on a provided
   * list of inferred locations and the country in their existing Stripe customer
   * record.
   *  - If no country is found in Stripe, `state` and `country` are both "unknown".
   *  - If there is a country mismatch, prefer the country in Stripe and select the most
   *    frequent location with a matching country.
   *  - If there is no matching country, `state` is "unknown".
   */
  async getBestLocationForPayPalUser(
    uid: string,
    results: PayPalUserLocationResult[]
  ): Promise<PayPalUserLocationResult | null> {
    let bestLocation = {
      uid,
      state: 'unknown',
      country: 'unknown',
      count: 1,
    };
    const country = await this.getPayPalCustomerCountry(uid);
    if (!country) {
      this.log.debug('customerLocations.getBestLocationForPayPalUser', {
        message: 'No country found in Stripe for the user.',
        uid,
      });
      return bestLocation;
    }
    if (!this.isCountryNeeded(country)) {
      this.log.debug('customerLocations.getBestLocationForPayPalUser', {
        message: `Region information for user's country is not needed.`,
        uid,
        country,
      });
      return null;
    }
    let locations: PayPalUserLocationResult[] = results.filter(
      (result) => result.uid === uid
    );
    if (locations.length === 0) {
      return { ...bestLocation, country };
    }
    // We have one or more locations for this user; get mode location.
    locations.sort((a, b) => b.count - a.count);
    locations = locations.map((location) => ({
      ...location,
      country: this.mapLongToShortCountryName(location.country),
      state: this.mapLongToShortStateName(location.country, location.state),
    }));
    const modeLocation = locations[0];
    // Prioritize country from Stripe customer
    if (modeLocation.country === country) {
      bestLocation = { ...modeLocation, count: 1 };
    } else if (locations.some((location) => location.country === country)) {
      bestLocation = {
        ...locations.find((location) => location.country === country)!,
        count: 1,
      };
    } else {
      this.log.debug('customerLocations.getBestLocationForPayPalUser', {
        message:
          'No location results countries match the Stripe customer country.',
        uid,
        country,
      });
      bestLocation = { ...bestLocation, country };
    }
    return bestLocation;
  }
}
