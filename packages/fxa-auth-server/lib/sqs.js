/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const AWS = require('aws-sdk');
const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const URL = require('url').URL;

module.exports = function(log, statsd) {
  function SQSReceiver(region, urls) {
    this.sqs = new AWS.SQS({ region: region });
    this.queueUrls = urls || [];
    EventEmitter.call(this);
  }
  inherits(SQSReceiver, EventEmitter);

  SQSReceiver.prototype.fetch = function(url) {
    // For statsd metrics, we want the queue name as part of the stat name
    let queueName;
    if (statsd) {
      const queueUrl = new URL(url);
      queueName = queueUrl.pathname.split('/').pop();
    }
    let errTimer = null;
    const receiveStartTime = Date.now();

    this.sqs.receiveMessage(
      {
        QueueUrl: url,
        AttributeNames: [],
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      },
      (err, data) => {
        if (statsd) {
          statsd.timing(
            `sqs.${queueName}.receive`,
            Date.now() - receiveStartTime
          );
        }
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
          const deleteStartTime = Date.now();
          this.sqs.deleteMessage(
            {
              QueueUrl: url,
              ReceiptHandle: message.ReceiptHandle,
            },
            err => {
              if (statsd) {
                statsd.timing(
                  `sqs.${queueName}.delete`,
                  Date.now() - deleteStartTime
                );
              }
              if (err) {
                log.error('deleteMessage', { err: err });
              }
            }
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
