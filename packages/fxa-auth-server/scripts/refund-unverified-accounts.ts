/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { StripeHelper } from '../lib/payments/stripe';
import Stripe from 'stripe';
import Container from 'typedi';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { AppConfig } from '../lib/types';
import { promises as fs } from 'fs';
import { parseDryRun } from './lib/args';

const pckg = require('../package.json');

type SubscriptionData = {
  subscription: Stripe.Subscription;
  uid?: string;
  email?: string;
  invoicePaymentIntentId?: Stripe.PaymentIntent['id'];
};

type OutputData = {
  uid: string;
  email: string;
  accountCreated: number;
  customerId: string;
  subscriptionId: string;
  subscriptionCreated: number;
  subscriptionStatus: string;
  subscriptionPlan: string;
  invoicePaymentIntentId: string;
  refunded: boolean;
};

type ErrorOutput = {
  subscriptionId: string;
  uid: string;
  email: string;
  errorMessage: string;
  error?: string;
};

class MergedAccountError extends Error {
  public subscriptionId: string;
  public uid?: string;
  public email?: string;
  constructor(
    message: string,
    subscriptionId: string,
    uid?: string,
    email?: string
  ) {
    super(message);
    this.message = message;
    this.subscriptionId = subscriptionId;
    this.uid = uid;
    this.email = email;
  }
}

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
    date ? Date.parse(date) : Date.parse('2022-12-23T00:00:00')
  );

