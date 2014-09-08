/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const db = require('../../db');
const hex = require('buf').to.hex;
const validate = require('../../validate');

const EMPTY = Object.create(null);
function avatarOrEmpty(avatar) {
  if (avatar) {
    return {
      id: hex(avatar.id),
      avatar: avatar.url
    };
  }
  return EMPTY;
}

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile', 'profile:avatar']
  },
  response: {
    schema: {
      id: Joi.string()
        .regex(validate.hex)
        .length(32),
      avatar: Joi.string().max(256)
    }
  },
  handler: function avatar(req, reply) {
    db.getSelectedAvatar(req.auth.credentials.user)
      .then(avatarOrEmpty)
      .done(reply, reply);
  }
};

