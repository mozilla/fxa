/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('./../promise')

module.exports = function (log) {

  return function start(messageQueue, push) {

    function handleProfileUpdated(message) {
      return new P(resolve => {
        resolve(push.notifyProfileUpdated(message.uid))
      })
      .catch(function(err) {
        log.error({ op: 'handleProfileUpdated', err: err })
      })
      .then(function () {
         // We always delete the message, we are not really mission critical
        message.del()
      })
    }

    messageQueue.on('data', handleProfileUpdated)
    messageQueue.start()

    return {
      messageQueue: messageQueue,
      handleProfileUpdated: handleProfileUpdated
    }
  }
}
