/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = require('buf').to.hex;
const Joi = require('joi');
const P = require('../../promise');

const AppError = require('../../error');
const db = require('../../db');
const logger = require('../../logging')('routes.avatar.delete');
const notifyProfileUpdated = require('../../updates-queue');
const validate = require('../../validate');
const workers = require('../../img-workers');

const EMPTY = Object.create(null);
const FXA_PROVIDER = 'fxa';

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
  handler: function deleteAvatar(req, reply) {
    db.getAvatar(req.params.id)
      .then(function(avatar) {
        logger.debug('avatar', avatar);
        if (!avatar) {
          throw AppError.notFound();
        } else if (hex(avatar.userId) !== req.auth.credentials.user) {
          throw AppError.unauthorized('Avatar not owned by user');
        } else {
          return P.all([
            db.deleteAvatar(req.params.id),
            db.getProviderById(avatar.providerId)
          ]);
        }
      })
      .spread(function(_, provider) {
        logger.debug('provider', provider);
        if (provider.name === FXA_PROVIDER) {
          return workers.delete(req.params.id);
        }
      })
      .then(function () {
        var uid = req.auth.credentials.user;
        notifyProfileUpdated(uid); // Don't wait on promise
        return EMPTY;
      })
      .done(reply, reply);
  }
};


