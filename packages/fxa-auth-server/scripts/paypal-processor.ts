/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { StatsD } from 'hot-shots';
import * as Sentry from '@sentry/node';
import Redis from 'ioredis';
import Redlock, { RedlockAbortSignal } from 'redlock';
import Container from 'typedi';
import { promisify } from 'util';

import { PayPalHelper } from '../lib/payments/paypal/helper';
import { PayPalClient } from '@fxa/payments/paypal';
import { PaypalProcessor } from '../lib/payments/paypal/processor';
import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { initSentry } from '@fxa/shared/sentry-node';

const pckg = require('../package.json');
const config = require('../config').default.getProperties();
const PAYPAL_PROCESSOR_LOCK = 'fxa-paypal-processor-lock';
const DEFAULT_LOCK_DURATION_MS = 300000;

/**
 * Used to track whether the script has been requested to exit cleanly and stop processing
 */
let shutdown = false;

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
      DEFAULT_LOCK_DURATION_MS.toString()
    )
    .parse(process.argv);

  // every arg is a string
  const useLock = program.useLock !== 'false';
  const lockDuration =
    parseInt(`${program.lockDuration}`) || DEFAULT_LOCK_DURATION_MS;

  const { log, database, senders } = await setupProcessingTaskObjects(
    'paypal-processor'
  );

  initSentry(
    {
      ...config,
      release: pckg.version,
    },
    log
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

  if (useLock) {
    try {
      const redis = new Redis(config.redis);
      const redlock = new Redlock([redis], {
        retryCount: 1,
        automaticExtensionThreshold: 5000,
      });

      await redlock.using(
        [program.lockName],
        lockDuration,
        async (signal: RedlockAbortSignal) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for await (const _ of processor.processInvoices()) {
            if (signal.aborted) {
              throw signal.error;
            }

            if (shutdown) {
              break;
            }
          }
        }
      );
    } catch (err) {
      throw new Error(`Cannot acquire lock to run`, { cause: err });
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of processor.processInvoices()) {
      // no need to extend locks between invoices since locking was not enabled

      if (shutdown) {
        break;
      }
    }
  }

  statsd.increment('paypal-processor.shutdown');
  await promisify(statsd.close).bind(statsd)();

  if (shutdown) {
    throw new Error(
      'Script received an exit signal and did not complete processing'
    );
  }

  return 0;
}

if (require.main === module) {
  let exitStatus = 1;
  const checkInId = Sentry.captureCheckIn({
    monitorSlug: 'paypal-processsor',
    status: 'in_progress',
  });
  init()
    .then((result) => {
      exitStatus = result;
      Sentry.captureCheckIn({
        checkInId,
        monitorSlug: 'paypal-processsor',
        status: 'ok',
      });
    })
    .catch((err) => {
      console.error(err);
      Sentry.captureCheckIn({
        checkInId,
        monitorSlug: 'paypal-processsor',
        status: 'error',
      });
    })
    .then(() => {
      return Sentry.close(2000);
    })
    .finally(() => {
      process.exit(exitStatus);
    });

  const gracefulShutdown = () => {
    shutdown = true;
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}
