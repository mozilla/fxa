/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { Container } from 'typedi';
import Sentry from '@sentry/node';

import { version } from '../lib/version';
import Config from '../config';
import { QueueProcessor } from '../lib/pubsub';
import mozlog from 'mozlog';

const logger = mozlog(Config.get('log'))('queueWorker');
const config = Config.getProperties();

function main() {
  Sentry.init({
    dsn: config.sentryDsn,
    release: version.version,
    integrations: [new Sentry.Integrations.LinkedErrors()]
  });
  Sentry.configureScope(scope => {
    scope.setTag('process', 'metrics_queue_worker');
  });
  const queueProcessor = Container.get(QueueProcessor);
  process.on('beforeExit', async () => {
    await queueProcessor.stop();
    await Sentry.close();
    logger.info('exitComplete', {});
  });
  return queueProcessor.start();
}

main().catch(err => {
  logger.error('runtime', err);
});
