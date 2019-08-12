/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const Joi = require('joi');

const MESSAGE_SCHEMA = Joi.object().keys({
  uid: Joi.string().required(),
  active: Joi.boolean().required(),
  subscriptionId: Joi.string().required(),
  productName: Joi.string(),
  eventId: Joi.string(),
  eventCreatedAt: Joi.number().integer(),
  messageCreatedAt: Joi.number()
    .integer()
    .required(),
  del: Joi.any(), // a method (function) that's added to messages
});

const MOCK_REQUEST = {
  async gatherMetricsContext() {},
};

function validateMessage(message) {
  return Joi.validate(message, MESSAGE_SCHEMA);
}

module.exports = function(log, config) {
  return function start(messageQueue, db, mailer) {
    async function handleSubHubUpdates(message) {
      const uid = message && message.uid;

      log.info('handleSubHubUpdated', { uid, action: 'notify' });

      const result = validateMessage(message);
      if (result.error) {
        log.error('handleSubHubUpdates', {
          uid,
          action: 'validate',
          validationError: result.error,
        });
        message.del();
        return;
      }

      try {
        let suppressNotification = false;

        if (message.active) {
          await db.createAccountSubscription(
            uid,
            message.subscriptionId,
            message.productName,
            message.eventCreatedAt
          );
          const account = await db.account(uid);
          await mailer.sendDownloadSubscription(account.emails, {
            acceptLanguage: account.locale,
            productId: message.productName,
            uid: account.uid,
          });
        } else {
          const existing = await db.getAccountSubscription(
            uid,
            message.subscriptionId
          );
          if (existing && existing.createdAt >= message.eventCreatedAt) {
            suppressNotification = true;
            log.warn('handleSubHubUpdate', {
              uid,
              action: 'ignoreDelete',
              eventCreatedAt: message.eventCreatedAt,
              subscriptionCreatedAt: existing.createdAt,
            });
          } else {
            await db.deleteAccountSubscription(uid, message.subscriptionId);
            log.info('handleSubHubUpdated', { uid, action: 'delete' });
          }
        }

        if (!suppressNotification) {
          await log.notifyAttachedServices(
            'subscription:update',
            MOCK_REQUEST,
            {
              uid,
              eventCreatedAt: message.eventCreatedAt,
              subscriptionId: message.subscriptionId,
              isActive: message.active,
              productName: message.productName,
              productCapabilities:
                config.subscriptions.productCapabilities[message.productName] ||
                [],
            }
          );
        }

        message.del();
      } catch (err) {
        log.error('handleSubHubUpdated', {
          uid,
          action: 'error',
          err,
          stack: err && err.stack,
        });
        throw err;
      }
    }

    messageQueue.on('data', handleSubHubUpdates);
    messageQueue.start();

    return {
      messageQueue,
      handleSubHubUpdates,
    };
  };
};
