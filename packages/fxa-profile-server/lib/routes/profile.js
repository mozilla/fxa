/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');
const checksum = require('checksum');
const P = require('../promise');

const logger = require('../logging')('routes.profile');

function computeEtag(profile) {
  if (profile) {
    return checksum(JSON.stringify(profile));
  }
  return false;
}

module.exports = {
  auth: {
    strategy: 'oauth',
  },
  response: {
    schema: {
      email: Joi.string().allow(null),
      uid: Joi.string().allow(null),
      avatar: Joi.string().allow(null),
      avatarDefault: Joi.boolean().allow(null),
      displayName: Joi.string().allow(null),
      locale: Joi.string().allow(null),
      amrValues: Joi.array()
        .items(Joi.string().required())
        .allow(null),
      twoFactorAuthentication: Joi.boolean().allow(null),
      subscriptions: Joi.array()
        .items(Joi.string().required())
        .optional(),

      //openid-connect
      sub: Joi.string().allow(null),
    },
  },
  handler: function profile(req, reply) {
    const server = req.server;
    const creds = req.auth.credentials;

    function createResponse(err, result, cached, report) {
      if (err) {
        return reply(err);
      }

      // `profileChangedAt` is an internal implementation detail that we don't
      // return to reliers. As of now, we don't expect them to have any
      // use for this.
      delete result.profileChangedAt;

      if (creds.scope.indexOf('openid') !== -1) {
        result.sub = creds.user;
      }

      let rep = reply(result);
      const etag = computeEtag(result);
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

    server.methods.profileCache.get(req, (err, result, cached, report) => {
      if (err) {
        return reply(err);
      }

      // Check to see if the oauth-server is reporting a newer `profileChangedAt`
      // timestamp from validating the token, if so, lets invalidate the cache
      // and set new value.
      if (result.profileChangedAt < creds.profile_changed_at) {
        return P.fromCallback(cb =>
          server.methods.profileCache.drop(creds.user, cb)
        ).then(() => {
          logger.info('profileChangedAt:cacheCleared', { uid: creds.user });
          server.methods.profileCache.get(req, createResponse);
        });
      }

      return createResponse(err, result, cached, report);
    });
  },
};
