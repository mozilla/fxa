/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { PlanCanceller } from './cancel-subscriptions-to-plan/cancel-subscriptions-to-plan';
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

const parseRemainingValueMode = (
  mode: string
): "noaction" | "refund" | "prorate" | "proratedRefund" => {
  const validModes = ['noaction', 'refund', 'prorate', 'proratedRefund'];
  if (!validModes.includes(mode)) {
    throw new Error(`Invalid --mode: ${mode}. Must be one of: ${validModes.join(', ')}`);
  }

  return mode as "noaction" | "refund" | "prorate" | "proratedRefund";
};

const parseProratedRefundRate = (proratedRefundRate: string) => {
  if (!proratedRefundRate) return null;
  const value = parseInt(proratedRefundRate);
  if (isNaN(value) || value <= 0) throw new Error("Invalid proratedRefundRate");
  return value;
};

async function init() {
  program
    .version(pckg.version)
    .option(
      '-o, --output-file [string]',
      'Output file to write report to. Will be output in CSV format',
      'cancel-subscriptions-to-plan.csv'
    )
    .option(
      '-r, --rate-limit [number]',
      'Rate limit for Stripe',
      70
    )
    .option(
      '--price [string]',
      'Stripe plan ID. All customers on this price ID will have their subscriptions cancelled'
    )
    .option(
      '-e, --exclude [string]',
      'Do not touch customers if they have a subscription to a price in this list',
      ''
    )
    .option(
      '-m, --mode [string]',
      'How to handle remaining subscription value: noaction, refund, prorate, proratedRefund',
      'noaction'
    )
    .option(
      '-p, --prorated-refund-rate [number]',
      'The rate per day (in whole cents) at which to refund subscriptions in proratedRefund mode'
    )
    .option(
      '--dry-run',
      'List the customers that would be cancelled without actually cancelling them'
    )
    .parse(process.argv);

  const { stripeHelper, log } = await setupProcessingTaskObjects(
    'cancel-subscriptions-to-plan'
  );

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

  const rateLimit = parseRateLimit(program.rateLimit);
  const excludePlanIds = parseExcludePlanIds(program.exclude);
  const remainingValueMode = parseRemainingValueMode(program.mode);
  const proratedRefundRate = parseProratedRefundRate(program.proratedRefundRate);

  const dryRun = !!program.dryRun;
  if (!program.price) throw new Error('--price must be provided');

  if (remainingValueMode === 'proratedRefund' && proratedRefundRate === null) {
    throw new Error('--prorated-refund-rate must be provided when using proratedRefund mode');
  }

  const planCanceller = new PlanCanceller(
    program.price,
    remainingValueMode,
    proratedRefundRate,
    excludePlanIds,
    program.outputFile,
    stripeHelper,
    paypalHelper,
    dryRun,
    rateLimit
  );

  await planCanceller.run();

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
