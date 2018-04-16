/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('./promise');
const batch = require('./batch');


// The returned profile info can vary depending on the scopes
// present in the OAuth token.  We cache the result for common
// sets of scopes, but we have to limit it to a small set of known
// possibilities in order to efficiently implement the "drop"
// method below.
const CACHEABLE_SCOPES = {
  // Trusted reliers all use the main "profile" scope.
  'profile': true,
  // Untrusted reliers tend to request these three scopes.
  'display_name+email+uid': true
};


// Extract the profile-related scopes for a request.
// This removes non-profile scopes and returns either
// the string 'profile' or a sorted plus-separated list
// of subscopes like 'display_name+email'.

function extractProfileScopes(req) {
  const creds = req.auth.credentials;
  // We cache the results to avoid doing this loop multiple times.
  if (creds.hasOwnProperty('_fxaCachedProfileScopes')) {
    return creds._fxaCachedProfileScopes;
  }
  const subScopes = {};
  for (let i = 0, len = creds.scope.length; i < len; i++) {
    let scope = creds.scope[i];
    if (scope.endsWith(':write')) {
      scope = scope.substr(0, scope.length - ':write'.length);
    }
    if (scope === 'profile') {
      creds._fxaCachedProfileScopes = 'profile';
      return 'profile';
    } else if (scope.startsWith('profile:')) {
      subScopes[scope.substr('profile:'.length)] = true;
    } else if (scope === 'email') {
      subScopes.email = true;
    }
  }
  return creds._fxaCachedProfileScopes = Object.keys(subScopes).sort().join('+');
}


module.exports = function profileCache(server, options, next) {

  // Fetch all available profile data given the scopes on the request,
  // using cached data if possible.

  server.method('profileCache.get', (req, next) => {
    batch(req, {
      '/v1/_core_profile': true,
      '/v1/uid': true,
      '/v1/avatar': ['avatar', 'avatarDefault'],
      '/v1/display_name': true
    })
    .then(result => {
      const scope = extractProfileScopes(req);
      let ttl = undefined;
      // Don't cache if this wasn't a known common sets of scopes.
      if (! CACHEABLE_SCOPES.hasOwnProperty(scope)) {
        ttl = 0;
      }
      return next(null, result, ttl);
    })
    .catch(next);
  }, {
    cache: {
      expiresIn: options.expiresIn,
      generateTimeout: options.generateTimeout
    },
    generateKey: function(req) {
      const uid = req.auth.credentials.user;
      const scope = extractProfileScopes(req);
      // Cache the full profile data under the bare uid.
      // This is mostly for b/w compat with previous versions of
      // the code, to avoid starting over with an empty cache.
      if (scope === 'profile') {
        return uid;
      }
      // Otherwise, cache under a key specific to the request scopes.
      return `${uid}:scoped:${scope}`;
    },
  });

  // Drop any cached profile data for the given user.

  server.method('profileCache.drop', (uid, next) => {
    // To work transparently with hapi's caching and `generateKey` above,
    // we make a bunch of synthetic request objects on which to drop the
    // cache, one for each possible set of scopes in the cache.
    return P.each(Object.keys(CACHEABLE_SCOPES), scope => {
      const req = { auth: { credentials: {
        user: uid,
        _fxaCachedProfileScopes: scope
      }}};
      return P.fromCallback(cb => {
        server.methods.profileCache.get.cache.drop(req, cb);
      });
    }).asCallback(next);
  });

  next();
};

module.exports.attributes = {
  name: 'fxa-profile-cache'
};
