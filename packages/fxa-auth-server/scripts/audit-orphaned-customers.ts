/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import program from 'commander';
import Stripe from 'stripe';
import Container from 'typedi';
import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { promises as fs } from 'fs';
import {
  AppConfig,
  AuthLogger
} from '../lib/types';
import AppError, { ERRNO } from '../lib/error';

type CustomerData = {
  id: string;
  uid?: string;
  email?: string;
};

type Customers = Map<string, CustomerData>

const pckg = require('../package.json');

const isOfStatus = (
  keyInput: string
): keyInput is Stripe.Subscription.Status => {
  return [
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid',
  ].includes(keyInput);
};

const isCustomer = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer
): customer is Stripe.Customer => {
  if (typeof customer !== 'string') {
    return !customer.deleted;
  }
  return false;
};

const parseDateForFirestore = (date: number) => Math.floor(date / 1000);

const parseStartDate = (date: string): number =>
  parseDateForFirestore(
    date ? Date.parse(date) : Date.parse('2021-08-13T00:00:00')
  );

const parseEndDate = (date: string): number =>
  parseDateForFirestore(
    date ? Date.parse(date) : Date.parse('2023-02-13T23:59:59')
  );

const parseSubscriptionStatus = (
  status: string
): Stripe.Subscription['status'] | undefined => {
  if (status) {
    if (!isOfStatus(status)) {
      throw new Error(
        `Please provide a valid status. Invalid status: ${status}`
      );
    }
    return status as Stripe.Subscription['status'];
  }
  return undefined;
};

const parseLogCadence = (cadence: number): number => cadence || 500;

function convertToCsv(data: CustomerData[]) {
  const replacer = (key: string, value: any) => (value === null ? '' : value); // specify how you want to handle null values here
  const header = Object.keys(data[0]);
  return [
    header.join(','), // header row first
    ...data.map((row: CustomerData) =>
      header
        .map((fieldName: string) =>
          JSON.stringify(row[fieldName as keyof typeof row], replacer)
        )
        .join(',')
    ),
  ].join('\r\n');
}

async function writeCsv(data: CustomerData[], file: string) {
  if (!data.length) {
    return;
  }
  const csv = convertToCsv(data);
  try {
    await fs.writeFile(`${parseDateForFirestore(Date.now())}_${file}.csv`, csv);
  } catch (err) {
    console.error(err);
  }
}

const orphanedCustomers: CustomerData[] = [];
const errorsOutput: CustomerData[] = [];

/**
 * Get unique Stripe Customers by looping through subscriptions
 * If the customer has a uid, add to StripeCustomers
 * If the customer does not have a uid, add to ErrorsOutput
*/
async function retrieveStripeCustomers(
  startDate: number,
  endDate: number,
  logCadence: number,
  status?: string,
): Promise<Customers> {
  const log = Container.get(AuthLogger);
  log.info('retrieveStripeCustomers - start', { message: 'Processing Stripe subscriptions...' });

  const config = Container.get(AppConfig);
  const stripe = new Stripe(config.subscriptions.stripeApiKey, {
    apiVersion: '2022-08-01',
    maxNetworkRetries: 3,
  });
  const baseQuery = `created<=${endDate} AND created>=${startDate}`;
  const params: Stripe.SubscriptionSearchParams = {
    query: status
      ? `${baseQuery} AND status:'${status}'`
      : `${baseQuery} AND -status:'canceled'`,
    expand: ['data.customer', 'data.latest_invoice'],
    limit: 100,
  };

  const stripeCustomers: Customers = new Map();
  let i = 0;

  for await (const sub of stripe.subscriptions.search(params)) {
    const id = (sub.customer as Stripe.Customer).id;
    const uid =
      isCustomer(sub.customer) && sub.customer.metadata['userid']
        ? sub.customer.metadata['userid']
        : undefined;
    const email =
      isCustomer(sub.customer) && sub.customer.email
        ? sub.customer.email
        : undefined;
    const output: CustomerData = {
      id,
      uid,
      email,
    };

    i++;

    if (i > 0 &&
      i % logCadence === 0) {
      log.info('retrieveStripeCustomers - in progress', { message: `Subscriptions processed: ${i}` });
    }

    if (!uid) {
      errorsOutput.push(output);
    } else {
      stripeCustomers.set(uid, output);
    }
  };

  if (stripeCustomers.size > 0) {
    log.info('retrieveStripeCustomers - in progress', { message: `Total subscriptions processed: ${i}`});
    log.info('retrieveStripeCustomers - done', { message: `Total Stripe customers: ${stripeCustomers.size}` });
    return stripeCustomers;
  }

  throw new Error(
    `No Stripe customers found between ${new Date(
      startDate * 1000
    ).toDateString()} and ${new Date(endDate * 1000).toDateString()}`
  );
};

