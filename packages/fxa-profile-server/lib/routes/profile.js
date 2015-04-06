/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const db = require('../db');

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile', 'profile:write']
  },
  response: {
    schema: {
      email: Joi.string().required(),
      uid: Joi.string().required(),
      avatar: Joi.string().allow(null),
      displayName: Joi.string().allow(null)
    }
  },
  handler: function email(req, reply) {
    var creds = req.auth.credentials;
    db.getSelectedAvatar(creds.user).then(function(avatar) {
      return db.getDisplayName(creds.user).then(function(profile) {
        return {
          email: creds.email,
          uid: creds.user,
          avatar: avatar ? avatar.url : null,
          displayName: profile && profile.displayName ?
            profile.displayName : null
        };
      });
    }).done(reply, reply);
  }
};


