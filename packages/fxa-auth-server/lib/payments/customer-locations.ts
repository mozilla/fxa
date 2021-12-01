/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BigQuery } from '@google-cloud/bigquery';
import { PayPalBillingAgreements } from 'fxa-shared/db/models/auth';
import { uuidTransformer } from 'fxa-shared/db/transformers';
import { Logger } from 'mozlog';
import Stripe from 'stripe';
import { StripeHelper, COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP } from './stripe';
// Region codes from: https://en.wikipedia.org/wiki/ISO_3166-2:US and https://en.wikipedia.org/wiki/ISO_3166-2:CA with country prefixes removed
import STATES_LONG_NAME_TO_SHORT_NAME_MAP from './states-long-name-to-short-name-map.json';

type PayPalUserLocationResult = {
  uid: string;
  state?: string;
  country?: string;
  count: number;
};

const stateNames = STATES_LONG_NAME_TO_SHORT_NAME_MAP as {
  [key: string]: { [key: string]: string };
};

// GCP credentials are stored in the GOOGLE_APPLICATION_CREDENTIALS env var
// See https://cloud.google.com/docs/authentication/getting-started
const GCP_PROJECT_NAME =
  process.env.FXA_TAX_REPORTING_GCP_PROJECT_NAME || 'bdanforth-fxa-dev';
const GCP_DATASET_ID =
  process.env.FXA_TAX_REPORTING_GCP_DATASET_ID || 'fxa_auth_stage';
const GCP_TABLE_NAME =
  process.env.FXA_TAX_REPORTING_GCP_TABLE_NAME ||
  'fxa_4218_uid_state_country_count_01042022';
const DATASET_LOCATION = 'US';

export class CustomerLocations {
  private bigquery: any;
  private log: Logger;
  private countriesStr: string;
  private stripeHelper: StripeHelper;

  constructor({
    log,
    stripeHelper,
  }: {
    log: Logger;
    stripeHelper: StripeHelper;
  }) {
    this.bigquery = new BigQuery();
    this.log = log;
    this.stripeHelper = stripeHelper;
    this.countriesStr = Object.keys(COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP)
      .map((country) => `"${country}"`)
      .join(',');
  }

  /**
   * Returns a list of inferred locations from our metrics logs
   * for a given uid.
   */
  async getLocationForUid(uid: string): Promise<PayPalUserLocationResult[]> {
    const query = `SELECT uid, state, country, count
      FROM \`${GCP_PROJECT_NAME}.${GCP_DATASET_ID}.${GCP_TABLE_NAME}\`
      WHERE uid = \"${uid}\"
      AND country IN (${this.countriesStr})
      `;
    const options = {
      query,
      location: DATASET_LOCATION,
    };
    const [job] = await this.bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    return rows;
  }

