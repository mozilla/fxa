/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Boom = require('hapi').error;
const Joi = require('joi');

const batch = require('../batch');

function hasProfileScope(scopes) {
  for (var i = 0, len = scopes.length; i < len; i++) {
    var scope = scopes[i];
    // careful to not match a scope of 'profilebogie'
    if (scope === 'profile' || scope.indexOf('profile:') === 0) {
      return true;
    }
  }
  return false;
}

module.exports = {
  auth: {
    strategy: 'oauth'
  },
  response: {
    schema: {
      email: Joi.string().allow(null),
      uid: Joi.string().allow(null),
      avatar: Joi.string().allow(null),
      displayName: Joi.string().allow(null)
    }
  },
  handler: function email(req, reply) {
    if (!hasProfileScope(req.auth.credentials.scope || [])) {
      return reply(Boom.forbidden());
    }
    batch(req, {
      email: '/v1/email',
      uid: '/v1/uid',
      avatar: '/v1/avatar',
      displayName: '/v1/display_name'
    }).done(reply, reply);
  }
};


