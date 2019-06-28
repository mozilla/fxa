/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const AWS = require('aws-sdk');
const P = require('./promise');

module.exports = function(logger) {
  function SQSSender(region, queueURL) {
    if (region === '' || queueURL === '') {
      logger.error(
        'SQSSender.send',
        'No SQS region or queueURL provided, SQS features will be disabled'
      );
      return;
    }
    this.sqs = new AWS.SQS({ region: region });
    this.queueUrl = queueURL;
  }

  SQSSender.prototype.send = function(body) {
    if (!this.sqs) {
      return;
    }
    return new P(
      function(resolve, reject) {
        var params = {
          MessageBody: JSON.stringify({ Message: JSON.stringify(body) }),
          QueueUrl: this.queueUrl,
        };
        this.sqs.sendMessage(params, function(err, data) {
          err ? reject(err) : resolve(data);
        });
      }.bind(this)
    ).catch(function(err) {
      logger.error('SQSSender.send', { op: 'send', body: body, err: err });
    });
  };

  return SQSSender;
};
