/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');
const db = require('../../db');

const EMPTY = Object.create(null);

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:write', 'profile:display_name:write']
  },
  validate: {
    payload: {
      displayName: Joi.string().required().allow('')
    }
  },
  handler: function avatarPost(req, reply) {
    var uid = req.auth.credentials.user;
    var payload = req.payload;
    db.setDisplayName(uid, payload.displayName)
      .then(function () { return EMPTY; })
      .done(reply, reply);
  }
};

