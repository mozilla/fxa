/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('hapi').types;

const db = require('../db');

const URL_REGEX = /^https?:\/\/.+/;

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile', 'profile:avatar']
  },
  validate: {
    payload: {
      url: Joi.string().regex(URL_REGEX).required()
    }
  },
  handler: function avatarPost(req, reply) {
    var id = req.auth.credentials.user;
    db.getOrCreateProfile(id).then(function() {
      return db.setAvatar(id, req.payload.url);
    }).done(function() {
      reply({});
    }, reply);
  }
};
