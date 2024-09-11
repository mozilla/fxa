/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { hex as buf } from 'buf';

import hexModule from "buf";
const hex = hexModule.to.hex;
import { Container } from 'typedi';
import { CapabilityService } from '../payments/capability';
import { config } from '../../config';
import OauthError from './error';
import db from './db';
import util from './util';
import ScopeSetModule from "fxa-shared";
const ScopeSet = ScopeSetModule.oauth.scopes;
import JWTAccessToken from './jwt_access_token';
import sub from './jwt_sub';

const ACR_VALUE_AAL2 = 'AAL2';
const ACCESS_TYPE_OFFLINE = 'offline';

const SCOPE_OPENID = ScopeSet.fromArray(['openid']);
import { OAUTH_SCOPE_SESSION_TOKEN } from 'fxa-shared/oauth/constants';

const ID_TOKEN_EXPIRATION = Math.floor(
  config.get('oauthServer.openid.ttl') / 1000
);

import jwt from './jwt';

const JWT_ACCESS_TOKENS_ENABLED = config.get(
  'oauthServer.jwtAccessTokens.enabled'
);
const JWT_ACCESS_TOKENS_CLIENT_IDS = new Set(
  config.get('oauthServer.jwtAccessTokens.enabledClientIds')
);

const UNTRUSTED_CLIENT_ALLOWED_SCOPES = ScopeSet.fromArray([
  'openid',
  'profile:uid',
  'profile:email',
  'profile:display_name',
]);

/** @type {CapabilityService} */
let capabilityService = undefined;

export const setStripeHelper = function (val) {
  // This is a less than ideal hook into the existing call-stack to
  // set the capabilityService at a time after the primary initialization
  // of objects has occurred.
  capabilityService = Container.get(CapabilityService);
};

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
export const validateRequestedGrant = async function validateRequestedGrant(
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
      throw OauthError.mismatchAcr(verifiedClaims['fxa-aal']);
    }
  }

  // Is an untrusted client requesting scopes that it's not allowed?
  if (!client.trusted) {
    const invalidScopes = requestedGrant.scope.difference(
      UNTRUSTED_CLIENT_ALLOWED_SCOPES
    );
    if (!invalidScopes.isEmpty()) {
      throw OauthError.invalidScopes(invalidScopes.getScopeValues());
    }
  }

  // For custom scopes (besides the UNTRUSTED_CLIENT_ALLOWED_SCOPES list), is the client allowed to request them?
  let requiresVerifiedToken = false;
  const scopeConfig = {};
  const customScopes = ScopeSet.fromArray([]);
  for (const scope of requestedGrant.scope.getScopeValues()) {
    const s = (scopeConfig[scope] = await db.getScope(scope));
    if (s) {
      if (s.hasScopedKeys) {
        // scoped keys require verification, see comment below.
        requiresVerifiedToken = true;
      }
      customScopes.add(scope);
    }
  }
  if (!customScopes.isEmpty()) {
    const invalidScopes = customScopes.difference(
      ScopeSet.fromString(client.allowedScopes || '')
    );
    if (!invalidScopes.isEmpty()) {
      throw OauthError.invalidScopes(invalidScopes.getScopeValues());
    }
  }

  if (requiresVerifiedToken && !verifiedClaims['fxa-tokenVerified']) {
    // Any request for a key-bearing scope should be using a verified token,
    // so we can also double-check that here as a defense-in-depth measure.
    //
    // Note that this directly reflects the `verified` property of the sessionToken
    // used to create the assertion, so it can be true for e.g. sessions that were
    // verified by email before 2FA was enabled on the account. Such sessions must
    // be able to access sync even after 2FA is enabled, hence checking `verified`
    // rather than the `aal`-related properties here.
    throw OauthError.invalidAssertion();
  }

  // If we grow our per-client config, there are more things we could check here:
  //   * Is this client allowed to request ACCESS_TYPE_OFFLINE?
  //   * Is this client allowed to request all the non-key-bearing scopes?
  //   * Do we expect this client to be using OIDC?
  return {
    clientId: client.id,
    name: client.name,
    canGrant: client.canGrant,
    publicClient: client.publicClient,
    userId: buf(verifiedClaims.uid),
    email: verifiedClaims['fxa-verifiedEmail'],
    scope: requestedGrant.scope,
    scopeConfig,
    sessionTokenId: verifiedClaims['fxa-sessionTokenId'],
    offline: requestedGrant.access_type === ACCESS_TYPE_OFFLINE,
    authAt: verifiedClaims['fxa-lastAuthAt'],
    amr: verifiedClaims['fxa-amr'],
    aal: verifiedClaims['fxa-aal'],
    profileChangedAt: verifiedClaims['fxa-profileChangedAt'],
    keysJwe: requestedGrant.keys_jwe,
    generation: verifiedClaims['fxa-generation'],
  };
};

