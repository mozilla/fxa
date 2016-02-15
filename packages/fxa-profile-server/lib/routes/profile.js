/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Boom = require('boom');
const Joi = require('joi');
const checksum = require('checksum');

const batch = require('../batch');

function hasAllowedScope(scopes) {
  for (var i = 0, len = scopes.length; i < len; i++) {
    var scope = scopes[i];
    // careful to not match a scope of 'profilebogie'
    if (scope === 'profile' || scope === 'email'
        || scope.indexOf('profile:') === 0) {
      return true;
    }
  }
  return false;
}

function computeEtag(profile) {
  if (profile) {
    return checksum(JSON.stringify(profile));
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
      displayName: Joi.string().allow(null),

      //openid-connect
      sub: Joi.string().allow(null)
    }
  },
  handler: function email(req, reply) {
    var creds = req.auth.credentials;
    if (!hasAllowedScope(creds.scope || [])) {
      return reply(Boom.forbidden());
    }
    batch(req, {
      email: '/v1/email',
      uid: '/v1/uid',
      avatar: '/v1/avatar',
      displayName: '/v1/display_name'
    })
    .done(function (result) {
      if (creds.scope.indexOf('openid') !== -1) {
        result.sub = creds.user;
      }
      var rep = reply(result);
      var etag = computeEtag(result);
      if (etag) {
        rep = rep.etag(etag);
      }
      return rep;
    }, reply);
  }
};


