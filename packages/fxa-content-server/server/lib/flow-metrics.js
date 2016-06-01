/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto');

module.exports = function flowEventData(config, request) {

  var flowId = crypto.randomBytes(16).toString('hex');
  var flowBeginTime = Date.now();

  // Incorporate a hash of request metadata into the flow id,
  // so that receiving servers can cross-check the metrics bundle.

  var key = config.get('flow_id_key');
  var flowSignature = crypto.createHmac('sha256', key)
    .update([
      flowId,
      flowBeginTime.toString(16),
      request.headers['user-agent']
    ].join('\n'))
    .digest('hex')
    .substr(0, 32);

  return {
    flowBeginTime: flowBeginTime,
    flowId: flowId + flowSignature
  };
};
