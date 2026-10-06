/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Container } = require('typedi');

const { CapabilityService } = require('../payments/capability');
const { config } = require('../../config');
const { OauthError, AppError } = require('@fxa/accounts/errors');
const db = require('./db');
const util = require('./util');
const ScopeSet = require('fxa-shared').oauth.scopes;
const JWTAccessToken = require('./jwt_access_token');
const sub = require('./jwt_sub');

const ACR_VALUE_AAL2 = 'AAL2';
const ACCESS_TYPE_OFFLINE = 'offline';

// Leeway (seconds) applied to the `max_age` freshness comparison. Without it a
// tight `max_age` (especially 0) could never be satisfied: the challenge →
// re-authorize round-trip always advances the clock past `auth_time`, so the RP
// would re-challenge in a loop. A few seconds of grace lets a just-completed
// challenge satisfy the request while relaxing larger `max_age` values only
// negligibly.
const MAX_AGE_LEEWAY_SECONDS = 5;
module.exports.MAX_AGE_LEEWAY_SECONDS = MAX_AGE_LEEWAY_SECONDS;

const SCOPE_OPENID = ScopeSet.fromArray(['openid']);
const { OAUTH_SCOPE_SESSION_TOKEN } = require('fxa-shared/oauth/constants');

const ID_TOKEN_EXPIRATION = Math.floor(
  config.get('oauthServer.openid.ttl') / 1000
);

const jwt = require('./jwt');

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

const TRUSTED_CLIENT_ALLOWED_SCOPES = ScopeSet.fromArray([
  'openid',
  'profile',
  'email',
  'profile:subscriptions',
]);

/** @type {CapabilityService} */
let capabilityService = undefined;

module.exports.setStripeHelper = function (val) {
  // This is a less than ideal hook into the existing call-stack to
  // set the capabilityService at a time after the primary initialization
  // of objects has occurred.
  capabilityService = Container.get(CapabilityService);
};

/**
 * Evaluates the RFC 9470 step-up requirements of a grant request against the
 * identity claims, without enforcing them.
 *
 * @param {object} verifiedClaims - verified identity assertion claims
 * @param {object} requestedGrant - the requested grant, carrying any `acr_values` / `max_age`
 * @returns {import('../metrics/step-up').StepUpEvaluation}
 */
function evaluateStepUp(verifiedClaims, requestedGrant) {
  const authAt = verifiedClaims['fxa-lastAuthAt'];
  // Clamped because cross-pod clock skew can put `authAt` in the future, and the
  // value is recorded as a histogram sample.
  const authAgeSeconds =
    authAt == null
      ? undefined
      : Math.max(0, Math.floor(Date.now() / 1000) - authAt);

  const acrTokens = requestedGrant.acr_values
    ? requestedGrant.acr_values.trim().split(/\s+/g)
    : [];
  const wantsAal2 = acrTokens.includes(ACR_VALUE_AAL2);
  // Both Joi schemas declare max_age as `.optional().allow(null)`, so an explicit
  // null is an absent request, not a request for a zero-second window.
  const wantsFreshAuth = requestedGrant.max_age != null;

  if (!wantsAal2 && !wantsFreshAuth) {
    return { requested: false, satisfied: true, authAgeSeconds };
  }

  if (wantsAal2 && !(verifiedClaims['fxa-aal'] >= 2)) {
    return {
      requested: true,
      satisfied: false,
      reason: 'acr_values_unmet',
      authAgeSeconds,
    };
  }

  // MAX_AGE_LEEWAY_SECONDS keeps a just-completed challenge from reading as stale.
  // Fail closed when the session carries no authentication time.
  if (wantsFreshAuth) {
    if (authAgeSeconds == null) {
      return {
        requested: true,
        satisfied: false,
        reason: 'auth_time_missing',
        authAgeSeconds,
      };
    }
    if (authAgeSeconds > requestedGrant.max_age + MAX_AGE_LEEWAY_SECONDS) {
      return {
        requested: true,
        satisfied: false,
        reason: 'max_age_stale',
        authAgeSeconds,
      };
    }
  }

  return { requested: true, satisfied: true, authAgeSeconds };
}
module.exports.evaluateStepUp = evaluateStepUp;

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
// `onStepUpEvaluated` observes the step-up verdict for telemetry. It receives a
// copy and its failures are swallowed, so telemetry can neither change nor block
// the outcome of this gate.
module.exports.validateRequestedGrant = async function validateRequestedGrant(
  verifiedClaims,
  client,
  requestedGrant,
  { onStepUpEvaluated } = {}
) {
  requestedGrant.scope = requestedGrant.scope || ScopeSet.fromArray([]);

  const { requested, satisfied, reason, authAgeSeconds } = evaluateStepUp(
    verifiedClaims,
    requestedGrant
  );
  try {
    onStepUpEvaluated?.({ requested, satisfied, reason, authAgeSeconds });
  } catch (err) {
    // The observer reports its own failures; this is the last line keeping one
    // from surfacing as a 500 in place of errno 170.
  }

  // Throws errno 170 (INSUFFICIENT_ACR_VALUES) — the signal the frontend routes to a
  // second-factor challenge (see pages/Signin/utils.ts, lib/oauth/hooks.tsx).
  if (requested && !satisfied) {
    throw AppError.insufficientACRValues(String(verifiedClaims['fxa-aal']));
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

  // For custom scopes, is the client allowed to request them?
  let requiresVerifiedToken = false;
  const scopeConfig = {};
  const customScopes = ScopeSet.fromArray([]);
  const notFoundCustomScopes = ScopeSet.fromArray([]);
  for (const scope of requestedGrant.scope.getScopeValues()) {
    const s = (scopeConfig[scope] = await db.getScope(scope));
    if (s) {
      if (s.hasScopedKeys) {
        // scoped keys require verification, see comment below.
        requiresVerifiedToken = true;
      }
      customScopes.add(scope);
    } else {
      notFoundCustomScopes.add(scope);
    }
  }

  // For trusted clients, validate scopes against clients trusted scopes
  if (client.trusted) {
    const clientScopeSet = ScopeSet.fromString(client.allowedScopes || '');
    const trustedClientAllowedScopes = clientScopeSet.union(
      TRUSTED_CLIENT_ALLOWED_SCOPES
    );

    const invalidScopes = requestedGrant.scope.difference(
      trustedClientAllowedScopes
    );
    if (!invalidScopes.isEmpty()) {
      if (config.get('oauthServer.strictScopeValidation')) {
        // Strict mode: remove invalid scopes
        requestedGrant.scope = requestedGrant.scope.difference(invalidScopes);
      }
    }
  }

  // For custom scopes (starts with https), validate against client's allowedScopes
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
    userId: Buffer.from(verifiedClaims.uid, 'hex'),
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
module.exports.generateTokens = async function generateTokens(grant) {
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
  const clientId = grant.clientId.toString('hex');
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
  // auth_time is the authentication event, in seconds since the epoch.
  // grant.authAt is already in seconds (it comes from fxa-lastAuthAt /
  // session_token.lastAuthAt(), and is the same value emitted as `auth_at` on
  // the token response and as `auth_time` on the JWT access token), so emit it
  // directly. It previously divided by 1000 again, yielding a value ~1000x too
  // small.
  if (grant.authAt) {
    claims.auth_time = grant.authAt;
  }

  return jwt.sign(claims);
}

exports.generateAccessToken = async function generateAccessToken(grant) {
  const clientId = grant.clientId.toString('hex').toLowerCase();
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
        clientId,
        await capabilityService.subscriptionCapabilities(
          grant.userId.toString('hex'),
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
