/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ScopeSet = require('../../fxa-shared').oauth.scopes;

const P = require('./promise');
const batch = require('./batch');

// The returned profile info can vary depending on the scopes
// present in the OAuth token.  We cache the result for common
// sets of scopes, but we have to limit it to a small set of known
// possibilities in order to efficiently implement the "drop"
// method below.

// Trusted reliers all use the main "profile" scope.
const SCOPE_PROFILE = ScopeSet.fromArray(['profile']);
// Untrusted reliers tend to request these three scopes.
const SCOPE_UNTRUSTED = ScopeSet.fromArray([
  'profile:display_name',
  'profile:email',
  'profile:uid',
]);

const CACHEABLE_SCOPES = [
  SCOPE_PROFILE.getScopeValues(),
  SCOPE_UNTRUSTED.getScopeValues(),
];

function getProfileCacheKey(req) {
  const creds = req.auth.credentials;
  // We stash the result on the request object to avoid doing these checks multiple times.
  // eslint-disable-next-line no-prototype-builtins
  if (!creds.hasOwnProperty('_fxaProfileCacheKey')) {
    // By default, requests are not cached.
    creds._fxaProfileCacheKey = null;
    const uid = creds.user;
    const scope = ScopeSet.fromArray(creds.scope);
    // If they have read access to the full profile, we can cache it.
    // We use the bare uid as the key for b/w compat with previous
    // versions of this code, to avoid starting over with an empty cache.
    if (scope.contains(SCOPE_PROFILE)) {
      creds._fxaProfileCacheKey = uid;
    }
    // If they're using a set of scopes common to untrusted reliers,
    // cache under a key for that specific set of scopes.  It's important
    // that they don't have other profile-related scopes, otherwise we
    // give them cached data that's missing some fields they're entitled to.
    else if (
      scope.contains(SCOPE_UNTRUSTED) &&
      !scope.difference(SCOPE_UNTRUSTED).intersects(SCOPE_PROFILE)
    ) {
      creds._fxaProfileCacheKey = `${uid}:scoped:display_name+email+uid`;
    }
  }
  return creds._fxaProfileCacheKey;
}

module.exports = function profileCache(server, options) {
  // Fetch all available profile data given the scopes on the request,
  // using cached data if possible.

  server.method(
    'profileCache.get',
    (req, flags) => {
      return batch(req, {
        '/v1/_core_profile': true,
        '/v1/uid': true,
        '/v1/avatar': ['avatar', 'avatarDefault'],
        '/v1/display_name': true,
      }).then(result => {
        // Only cache the result if we can produce a suitable cache key.
        const key = getProfileCacheKey(req);
        // Since Hapi 17+ "When a server method is cached, the result no longer changes to an envelope with the result and ttl value."
        // This feature seems poorly documented. Best source for info is the following https://github.com/outmoded/discuss/issues/751
        flags.ttl = key ? undefined : 0;
        return { result };
      });
    },
    {
      cache: {
        expiresIn: options.expiresIn,
        generateTimeout: options.generateTimeout,
        // As of Hapi 17 we must set 'getDecoratedValue' to get information about the cache result
        getDecoratedValue: true,
      },
      generateKey: req => {
        return getProfileCacheKey(req) || 'can-not-cache';
      },
    }
  );

  // Drop any cached profile data for the given user.
  server.method('profileCache.drop', uid => {
    // To work transparently with hapi's caching and `getProfileCacheKey` above,
    // we make a bunch of synthetic request objects on which to drop the
    // cache, one for each possible set of scopes in the cache.
    return P.each(CACHEABLE_SCOPES, scope => {
      const req = {
        auth: {
          credentials: {
            user: uid,
            scope: scope,
          },
        },
      };
      return server.methods.profileCache.get.cache.drop(req);
    });
  });
};
