/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = function(log) {
  return function start(messageQueue, push, db) {
    function handleProfileUpdated(message) {
      const uid = message && message.uid;

      log.info('handleProfileUpdated', { uid, action: 'notify' });

      return db
        .devices(uid)
        .then(devices => push.notifyProfileUpdated(uid, devices))
        .catch(err =>
          log.error('handleProfileUpdated', {
            uid,
            action: 'error',
            err,
            stack: err && err.stack,
          })
        )
        .then(() => {
          log.info('handleProfileUpdated', { uid, action: 'delete' });
          // We always delete the message, we are not really mission critical
          message.del();
        });
    }

    messageQueue.on('data', handleProfileUpdated);
    messageQueue.start();

    return {
      messageQueue: messageQueue,
      handleProfileUpdated: handleProfileUpdated,
    };
  };
};
