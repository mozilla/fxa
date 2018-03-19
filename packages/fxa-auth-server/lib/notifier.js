/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

/**
 * This notifier is called by the logger via `notifyAttachedServices`
 * to send notifications to Amazon SNS/SQS.
 */
const AWS = require('aws-sdk')
const config = require('../config')

const notifierSnsTopicArn = config.get('snsTopicArn')
let sns = { publish: function (msg, cb) {
  cb(null, {disabled: true})
}}

if (notifierSnsTopicArn !== 'disabled') {
  // Pull the region info out of the topic arn.
  // For some reason we need to pass this in explicitly.
  // Format is "arn:aws:sns:<region>:<other junk>"
  const region = notifierSnsTopicArn.split(':')[3]
  // This will pull in default credentials, region data etc
  // from the metadata service available to the instance.
  // It's magic, and it's awesome.
  sns = new AWS.SNS({region: region})
}

module.exports = function notifierLog(log) {
  return {
    send: (event, callback) => {
      const msg = event.data || {}
      msg.event = event.event

      sns.publish({
        TopicArn: notifierSnsTopicArn,
        Message: JSON.stringify(msg)
      }, (err, data) => {
        if (err) {
          log.error({op: 'Notifier.publish', err: err})
        } else {
          log.trace({op: 'Notifier.publish', success: true, data: data})
        }

        if (callback) {
          callback(err, data)
        }
      })

    },
    // exported for testing purposes
    __sns: sns
  }
}
