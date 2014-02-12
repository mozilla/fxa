/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Boom = require('hapi').error;

//const db = require('../db');

module.exports = {
  auth: {
    strategy: 'userid'
  },
  payload: {
    allow: [
      'image/png',
      'image/jpeg'
    ],
    output: 'stream',
    parse: false
  },
  handler: function avatarPost(req, reply) {
    reply(Boom.notImplemented());
  }
};
