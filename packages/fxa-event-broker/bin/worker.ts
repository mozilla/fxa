/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
const db = Config.get('firestore.enabled')
  ? createDatastore(FirestoreDatastore, Config.get('firestore'))
  : createDatastore(InMemoryDatastore, {});

const processor = new ServiceNotificationProcessor(
  logger,
  db,
  Config.get('serviceNotificationQueueUrl'),
  new SQS()
);
processor.start();
