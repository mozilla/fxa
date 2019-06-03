/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { SQS } from 'aws-sdk';
import { Logger } from 'mozlog';
import { Consumer } from 'sqs-consumer';
import * as joi from 'typesafe-joi';

import { Datastore } from './db';

// Event strings
const LOGIN_EVENT = 'login';
const SUBSCRIPTION_UPDATE_EVENT = 'subscription:update';

// Message schemas
const BASE_MESSAGE_SCHEMA = joi
  .object()
  .keys({
    event: joi.string().required(),
    uid: joi.string().required()
  })
  .unknown(true)
  .required();

const LOGIN_SCHEMA = joi
  .object()
  .keys({
    clientId: joi.string().required(),
    deviceCount: joi
      .number()
      .integer()
      .required(),
    email: joi.string().required(),
    event: joi
      .string()
      .valid(LOGIN_EVENT)
      .required(),
    service: joi.string().required(),
    uid: joi.string().required(),
    userAgent: joi.string().required()
  })
  .unknown(true)
  .required();

const SUBSCRIPTION_UPDATE_SCHEMA = joi
  .object()
  .keys({
    event: joi
      .string()
      .valid(SUBSCRIPTION_UPDATE_EVENT)
      .required(),
    isActive: joi.bool().required(),
    productCapabilities: joi
      .array()
      .items(joi.string())
      .required(),
    productName: joi.string().required(),
    subscriptionId: joi.string().required(),
    uid: joi.string().required()
  })
  .unknown(true)
  .required();

class ServiceNotificationProcessor {
  public readonly app: Consumer;
  private readonly db: Datastore;
  private readonly logger: Logger;

  constructor(logger: Logger, db: Datastore, queueUrl: string, sqs: SQS) {
    this.db = db;
    this.logger = logger;
    this.app = Consumer.create({
      handleMessage: async (message: SQS.Message) => {
        return await this.handleMessage(message);
      },
      queueUrl,
      sqs
    });
    this.app.on('error', err => {
      logger.error('consumerError', { err });
    });

    this.app.on('processing_error', err => {
      logger.error('processingError', { err });
    });
  }

  public start() {
    this.app.start();
  }

  public stop() {
    this.app.stop();
  }

  private async handleMessage(sqsMessage: SQS.Message) {
    const body = JSON.parse(sqsMessage.Body || '{}');
    const message = joi.attempt(JSON.parse(body.Message), BASE_MESSAGE_SCHEMA);
    switch (message.event) {
      case LOGIN_EVENT: {
        const loginMessage = joi.attempt(message, LOGIN_SCHEMA);
        await this.db.storeLogin(loginMessage.uid, loginMessage.clientId);
        return;
      }
      case SUBSCRIPTION_UPDATE_EVENT: {
        const subMessage = joi.attempt(message, SUBSCRIPTION_UPDATE_SCHEMA);
        const clientIds = await this.db.fetchClientIds(subMessage.uid);
        // TODO: Queue a subscription event for each clientId for delivery.
        return;
      }
    }
    // Anything that isn't a message we want
    this.logger.debug('unwantedMessage', { message });
  }
}

export { ServiceNotificationProcessor };
