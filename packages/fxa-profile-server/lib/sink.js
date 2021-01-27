/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const AWS = require('aws-sdk');
const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;

function Sink(region, url) {
  this.sqs = new AWS.SQS({ region: region });
  this.url = url;
  this.errTimer = null;
  this.onMessageReceived = messageReceived.bind(this);
  this.onMessageDeleted = messageDeleted.bind(this);
  EventEmitter.call(this);
}
inherits(Sink, EventEmitter);

function messageDeleted(err) {
  if (err) {
    this.emit('error', err);
  }
}

function deleteMessage(message) {
  this.sqs.deleteMessage(
    {
      QueueUrl: this.url,
      ReceiptHandle: message.ReceiptHandle,
    },
    this.onMessageDeleted
  );
}

function messageReceived(err, data) {
  if (err) {
    return this.errorReceived(err);
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
      this.emit('error', e);
      deleteFromQueue();
    }
  }
  this.fetch();
}

Sink.prototype.errorReceived = function (err) {
  clearTimeout(this.errTimer);
  this.errTimer = setTimeout(this.fetch.bind(this), 2000);
  this.emit('error', err);
};

Sink.prototype.fetch = function () {
  this.sqs.receiveMessage(
    {
      QueueUrl: this.url,
      AttributeNames: [],
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    },
    this.onMessageReceived
  );
};

module.exports = Sink;
