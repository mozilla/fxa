/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Development version of event-broker that uses FxA daemons pm2 starts.
 *
 * @module
 */
import { Firestore } from '@google-cloud/firestore';
import { PubSub } from '@google-cloud/pubsub';
import * as grpc from '@grpc/grpc-js';
import AWS from 'aws-sdk';
import { SQS } from 'aws-sdk';
import { StatsD } from 'hot-shots';
import mozlog from 'mozlog';

import Config from '../config';
import { createDatastore, FirestoreDatastore, InMemoryDatastore } from '../lib/db';
import { ServiceNotificationProcessor } from '../lib/notificationProcessor';
import { proxyServerInit, ServerEnvironment } from '../lib/proxy-server';
import { ClientCapabilityService } from '../lib/selfUpdatingService/clientCapabilityService';
import { ClientWebhookService } from '../lib/selfUpdatingService/clientWebhookService';
import { configureHapiSentry, configureSentry } from '../lib/sentry';
import { version } from '../lib/version';

configureSentry({ enabled: false, release: version.version });

const NODE_ENV = Config.get('env');
const logger = mozlog(Config.get('log'))('notificationProcessor');

// This is a development only server
if (NODE_ENV === 'production') {
  logger.error('workerDev', {
    message: 'NODE_ENV must not be set to production to run the dev server'
  });
  process.exit(1);
}

const firestoreConfig = Config.get('firestore');
const firestoreEnabled = firestoreConfig.enabled;
delete firestoreConfig.enabled;

let db = firestoreEnabled
  ? createDatastore(FirestoreDatastore, firestoreConfig)
  : createDatastore(InMemoryDatastore, { clientWebhooks: Config.get('clientWebhooks') });

/**
 * Verify the topic configuration is setup properly to route subscriptions locally
 *
 * @param pubsub
 * @param proxyPort
 * @param webhookService
 */
async function verifyTopicConfig(
  pubsub: PubSub,
  proxyPort: number,
  webhookService: ClientWebhookService
) {
  // Start the service to grab the clientIds
  await webhookService.start();
  const clientCapabilities = webhookService.serviceData();
  const clientTopics = Object.keys(clientCapabilities).map(clientId => 'rpQueue-' + clientId);

  // Grab the topics we already have made
  const [topics] = await pubsub.getTopics();
  const existingTopics = topics
    .map(topic => topic.name.split('/').slice(-1)[0])
    .filter(name => clientTopics.includes(name));

  // Create a topic and subscription for each clientId we're missing a topic for
  const newTopics = clientTopics.filter(clientTopic => !existingTopics.includes(clientTopic));
  for (const clientTopic of newTopics) {
    const [topic] = await pubsub.createTopic(clientTopic);
    const clientId = clientTopic.slice('rpQueue-'.length);
    await topic.createSubscription(clientTopic + '-proxy', {
      pushEndpoint: `http://localhost:${proxyPort}/v1/proxy/${clientId}`
    });
  }
}

async function main() {
  AWS.config.update({ region: 'us-east-1' });

  if (NODE_ENV === 'development') {
    AWS.config.update({
      accessKeyId: 'fake',
      ['endpoint' as any]: 'localhost:4100',
      secretAccessKey: 'fake',
      sslEnabled: false
    });
  }

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
    if (firestoreEnabled && NODE_ENV === 'development') {
      const fstore = new Firestore({
        customHeaders: {
          Authorization: 'Bearer owner'
        },
        port: 9090,
        projectId: 'fx-event-broker',
        servicePath: 'localhost',
        sslCreds: grpc.credentials.createInsecure()
      });
      db = new FirestoreDatastore(firestoreConfig, fstore);
    }
  } catch (err) {
    logger.error('Error loading application:', { err });
    process.exit(1);
  }

  const capabilityService = new ClientCapabilityService(
    logger,
    Config.get('clientCapabilityFetch')
  );

  const webhookService = new ClientWebhookService(
    logger,
    Config.get('clientCapabilityFetch.refreshInterval'),
    db
  );

  const pubsub = new PubSub({ projectId: 'fxa-event-broker' });
  await verifyTopicConfig(pubsub, Config.get('proxy').port, webhookService);

  const metrics = new StatsD({ mock: true });

  const processor = new ServiceNotificationProcessor(
    logger,
    db,
    metrics,
    capabilityService,
    webhookService,
    pubsub,
    Config.get('topicPrefix'),
    Config.get('serviceNotificationQueueUrl'),
    new SQS()
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
  configureHapiSentry(server);
  await server.start();
}

main();
