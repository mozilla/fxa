/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = require('buf').to.hex;
const Joi = require('joi');

const AppError = require('../../error');
const db = require('../../db');
const validate = require('../../validate');

const EMPTY = Object.create(null);

function empty() {
  return EMPTY;
}

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:write', 'profile:avatar:write']
  },
  validate: {
    params: {
      id: Joi.string()
        .length(32)
        .regex(validate.hex)
        .required()
    }
  },
  handler: function avatar(req, reply) {
    db.getAvatar(req.params.id)
      .then(function(avatar) {
        if (!avatar) {
          throw AppError.notFound();
        } else if (hex(avatar.userId) !== req.auth.credentials.user) {
          throw AppError.unauthorized('Avatar not owned by user');
        } else {
          return db.deleteAvatar(req.params.id);
        }
      })
      .then(empty)
      .done(reply, reply);
  }
};


