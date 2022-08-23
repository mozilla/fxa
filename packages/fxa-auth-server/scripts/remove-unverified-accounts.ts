import { PayPalClient } from 'fxa-auth-server/lib/payments/paypal/client';
import {
  deleteAllPayPalBAs,
  getAllPayPalBAByUid,
} from 'fxa-shared/db/models/auth';
import { Account } from 'fxa-shared/db/models/auth/account';
import Stripe from 'stripe';
import Container from 'typedi';
import { promisify } from 'util';
import { StatsD } from 'hot-shots';
import { PayPalHelper } from '../lib/payments/paypal';
import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { StripeHelper } from '../lib/payments/stripe';
import { reportSentryError } from '../lib/sentry';
const config = require('../config').getProperties();

export async function retreiveUnverifiedAccounts(
  database: any
): Promise<Account[]> {
  const unverifiedAccounts = await database.listAllUnverifiedAccounts();
  const accountsToDelete: Account[] = [];

  for (const account of unverifiedAccounts) {
    const accountCreationDate = new Date(account.createdAt);
    const cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - 16);

    if (account.verifierSetAt === 0 && accountCreationDate <= cutOffDate) {
      accountsToDelete.push(account);
    }
  }

  return accountsToDelete;
}

export async function cancelSubscriptionsAndDeleteCustomer(
  stripeHelper: StripeHelper,
  paypalHelper: PayPalHelper,
  account: Account,
  removedAccounts: Account[]
): Promise<void> {
  const stripeCustomer = await stripeHelper.fetchCustomer(account.uid, [
    'subscriptions',
  ]);

  if (stripeCustomer) {
    const paymentProvider = (
      await stripeHelper.getPaymentProvider(stripeCustomer)
    ).toLowerCase();

    // Cancel any subscriptions and issue refunds
    if (stripeCustomer.subscriptions) {
      for (const subscription of stripeCustomer.subscriptions.data) {
        await issueRefund(
          stripeHelper,
          paypalHelper,
          subscription,
          paymentProvider
        );
        await stripeHelper.cancelSubscription(subscription.id);
      }
    }

    // Remove the customer from stripe
    await stripeHelper.removeCustomer(account.uid, stripeCustomer.email!);
    removedAccounts.push(account);

    // Delete any PayPal billing agreements
    if (paymentProvider === 'paypal') {
      await deletePayPalBillingAgreements(paypalHelper, account);
    }
  }
}

export async function issueRefund(
  stripeHelper: StripeHelper,
  paypalHelper: PayPalHelper,
  subscription: Stripe.Subscription,
  paymentProvider: string
) {
  const latestInvoice = await stripeHelper.getInvoice(
    subscription.latest_invoice as string
  );

  switch (paymentProvider) {
    case 'stripe':
      await stripeHelper.refundPayment(
        latestInvoice.payment_intent as string,
        'fraudulent'
      );
      break;
    case 'paypal':
      const paypalTransactionId =
        await stripeHelper.getInvoicePaypalTransactionId(latestInvoice);
      if (paypalTransactionId) {
        await paypalHelper.issueRefund(latestInvoice, paypalTransactionId);
      }
      break;
    default:
      break;
  }
}

export async function deletePayPalBillingAgreements(
  paypalHelper: PayPalHelper,
  account: Account
) {
  const paypalAgreements = await getAllPayPalBAByUid(account.uid);
  const activeIds = paypalAgreements.filter((ba: any) => {
    ['active', 'pending', 'suspended'].includes(ba.status.toLowerCase());
  });

  await Promise.allSettled(
    activeIds.map((ba) => {
      paypalHelper.cancelBillingAgreement(ba.billingAgreementId);
    })
  );

  await deleteAllPayPalBAs(account.uid);
}

export async function init() {
  const { log, database, senders, stripeHelper } =
    await setupProcessingTaskObjects('remove-unverified-accounts');

  const paypalClient = new PayPalClient(
    config.subscriptions.paypalNvpSigCredentials
  );
  Container.set(PayPalClient, paypalClient);
  const paypalHelper = new PayPalHelper({ log });
  Container.set(PayPalHelper, paypalHelper);
  const statsd = Container.get(StatsD);

  statsd.increment('remove-unverified-accounts.startup');

  // retreive all unverified accounts
  const allUnverifiedAccounts = await retreiveUnverifiedAccounts(database);
  const removedAccounts: Account[] = [];

  // iterate through unverified accounts and try to cancel subs, issue refunds, delete customers and accounts
  for (const account of allUnverifiedAccounts) {
    try {
      await cancelSubscriptionsAndDeleteCustomer(
        stripeHelper,
        paypalHelper,
        account,
        removedAccounts
      );
      await database.deleteAccount({ uid: account.uid });
    } catch (error) {
      reportSentryError(error);
      log.error(`Failed to remove unverified account`, { error });
    }
  }

  // send emails for successfully removed customers
  for (const account of removedAccounts) {
    try {
      await senders.email.sendFraudulentAccountDeletionEmail(
        ...[account.emails!, account]
      );
    } catch (error) {
      reportSentryError(error);
      log.error(`Failed to send email when removing unverified account`, {
        error,
      });
    }
  }

  statsd.increment('remove-unverified-accounts.shutdown');
  await promisify(statsd.close).bind(statsd)();
  return 0;
}

if (require.main === module) {
  init().then((result) => process.exit(result));
}
