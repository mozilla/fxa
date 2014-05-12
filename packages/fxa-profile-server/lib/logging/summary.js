/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = require('./').getLogger('fxa.summary');

module.exports = function summary(request, response) {
  if (request.method === 'options') {
    return;
  }

  var line = {
    code: response.isBoom ? response.output.statusCode : response.statusCode,
    errno: response.errno || 0,
    path: request.path,
    agent: request.headers['user-agent'],
    t: Date.now() - request.info.received
  };

  if (line.code >= 500) {
    line.stack = response.stack;
    logger.error(line);
  } else {
    logger.info(line);
  }
};

