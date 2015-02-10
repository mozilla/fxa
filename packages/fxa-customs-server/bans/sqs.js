/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var AWS = require('aws-sdk')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

module.exports = function (log) {

  function SQSBanQueue(config) {
    this.sqs = new AWS.SQS({ region : config.region })
    this.queueUrl = config.queueUrl
    EventEmitter.call(this)
  }
  inherits(SQSBanQueue, EventEmitter)

  function checkDeleteError(err) {
    if (err) {
      log.error({ op: 'sqs.deleteMessage', err: err })
    }
  }

  SQSBanQueue.prototype.fetch = function (url) {
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
          log.error({ op: 'sqs.fetch', url: url, err: err })
          if (!errTimer) {
            // unacceptable! this aws lib will call the callback
            // more than once with different errors.
            errTimer = setTimeout(this.fetch.bind(this, url), 2000)
          }
          return
        }
        data.Messages = data.Messages || []
        for (var i = 0; i < data.Messages.length; i++) {
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
          catch (e) {
            log.error({ op: 'sqs.fetch.parse', message: msg.Body, err: e })
          }
        }
        this.fetch(url)
      }.bind(this)
    )
  }

  SQSBanQueue.prototype.start = function () {
    this.fetch(this.queueUrl)
  }

  return SQSBanQueue
}
