/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PubSub } from '@google-cloud/pubsub';
import * as sentry from '@sentry/node';
import { SQS } from 'aws-sdk';
import mozlog from 'mozlog';

import { StatsD } from 'hot-shots';
import Config from '../config';
import { createDatastore, FirestoreDatastore, InMemoryDatastore } from '../lib/db';
import { ServiceNotificationProcessor } from '../lib/notificationProcessor';
import { proxyServerInit, ServerEnvironment } from '../lib/proxy-server';
import { ClientCapabilityService } from '../lib/selfUpdatingService/clientCapabilityService';
import { ClientWebhookService } from '../lib/selfUpdatingService/clientWebhookService';
import { version } from '../lib/version';

// Initialize Sentry as early as possible
sentry.init({ dsn: Config.get('sentryDsn'), release: version.version });

const logger = mozlog(Config.get('log'))('notificationProcessor');

const firestoreConfig = Config.get('firestore');
const firestoreEnabled = firestoreConfig.enabled;
delete firestoreConfig.enabled;

const db = firestoreEnabled
  ? createDatastore(FirestoreDatastore, firestoreConfig)
  : createDatastore(InMemoryDatastore, {});

export function extractRegionFromUrl(url: string) {
  const matchResult = url.match(/(?:.*\/sqs\.)([^\.]+)/i);
  if (!matchResult || matchResult.length !== 2) {
    return undefined;
  } else {
    return matchResult[1];
  }
}

async function main() {
  const capabilityService = new ClientCapabilityService(
    logger,
    Config.get('clientCapabilityFetch')
  );
  const webhookService = new ClientWebhookService(
    logger,
    Config.get('clientCapabilityFetch.refreshInterval'),
    db
  );
  const pubsub = new PubSub();

  // Extract region for SQS object
  const serviceNotificationQueueUrl = Config.get('serviceNotificationQueueUrl');
  const region = extractRegionFromUrl(serviceNotificationQueueUrl);
  if (!region) {
    logger.error('invalidServiceUrl', {
      message: 'Cant find region in service url',
      serviceNotificationQueueUrl
    });
    process.exit(8);
  }
  const metrics = new StatsD(Config.get('metrics'));
  const processor = new ServiceNotificationProcessor(
    logger,
    db,
    metrics,
    capabilityService,
    webhookService,
    pubsub,
    Config.get('topicPrefix'),
    serviceNotificationQueueUrl,
    new SQS({ region })
  );
  logger.info('startup', { message: 'Starting event broker...' });
  processor.start();
  logger.info('startup', { message: 'Starting proxy server...' });
  const server = await proxyServerInit(
    {
      ...Config.get('proxy'),
      env: Config.get('env') as ServerEnvironment,
      openid: Config.get('openid'),
      pubsub: Config.get('pubsub')
    },
    logger,
    metrics,
    webhookService
  );
  try {
    await server.start();
  } catch (err) {
    logger.error('startup', { err });
    process.exit(1);
  }

  process.on('uncaughtException', err => {
    logger.error('uncaughtException', { err });
    process.exit(8);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('unhandledRejection', { error: reason });
    process.exit(8);
  });
  process.on('SIGINT', shutdown);

  function shutdown() {
    server.stop({ timeout: 10_000 }).then(() => {
      process.exit(0);
    });
  }
}

if (require.main === module) {
  main();
}
