/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('./config').getProperties();
const db = require('./db');
const P = require('./promise');
const env = require('./env');
const logger = require('./logging')('events');
const Sink = require('fxa-notifier-aws').Sink;
const HEX_STRING = require('./validators').HEX_STRING;

let fxaEvents;

if (!config.events.region || !config.events.queueUrl) {
  fxaEvents = {
    start: function start() {
      if (env.isProdLike() && config.events.enabled) {
        throw new Error('config.events must be included in prod');
      } else {
        logger.warn('accountEvent.unconfigured');
      }
    },
  };
} else {
  fxaEvents = new Sink(config.events.region, config.events.queueUrl);

  fxaEvents.on('data', message => {
    const messageEvent = message.event;
    const uid = message.uid;
    logger.verbose('data', message);
    logger.info(message.event, { uid: uid });

    if (!HEX_STRING.test(uid)) {
      message.del();
      return logger.warn('badDelete', { userId: uid });
    }

    return P.resolve()
      .then(() => {
        switch (messageEvent) {
          case 'delete':
            return db.removeUser(uid);
          case 'reset':
          case 'passwordChange':
            return db.removePublicAndCanGrantTokens(uid);
          default:
            return;
        }
      })
      .done(
        () => {
          message.del();
        },
        err => {
          logger.error(message.event, err);
        }
      );
  });

  fxaEvents.on('error', err => logger.error('accountEvent', err));
  fxaEvents.start = fxaEvents.fetch;
}

module.exports = fxaEvents;