/**
 * Check Stripe Customer UID against Account Records
*/
async function checkStripeExistsInAccount(
  database: any,
  key: string,
  value: CustomerData,
) {
  try {
    await database.account(key);
    return { matchedAccount: value };
  } catch (err){
    if (err instanceof AppError && err.errno === ERRNO.ACCOUNT_UNKNOWN) {
      return { orphanedAccount: value };
    } else {
      return { errorAccount: value };
    }
  }
};

async function auditStripeExistsInAccounts({
  database,
  startDate,
  endDate,
  logCadence,
  filterStatus,
} : {
  database: any,
  startDate: number;
  endDate: number;
  logCadence: number;
  filterStatus?: Stripe.Subscription['status'];
}) {
  const log = Container.get(AuthLogger);
  log.info('init', { message: 'Starting audit script...' });

  const matchedCustomers: CustomerData[] = [];
  let i = 0;

  try {
    const stripeCustomers: Customers =
      await retrieveStripeCustomers(
        startDate,
        endDate,
        logCadence,
        filterStatus,
      );

    log.info('auditStripeExistsInAccounts - start', { message: 'Auditing Stripe customers...' });

    const results = await Promise.allSettled(
      Array.from(stripeCustomers, ([key, value]) =>
        checkStripeExistsInAccount(database, key, value)
      )
    );

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        if (result.value.matchedAccount) {
          i++;
          matchedCustomers.push(result.value.matchedAccount);
        } else if (result.value.orphanedAccount) {
          i++;
          orphanedCustomers.push(result.value.orphanedAccount);
        } else {
          i++;
          errorsOutput.push(result.value.errorAccount)
        }
      }

      if (i > 0 &&
        i % logCadence === 0) {
        log.info('auditStripeExistsInAccounts - in progress', { message: `Audited Stripe customers: ${Math.round(i/stripeCustomers.size*100)}%` });
      };
    });

    log.info('auditStripeExistsInAccounts - done', { message: 'Audit script completed.' });

  } catch (err) {
    console.error('Error occurred while auditing Stripe customers.');
    throw err;
  }

  // Output results
  await writeCsv(matchedCustomers, 'matched_output');
  await writeCsv(orphanedCustomers, 'orphaned_output');
  await writeCsv(errorsOutput, 'error_output');
};

async function init() {
  program
    .version(pckg.version)
    .option(
      '-s, --start-date [string]',
      'Start date of range to search for subscriptions by created date',
      ''
    )
    .option(
      '-e, --end-date [string]',
      'End date of range to search for subscriptions by created date',
      ''
    )
    .option(
      '-l, --log-cadence [number]',
      'Number of processed Stripe subscriptions to log by. Optional.',
      ''
    )
    .option(
      '-t, --subscription-status [string]',
      'Filter by specific subscription status. Optional.',
      ''
    )
    .parse(process.argv);
  const { database } = await setupProcessingTaskObjects('audit-orphaned-customers');

  const startDate = parseStartDate(program.startDate);
  const endDate = parseEndDate(program.endDate);
  const logCadence = parseLogCadence(program.logCadence);
  const filterStatus = parseSubscriptionStatus(program.subscriptionStatus);

  await auditStripeExistsInAccounts({
    database,
    startDate,
    endDate,
    logCadence,
    filterStatus,
  });

  return 0;
};

if (require.main === module) {
  init()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .then((result) => process.exit(result));
}