  /**
   * Transform country long name into country short name.
   */
  mapLongToShortCountryName(country: string): string {
    if (Object.keys(COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP).includes(country)) {
      return COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP[country];
    }
    // We don't care about any other countries.
    this.log.info('customerLocations.mapLongToShortCountryName', {
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
    this.log.info('customerLocations.mapLongToShortStateName', {
      message: 'State not found in long name to short name map.',
      state,
    });
    return state;
  }

  async findPayPalUserLocation(customer: Stripe.Customer) {
    const uid = customer.metadata.userid;
    const resultsWithDupes = await this.getLocationForUid(uid);
    return this.getBestLocationForPayPalUser(customer, resultsWithDupes);
  }

  /**
   * Finds the best `country` and `state` location for the user based on a provided
   * list of inferred locations and the country in their existing Stripe customer
   * record.
   *  - If no country is found in Stripe, `state` and `country` are both undefined.
   *  - If there is a country mismatch, prefer the country in Stripe and select the most
   *    frequent location with a matching country.
   *  - If there is no matching country, `state` is undefined.
   */
  async getBestLocationForPayPalUser(
    customer: Stripe.Customer,
    results: PayPalUserLocationResult[]
  ): Promise<PayPalUserLocationResult> {
    const uid = customer.metadata.userid;
    let bestLocation: PayPalUserLocationResult = {
      uid,
      state: undefined,
      country: undefined,
      count: 1,
    };
    const country = customer.address?.country;
    if (!country) {
      this.log.info('customerLocations.getBestLocationForPayPalUser', {
        message: 'No country found in Stripe for the customer.',
        customerId: customer.id,
      });
      return bestLocation;
    }
    if (results.length === 0) {
      this.log.info('customerLocations.noRecordsFound', {
        message: 'Customer not found in metrics log.',
        customerId: customer.id,
      });
      return { ...bestLocation, country };
    }
    // We have one or more locations for this user; get mode location.
    const copy = [...results];
    // sort mutates
    results = copy.sort((a, b) => b.count - a.count);
    results = results.map((location) => ({
      ...location,
      country: this.mapLongToShortCountryName(location.country!),
      state: this.mapLongToShortStateName(location.country!, location.state!),
    }));
    const modeLocation = results[0];
    // Prioritize country from Stripe customer
    if (modeLocation.country === country) {
      bestLocation = { ...modeLocation, count: 1 };
    } else if (results.some((location) => location.country === country)) {
      bestLocation = {
        ...results.find((location) => location.country === country)!,
        count: 1,
      };
    } else {
      this.log.info('customerLocations.getBestLocationForPayPalUser', {
        message:
          'No location results countries match the Stripe customer country.',
        customerId: customer.id,
        country,
      });
      bestLocation = { ...bestLocation, country };
    }
    return bestLocation;
  }

  async isPayPalCustomer(customer: Stripe.Customer): Promise<boolean> {
    if (customer.metadata.paypalAgreementId) {
      return true;
    }

    if (customer?.invoice_settings?.default_payment_method) {
      return false;
    }

    this.log.debug('CustomerLocations.noPayPalBaId', {
      message: "User doesn't have paypal BA ID. Checking DB.",
      customerId: customer.id,
    });

    // For PayPal users whose subscriptions are no longer active, they will
    // not have a paypalBillingAgreementId in Stripe customer metadata.
    const uidBuffer = uuidTransformer.to(customer.metadata.userid);
    return !!(await PayPalBillingAgreements.query().findOne({
      uid: uidBuffer,
    }));
  }

  async backfillCustomerLocation({
    limit,
    isDryRun,
    delay,
  }: {
    limit: number;
    isDryRun: boolean;
    delay: number;
  }): Promise<void> {
    let count = 0;
    const pause = async () =>
      new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    const lookupCountries = Object.values(
      COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP
    );

    for await (const customer of this.stripeHelper.stripe.customers.list({
      expand: ['data.invoice_settings.default_payment_method'],
    })) {
      if (count >= limit) {
        break;
      }
      count++;

      try {
        const paymentMethod = customer.invoice_settings
          ?.default_payment_method as Stripe.PaymentMethod;
        const paymentMethodCountry = paymentMethod?.card?.country;
        let postalCode = paymentMethod?.billing_details?.address?.postal_code;

        // Skip when...
        // The customer's address has a state already
        if (customer.address?.state) {
          this.log.info('CustomerLocations.skipHaveState', {
            message:
              'Skipping customer as they already have a state in their address.',
            customerId: customer.id,
          });
          continue;
        }
        // The customer's address has a country and it's not US or CA
        if (
          (customer.address?.country &&
            !lookupCountries.includes(customer.address.country)) ||
          (paymentMethodCountry &&
            !lookupCountries.includes(paymentMethodCountry))
        ) {
          this.log.info('CustomerLocations.skipNotInRequiredCountries', {
            messge: 'Skipping customer as they are not in the US or Canada.',
            customerId: customer.id,
          });
          continue;
        }

        const isPaypalCustomer = await this.isPayPalCustomer(customer);

        if (!isPaypalCustomer && !postalCode) {
          this.log.info('CustomerLocations.noPostalCode', {
            message: 'No postal code for Stripe customer.',
            customerId: customer.id,
          });
          continue;
        }

        if (isPaypalCustomer) {
          const { state, country } = await this.findPayPalUserLocation(
            customer
          );

          if (!state) {
            continue;
          }

          if (isDryRun) {
            this.log.debug('CustomerLocations.dryRunPayPal', {
              message:
                'Customer is a PayPal user with a best inferred location.',
              customerId: customer.id,
              state,
              country,
            });
          } else {
            await this.stripeHelper.updateCustomerBillingAddress(customer.id, {
              line1: '',
              line2: '',
              city: '',
              state,
              country: country!,
              postalCode: '',
            });
          }
        } else {
          if (isDryRun) {
            this.log.debug('CustomerLocations.dryRunStripe', {
              message: 'Customer is a Stripe user with a best location.',
              customerId: customer.id,
              postalCode,
              country: paymentMethodCountry,
            });
          } else {
            await this.stripeHelper.setCustomerLocation({
              customerId: customer.id,
              postalCode: postalCode!,
              country: paymentMethodCountry!,
            });
          }
        }
        if (!isDryRun) {
          this.log.info('CustomerLocations.success', {
            message: 'Successfully set location for customer',
            customerId: customer.id,
          });
        }
      } catch (err: any) {
        this.log.error('CustomerLocations.failure', {
          message: `${err.jse_cause || err.message}`,
          customerId: customer.id,
        });
      }

      await pause();
    }
  }
}
