/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = (v) => (Buffer.isBuffer(v) ? v.toString('hex') : v);
const Joi = require('joi');

const { OauthError } = require('@fxa/accounts/errors');
const { AppError: AuthError } = require('@fxa/accounts/errors');
const {
  MOBILE_OAUTH_NATIVE_CLIENT_IDS,
  OAUTH_NATIVE_CLIENT_IDS,
  OAuthNativeClients,
} = require('@fxa/accounts/oauth');
const ScopeSet = require('fxa-shared').oauth.scopes;
const validators = require('../../oauth/validators');
const { validateRequestedGrant, generateTokens } = require('../../oauth/grant');
const { makeAssertionJWT } = require('../../oauth/util');
const verifyAssertion = require('../../oauth/assertion');
const { isFirstAuthorization } = require('../../oauth/first-authorization');
const encrypt = require('fxa-shared/auth/encrypt');
const {
  dropUnconsentedSyncScope,
  excludeDauCacheKey,
} = require('../../oauth/desktop-sync-dau-authorization-bandaid');
const OAUTH_DOCS = require('../../../docs/swagger/oauth-api').default;
const OAUTH_SERVER_DOCS =
  require('../../../docs/swagger/oauth-server-api').default;
const DESCRIPTION =
  require('../../../docs/swagger/shared/descriptions').default;

const RESPONSE_TYPE_CODE = 'code';
const RESPONSE_TYPE_TOKEN = 'token';

const ACCESS_TYPE_ONLINE = 'online';
const ACCESS_TYPE_OFFLINE = 'offline';

const PKCE_SHA256_CHALLENGE_METHOD = 'S256'; // This server only supports S256 PKCE, no 'plain'
const PKCE_CODE_CHALLENGE_LENGTH = 43;

// RFC 8252 loopback hosts. Exact match (not substring/suffix) is what keeps
// `localhost.attacker.com` and friends from becoming an open redirect.
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function isLocalHost(url) {
  // new URL().hostname is already lowercased and keeps IPv6 brackets; only the
  // trailing-dot FQDN form (e.g. `localhost.`) needs normalizing.
  const host = new URL(url).hostname.replace(/\.$/, '');
  return LOOPBACK_HOSTS.has(host);
}

/**
 * Whether this authorization is a device pairing, inferred rather than declared:
 * Firefox sends an identical payload either way, so there is no marker to read.
 *
 * A mobile client's code is normally requested by that same app, from the FxA
 * page inside its own webview. Pairing is the one flow where desktop Firefox
 * asks for it on the phone's behalf, and that is what this identifies. Pairing
 * from a phone to a desktop is not supported, so there is no mirror case.
 *
 * Deliberately a positive test for desktop Firefox rather than "not a mobile
 * device". Current iPad Firefox sends a Mac UA with no FxiOS token, leaving it
 * indistinguishable from MacBook Safari (FXA-10427), so it parses as neither
 * mobile nor tablet — a negative test would count an ordinary iPad sign-in as a
 * pairing. Only real desktop Firefox carries Gecko's `Firefox/<version>`, which
 * `browser` is parsed from; iPad Firefox is WebKit and reports Safari. That also
 * means this does not depend on iPad detection ever being fixed.
 */
function isPairingAuthorization(request, clientId) {
  if (!MOBILE_OAUTH_NATIVE_CLIENT_IDS.has(clientId.toLowerCase())) {
    return false;
  }
  const ua = request.app.ua;
  // deviceType is null only for a desktop; Firefox on an Android tablet would
  // otherwise slip through on `browser` alone.
  return ua?.browser === 'Firefox' && !ua?.deviceType;
}

