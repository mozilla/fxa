/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const Joi = require('@hapi/joi');
const Sentry = require('@sentry/node');

const MESSAGE_SCHEMA = Joi.object()
  .keys({
    uid: Joi.string().required(),
    active: Joi.boolean().required(),
    subscriptionId: Joi.string().required(),
    productId: Joi.string(),
    eventId: Joi.string(),
    eventCreatedAt: Joi.number().integer(),
    messageCreatedAt: Joi.number()
      .integer()
      .required(),
    del: Joi.any(), // a method (function) that's added to messages
  })
  .unknown(true);

const MOCK_REQUEST = {
  async gatherMetricsContext() {},
};

function validateMessage(message) {
  return Joi.validate(message, MESSAGE_SCHEMA);
}

/**
 * SQS Processor for SubHub Messages
 *
 * Note: In the event that Sentry fails to record messages that must be
 *       handled, we rely on SubHub replaying the possibly lost event
 *       stream to restore consistency.
 */
class SubHubMessageProcessor {
  constructor(log, config, db, profile) {
    this.log = log;
    this.config = config;
    this.db = db;
    this.profile = profile;
  }

  /**
   * Report to Sentry and log a message that will be deleted.
   *
   * @param {object} message SQS message payload.
   * @param {Error} error Error to log and send to Sentry.
   */
  reportDeletedMessage(message, error) {
    Sentry.withScope(scope => {
      scope.setExtras({ message, sqs_message_deleted: true });
      Sentry.captureException(error);
    });
    this.log.error('handleSubHubUpdated', {
      uid: message.uid,
      action: 'validationError',
      message,
    });
    message.del();
  }

  /**
   * Handle SubHub Message Updates
   *
   * Processes a SubHub message to activate or deactivate a users
   * subscription.
   *
   * @param {object} message SQS message payload to process
   */
  async handleSubHubUpdates(message) {
    const uid = message && message.uid;

    this.log.trace('handleSubHubUpdated', { uid, action: 'notify', message });

    const result = validateMessage(message);
    if (result.error) {
      // Invalid messages are reported and deleted.
      return this.reportDeletedMessage(message, result.error);
    }
    let existing;

    try {
      existing = await this.db.getAccountSubscription(
        uid,
        message.subscriptionId
      );
    } catch (err) {
      // Sentry report the error if this user wasn't found and delete the
      // message.
      if (err.statusCode !== 404) {
        return this.reportDeletedMessage(message, err);
      }
    }

    // The createdAt in our db always has milliseconds, so we compare and store
    // this value in milliseconds as this Stripe value is in seconds.
    const messageCreatedAt = message.eventCreatedAt * 1000;

    // Don't process a message if it's older than our existing record.
    // Note: We intentionally may reprocess a message to ensure the change
    //       has propagated.
    if (existing && existing.createdAt > messageCreatedAt) {
      this.log.warn('handleSubHubUpdate', {
        uid,
        action: 'ignoreChange',
        eventCreatedAt: messageCreatedAt,
        subscriptionCreatedAt: existing.createdAt,
      });
      message.del();
      return;
    }

    if (message.active) {
      if (existing && existing.cancelledAt) {
        await this.db.reactivateAccountSubscription(
          uid,
          message.subscriptionId
        );
      } else if (existing) {
        // Existing account is already active.
      } else {
        await this.db.createAccountSubscription({
          uid,
          subscriptionId: message.subscriptionId,
          productId: message.productId,
          createdAt: messageCreatedAt,
        });
      }
    } else {
      if (existing) {
        await this.db.deleteAccountSubscription(uid, message.subscriptionId);
        this.log.info('handleSubHubUpdated', { uid, action: 'delete' });
      } else {
        // Non-existent records don't need to be deleted.
      }
    }

    await this.updateSystems(uid, message);
    message.del();
  }

  /**
   * Update profile server and notify other RPs of the state change.
   *
   * @param {string} uid
   * @param {object} message
   */
  async updateSystems(uid, message) {
    await this.profile.deleteCache(uid);
    await this.log.notifyAttachedServices('subscription:update', MOCK_REQUEST, {
      uid,
      eventCreatedAt: message.eventCreatedAt,
      subscriptionId: message.subscriptionId,
      isActive: message.active,
      productId: message.productId,
      productCapabilities:
        this.config.subscriptions.productCapabilities[message.productId] || [],
    });
  }

  /**
   * Start processing messages from the SQS Receiver.
   *
   * @param {SQSReceiver} messageQueue SQS queue to process messages from.
   */
  start(messageQueue) {
    messageQueue.on('data', message => this.handleSubHubUpdates(message));
    messageQueue.start();
  }
}

module.exports = SubHubMessageProcessor;
