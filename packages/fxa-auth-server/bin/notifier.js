/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var split = require('binary-split')
var through = require('through')
var AWS = require('aws-sdk')
var log = require('../log')('info')
var snsTopicArn = ''
var sns = {
  publish: function (msg, cb) {
    cb('event before config')
  }
}

function init(config) {
  snsTopicArn = config.snsTopicArn
  log.level(config.log.level)
  if (snsTopicArn === 'disabled') {
    sns = { publish: function (msg, cb) { cb() }}
    return
  }
  // Pull the region info out of the topic arn.
  // For some reason we need to pass this in explicitly.
  // Format is "arn:aws:sns:<region>:<other junk>"
  var region = config.snsTopicArn.split(':')[3]
  // This will pull in default credentials, region data etc
  // from the metadata service available to the instance.
  // It's magic, and it's awesome.
  sns = new AWS.SNS({ region: region })
}

function handleEvent(json) {
  if (json.event === 'config') {
    init(json.data)
  }
  else {
    var msg = json.data
    msg.event = json.event
    sns.publish(
      {
        TopicArn: snsTopicArn,
        Message: JSON.stringify(msg)
      },
      function (err) {
        if (err) {
          log.error({ op: 'Notifier.publish', err: err })
        }
      }
    )
  }
}

process.stdin.pipe(split())
  .pipe(
    through(
      function (line) {
        // pass it on down the line
        process.stdout.write(line + '\n')
        try {
          this.emit('data', JSON.parse(line))
        }
        catch (e) {}
      }
    )
  )
  .on('data', handleEvent)
