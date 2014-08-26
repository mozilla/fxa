/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const AppError = require('../../error');
const db = require('../../db');
const img = require('../../img');


const EMPTY = Object.create(null);
const PROVIDERS = (function(providers) {
  var ret = Object.create(null);
  var keys = Object.keys(providers);
  keys.forEach(function(key) {
    ret[key] = new RegExp(providers[key]);
  });
  return ret;
})(require('../../config').get('img.providers'));

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:write', 'profile:avatar:write']
  },
  validate: {
    payload: {
      url: Joi.string().required(),
      selected: Joi.boolean()
    }
  },
  response: {
    schema: false
  },
  handler: function avatarPost(req, reply) {
    var uid = req.auth.credentials.user;
    var payload = req.payload;
    var provider;
    for (var key in PROVIDERS) {
      var re = PROVIDERS[key];
      if (re.test(payload.url)) {
        provider = key;
        break;
      }
    }
    if (!provider) {
      return reply(AppError.unsupportedProvider(payload.url));
    }
    var id = img.id();
    db.addAvatar(id, uid, payload.url, provider, payload.selected)
    .done(function() {
      reply(EMPTY).code(201);
    }, reply);
  }
};

