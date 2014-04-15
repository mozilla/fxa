/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var AWS = require('aws-sdk')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

module.exports = function (log) {

  function SQSBounceQueue(config) {
    this.sqs = new AWS.SQS({ region : config.region })
    this.bounceQueueUrl = config.bounceQueueUrl
    this.complaintQueueUrl = config.complaintQueueUrl
    EventEmitter.call(this)
  }
  inherits(SQSBounceQueue, EventEmitter)

  function checkDeleteError(err) {
    if (err) {
      log.error({ op: 'deleteMessage', err: err })
    }
  }

  SQSBounceQueue.prototype.fetch = function (url) {
    var errTimer = null
    this.sqs.receiveMessage(
      {
        QueueUrl: url,
        AttributeNames: [],
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20
      },
      function (err, data) {
        if (err) {
          log.error({ op: 'fetch', url: url, err: err })
          if (!errTimer) {
            // unacceptable! this aws lib will call the callback
            // more than once with different errors. ಠ_ಠ
            errTimer = setTimeout(this.fetch.bind(this, url), 2000)
          }
          return
        }
        data.Messages = data.Messages || []
        for (var i = 0; i < data.Messages.length; i++) {
          // yes, delete the message before processing. zero $&%@s given
          // why?
          // 1. if they're malformed we don't want them anyway
          // 2. bounces aren't super critical
          //   a. its ok if we don't handle them all perfectly
          //   b. so we can be more lax in our handling
          //   c. and use a simple event mechanism
          var msg = data.Messages[i]
          this.sqs.deleteMessage(
            {
              QueueUrl: url,
              ReceiptHandle: msg.ReceiptHandle
            },
            checkDeleteError
          )
          try {
            var body = JSON.parse(msg.Body)
            var message = JSON.parse(body.Message)
            this.emit('data', message)
          }
          catch (e) {}
        }
        this.fetch(url)
      }.bind(this)
    )
  }

  SQSBounceQueue.prototype.start = function () {
    this.fetch(this.bounceQueueUrl)
    this.fetch(this.complaintQueueUrl)
  }

  return SQSBounceQueue
}
