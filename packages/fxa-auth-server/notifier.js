/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Utilty for sending account-event notifications into SNS.
// We will eventually replace this with a downstream solution based
// on e.g. heka, but doing it in the app is easier to get up and
// running for now.  Expect this code to go away in the future.

module.exports = function(config, log) {

  // By default we don't publish any notifications.
  // It's only enabled by a config setting in production.
  var publish = function(){}

  if (config.snsTopicArn) {

    var AWS = require('aws-sdk')
 
    // Pull the region info out of the topic arn.
    // For some reason we need to pass this in explicitly.
    // Format is "arn:aws:sns:<region>:<other junk>"
    var region = config.snsTopicArn.split(':')[3]

    // This will pull in default credentials, region data etc
    // from the metadata service available to the instance.
    // It's magic, and it's awesome.
    var sns = new AWS.SNS({ region: region });
    
    // Publishing notificatios is fire-and-forget.
    // We'll log any errors but not surface them to the app.
    publish = function(msg) {
      sns.publish({
        TopicArn: config.snsTopicArn,
        Message: JSON.stringify(msg),
      }, function(err) {
        if (err) {
          log.error({ op: 'Notifier.publish', err: err })
        }
      })
    }
  }

  return {
    publish: publish
  }
}
