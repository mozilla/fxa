/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/**
 * This notifier is called by the logger via `notifyAttachedServices`
 * to send notifications to Amazon SNS/SQS.
 */
const AWS = require('aws-sdk');
const config = require('../config');

const notifierSnsTopicArn = config.get('snsTopicArn');
const notifierSnsTopicEndpoint = config.get('snsTopicEndpoint');
let sns = {
  publish: function (msg, cb) {
    cb(null, { disabled: true });
  },
};

if (notifierSnsTopicArn !== 'disabled') {
  // Pull the region info out of the topic arn.
  // For some reason we need to pass this in explicitly.
  // Format is "arn:aws:sns:<region>:<other junk>"
  const region = notifierSnsTopicArn.split(':')[3];
  // This will pull in default credentials, region data etc
  // from the metadata service available to the instance.
  // It's magic, and it's awesome.
  sns = new AWS.SNS({ endpoint: notifierSnsTopicEndpoint, region: region });
}

function formatMessageAttributes(msg) {
  const attrs = {};
  attrs.event_type = {
    DataType: 'String',
    StringValue: msg.event,
  };
  if (msg.email) {
    attrs.email_domain = {
      DataType: 'String',
      StringValue: msg.email.split('@')[1],
    };
  }
  return attrs;
}

module.exports = function notifierLog(log, statsd) {
  return {
    send: (event, callback) => {
      const msg = event.data || {};
      msg.event = event.event;

      const startTime = Date.now();

      sns.publish(
        {
          TopicArn: notifierSnsTopicArn,
          Message: JSON.stringify(msg),
          MessageAttributes: formatMessageAttributes(msg),
        },
        (err, data) => {
          if (statsd) {
            statsd.timing('notifier.publish', Date.now() - startTime);
          }

          if (err) {
            log.error('Notifier.publish', { err: err });
          } else {
            log.trace('Notifier.publish', { success: true, data: data });
          }

          if (callback) {
            callback(err, data);
          }
        }
      );
    },
    // exported for testing purposes
    __sns: sns,
  };
};
