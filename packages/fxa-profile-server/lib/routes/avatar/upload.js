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
const validate = require('../../validate');
const workers = require('../../img-workers');

const FXA_PROVIDER = 'fxa';
const FXA_URL_TEMPLATE = config.get('img.url');
assert(FXA_URL_TEMPLATE.indexOf('{id}') !== -1,
    'img.url must contain the string "{id}"');

function fxaUrl(id) {
  return FXA_URL_TEMPLATE.replace('{id}', id);
}

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:write', 'profile:avatar:write']
  },
  validate: {
    headers: Joi.object({
      'content-length': Joi.number().required()
    }).unknown()
  },
  payload: {
    output: 'stream',
    parse: false,
    allow: Object.keys(config.get('img.uploads.types')),
    maxBytes: config.get('img.uploads.maxSize')
  },
  response: {
    schema: {
      id: Joi.string()
        .regex(validate.hex)
        .length(32),
      url: Joi.string().required()
    }
  },
  handler: function upload(req, reply) {
    var id = img.id();
    var url = fxaUrl(id);
    var uid = req.auth.credentials.user;
    workers.upload(id, req.payload, req.headers)
      .then(function save() {
        return db.addAvatar(id, uid, url, FXA_PROVIDER);
      })
      .done(function uploadDone() {
        notifyProfileUpdated(uid); // Don't wait on promise
        reply({ url: url, id: hex(id) }).code(201);
      }, reply);
  }
};


