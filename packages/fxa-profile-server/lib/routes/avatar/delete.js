/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = require('buf').to.hex;
const Joi = require('joi');
const P = require('../../promise');

const AppError = require('../../error');
const config = require('../../config');
const db = require('../../db');
const logger = require('../../logging')('routes.avatar.delete');
const notifyProfileUpdated = require('../../updates-queue');
const validate = require('../../validate');
const workers = require('../../img-workers');

const DEFAULT_AVATAR_ID = config.get('img.defaultAvatarId');
const EMPTY = Object.create(null);
const FXA_PROVIDER = 'fxa';

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:avatar:write'],
  },
  validate: {
    params: {
      id: Joi.string()
        .length(32)
        .regex(validate.hex)
        .optional(),
    },
  },
  handler: function deleteAvatar(req, reply) {
    if (req.params.id === DEFAULT_AVATAR_ID) {
      // if we are clearing the default avatar then do nothing
      return reply({});
    }

    const uid = req.auth.credentials.user;
    let avatar, lookup;

    req.server.methods.profileCache.drop(uid, () => {
      if (req.params.id) {
        lookup = getAvatar(req.params.id, uid);
      } else {
        lookup = getSelectedAvatar(uid);
      }

      return lookup
        .then(av => {
          avatar = av;
          return P.all([
            db.deleteAvatar(avatar.id),
            db.getProviderById(avatar.providerId),
          ]);
        })
        .spread((_, provider) => {
          logger.debug('provider', provider);
          if (provider.name === FXA_PROVIDER) {
            return workers.delete(avatar.id);
          }
        })
        .then(() => {
          notifyProfileUpdated(uid); // Don't wait on promise
          return EMPTY;
        })
        .done(reply, reply);
    });
  },
};

function getAvatar(id, uid) {
  return db.getAvatar(id).then(function(avatar) {
    logger.debug('avatar', avatar);
    if (! avatar) {
      throw AppError.notFound();
    } else if (hex(avatar.userId) !== uid) {
      throw AppError.unauthorized('Avatar not owned by user');
    } else {
      return avatar;
    }
  });
}

function getSelectedAvatar(uid) {
  return db.getSelectedAvatar(uid).then(function(avatar) {
    if (avatar) {
      return avatar;
    } else {
      throw AppError.notFound();
    }
  });
}
