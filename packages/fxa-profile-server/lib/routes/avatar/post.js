/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const AppError = require('../../error');
const db = require('../../db');
const hex = require('buf').to.hex;
const img = require('../../img');
const validate = require('../../validate');
const logger = require('../../logging')('routes.avatar.post');
const customs = require('../../customs')();

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
    schema: {
      id: Joi.string()
        .regex(validate.hex)
        .length(32)
    }
  },
  handler: function avatarPost(req, reply) {

    var action = 'avatarUpload';
    var ip = req.app.clientAddress;
    var payload = req.payload;
    var provider;
    var uid = req.auth.credentials.user;

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

    customs.checkAuthenticated(action, ip, uid)
      .then(function (){
        return db.addAvatar(id, uid, payload.url, provider, payload.selected);
      })
      .done(function() {
        var info = {
          event: 'avatar.post',
          uid: uid
        };
        logger.info('activityEvent', info);
        reply({ id: hex(id) }).code(201);
      }, reply);
  }
};
