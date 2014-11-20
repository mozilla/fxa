/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = require('./')('summary');

module.exports = function summary(request, response) {
  if (request.method === 'options') {
    return;
  }
  var payload = request.payload || {};
  var query = request.query || {};
  var params = request.params || {};

  var auth = request.auth && request.auth.credentials && {
    user: request.auth.credentials.user,
    scope: request.auth.credentials.scope
  };

  var line = {
    code: response.isBoom ? response.output.statusCode : response.statusCode,
    errno: response.errno || 0,
    method: request.method,
    path: request.path,
    agent: request.headers['user-agent'],
    t: Date.now() - request.info.received,
    /*jshint camelcase: false*/
    client_id: payload.client_id || query.client_id || params.client_id,
    auth: auth,
    payload: Object.keys(payload)
  };

  if (line.code >= 500) {
    line.stack = response.stack;
    logger.error('summary', line);
  } else {
    logger.info('summary', line);
  }
};