const parseEndDate = (date: string): number =>
  parseDateForFirestore(
    date ? Date.parse(date) : Date.parse('2022-12-31T23:59:59')
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

function convertToCsv(data: OutputData[] | ErrorOutput[]) {
  const replacer = (key: string, value: any) => (value === null ? '' : value); // specify how you want to handle null values here
  const header = Object.keys(data[0]);
  return [
    header.join(','), // header row first
    ...data.map((row: OutputData | ErrorOutput) =>
      header
        .map((fieldName: string) =>
          JSON.stringify(row[fieldName as keyof typeof row], replacer)
        )
        .join(',')
    ),
  ].join('\r\n');
}

async function writeCsv(data: OutputData[] | ErrorOutput[], file: string) {
  if (!data.length) {
    return;
  }
  const csv = convertToCsv(data);
  try {
    await fs.writeFile(`${file}_${parseDateForFirestore(Date.now())}.csv`, csv);
  } catch (err) {
    console.error(err);
  }
}

async function readSkip(file: string) {
  const data = await fs.readFile(file, { encoding: 'utf-8' });
  return data.split(/\r?\n/);
}

/**
 * Retrieve subscriptions by created date from Stripe
 */
async function retrieveSubscriptionsByCreatedStripe(
  startDate: number,
  endDate: number,
  status?: string
): Promise<SubscriptionData[]> {
  const config = Container.get(AppConfig);
  const stripe = new Stripe(config.subscriptions.stripeApiKey, {
    apiVersion: '2024-04-10',
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

  const subsOutput: SubscriptionData[] = [];
  for await (const sub of stripe.subscriptions.search(params)) {
    const uid =
      isCustomer(sub.customer) && sub.customer.metadata['userid']
        ? sub.customer.metadata['userid']
        : undefined;
    const email =
      isCustomer(sub.customer) && sub.customer.email
        ? sub.customer.email
        : undefined;
    const invoicePaymentIntentId =
      typeof sub.latest_invoice !== 'string'
        ? ((sub.latest_invoice as Stripe.Invoice)?.payment_intent as string)
        : undefined;
    const output: SubscriptionData = {
      subscription: sub,
      uid: uid,
      email: email,
      invoicePaymentIntentId,
    };
    subsOutput.push(output);
  }

  if (subsOutput.length) {
    return subsOutput;
  }
  throw new Error(
    `No subscriptions found between ${new Date(
      startDate * 1000
    ).toDateString()} and ${new Date(endDate * 1000).toDateString()}`
  );
}

/**
 * Refund and Delete Customer, Cancel Subscription
 */
export async function cancelSubscriptionsAndDeleteCustomer(
  uid: string,
  email: string,
  subscriptionId: string,
  invoicePaymentIntentId: string
): Promise<void> {
  const stripeHelper = Container.get(StripeHelper);

  if (!invoicePaymentIntentId) {
    throw new Error(`Could not find payment intent for ${email}`);
  }

  // Cancel any subscriptions and issue refunds
  await stripeHelper.refundPayment(invoicePaymentIntentId, 'fraudulent');
  await stripeHelper.cancelSubscription(subscriptionId);

  // Remove the customer from stripe
  await stripeHelper.removeCustomer(uid);
}

async function mergeAccountData(database: any, subscription: SubscriptionData) {
  const {
    subscription: sub,
    uid,
    email,
    invoicePaymentIntentId,
  } = subscription;
  try {
    if (!uid) {
      throw new Error('Uid could not be found for subscription');
    }
    const account = await database.account(uid);
    if (account) {
      const outputData: OutputData = {
        uid,
        email: account.email,
        accountCreated: account.createdAt,
        customerId: (sub.customer as Stripe.Customer).id,
        subscriptionId: sub.id,
        subscriptionCreated: sub.created,
        subscriptionStatus: sub.status,
        subscriptionPlan: sub.items.data[0].id,
        invoicePaymentIntentId: invoicePaymentIntentId || '',
        refunded: false,
      };
      if (account.verifierSetAt === 0) {
        return { unverifiedAccount: outputData };
      } else {
        return { verifiedAccount: outputData };
      }
    } else {
      throw new Error(
        `Could not find FxA account. Subscription status: ${sub.status}.`
      );
    }
  } catch (error) {
    throw new MergedAccountError(error.message, sub.id, uid, email);
  }
}

async function refundUnverifiedAccounts({
  database,
  isDryRun,
  startDate,
  endDate,
  skipFile,
  filterStatus,
}: {
  database: any;
  isDryRun: boolean;
  startDate: number;
  endDate: number;
  skipFile: string;
  filterStatus?: Stripe.Subscription['status'];
}) {
  const unverifiedAccounts: OutputData[] = [];
  const unverifiedAccountsRefunded: OutputData[] = [];
  const verifiedAccounts: OutputData[] = [];
  const errorsOutput: ErrorOutput[] = [];

  const skipUidOrEmail = skipFile ? await readSkip(skipFile) : [];

  try {
    const subscriptions: SubscriptionData[] =
      await retrieveSubscriptionsByCreatedStripe(
        startDate,
        endDate,
        filterStatus
      );

    // For each UID, get the Account record
    // Populate either unverified or verified Account arrays
    // Or errorsOutput if an error ocurred.
    const mergedDataResults = await Promise.allSettled(
      subscriptions.map((sub) => mergeAccountData(database, sub))
    );
    mergedDataResults.forEach((acc) => {
      if (acc.status === 'fulfilled') {
        if (acc.value.unverifiedAccount) {
          const { uid, email } = acc.value.unverifiedAccount;
          // Skip unverified Accounts with UID or Email in skipFile
          if (!skipUidOrEmail.some((skip) => skip === uid || skip === email)) {
            unverifiedAccounts.push(acc.value.unverifiedAccount);
          }
        } else {
          verifiedAccounts.push(acc.value.verifiedAccount);
        }
      } else {
        if (acc.reason instanceof MergedAccountError) {
          const reason = acc.reason;
          errorsOutput.push({
            subscriptionId: reason.subscriptionId,
            uid: reason.uid || 'unknown',
            email: reason.email || 'unknown',
            errorMessage: reason.message,
            error: reason.toString(),
          });
        } else {
          errorsOutput.push({
            subscriptionId: 'unknown',
            uid: 'unknown',
            email: 'unknown',
            errorMessage: 'Generic error',
          });
        }
      }
    });
  } catch (err) {
    console.error('Error occurred while collecting unverified accounts');
    throw err;
  }
  // If not DryRun, then process unverifiedAccounts and Refund
  if (!isDryRun) {
    for (const unverifiedAccount of unverifiedAccounts) {
      const { uid, email, subscriptionId, invoicePaymentIntentId } =
        unverifiedAccount;
      try {
        // Perform Stripe actions to delete and refund
        await cancelSubscriptionsAndDeleteCustomer(
          uid,
          email,
          subscriptionId,
          invoicePaymentIntentId
        );

        // Delete record from Account
        await database.deleteAccount({ uid });

        unverifiedAccountsRefunded.push({
          ...unverifiedAccount,
          refunded: true,
        });
      } catch (error) {
        if (error instanceof Error) {
          errorsOutput.push({
            subscriptionId,
            uid,
            email,
            errorMessage: error.message,
            error: error.toString(),
          });
        } else {
          errorsOutput.push({
            subscriptionId,
            uid,
            email,
            errorMessage: 'Generic error',
          });
        }
      }
    }
    //
  } else {
    // If just dryRun, just return unverifiedAccounts
    // Is there a better way to move unverifiedAccounts into unverifiedAccountsRefunded?
    unverifiedAccounts.forEach((account) =>
      unverifiedAccountsRefunded.push(account)
    );
  }

  // Output results
  await writeCsv(unverifiedAccountsRefunded, 'unverified_output');
  await writeCsv(verifiedAccounts, 'verified_output');
  await writeCsv(errorsOutput, 'error_output');
}

async function init() {
  program
    .version(pckg.version)
    .option(
      '-n, --dry-run [true|false]',
      'Print what the script would do instead of performing the action.  Defaults to true.',
      true
    )
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
      '-k, --skip-file [string]',
      'File that contains a list of uid or emails that should be skipped during processing.',
      ''
    )
    .option(
      '-t, --subscription-status [string]',
      'Filter by specific subscription status. Optional.',
      ''
    )
    .parse(process.argv);

  const { database } = await setupProcessingTaskObjects(
    'refund-unverified-accounts'
  );

  const isDryRun = parseDryRun(program.dryRun);
  const startDate = parseStartDate(program.startDate);
  const endDate = parseEndDate(program.endDate);
  const skipFile = program.skipFile || '';
  const filterStatus = parseSubscriptionStatus(program.subscriptionStatus);

  await refundUnverifiedAccounts({
    database,
    isDryRun,
    startDate,
    endDate,
    skipFile,
    filterStatus,
  });

  return 0;
}

if (require.main === module) {
  init()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .then((result) => process.exit(result));
}
