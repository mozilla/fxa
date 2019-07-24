/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PubSub } from '@google-cloud/pubsub';
import { SQS } from 'aws-sdk';
import * as mozlog from 'mozlog';

import Config from '../config';
import { createDatastore, FirestoreDatastore, InMemoryDatastore } from '../lib/db';
import { ServiceNotificationProcessor } from '../lib/notificationProcessor';
import * as proxyServer from '../lib/proxy-server';
import { ClientCapabilityService } from '../lib/selfUpdatingService/clientCapabilityService';
import { ClientWebhookService } from '../lib/selfUpdatingService/clientWebhookService';

const logger = mozlog(Config.get('log'))('notificationProcessor');

const firestoreConfig = Config.get('firestore');
const firestoreEnabled = firestoreConfig.enabled;
delete firestoreConfig.enabled;

const db = firestoreEnabled
  ? createDatastore(FirestoreDatastore, firestoreConfig)
  : createDatastore(InMemoryDatastore, {});

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
  const processor = new ServiceNotificationProcessor(
    logger,
    db,
    Config.get('serviceNotificationQueueUrl'),
    new SQS(),
    capabilityService,
    webhookService,
    pubsub
  );
  logger.info('startup', { message: 'Starting event broker...' });
  processor.start();
  logger.info('startup', { message: 'Starting proxy server...' });
  const server = await proxyServer.init(
    { ...Config.get('proxy'), openid: Config.get('openid'), pubsub: Config.get('pubsub') },
    logger,
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

main();
