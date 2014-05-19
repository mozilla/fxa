/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var logger = require('intel').getLogger('server.metrics');

module.exports = function() {
  var route = {};

  route.method = 'post';
  route.path = '/metrics';

  route.process = function(req, res) {

    logger.info('metrics:\n%s', JSON.stringify(req.body, null, 2));

    res.json({ success: true });
  };

  return route;
};
