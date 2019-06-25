/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = require('./')('server');

module.exports = function summary(request, response) {
  if (request.method === 'options') {
    return;
  }

  var line = {
    code: response.isBoom ? response.output.statusCode : response.statusCode,
    method: request.method,
    errno: response.errno || 0,
    path: request.path,
    agent: request.headers['user-agent'],
    t: Date.now() - request.info.received,
    remoteAddressChain: request.app.remoteAddressChain,
  };

  if (request.auth && request.auth.credentials) {
    line.client_id = request.auth.credentials.client_id;
  }

  if (line.code >= 500) {
    line.stack = response.stack;
    logger.error('summary', line);
  } else {
    logger.info('summary', line);
  }
};
