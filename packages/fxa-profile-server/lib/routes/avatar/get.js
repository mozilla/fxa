/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const db = require('../../db');
const config = require('../../config');
const hex = require('buf').to.hex;
const validate = require('../../validate');
const logger = require('../../logging')('routes.avatar.get');
const avatarShared = require('./_shared');

const DEFAULT_AVATAR = {
  avatar: avatarShared.fxaUrl(config.get('img.defaultAvatarId')),
  avatarDefault: true,
  id: config.get('img.defaultAvatarId'),
};

function avatarOrDefault(avatar) {
  if (avatar) {
    return {
      avatar: avatar.url,
      avatarDefault: false,
      id: hex(avatar.id),
    };
  }
  return DEFAULT_AVATAR;
}

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:avatar'],
  },
  response: {
    schema: {
      id: Joi.string()
        .regex(validate.hex)
        .length(32),
      avatarDefault: Joi.boolean(),
      avatar: Joi.string().max(256),
    },
  },
  handler: async function avatar(req, h) {
    var uid = req.auth.credentials.user;
    return db.getSelectedAvatar(uid)
      .then(avatarOrDefault)
      .then(function(result) {
        var rep = result;
        if (result.id) {
          var info = {
            event: 'avatar.get',
            uid: uid,
          };
          logger.info('activityEvent', info);
          rep = h.response(result).etag(result.id);
        }
        return rep;
      });
  },
};
