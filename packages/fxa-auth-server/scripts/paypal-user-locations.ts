/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { setupProcesingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { StripeHelper } from '../lib/payments/stripe';

const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');

type PayPalUserLocationResult = {
  uid: string;
  state: string;
  country: string;
  count: number;
};

// GCP credentials are stored in the GOOGLE_APPLICATION_CREDENTIALS env var
// See https://cloud.google.com/docs/authentication/getting-started
const GCP_PROJECT_NAME = 'bdanforth-fxa-dev';
const GCP_DATASET_ID = 'fxa_auth_prod';
const GCP_TABLE_NAME = 'fxa_4218_uid_state_country_count';
const DATASET_LOCATION = 'US';
const PAYPAL_UIDS_FILENAME = 'secret-paypal-users-fxa-4218.tsv';
const BATCH_SIZE = 50; // How many users to look for in BigQuery at one time
// The countries we need data for
const COUNTRIES_LONG_NAME = ['United States', 'Canada']; // Long name is used in BigQuery derived table
const COUNTRIES_SHORT_NAME = ['US', 'CA']; // Short name is used in Stripe customer billing address

export class PayPalUserLocations {
  private bigquery: any;
  // @ts-ignore We initialize stripeHelper in the async `init` method
  private stripeHelper: StripeHelper;

  constructor() {
    this.bigquery = new BigQuery();
  }

  /**
   * Converts a CSV at `path` to an array of strings.
   */
  parseInput(path: string): string[] {
    const input = fs.readFileSync(path, { encoding: 'utf8' });
    const results = [];
    const uids = input.trim().split(/\n/);
    for (const uid of uids) {
      if (uid.startsWith('hex')) {
        continue; // Ignore the first line
      }
      // The query is case-sensitive, and uids in the table are lowercase hex strings
      results.push(uid.replace(/\r/, '').toLowerCase());
    }
    return results;
  }

  // countryCode is an ISO 3166-2 code e.g. 'US' or 'CA'.
  isCountryNeeded(countryCode: string) {
    return COUNTRIES_SHORT_NAME.includes(countryCode);
  }

  /**
   * For PayPal customers, their payment method country is stored in the
   * customer's billing address. This will return an ISO 3166-2 country
   *  code. 'US' and 'CA' are the only ones we're interested in.
   */
  async getPayPalCustomerCountry(uid: string): Promise<string | null> {
    // 1. Get the Stripe customer object from Firestore else Stripe
    const customer = await this.stripeHelper.fetchCustomer(uid);
    if (!customer) {
      console.log(`Stripe customer for ${uid} not found.`);
      return null;
    }
    // 2. Get the Stripe customer billing address; should be `address.country`
    // Note: We already know this user is or was a PayPal subscriber, so we
    // don't have to check.
    const { address } = customer;
    const country = address?.country;
    if (!country) {
      console.log(`No country on address for customer ${customer.id}.`);
      return null;
    }
    return country;
  }

  sleep(delayMs: number) {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  /**
   * Some uids may have multipe regions/countries; use the location that is most frequent.
   * TODO: Deprioritize Virginia, US location due to FXA-4280 (if lots of locations are Virginia)
   */
  async findBestLocationForUsers(
    uids: string[],
    results: PayPalUserLocationResult[]
  ): Promise<PayPalUserLocationResult[]> {
    const dedupedResults = [];
    for (const uid of uids) {
      let bestLocation;
      // Avoid hitting Stripe 100 rps rate limit in prod by artificially slowing down requests.
      // After the first runthrough of the script, we should have backfilled everyone in
      // Firestore, and this delay can be removed.
      await this.sleep(200);
      const country = await this.getPayPalCustomerCountry(uid);
      if (!country) {
        bestLocation = { uid, state: 'Unknown', country: 'Unknown', count: 1 };
        dedupedResults.push(bestLocation);
        continue;
      }
      if (!this.isCountryNeeded(country)) {
        continue;
      }
      let locations = results.filter((result) => result.uid === uid);
      if (locations.length === 0) {
        bestLocation = { uid, state: 'Unknown', country, count: 1 };
        dedupedResults.push(bestLocation);
        continue;
      }
      // We have one or more locations for this user; get mode location.
      locations.sort((a, b) => b.count - a.count);
      // Transform country long name into country short name for direct
      // string comparison
      locations = locations.map((location) => {
        switch (location.country) {
          case 'United States':
            return {
              ...location,
              country: 'US',
            };
            break;
          case 'Canada':
            return {
              ...location,
              country: 'CA',
            };
            break;
          default:
            // We don't care about any other countries.
            return location;
            break;
        }
      });
      const modeLocation = locations[0];
      // Prioritize country from Stripe customer
      if (modeLocation.country === country) {
        // Use this location
        bestLocation = modeLocation;
      } else if (locations.some((location) => location.country === country)) {
        // Use the next most frequent location with a matching country
        bestLocation = locations.find(
          (location) => location.country === country
        );
      } else {
        // No location results countries match the Stripe customer country
        bestLocation = { uid, state: 'Unknown', country, count: 1 };
      }
      dedupedResults.push(bestLocation);
    }
    // @ts-ignore dedupedResults can be []
    return dedupedResults;
  }

  async getLocationForUids(
    uids: string[]
  ): Promise<PayPalUserLocationResult[]> {
    const uidsStr = uids.map((uid) => `"${uid}"`).join(',');
    const countriesStr = COUNTRIES_LONG_NAME.map(
      (country) => `"${country}"`
    ).join(',');
    const query = `SELECT uid, state, country, count
      FROM \`${GCP_PROJECT_NAME}.${GCP_DATASET_ID}.${GCP_TABLE_NAME}\`
      WHERE uid IN (${uidsStr})
      AND country IN (${countriesStr})
      ORDER BY uid
      LIMIT 1000`;
    const options = {
      query,
      location: DATASET_LOCATION,
    };
    const [job] = await this.bigquery.createQueryJob(options);
    console.log(`Job ${job.id} started.`);
    const [rows] = await job.getQueryResults();
    return rows;
  }

  async init() {
    const { stripeHelper } = await setupProcesingTaskObjects(
      'paypal-user-locations'
    );
    this.stripeHelper = stripeHelper;
    const path = `${__dirname}/../config/${PAYPAL_UIDS_FILENAME}`;
    const paypalUids = this.parseInput(path);
    const processedUids = [];
    let startIndex = 0;
    let stopIndex = startIndex + BATCH_SIZE;
    const results = [];
    while (processedUids.length !== paypalUids.length) {
      const uidsToProcess = paypalUids.slice(startIndex, stopIndex);
      const resultsWithDupes = await this.getLocationForUids(uidsToProcess);
      const dedupedResults = await this.findBestLocationForUsers(
        uidsToProcess,
        resultsWithDupes
      );
      results.push(...dedupedResults);
      startIndex += BATCH_SIZE;
      stopIndex += BATCH_SIZE;
      processedUids.push(...uidsToProcess);
    }
    // Sort alphabetically by country, then state.
    results.sort((a, b) => {
      const countryA = a.country.toUpperCase();
      const countryB = b.country.toUpperCase();
      const stateA = a.state.toUpperCase();
      const stateB = b.state.toUpperCase();
      if (countryA < countryB) {
        return -1;
      }
      if (countryA > countryB) {
        return 1;
      }
      if (stateA < stateB) {
        return -1;
      }
      if (stateA > stateB) {
        return 1;
      }
      return 0;
    });
    results.forEach((result) =>
      console.log(result.uid, result.country, result.state)
    );
  }
}

if (require.main === module) {
  const paypalUserLocations = new PayPalUserLocations();
  paypalUserLocations
    .init()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    // @ts-ignore
    .then((result) => process.exit(result));
}
