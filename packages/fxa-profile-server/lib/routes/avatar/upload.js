/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');

const Joi = require('@hapi/joi');

const config = require('../../config');
const db = require('../../db');
const hex = require('buf').to.hex;
const img = require('../../img');
const notifyProfileUpdated = require('../../updates-queue');
const validate = require('../../validate');
const workers = require('../../img-workers');
const avatarShared = require('./_shared');

const FXA_PROVIDER = 'fxa';
const FXA_URL_TEMPLATE = config.get('img.url');
assert(
  FXA_URL_TEMPLATE.indexOf('{id}') !== -1,
  'img.url must contain the string "{id}"'
);
const DEFAULT_AVATAR_ID = config.get('img.defaultAvatarId');
assert(DEFAULT_AVATAR_ID.length === 32, 'img.default');

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:avatar:write'],
  },
  validate: {
    headers: Joi.object({
      'content-length': Joi.number().required(),
    }).unknown(),
  },
  payload: {
    output: 'stream',
    parse: false,
    allow: Object.keys(config.get('img.uploads.types')),
    maxBytes: config.get('img.uploads.maxSize'),
  },
  response: {
    schema: {
      id: Joi.string().regex(validate.hex).length(32),
      url: Joi.string().required(),
    },
  },
  handler: async function upload(req, h) {
    const uid = req.auth.credentials.user;
    return req.server.methods.profileCache.drop(uid).then(() => {
      const id = img.id();
      // precaution to avoid the default id from being overwritten
      assert(id !== DEFAULT_AVATAR_ID);
      const url = avatarShared.fxaUrl(id);
      return workers
        .upload(id, req.payload, req.headers)
        .then(function save() {
          return db.addAvatar(id, uid, url, FXA_PROVIDER);
        })
        .then(function uploadDone() {
          notifyProfileUpdated(uid); // Don't wait on promise
          return h.response({ url: url, id: hex(id) }).code(201);
        });
    });
  },
};
