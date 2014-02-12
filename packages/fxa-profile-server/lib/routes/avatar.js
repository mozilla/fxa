/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('hapi').types;

const db = require('../db');

module.exports = {
  auth: {
    strategy: 'userid'
  },
  validate: {
    payload: {
      url: Joi.string().required()
    }
  },
  handler: function avatarPost(req, reply) {
    var id = req.auth.credentials;
    db.profileExists(id).then(function(exists) {
      if (!exists) {
        return db.createProfile({ uid: id });
      }
    }).then(function() {
      return db.setAvatar(id, req.payload.url);
    }).done(function() {
      reply({});
    }, reply);
  }
};
