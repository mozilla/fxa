/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Boom = require('hapi').error;
const Joi = require('hapi').types;

const db = require('../db');
const config = require('../config');

module.exports = {
  validate: {
    path: {
      userId: Joi.string().required()
    }
  },
  response: {
    schema: {
      uid: Joi.string().required(),
      avatar: Joi.object({
        url: Joi.string()
      })
    }
  },
  handler: function userGet(req, reply) {
    db.getProfile(req.params.userId).then(function(profile) {
      if (!profile) {
        throw Boom.notFound();
      }

      var url = profile.avatar;
      if (url.indexOf('http') !== 0) {
        // then it's a hash and we serve the url ourselves
        url = config.get('uploads.url')
          + config.get('uploads.route')
          + '/' + url;
      }
      return {
        uid: profile.uid.toString(),
        avatar: {
          url: url
        }
      };
    }).done(reply, reply);
  }
};
