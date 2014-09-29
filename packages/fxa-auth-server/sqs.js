/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var AWS = require('aws-sdk')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

module.exports = function (log) {

  function SQSReceiver(region, urls) {
    this.sqs = new AWS.SQS({ region : region })
    this.queueUrls = urls || []
    EventEmitter.call(this)
  }
  inherits(SQSReceiver, EventEmitter)

  function checkDeleteError(err) {
    if (err) {
      log.error({ op: 'deleteMessage', err: err })
    }
  }

  SQSReceiver.prototype.fetch = function (url) {
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
        function deleteMessage(message) {
          this.sqs.deleteMessage(
            {
              QueueUrl: url,
              ReceiptHandle: message.ReceiptHandle
            },
            checkDeleteError
          )
        }
        data.Messages = data.Messages || []
        for (var i = 0; i < data.Messages.length; i++) {
          var msg = data.Messages[i]
          var deleteFromQueue = deleteMessage.bind(this, msg)
          try {
            var body = JSON.parse(msg.Body)
            var message = JSON.parse(body.Message)
            message.del = deleteFromQueue
            this.emit('data', message)
          }
          catch (e) {
            log.error({ op: 'fetch', url: url, err: e })
            deleteFromQueue()
          }
        }
        this.fetch(url)
      }.bind(this)
    )
  }

  SQSReceiver.prototype.start = function () {
    for (var i = 0; i < this.queueUrls.length; i++) {
      this.fetch(this.queueUrls[i])
    }
  }

  return SQSReceiver
}
