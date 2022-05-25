/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const db = require('../../db');
const hex = require('buf').to.hex;
const validate = require('../../validate');
const logger = require('../../logging')('routes.avatar.get');
const avatarShared = require('./_shared');

async function avatarOrDefault(uid) {
  const avatar = await db.getSelectedAvatar(uid);
  if (avatar) {
    return {
      avatar: avatar.url,
      avatarDefault: false,
      id: hex(avatar.id),
    };
  }
  return avatarShared.DEFAULT_AVATAR;
}

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:avatar'],
  },
  response: {
    schema: Joi.object({
      id: Joi.string().regex(validate.hex).length(32),
      avatarDefault: Joi.boolean(),
      avatar: Joi.string().max(256),
    }),
  },
  handler: async function avatar(req, h) {
    var uid = req.auth.credentials.user;
    const avatar = await avatarOrDefault(uid);
    logger.info('activityEvent', { event: 'avatar.get', uid });
    return h.response(avatar).etag(avatar.id);
  },
};