module.exports = ({
  log,
  oauthDB,
  config,
  statsd,
  glean,
  authServerCacheRedis,
}) => {
  if (!config) {
    config = require('../../../config').default.getProperties();
  }
  const MAX_TTL_S = config.oauthServer.expiration.accessToken / 1000;
  const CODE_EXPIRATION_S = Math.ceil(
    config.oauthServer.expiration.code / 1000
  );

  const DISABLED_CLIENTS = new Set(config.oauthServer.disabledClients);

  const ALLOWED_SCHEMES = ['https'];

  if (config.oauthServer.allowHttpRedirects === true) {
    // http scheme used when developing OAuth clients
    ALLOWED_SCHEMES.push('http');
  }
  const contentUrl = config.oauthServer.contentUrl;
  const OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS = new Set(
    // TODO: dedupe config param with `oauthServer.disabledClients`
    config.oauth.disableNewConnectionsForClients || []
  );

  function checkDisabledClientId(payload) {
    const clientId = payload.client_id;
    if (OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(clientId)) {
      throw AuthError.disabledClientId(clientId);
    }
  }
  // Hand the exclude-DAU decision to /oauth/token, which never receives
  // `service=`. The auth code is the only link between the two requests.
  // Written only when the answer is yes, so absence means "count it" — which
  // is also what a Redis failure degrades to.
  async function rememberExcludeDau(code, grant) {
    if (!grant.excludeDau || !authServerCacheRedis) {
      return;
    }
    try {
      const codeId = encrypt.hash(code).toString('hex');
      await authServerCacheRedis.set(
        excludeDauCacheKey(codeId),
        '1',
        'EX',
        CODE_EXPIRATION_S
      );
    } catch (err) {
      statsd?.increment('accountAuthorization.exclude_dau_write_failed');
      log.warn('accountAuthorization.exclude_dau_write_failed', {
        err: err?.message,
      });
    }
  }

  async function generateAuthorizationCode(client, payload, grant) {
    // Clients must use PKCE if and only if they are a public client.
    if (client.publicClient) {
      if (!payload.code_challenge_method || !payload.code_challenge) {
        log.info('client.missingPkceParameters');
        throw OauthError.missingPkceParameters();
      }
    } else {
      if (payload.code_challenge_method || payload.code_challenge) {
        log.info('client.notPublicClient');
        throw OauthError.notPublicClient({ id: payload.client_id });
      }
    }

    const state = payload.state;

    let code = await oauthDB.generateCode(
      Object.assign(grant, {
        codeChallengeMethod: payload.code_challenge_method,
        codeChallenge: payload.code_challenge,
        sessionTokenId:
          grant.sessionTokenId && Buffer.from(grant.sessionTokenId, 'hex'),
      })
    );
    code = hex(code);
    // Awaited: the client can redeem the code when we return it, so the write
    // must land first or /oauth/token can count the token towards DAU.
    await rememberExcludeDau(code, grant);

    const redirect = new URL(payload.redirect_uri);
    redirect.searchParams.set('code', code);
    redirect.searchParams.set('state', state);
    return {
      code,
      state,
      redirect: redirect.href,
      // RFC 6749 §5.1: response should include `scope` when the granted
      // scope differs from requested. We always include it so the caller
      // has a single source of truth — especially important when scope
      // was resolved server-side from `service=`. Today only Firefox (via
      // fxaOAuthLogin) consumes this field downstream; other RPs may
      // ignore it. Always non-empty after grant validation.
      scope: grant.scope.toString(),
    };
  }

  // N.B. We do not correctly implement the "implicit grant" flow from
  // RFC6749 which defines `response_type=token`. Instead, we have a
  // privileged set of clients that use `response_type=token` for something
  // approximating the "resource owner password grant" flow, using an identity
  // assertion to just directly grant tokens for their own use. Known current
  // users of this functionality include:
  //
  //  * Firefox Desktop, for getting "profile"-scoped tokens to access profile data
  //  * Firefox for Android, for getting "profile"-scoped tokens to access profile data
  //  * Firefox for iOS, for getting "profile"-scoped tokens to access profile data
  //
  // New clients should not do this, and should instead of `grant_type=fxa-credentials`
  // on the /token endpoint.
  //
  // This route is kept for backwards-compatibility only.
  async function generateImplicitGrant(client, payload, grant) {
    if (!client.canGrant) {
      log.warn('grantType.notAllowed', {
        id: hex(client.id),
        grant_type: 'fxa-credentials',
      });
      throw OauthError.invalidResponseType();
    }
    const ttl = Math.min(payload.ttl, MAX_TTL_S);
    return generateTokens({
      ...grant,
      grantType: 'fxa-credentials',
      resource: payload.resource,
      ttl,
    });
  }

  function validateClientDetails(client, payload) {
    if (!payload.redirect_uri && !client.redirectUri) {
      throw OauthError.incorrectRedirect();
    }

    // Starting in train-248, FxA added the ability for an OAuth client to support
    // multiple redirect uris (comma separated list). The authorization flow redirect uri
    // must match one of these exactly. Pattern matching is not supported.
    const redirectUris = client.redirectUri.split(',');

    // Authorization flow must use a single specific redirect_uri,
    // but allowed to not provide one and have us fill it in automatically.
    payload.redirect_uri = payload.redirect_uri || redirectUris[0];

    const validUri = redirectUris.some((uri) => {
      if (uri === payload.redirect_uri) {
        return true;
      }
    });

    if (!validUri) {
      if (
        config.oauthServer.localRedirects &&
        isLocalHost(payload.redirect_uri)
      ) {
        log.debug('redirect.local', { uri: payload.redirect_uri });
      } else {
        throw OauthError.incorrectRedirect(payload.redirect_uri);
      }
    } else {
      log.debug('redirect.mismatch', {
        param: payload.redirect_uri,
        registered: client.redirectUri,
      });
    }
  }

  // Record consent here, not at /oauth/token, so the URL service= is
  // available. Silent (prompt=none) re-auths and off-allowlist clients
  // are skipped; the latter guards privileged services like VPN from
  // a non-Mozilla RP forging consent on the user behalf. Errors are
  // swallowed; bookkeeping cannot break sign-in.
  // Resolve the browser service this authorization is for. Falls back
  // to inferring from a canonical scope when the URL omits service=,
  // but only when exactly one is present — ambiguous requests resolve to ''.
  function resolveServiceValue(req, requestedScopes) {
    const serviceParam = (req.payload.service || '').toLowerCase();
    if (oauthDB.isKnownService(serviceParam)) {
      return serviceParam;
    }
    const inferred = requestedScopes
      .map((s) => oauthDB.getServiceForCanonicalScope(s))
      .filter(Boolean);
    return inferred.length === 1 ? inferred[0] : '';
  }

  // Whether this sign-in should be kept out of the Sync DAU signal. Computed
  // separately from the consent write because it has to hold for requests that
  // never reach the ledger: prompt=none silent re-auths, and clients not on a
  // service's allowlist. Both still mint an apps/oldsync access token.
  function shouldExcludeSyncDau(req, grant) {
    const clientIdHex = hex(grant.clientId);
    // Cheapest gate first. dropUnconsentedSyncScope checks this too, but
    // short-circuit here if we can.
    if (clientIdHex !== OAuthNativeClients.FirefoxDesktop) {
      return false;
    }
    const requestedScopes = grant.scope.getScopeValues();
    if (requestedScopes.length === 0) {
      return false;
    }
    return dropUnconsentedSyncScope({
      scopes: requestedScopes,
      serviceValue: resolveServiceValue(req, requestedScopes),
      clientIdHex,
    }).droppedSyncScope;
  }

  async function recordAuthorizationRows(req, grant) {
    if (req.payload.prompt === 'none') {
      statsd?.increment('accountAuthorization.skipped', {
        reason: 'prompt_none',
      });
      return;
    }
    const requestedScopes = grant.scope.getScopeValues();
    if (requestedScopes.length === 0) {
      return;
    }
    const clientIdHex = hex(grant.clientId);
    const serviceValue = resolveServiceValue(req, requestedScopes);
    // Expose the resolved service for native clients so the `login` event can
    // report the browser service (matching the grain of `firstAuthorization`,
    // incl. scope-only flows like VPN cached sign-in) instead of the shared
    // client id. Only set for native clients — `service` is meaningless and
    // spoofable for web RPs, which fall back to the client id on the event.
    if (OAUTH_NATIVE_CLIENT_IDS.has(clientIdHex) && serviceValue) {
      req.app.oauthService = serviceValue;
    }
    if (!oauthDB.isClientAllowedForService(serviceValue, clientIdHex)) {
      statsd?.increment('accountAuthorization.skipped', {
        reason: 'client_not_allowed',
        service: serviceValue,
      });
      return;
    }
    const scopesToConsent = new Set(requestedScopes);
    if (serviceValue) {
      const canonical = oauthDB.getCanonicalScopeForService(serviceValue);
      if (canonical) {
        scopesToConsent.add(canonical);
      }
    }
    // Desktop requests the Sync scope on every browser flow, so drop it from
    // the ledger when another service was signed into. Grant and tokens are
    // untouched — see ../../oauth/desktop-sync-dau-authorization-bandaid.
    const { scopes: consentScopes, droppedSyncScope } =
      dropUnconsentedSyncScope({
        scopes: Array.from(scopesToConsent),
        serviceValue,
        clientIdHex,
      });
    const now = Date.now();
    const uidHex = hex(grant.userId);
    // Detect the user's first use of this service / RP, to drive
    // `firstAuthorization` on the `login` event. Best-effort: its own try/catch
    // keeps a read failure from suppressing the load-bearing consent writes
    // below, and the targeted existence query short-circuits (no DB call) when
    // the result is knowably false.
    let firstAuthorization = false;
    try {
      firstAuthorization = await isFirstAuthorization(oauthDB, {
        uid: uidHex,
        serviceValue,
        clientIdHex,
        isNativeClient: OAUTH_NATIVE_CLIENT_IDS.has(clientIdHex),
      });
    } catch (err) {
      statsd?.increment('accountAuthorization.first_auth_read_failed');
      log.warn('accountAuthorization.first_auth_read_failed', {
        err: err.message,
      });
    }
    // Single atomic upsert for all scopes, one DB connection. A rejection
    // bubbles to authorizationHandler's catch, which emits
    // accountAuthorization.write_failed and keeps sign-in working.
    await oauthDB.recordSignInConsents({
      uid: uidHex,
      scopes: consentScopes,
      service: serviceValue,
      clientId: clientIdHex,
      now,
    });
    // Only flag once the write succeeded, so the signal matches what landed.
    if (firstAuthorization) {
      req.app.firstAuthorization = true;
    }
    // Emitted after the write, like firstAuthorization above, so the counter
    // tracks rows actually kept out of the ledger rather than decisions made.
    // A failed write emits accountAuthorization.write_failed instead.
    if (droppedSyncScope) {
      statsd?.increment('accountAuthorization.sync_scope_dropped', {
        service: serviceValue || 'unset',
      });
    }
    statsd?.increment('accountAuthorization.recorded', {
      service: serviceValue || 'unset',
      access_type: grant.offline ? 'offline' : 'online',
    });
  }

  async function authorizationHandler(req, payloadOverride) {
    // payloadOverride lets the /oauth/authorization route inject a
    // server-resolved `scope` without mutating req.payload.
    const payload = payloadOverride ?? req.payload;
    const claims = await verifyAssertion(req.payload.assertion);

    const client = await oauthDB.getClient(
      Buffer.from(payload.client_id, 'hex')
    );
    if (!client) {
      log.debug('notFound', { id: payload.client_id });
      throw OauthError.unknownClient(payload.client_id);
    }
    validateClientDetails(client, payload);
    const grant = await validateRequestedGrant(claims, client, payload);
    // Set before recordAuthorizationRows so the decision survives its early
    // returns and its swallow-all catch — the token is minted either way.
    grant.excludeDau = shouldExcludeSyncDau(req, grant);
    try {
      await recordAuthorizationRows(req, grant);
    } catch (err) {
      statsd?.increment('accountAuthorization.write_failed');
      log.warn('accountAuthorization.write_failed', { err: err.message });
    }
    switch (payload.response_type) {
      case RESPONSE_TYPE_CODE:
        return await generateAuthorizationCode(client, payload, grant);
      case RESPONSE_TYPE_TOKEN: {
        const tokens = await generateImplicitGrant(client, payload, grant);
        req.emitMetricsEvent('token.created', {
          service: hex(grant.clientId),
          uid: hex(grant.userId),
        });
        return tokens;
      }
      default:
        // Joi validation means this should never happen.
        log.fatal('joi.response_type', {
          response_type: payload.response_type,
        });
        throw OauthError.invalidResponseType();
    }
  }

  return [
    {
      method: 'GET',
      path: '/authorization',
      config: {
        ...OAUTH_SERVER_DOCS.AUTHORIZATION_GET,
        cors: { origin: 'ignore' },
        handler: async function redirectAuthorization(req, h) {
          // keys_jwk is barred from transiting the OAuth server
          // to prevent a malicious OAuth server from stealing
          // a user's Scoped Keys. See bz1456351
          if (req.query.keys_jwk) {
            throw OauthError.invalidRequestParameter({ keys: ['keys_jwk'] });
          }

          const redirect = new URL(contentUrl);
          redirect.pathname = '/authorization';
          redirect.search = new URLSearchParams(req.query);
          return h.redirect(redirect.href);
        },
      },
    },
    {
      method: 'POST',
      path: '/authorization',
      config: {
        ...OAUTH_SERVER_DOCS.AUTHORIZATION_POST,
        cors: { origin: 'ignore' },
        validate: {
          payload: Joi.object({
            client_id: validators.clientId.description(
              DESCRIPTION.clientId + DESCRIPTION.clientIdRegistration
            ),
            assertion: validators.assertion
              .required()
              .description(DESCRIPTION.assertion),
            redirect_uri: Joi.string()
              .max(256)
              // uri validation ref: https://github.com/hapijs/joi/blob/master/API.md#stringurioptions
              .uri({
                scheme: ALLOWED_SCHEMES,
              })
              .description(DESCRIPTION.redirectUri),
            scope: validators.scope.required().description(DESCRIPTION.scope),
            response_type: Joi.string()
              .valid(RESPONSE_TYPE_CODE, RESPONSE_TYPE_TOKEN)
              .default(RESPONSE_TYPE_CODE)
              .description(DESCRIPTION.responseTypeOauth),
            state: Joi.string()
              .max(512)
              .when('response_type', {
                is: RESPONSE_TYPE_TOKEN,
                then: Joi.optional(),
                otherwise: Joi.required(),
              })
              .description(DESCRIPTION.state),
            ttl: Joi.number()
              .positive()
              .default(MAX_TTL_S)
              .when('response_type', {
                is: RESPONSE_TYPE_TOKEN,
                then: Joi.optional(),
                otherwise: Joi.forbidden(),
              })
              .description(DESCRIPTION.ttlOauth + DESCRIPTION.ttlOAuthPostAuth),
            access_type: Joi.string()
              .valid(ACCESS_TYPE_OFFLINE, ACCESS_TYPE_ONLINE)
              .default(ACCESS_TYPE_ONLINE)
              .optional()
              .description(DESCRIPTION.accessType),
            code_challenge_method: Joi.string()
              .valid(PKCE_SHA256_CHALLENGE_METHOD)
              .when('response_type', {
                is: RESPONSE_TYPE_CODE,
                then: Joi.optional(),
                otherwise: Joi.forbidden(),
              })
              .when('code_challenge', {
                is: Joi.string().required(),
                then: Joi.required(),
              })
              .description(DESCRIPTION.codeChallengeMethod),
            code_challenge: Joi.string()
              .length(PKCE_CODE_CHALLENGE_LENGTH)
              .when('response_type', {
                is: RESPONSE_TYPE_CODE,
                then: Joi.optional(),
                otherwise: Joi.forbidden(),
              })
              .description(DESCRIPTION.codeChallenge),
            keys_jwe: validators.jwe
              .when('response_type', {
                is: RESPONSE_TYPE_CODE,
                then: Joi.optional(),
                otherwise: Joi.forbidden(),
              })
              .description(DESCRIPTION.keysJwe),
            acr_values: Joi.string()
              .max(256)
              .optional()
              .allow(null)
              .description(DESCRIPTION.acrValues),
            max_age: Joi.number()
              .integer()
              .min(0)
              .optional()
              .allow(null)
              .description(DESCRIPTION.maxAge),
            resource: validators.resourceUrl
              .when('response_type', {
                is: RESPONSE_TYPE_TOKEN,
                then: Joi.optional(),
                otherwise: Joi.forbidden(),
              })
              .description(DESCRIPTION.resource + DESCRIPTION.resourceOauth),
            service: validators.service
              .optional()
              .description(DESCRIPTION.service),
            prompt: Joi.string().valid('none', 'login', 'consent').optional(),
          }),
        },
        response: {
          schema: Joi.object()
            .keys({
              redirect: Joi.string(),
              code: Joi.string().description(DESCRIPTION.codeOauth),
              state: Joi.string().description(DESCRIPTION.state),
              access_token: validators.accessToken.description(
                DESCRIPTION.accessToken
              ),
              token_type: Joi.string()
                .valid('bearer')
                .description(DESCRIPTION.tokenType),
              scope: Joi.string().allow('').description(DESCRIPTION.scope),
              auth_at: Joi.number().description(DESCRIPTION.authAt),
              expires_in: Joi.number().description(DESCRIPTION.expiresIn),
            })
            .with('access_token', [
              'token_type',
              'scope',
              'auth_at',
              'expires_in',
            ])
            .with('code', ['state', 'redirect', 'scope'])
            .without('code', ['access_token']),
        },
        handler: function (req) {
          // Refuse to generate new codes or tokens for disabled clients.
          if (DISABLED_CLIENTS.has(req.payload.client_id)) {
            throw OauthError.disabledClient(req.payload.client_id);
          }
          return authorizationHandler(req);
        },
      },
    },
    {
      method: 'POST',
      path: '/oauth/authorization',
      config: {
        ...OAUTH_DOCS.OAUTH_AUTHORIZATION_POST,
        auth: {
          strategies: ['sessionTokenBearer', 'sessionToken'],
          payload: 'required',
        },
        validate: {
          payload: Joi.object({
            response_type: Joi.string()
              .valid('code')
              .default('code')
              .description(DESCRIPTION.responseType),
            client_id: validators.clientId
              .required()
              .description(DESCRIPTION.clientId),
            redirect_uri: Joi.string()
              .max(256)
              .uri({
                scheme: ['http', 'https'],
              })
              .optional()
              .description(DESCRIPTION.redirectUri),
            scope: validators.scope.optional().description(DESCRIPTION.scope),
            state: Joi.string()
              .max(512)
              .required()
              .description(DESCRIPTION.state),
            access_type: Joi.string()
              .valid('offline', 'online')
              .default('online')
              .description(DESCRIPTION.accessType),
            code_challenge_method: validators.pkceCodeChallengeMethod
              .optional()
              .description(DESCRIPTION.codeChallengeMethod),
            code_challenge: validators.pkceCodeChallenge
              .optional()
              .description(DESCRIPTION.codeChallenge),
            keys_jwe: validators.jwe
              .optional()
              .description(DESCRIPTION.keysJwe),
            acr_values: Joi.string()
              .max(256)
              .allow(null)
              .optional()
              .description(DESCRIPTION.acrValues),
            max_age: Joi.number()
              .integer()
              .min(0)
              .allow(null)
              .optional()
              .description(DESCRIPTION.maxAge),
            assertion: Joi.forbidden(),
            resource: Joi.forbidden(),
            service: validators.service
              .optional()
              .description(DESCRIPTION.service),
            prompt: Joi.string().valid('none', 'login', 'consent').optional(),
          }).and('code_challenge', 'code_challenge_method'),
        },
        response: {
          schema: Joi.object({
            redirect: Joi.string(),
            code: Joi.string(),
            state: Joi.string().max(512),
            scope: Joi.string().description(DESCRIPTION.scope),
          }),
        },
      },
      handler: async function (req) {
        checkDisabledClientId(req.payload);
        const sessionToken = req.auth.credentials;

        // For services that require email verification for non-2FA non-Sync
        // flows, reject sessions in this state. This is accounted for in the
        // front-end as well, but this guards in our BE. This purposefully
        // does NOT check session.mustVerify because users in this kind of
        // unverified session don't have that flag set.
        const clientId = req.payload.client_id;
        if (
          config.servicesWithEmailVerification.includes(clientId) &&
          !sessionToken.tokenVerified
        ) {
          throw AuthError.unverifiedSession();
        }

        // Server-side scope resolution from `service=` for OAuthNative
        // (Firefox) clients. Only applies when service= is present and
        // the client did not specify scope=. If scope is given, it takes
        // precedence. `validators.scope` transforms the wire string into
        // a ScopeSet, so a present `req.payload.scope` is a ScopeSet here.
        // Compute lazily so requests without a service= param skip the
        // work entirely.
        let payloadOverride;
        if (req.payload.service) {
          const wireScope = req.payload.scope;
          const wireScopeIsEmpty = !wireScope || wireScope.isEmpty();
          if (wireScopeIsEmpty) {
            if (!OAUTH_NATIVE_CLIENT_IDS.has(clientId.toLowerCase())) {
              throw OauthError.invalidRequestParameter({ keys: ['scope'] });
            }
            const serviceParam = req.payload.service.toLowerCase();
            const clientIdHex = clientId.toLowerCase();
            // keys_jwe in the payload means the user entered a password
            // and the client wrapped scoped keys, so the resolver
            // appends apps/oldsync. `resolveScopesForService` returning
            // undefined IS the "unknown service" signal — single source
            // of truth via oauthServer.authorization.serviceScopes.
            const withKeys = req.payload.keys_jwe != null;
            const resolvedScopes = oauthDB.resolveScopesForService(
              serviceParam,
              withKeys
            );
            if (
              !resolvedScopes ||
              !oauthDB.isClientAllowedForService(serviceParam, clientIdHex)
            ) {
              throw OauthError.invalidRequestParameter({ keys: ['service'] });
            }
            payloadOverride = {
              ...req.payload,
              scope: ScopeSet.fromArray(resolvedScopes),
            };
          }
        } else if (!req.payload.scope || req.payload.scope.isEmpty()) {
          // Defense-in-depth against missing both query parameters.
          // Unreachable from fxa-settings today.
          throw OauthError.invalidRequestParameter({ keys: ['scope'] });
        }

        req.payload.assertion = await makeAssertionJWT(config, sessionToken);
        const result = await authorizationHandler(req, payloadOverride);

        // In pair2 the browser only reaches this endpoint after both devices
        // have confirmed, so a successful code here is a completed pairing.
        // Not awaited, matching the access_token.created call in token.js: a
        // metrics failure must not fail the authorization.
        if (isPairingAuthorization(req, clientId)) {
          glean.pairing.success(req);
        }

        const geoData = req.app.geo;
        const country = geoData.location && geoData.location.country;
        const countryCode = geoData.location && geoData.location.countryCode;
        const { email, uid } = sessionToken;
        const devices = await req.app.devices;
        await log.notifyAttachedServices('login', req, {
          country,
          countryCode,
          deviceCount: devices.length,
          email,
          // Resolved browser service (an OAuthNative service) when there is
          // one, so consumers can distinguish services that share a clientId
          // (Smart Window vs Sync on Desktop); else serviceTag, else the clientId
          // (mapped by log.js) for web RPs.
          service: req.app.oauthService || req.app.serviceTag || clientId,
          clientId,
          uid,
          userAgent: req.headers['user-agent'],
          firstAuthorization: !!req.app.firstAuthorization,
        });
        return result;
      },
    },
  ];
};

module.exports.isLocalHost = isLocalHost;
module.exports.isPairingAuthorization = isPairingAuthorization;
