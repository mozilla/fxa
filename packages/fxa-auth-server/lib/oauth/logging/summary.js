/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = require('./')('summary');

function parsePayload(payload) {
  var payloadKeys = ['INVALID_PAYLOAD_OBJECT'];
  try {
    // given payload object might not be a valid object
    // See issue #410
    payloadKeys = Object.keys(payload);
  } catch (e) {
    // failed to parse payload keys.
  }
  return payloadKeys;
}

module.exports = function summary(request, response) {
  /*eslint complexity: [2, 12] */
  if (request.method === 'options') {
    return;
  }
  var payload = request.payload || {};
  var query = request.query || {};
  var params = request.params || {};

  var auth = request.auth &&
    request.auth.credentials && {
    user: request.auth.credentials.user,
    scope: request.auth.credentials.scope,
  };

  var line = {
    code: response.isBoom ? response.output.statusCode : response.statusCode,
    errno: response.errno || 0,
    method: request.method,
    path: request.path,
    agent: request.headers['user-agent'],
    t: Date.now() - request.info.received,
    client_id: payload.client_id || query.client_id || params.client_id,
    auth: auth,
    payload: parsePayload(payload),
    remoteAddressChain: request.app.remoteAddressChain,
  };

  if (line.code >= 500) {
    line.stack = response.stack;
    logger.error('summary', line);
  } else {
    logger.info('summary', line);
  }
};
