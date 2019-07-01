/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const AWS = require('aws-sdk');
const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;

module.exports = function(log) {
  function SQSReceiver(region, urls) {
    this.sqs = new AWS.SQS({ region: region });
    this.queueUrls = urls || [];
    EventEmitter.call(this);
  }
  inherits(SQSReceiver, EventEmitter);

  function checkDeleteError(err) {
    if (err) {
      log.error('deleteMessage', { err: err });
    }
  }

  SQSReceiver.prototype.fetch = function(url) {
    let errTimer = null;
    this.sqs.receiveMessage(
      {
        QueueUrl: url,
        AttributeNames: [],
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      },
      (err, data) => {
        if (err) {
          log.error('fetch', { url: url, err: err });
          if (!errTimer) {
            // unacceptable! this aws lib will call the callback
            // more than once with different errors. ಠ_ಠ
            errTimer = setTimeout(this.fetch.bind(this, url), 2000);
          }
          return;
        }
        function deleteMessage(message) {
          this.sqs.deleteMessage(
            {
              QueueUrl: url,
              ReceiptHandle: message.ReceiptHandle,
            },
            checkDeleteError
          );
        }
        data.Messages = data.Messages || [];
        for (let i = 0; i < data.Messages.length; i++) {
          const msg = data.Messages[i];
          const deleteFromQueue = deleteMessage.bind(this, msg);
          try {
            const body = JSON.parse(msg.Body);
            const message = JSON.parse(body.Message);
            message.del = deleteFromQueue;
            this.emit('data', message);
          } catch (e) {
            log.error('fetch', { url: url, err: e });
            deleteFromQueue();
          }
        }
        this.fetch(url);
      }
    );
  };

  SQSReceiver.prototype.start = function() {
    for (let i = 0; i < this.queueUrls.length; i++) {
      this.fetch(this.queueUrls[i]);
    }
  };

  return SQSReceiver;
};