// Generate tokens that will give the holder all the access in the specified grant.
// This always include an access_token, but may also include a refresh_token and/or
// id_token if implied by the grant.
//
// This function does *not* perform any authentication or validation, assuming that
// the specified grant has been sufficiently vetted by calling code.
export const generateTokens = async function generateTokens(grant) {
  // We always generate an access_token.
  const access = await exports.generateAccessToken(grant);

  const result = {
    access_token: access.jwt_token || access.token.toString('hex'),
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
    result.id_token = await generateIdToken(grant, result.access_token);
  }

  if (grant.scope && grant.scope.contains(OAUTH_SCOPE_SESSION_TOKEN)) {
    result.session_token_id =
      grant.sessionTokenId && grant.sessionTokenId.toString('hex');
  }

  return result;
};

async function generateIdToken(grant, accessToken) {
  var now = Math.floor(Date.now() / 1000);
  const clientId = hex(grant.clientId);
  // The IETF spec for `aud` refers to https://openid.net/specs/openid-connect-core-1_0.html#IDToken
  // > REQUIRED. Audience(s) that this ID Token is intended for. It MUST contain the
  // > OAuth 2.0 client_id of the Relying Party as an audience value. It MAY also contain
  // > identifiers for other audiences. In the general case, the aud value is an array of
  // > case-sensitive strings. In the common special case when there is one audience, the
  // > aud value MAY be a single case-sensitive string.
  const audience = grant.resource ? [clientId, grant.resource] : clientId;

  const claims = {
    sub: await sub(grant.userId, grant.clientId, grant.ppidSeed),
    aud: audience,
    //iss set in jwt.sign
    iat: now,
    exp: now + ID_TOKEN_EXPIRATION,
    at_hash: util.generateTokenHash(accessToken),
  };
  if (grant.amr) {
    claims.amr = grant.amr;
  }
  if (grant.aal) {
    claims['fxa-aal'] = grant.aal;
    claims.acr = 'AAL' + grant.aal;
  }
  // For legacy reasons auth_time was stored as authAt in our db. It also
  // needs to be converted to seconds.
  if (grant.authAt) {
    claims.auth_time = Math.floor(grant.authAt / 1000);
  }

  return jwt.sign(claims);
}

export const generateAccessToken = async function generateAccessToken(grant) {
  const clientId = hex(grant.clientId).toLowerCase();
  const accessToken = await db.generateAccessToken(grant);
  if (
    !JWT_ACCESS_TOKENS_ENABLED ||
    !JWT_ACCESS_TOKENS_CLIENT_IDS.has(clientId)
  ) {
    // return the old style access token if JWT access tokens are
    // not globally enabled or if not enabled for the given clientId.
    return accessToken;
  }

  if (grant.scope.contains('profile:subscriptions')) {
    const capabilities =
      await capabilityService.determineClientVisibleSubscriptionCapabilities(
        hex(clientId),
        await capabilityService.subscriptionCapabilities(
          hex(grant.userId),
          grant.email
        )
      );
    // To avoid mutating the input grant, create a
    // copy and add the new property there.
    grant = {
      ...grant,
      'fxa-subscriptions': capabilities,
    };
  }

  return JWTAccessToken.create(accessToken, grant);
};
