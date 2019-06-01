/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PubSub } from '@google-cloud/pubsub';
import { SQS } from 'aws-sdk';
import * as mozlog from 'mozlog';

import Config from '../config';
import { createDatastore, FirestoreDatastore, InMemoryDatastore } from '../lib/db';
import { ServiceNotificationProcessor } from '../lib/notificationProcessor';
import { ClientCapabilityService } from '../lib/selfUpdatingService/clientCapabilityService';
import { ClientWebhookService } from '../lib/selfUpdatingService/clientWebhookService';

const logger = mozlog(Config.get('log'))('notificationProcessor');

const firestoreConfig = Config.get('firestore');
const firestoreEnabled = firestoreConfig.enabled;
delete firestoreConfig.enabled;

const db = firestoreEnabled
  ? createDatastore(FirestoreDatastore, firestoreConfig)
  : createDatastore(InMemoryDatastore, {});

const capabilityService = new ClientCapabilityService(logger, Config.get('clientCapabilityFetch'));
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
