/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { StatsD } from 'hot-shots';
import Redis from 'ioredis';
import Redlock, { Lock } from 'redlock';
import Container from 'typedi';
import { promisify } from 'util';

import { PayPalHelper } from '../lib/payments/paypal/helper';
import { PayPalClient } from '../lib/payments/paypal/client';
import { PaypalProcessor } from '../lib/payments/paypal/processor';
import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';

const pckg = require('../package.json');
const config = require('../config').getProperties();
const PAYPAL_PROCESSOR_LOCK = 'fxa-paypal-processor-lock';
const DEFAULT_LOCK_DURATION_MS = 300000;
let lock: Lock;

const initTimer = () => {
  let start = Date.now();

  const reset = () => (start = Date.now());
  const elapsed = () => Date.now() - start;

  return {
    reset,
    elapsed,
  };
};

export async function init() {
  // Load program options
  program
    .version(pckg.version)
    .option('-g, --grace [days]', 'Grace days to allow. Defaults to 1.', '1')
    .option(
      '-r, --retries [times]',
      'Retry attempts to per day. Defaults to 1.',
      '1'
    )
    .option(
      '-i, --invoice-age [hours]',
      'How old in hours the invoice must be to get processed. Defaults to 6.',
      '6'
    )
    .option(
      '-l, --use-lock [bool]',
      'Whether to require a distributed lock to run.  Use "false" to disable.  Defaults to true.',
      true
    )
    .option(
      '-n, --lock-name [name]',
      `The name of the resource for which to acquire a distributed lock. Defaults to ${PAYPAL_PROCESSOR_LOCK}.`,
      PAYPAL_PROCESSOR_LOCK
    )
    .option(
      '-d, --lock-duration [milliseconds]',
      `The max duration in milliseconds to hold the lock.  The lock will be extended as needed.  Defaults to ${DEFAULT_LOCK_DURATION_MS}.`,
      DEFAULT_LOCK_DURATION_MS
    )
    .parse(process.argv);

  // every arg is a string
  const useLock = program.useLock !== 'false';
  const lockDuration =
    parseInt(`${program.lockDuration}`) || DEFAULT_LOCK_DURATION_MS;

  const { log, database, senders } = await setupProcessingTaskObjects(
    'paypal-processor'
  );

  const paypalClient = new PayPalClient(
    config.subscriptions.paypalNvpSigCredentials
  );
  Container.set(PayPalClient, paypalClient);
  const paypalHelper = new PayPalHelper({ log });
  Container.set(PayPalHelper, paypalHelper);

  const processor = new PaypalProcessor(
    log,
    config,
    parseInt(program.grace),
    parseInt(program.retries),
    parseInt(program.invoiceAge),
    database,
    senders.email
  );
  const statsd = Container.get(StatsD);
  statsd.increment('paypal-processor.startup');

  const timer = initTimer();

  if (useLock) {
    try {
      const redis = new Redis(config.redis);
      const redlock = new Redlock([redis], { retryCount: 1 });
      lock = await redlock.acquire([program.lockName], lockDuration);
    } catch (err) {
      throw new Error(`Cannot acquire lock to run: ${err.message}`);
    }
  }

  for await (const _ of processor.processInvoices()) {
    if (useLock && timer.elapsed() > Math.floor(lockDuration / 2)) {
      await lock.extend(timer.elapsed());
      timer.reset();
    }
  }

  lock?.release();
  statsd.increment('paypal-processor.shutdown');
  await promisify(statsd.close).bind(statsd)();
  return 0;
}

if (require.main === module) {
  let exitStatus = 1;
  init()
    .then((result) => {
      exitStatus = result;
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      process.exit(exitStatus);
    });
}
