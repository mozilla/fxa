/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Boom = require('boom');
const Joi = require('joi');
const checksum = require('checksum');

const avatarShared = require('./avatar/_shared');
const config = require('../config');
const logger = require('../logging')('routes.profile');

const DEFAULT_AVATAR_URL = avatarShared.fxaUrl(config.get('img.defaultAvatarId'));

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
      avatarDefault: Joi.boolean().allow(null),
      displayName: Joi.string().allow(null),

      //openid-connect
      sub: Joi.string().allow(null)
    }
  },
  handler: function email(req, reply) {
    const server = req.server;
    const creds = req.auth.credentials;

    if (! hasAllowedScope(creds.scope || [])) {
      return reply(Boom.forbidden());
    }

    server.methods.batch(
      req,
      {
        email: '/v1/email',
        uid: '/v1/uid',
        avatar: '/v1/avatar',
        displayName: '/v1/display_name'
      },
      function(err, result, cached, report) {
        if (err) {
          return reply(err);
        }
        if (creds.scope.indexOf('openid') !== -1) {
          result.sub = creds.user;
        }

        if (result.avatar) {
          // currently the batch requests extract a single property.
          // to avoid refactoring the batch requests to support multiple properties,
          // set the default flag here
          result.avatarDefault = result.avatar === DEFAULT_AVATAR_URL;
        }

        var rep = reply(result);
        var etag = computeEtag(result);
        if (etag) {
          rep = rep.etag(etag);
        }
        const lastModified = cached ? new Date(cached.stored) : new Date();
        if (cached) {
          logger.info('batch.cached', {
            storedAt: cached.stored,
            error: report && report.error,
            ttl: cached.ttl,
          });
        } else {
          logger.info('batch.db');
        }
        return rep.header('last-modified', lastModified.toUTCString());
      }
    );
  }
};


