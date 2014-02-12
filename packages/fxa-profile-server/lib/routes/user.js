/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Boom = require('hapi').error;
const Joi = require('hapi').types;

const db = require('../db');

module.exports = {
  validate: {
    path: {
      userId: Joi.string().required()
    }
  },
  handler: function userGet(req, reply) {
    db.getProfile(req.params.userId).then(function(profile) {
      if (!profile) {
        throw Boom.notFound();
      }
      return {
        uid: profile.uid,
        avatar: {
          url: profile.avatar
        }
      };
    }).done(reply, reply);
  }
};
