/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Sink = require('fxa-notifier-aws').Sink;
const P = require('./promise');

const config = require('./config').getProperties();
const db = require('./db');
const env = require('./env');
const logger = require('./logging')('events');
const workers = require('./img-workers');

const HEX_STRING = require('./validate').hex;

exports.onData = function onData(message) {
  logger.verbose('data', message);
  if (message.event === 'delete') {
    var userId = message.uid.split('@')[0];
    if (!HEX_STRING.test(userId)) {
      message.del();
      return logger.warn('badDelete', { userId: userId });
    }
    P.all([
      db.getSelectedAvatar(userId).then(function(avatar) {
        return workers.delete(avatar.id).then(function() {
          return db.deleteAvatar(avatar.id);
        });
      }),
      db.removeProfile(userId)
    ]).done(
      function () {
        logger.info('delete', { uid: userId });
        message.del();
      },
      function (err) {
        logger.error('removeUser', err);
        // The message visibility timeout (in SQS terms) will expire
        // and be reissued again.
      }
    );
  } else {
    message.del();
  }
};

exports.onError = function onError(err) {
  logger.error('accountEvent', err);
};

exports.start = function start() {
  if (!config.events.region || !config.events.queueUrl) {
    if (env.isProdLike()) {
      throw new Error('config.events must be included in prod');
    } else {
      logger.warn('accountEvent.unconfigured');
    }
  } else {
    var fxaEvents = new Sink(config.events.region, config.events.queueUrl);
    fxaEvents.on('data', exports.onData);
    fxaEvents.on('error', exports.onError);
    fxaEvents.fetch();
  }
};

