/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const buf = require('buf').hex;
const hex = require('buf').to.hex;

const config = require('./config');
const AppError = require('./error');
const db = require('./db');
const util = require('./util');
const ScopeSet = require('fxa-shared').oauth.scopes;
const JwTool = require('fxa-jwtool');
const logger = require('./logging')('grant');
const amplitude = require('./metrics/amplitude')(
  logger,
  config.getProperties()
);

const ACR_VALUE_AAL2 = 'AAL2';
const ACCESS_TYPE_OFFLINE = 'offline';

const SCOPE_OPENID = ScopeSet.fromArray(['openid']);

const ID_TOKEN_EXPIRATION = Math.floor(config.get('openid.ttl') / 1000);
const ID_TOKEN_ISSUER = config.get('openid.issuer');
const ID_TOKEN_KEY = JwTool.JWK.fromObject(config.get('openid.key'), {
  iss: ID_TOKEN_ISSUER,
});

const UNTRUSTED_CLIENT_ALLOWED_SCOPES = ScopeSet.fromArray([
  'openid',
  'profile:uid',
  'profile:email',
  'profile:display_name',
]);

// Given a set of verified user identity claims, can the given client
// be granted the specified access to the user's data?
//
// This is a shared helper function responsible for checking:
//   * whether the identity claims are sufficient to authorize the requested access
//   * whether config allows that particular client to request such access at all
//
// It does *not* perform any user or client authentication, assuming that the
// authenticity of the passed-in details has been sufficiently verified by
// calling code.
module.exports.validateRequestedGrant = async function validateRequestedGrant(
  verifiedClaims,
  client,
  requestedGrant
) {
  requestedGrant.scope = requestedGrant.scope || ScopeSet.fromArray([]);

  // If the grant request is for specific ACR values, do the identity claims support them?
  if (requestedGrant.acr_values) {
    const acrTokens = requestedGrant.acr_values.trim().split(/\s+/g);
    if (
      acrTokens.includes(ACR_VALUE_AAL2) &&
      !(verifiedClaims['fxa-aal'] >= 2)
    ) {
      throw AppError.mismatchAcr(verifiedClaims['fxa-aal']);
    }
  }

  // Is an untrusted client requesting scopes that it's not allowed?
  if (!client.trusted) {
    const invalidScopes = requestedGrant.scope.difference(
      UNTRUSTED_CLIENT_ALLOWED_SCOPES
    );
    if (!invalidScopes.isEmpty()) {
      throw AppError.invalidScopes(invalidScopes.getScopeValues());
    }
  }

  // For key-bearing scopes, is the client allowed to request them?
  // We probably want to clean this logic up in the future, but for now,
  // all trusted clients are allowed to request all non-key-bearing scopes.
  const scopeConfig = {};
  const keyBearingScopes = ScopeSet.fromArray([]);
  for (const scope of requestedGrant.scope.getScopeValues()) {
    const s = (scopeConfig[scope] = await db.getScope(scope));
    if (s && s.hasScopedKeys) {
      keyBearingScopes.add(scope);
    }
  }
  if (!keyBearingScopes.isEmpty()) {
    const invalidScopes = keyBearingScopes.difference(
      ScopeSet.fromString(client.allowedScopes || '')
    );
    if (!invalidScopes.isEmpty()) {
      throw AppError.invalidScopes(invalidScopes.getScopeValues());
    }
    // Any request for a key-bearing scope should be using a verified token,
    // so we can also double-check that here as a defense-in-depth measure.
    //
    // Note that this directly reflects the `verified` property of the sessionToken
    // used to create the assertion, so it can be true for e.g. sessions that were
    // verified by email before 2FA was enabled on the account. Such sessions must
    // be able to access sync even after 2FA is enabled, hence checking `verified`
    // rather than the `aal`-related properties here.
    if (!verifiedClaims['fxa-tokenVerified']) {
      throw AppError.invalidAssertion();
    }
  }

  // If we grow our per-client config, there are more things we could check here:
  //   * Is this client allowed to request ACCESS_TYPE_OFFLINE?
  //   * Is this client allowed to request all the non-key-bearing scopes?
  //   * Do we expect this client to be using OIDC?

  return {
    clientId: client.id,
    userId: buf(verifiedClaims.uid),
    email: verifiedClaims['fxa-verifiedEmail'],
    scope: requestedGrant.scope,
    scopeConfig,
    offline: requestedGrant.access_type === ACCESS_TYPE_OFFLINE,
    authAt: verifiedClaims['fxa-lastAuthAt'],
    amr: verifiedClaims['fxa-amr'],
    aal: verifiedClaims['fxa-aal'],
    profileChangedAt: verifiedClaims['fxa-profileChangedAt'],
    keysJwe: requestedGrant.keys_jwe,
  };
};

// Generate tokens that will give the holder all the access in the specified grant.
// This always include an access_token, but may also include a refresh_token and/or
// id_token if implied by the grant.
//
// This function does *not* perform any authentication or validation, assuming that
// the specified grant has been sufficiently vetted by calling code.
module.exports.generateTokens = async function generateTokens(grant) {
  // We always generate an access_token.
  const access = await db.generateAccessToken(grant);
  const result = {
    access_token: access.token.toString('hex'),
    token_type: access.type,
    scope: access.scope.toString(),
  };
  result.expires_in =
    grant.ttl || Math.floor((access.expiresAt - Date.now()) / 1000);
  if (grant.authAt) {
    result.auth_at = grant.authAt;
  }
  if (grant.keysJwe) {
    result.keys_jwe = grant.keysJwe;
  }
  // Maybe also generate a refreshToken?
  if (grant.offline) {
    const refresh = await db.generateRefreshToken(grant);
    result.refresh_token = refresh.token.toString('hex');
  }
  // Maybe also generate an idToken?
  if (grant.scope && grant.scope.contains(SCOPE_OPENID)) {
    result.id_token = await generateIdToken(grant, access);
  }

  amplitude('token.created', {
    service: hex(grant.clientId),
    uid: hex(grant.userId),
  });

  return result;
};

function generateIdToken(grant, access) {
  var now = Math.floor(Date.now() / 1000);
  var claims = {
    sub: hex(grant.userId),
    aud: hex(grant.clientId),
    iss: ID_TOKEN_ISSUER,
    iat: now,
    exp: now + ID_TOKEN_EXPIRATION,
    at_hash: util.generateTokenHash(access.token),
  };
  if (grant.amr) {
    claims.amr = grant.amr;
  }
  if (grant.aal) {
    claims['fxa-aal'] = grant.aal;
    claims.acr = 'AAL' + grant.aal;
  }

  return ID_TOKEN_KEY.sign(claims);
}
