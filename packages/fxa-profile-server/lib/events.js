/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Sink = require('fxa-notifier-aws').Sink;

const config = require('./config').getProperties();
const db = require('./db');
const env = require('./env');
const logger = require('./logging')('events');
const workers = require('./img-workers');

const HEX_STRING = require('./validate').hex;

module.exports = function(server) {
  function getUserId(message) {
    var userId = message.uid.split('@')[0];
    if (!HEX_STRING.test(userId)) {
      message.del();
      logger.warn('getUserId', { userId: userId });
      throw Error('Unable get uid from message event ' + message.event);
    }

    return userId;
  }

  async function deleteUser(message) {
    const userId = getUserId(message);

    await Promise.all([
      db.getSelectedAvatar(userId).then(function(avatar) {
        if (avatar) {
          // if there is an avatar set then also delete it
          return workers.delete(avatar.id).then(function() {
            return db.deleteAvatar(avatar.id);
          });
        }
      }),
      db.removeProfile(userId),
    ]);

    logger.info(message.event, { uid: userId });
  }

  async function primaryEmailChanged(message) {
    const userId = getUserId(message);
    logger.info(message.event, { uid: userId });
    await server.methods.profileCache.drop(userId);
    logger.info('primaryEmailChanged:cacheCleared', { uid: userId });
  }

  async function profileDataChanged(message) {
    const userId = getUserId(message);
    logger.info(message.event, { uid: userId });
    await server.methods.profileCache.drop(userId);
    logger.info('profileDataChanged:cacheCleared', { uid: userId });
  }

  function onData(message) {
    logger.verbose('data', message);
    var messageEvent = message.event;
    return Promise.resolve()
      .then(function() {
        switch (messageEvent) {
          case 'delete':
            return deleteUser(message);
          case 'primaryEmailChanged':
            return primaryEmailChanged(message);
          case 'profileDataChanged':
            return profileDataChanged(message);
          default:
            return;
        }
      })
      .then(
        function() {
          message.del();
        },
        function(err) {
          logger.error(message.event, err);
          // The message visibility timeout (in SQS terms) will expire
          // and be reissued again.
        }
      );
  }

  function onError(err) {
    logger.error('accountEvent', err);
  }

  function start() {
    if (!config.events.region || !config.events.queueUrl) {
      if (env.isProdLike() && config.events.enabled) {
        throw new Error('config.events must be included in prod');
      } else {
        logger.warn('accountEvent.unconfigured');
      }
    } else {
      var fxaEvents = new Sink(config.events.region, config.events.queueUrl);
      fxaEvents.on('data', onData);
      fxaEvents.on('error', onError);
      fxaEvents.fetch();
    }
  }

  return {
    start: start,
    onError: onError,
    onData: onData,
  };
};
