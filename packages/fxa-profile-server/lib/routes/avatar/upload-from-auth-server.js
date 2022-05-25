/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');

const Joi = require('joi');

const config = require('../../config');
const db = require('../../db');
const hex = require('buf').to.hex;
const img = require('../../img');
const notifyProfileUpdated = require('../../updates-queue');
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
    strategy: 'secretBearerToken',
  },
  validate: {
    payload: {
      imageUrl: Joi.string()
      // I think this max is probably too small.
      // also we could have a "valid url" regex
        .max(256)
        .required()
    },
    params: {
      uid: Joi.string(),
    }
  },
  handler: async function uploadFromUrl(req, h) {
    const { imageUrl } = req.payload;
    const { uid } = req.params;
  //   // now, we download the file from that url so that we can send it to the server.
    const imageStream = await workers.download(imageUrl);
    return req.server.methods.profileCache.drop(uid).then(() => {
      const id = img.id();

      // precaution to avoid the default id from being overwritten
      assert(id !== DEFAULT_AVATAR_ID);
      const url = avatarShared.fxaUrl(id);

      // Since the original avatar upload route sent the file in the original req as a stream, these
      // content headers could be reused in the img worker upload method. since we instead pass in a url
      // (and derive the stream from it), we need to modify our headers for the upload method.
      const updatedHeaders = req.headers;
      updatedHeaders['content-length'] = imageStream.length;
      updatedHeaders['content-type'] = 'image/png';

      return workers
        .upload(id, imageStream, updatedHeaders)
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
