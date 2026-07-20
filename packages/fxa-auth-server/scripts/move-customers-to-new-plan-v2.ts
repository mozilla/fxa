/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { CustomerPlanMover } from './move-customers-to-new-plan-v2/move-customers-to-new-plan-v2';
import { PayPalHelper } from '../lib/payments/paypal';
import { PayPalClient } from '@fxa/payments/paypal';
import { Container } from 'typedi';
import type { StatsD } from 'hot-shots';

const pckg = require('../package.json');
const config = require('../config').default.getProperties();

const parseRateLimit = (rateLimit: string | number) => {
  return parseInt(rateLimit.toString(), 10);
};

const parseExcludePlanIds = (planIds: string) => {
  return planIds.split(',');
};

const parseProratedRefundRate = (proratedRefundRate: string) => {
  if (!proratedRefundRate) return null;
  const value = parseInt(proratedRefundRate);
  if (isNaN(value) || value <= 0) throw new Error("Invalid proratedRefundRate");
  return value;
};

const parseProrationBehavior = (prorationBehavior: string): 'none' | 'create_prorations' | 'always_invoice' => {
  if (!['none', 'create_prorations', 'always_invoice'].includes(prorationBehavior)) {
    throw new Error(`Invalid prorationBehavior: ${prorationBehavior}. Must be one of: none, create_prorations, always_invoice`);
  }
  return prorationBehavior as 'none' | 'create_prorations' | 'always_invoice';
};

async function init() {
  program
    .version(pckg.version)
    .option(
      '-o, --output-file [string]',
      'Output file to write report to. Will be output in CSV format.  Defaults to move-customers-to-new-plan-output.csv.',
      'move-customers-to-new-plan-output.csv'
    )
    .option(
      '-r, --rate-limit [number]',
      'Rate limit for Stripe API calls per second',
      20
    )
    .option(
      '--coupon [string]',
      'The Stripe coupon ID to apply (_not_ promotion code!)',
    )
    .option(
      '--proration-behavior [string]',
      'Stripe proration behavior for subscription updates (none, create_prorations, always_invoice). Defaults to none. Can only be non-none if prorated-refund-rate is not specified.',
      'none'
    )
    .option(
      '-s, --source-price-id [string]',
      'Source Stripe price ID. All customers on this price ID will be moved off of this price ID'
    )
    .option(
      '-d, --destination-price-id [string]',
      'Destination Stripe price ID. All customers on the source price ID will be moved to this price ID'
    )
    .option(
      '-p, --prorated-refund-rate [number]',
      'The rate per day (in whole cents) at which we plan to refund their subscription where possible to their original form of payment',
    )
    .option(
      '-e, --exclude-customers-having-price-ids [string]',
      'Do not touch customers if they have a subscription to a price in this list',
      ''
    )
    .option(
      '--dry-run',
      'List the customers that would be deleted without actually deleting'
    )
    .option(
      '--skip-subscription-if-set-to-cancel',
      'Skip subscriptions that are set to cancel at period end'
    )
    .option(
      '--reset-billing-cycle-anchor',
      'Reset the billing cycle anchor to now when updating subscriptions. If not set, billing cycle anchor remains unchanged.'
    )
    .parse(process.argv);

  const { stripeHelper, log } = await setupProcessingTaskObjects(
    'move-customers-to-new-plan'
  );

  const rateLimit = parseRateLimit(program.rateLimit);
  const excludeCustomersHavingPriceIds = parseExcludePlanIds(program.excludeCustomersHavingPriceIds);
  const proratedRefundRate = parseProratedRefundRate(program.proratedRefundRate);
  const prorationBehavior = parseProrationBehavior(program.prorationBehavior);

  const dryRun = !!program.dryRun;
  const skipSubscriptionIfSetToCancel = !!program.skipSubscriptionIfSetToCancel;
  const resetBillingCycleAnchor = !!program.resetBillingCycleAnchor;

  const statsd = {
    increment: () => {},
    timing: () => {},
    close: () => {},
  };
  const paypalClient = new PayPalClient(
    config.subscriptions.paypalNvpSigCredentials,
    statsd as unknown as StatsD
  );
  Container.set(PayPalClient, paypalClient);

  const paypalHelper = new PayPalHelper({
    log,
  });

  const customerPlanMover = new CustomerPlanMover(
    program.sourcePriceId,
    program.destinationPriceId,
    excludeCustomersHavingPriceIds,
    program.outputFile,
    stripeHelper.stripe,
    dryRun,
    rateLimit,
    proratedRefundRate,
    program.coupon,
    prorationBehavior,
    skipSubscriptionIfSetToCancel,
    resetBillingCycleAnchor,
    paypalHelper,
  );

  await customerPlanMover.convert();

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
