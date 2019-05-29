/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as firebase from '@firebase/testing';
import { Firestore } from '@google-cloud/firestore';
import * as AWS from 'aws-sdk';
import { SQS } from 'aws-sdk';
import * as mozlog from 'mozlog';

import Config from '../config';
import {
  createDatastore,
  FirestoreDatastore,
  InMemoryDatastore
} from '../lib/db';
import { ServiceNotificationProcessor } from '../lib/notificationProcessor';

const logger = mozlog(Config.get('log'))('notificationProcessor');

// This is a development only server
if (Config.get('env') !== 'development') {
  logger.error('workerDev', {
    message: 'NODE_ENV must be set to development to run the dev server'
  });
  process.exit(1);
}

const firestoreConfig = Config.get('firestore');
const firestoreEnabled = firestoreConfig.enabled;
delete firestoreConfig.enabled;

let db = firestoreEnabled
  ? createDatastore(FirestoreDatastore, firestoreConfig)
  : createDatastore(InMemoryDatastore, {});

async function main() {
  AWS.config.update({
    accessKeyId: 'fake',
    ['endpoint' as any]: 'localhost:4100',
    region: 'us-east-1',
    secretAccessKey: 'fake',
    sslEnabled: false
  });

  try {
    // Verify the queue exists
    const queueParts = Config.get('serviceNotificationQueueUrl').split('/');
    const queueName = queueParts[queueParts.length - 1];
    const sqs = new SQS();
    const queues = await sqs.listQueues().promise();

    if (!queues.QueueUrls || !queues.QueueUrls.includes(queueName)) {
      await sqs
        .createQueue({
          QueueName: queueName
        })
        .promise();
    }

    // Utilize the local firestore emulator if we were told to use it
    if (firestoreEnabled) {
      const app = firebase.initializeTestApp({
        auth: { uid: 'alice' },
        databaseName: 'my-database',
        projectId: 'fx-event-broker'
      });
      db = new FirestoreDatastore(
        firestoreConfig,
        (app.firestore() as unknown) as Firestore
      );
    }
  } catch (err) {
    logger.error('Error loading application:', { err });
    process.exit(1);
  }

  const processor = new ServiceNotificationProcessor(
    logger,
    db,
    Config.get('serviceNotificationQueueUrl'),
    new SQS()
  );
  logger.info('startup', { message: 'Starting event broker...' });
  processor.start();
}

main();
