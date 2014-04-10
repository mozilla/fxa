/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var handleBounces = require('./handler')

module.exports = function (log) {

  var BounceQueue = require('./sqs')(log)

  return function start(config, db) {
    var bounceQueue = new BounceQueue(config)
    bounceQueue.on('data', handleBounces(db, log))
    bounceQueue.start()
    return bounceQueue
  }
}
