/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

export default function (log) {
  return function start(messageQueue, push, db) {
    async function handleProfileUpdated(message) {
      const uid = message && message.uid;

      if (!uid) {
        throw new Error('uid missing from profile update message.');
      }

      log.info('handleProfileUpdated', { uid, action: 'notify' });

      try {
        const devices = await db.devices(uid);
        await push.notifyProfileUpdated(uid, devices);

        // Notify our RP/Event broker of profile-server based
        // updates (display name/avatar changes). The profile
        // server is also listening for these events but will only
        // clear its cache when received.
        await log.notifyAttachedServices(
          'profileDataChange',
          {},
          {
            uid,
          }
        );
      } catch (err) {
        log.error('handleProfileUpdated', {
          uid,
          action: 'error',
          err,
          stack: err && err.stack,
        });
      }
      log.info('handleProfileUpdated', { uid, action: 'delete' });
      // We always delete the message, we are not really mission critical
      message.del();
    }

    messageQueue.on('data', handleProfileUpdated);
    messageQueue.start();

    return {
      messageQueue: messageQueue,
      handleProfileUpdated: handleProfileUpdated,
    };
  };
};
