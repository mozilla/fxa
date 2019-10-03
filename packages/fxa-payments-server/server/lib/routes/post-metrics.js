/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const amplitude = require('../amplitude');

module.exports = {
  method: 'post',
  path: '/metrics',

  handler(request, response) {
    if (!validate(request.body)) {
      return response.status(400).end();
    }

    const { data, events } = request.body;
    events.forEach(event => amplitude(event, request, data));
    response.status(200).end();
  },
};

function validate(body) {
  // TODO: replace this with JSON schema or hapi or whatever
  return (
    body.data &&
    typeof body.data === 'object' &&
    !Array.isArray(body.data) &&
    Array.isArray(body.events) &&
    body.events.every(event => typeof event === 'string')
  );
}
