/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');
const crypto = require('crypto');
const checksum = require('checksum');
const {
  determineClientVisibleSubscriptionCapabilities,
} = require('../subscriptions');

const config = require('../config');
const db = require('../db');
const logger = require('../logging')('routes.profile');
const avatarShared = require('./avatar/_shared');
const monogramUrl = config.get('publicUrl');
const ALPHANUMERIC = /^[a-zA-Z0-9]/;

function computeEtag(profile) {
  if (profile) {
    return checksum(JSON.stringify(profile));
  }
  return false;
}

function nextAvatar(result) {
  if (
    result.avatar &&
    (result.avatarDefault || result.avatar.startsWith(monogramUrl))
  ) {
    const displayName = result.displayName;
    let avatarUrl = result.avatar;
    if (displayName && ALPHANUMERIC.test(displayName)) {
      avatarUrl = `${monogramUrl}/v1/avatar/${displayName[0]}`;
    } else if (ALPHANUMERIC.test(result.email)) {
      avatarUrl = `${monogramUrl}/v1/avatar/${result.email[0]}`;
    } else {
      avatarUrl = avatarShared.DEFAULT_AVATAR.avatar;
    }
    return avatarUrl;
  }
  return result.avatar;
}

async function changeAvatar(avatarUrl, uid) {
  if (avatarUrl === avatarShared.DEFAULT_AVATAR.avatar) {
    await db.deleteUserAvatars(uid);
  } else {
    await db.addAvatar(
      crypto.randomBytes(16).toString('hex'),
      uid,
      avatarUrl,
      'fxa'
    );
  }
}

module.exports = {
  auth: {
    strategy: 'oauth',
  },
  response: {
    schema: Joi.object({
      email: Joi.string().allow(null),
      uid: Joi.string().allow(null),
      avatar: Joi.string().allow(null),
      avatarDefault: Joi.boolean().allow(null),
      displayName: Joi.string().allow(null),
      locale: Joi.string().allow(null),
      amrValues: Joi.array().items(Joi.string().required()).allow(null),
      twoFactorAuthentication: Joi.boolean().allow(null),
      subscriptions: Joi.array().items(Joi.string().required()).optional(),
      metricsEnabled: Joi.boolean().optional(),

      //openid-connect
      sub: Joi.string().allow(null),
    }),
  },
  handler: async function profile(req, h) {
    const server = req.server;
    const creds = req.auth.credentials;

    function createResponse(response) {
      const { value, cached, report } = response;
      const result = value;
      // `profileChangedAt` is an internal implementation detail that we don't
      // return to reliers. As of now, we don't expect them to have any
      // use for this.
      delete result.profileChangedAt;

      if (creds.scope.indexOf('openid') !== -1) {
        result.sub = creds.user;
      }

      // Need to filter subscriptions by client ID for the request, since ALL
      // capabilities for all clients is what we cache on user ID.
      if (result.subscriptionsByClientId) {
        result.subscriptions = determineClientVisibleSubscriptionCapabilities(
          req.auth.credentials.client_id,
          result.subscriptionsByClientId
        );
        delete result.subscriptionsByClientId;
      }

      let rep = h.response(result);
      const etag = computeEtag(result);
      if (etag) {
        rep = h.response(result).etag(etag);
      }
      const lastModified = cached ? new Date(cached.stored) : new Date();
      if (cached) {
        logger.verbose('batch.cached', {
          storedAt: cached.stored,
          error: report && report.error,
          ttl: cached.ttl,
        });
      } else {
        logger.verbose('batch.db');
      }

      return rep.header('last-modified', lastModified.toUTCString());
    }

    let response = await server.methods.profileCache.get(req);
    const result = response.value;
    const newAvatar = nextAvatar(result);
    const avatarChanged = result.avatar !== newAvatar;
    if (avatarChanged) {
      // Check if the db needs to be updated or just the profileCache
      const selectedAvatar = await db.getSelectedAvatar(creds.user);
      if (!selectedAvatar || selectedAvatar.url !== newAvatar) {
        await changeAvatar(newAvatar, creds.user);
      }
    }
    // Check to see if the oauth-server is reporting a newer `profileChangedAt`
    // timestamp from validating the token, if so, lets invalidate the cache
    // and set new value.
    if (avatarChanged || result.profileChangedAt < creds.profile_changed_at) {
      await server.methods.profileCache.drop(creds.user);
      logger.info('profileChangedAt:cacheCleared', { uid: creds.user });
      response = await server.methods.profileCache.get(req);
    }

    return createResponse(response);
  },
};
