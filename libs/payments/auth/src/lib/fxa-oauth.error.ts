/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';

/**
 * Base for FxA OAuth auth failures; not thrown directly. Each subclass `name`
 * is used verbatim as the `auth.fail` metric `reason` tag (see
 * AUTH_FAIL_METRIC) and in the guard log line, so keep the set small and stable.
 */
export class FxaOAuthError extends BaseError {
  constructor(message: string, info?: Record<string, unknown>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'FxaOAuthError';
  }
}

export class NoBearerTokenError extends FxaOAuthError {
  constructor() {
    super('Bearer token not provided');
    this.name = 'NoBearerTokenError';
  }
}

export class OAuthTokenRejectedError extends FxaOAuthError {
  constructor(status: number) {
    super(`Auth server rejected the access token (HTTP ${status})`, { status });
    this.name = 'OAuthTokenRejectedError';
  }
}

/**
 * OAuthVerifyUpstreamError is not thrown directly. It groups failures that are
 * the auth server's fault rather than a genuinely bad token — it was
 * unreachable, returned a 5xx, or returned a 2xx the client can't be blamed for
 * (non-JSON body, unexpected shape). The guard maps these to a 503 (via
 * `instanceof`) rather than a client 401, so an outage or deploy-skew surfaces
 * as a server error and isn't miscounted against clients.
 */
export class OAuthVerifyUpstreamError extends FxaOAuthError {
  constructor(message: string, info?: Record<string, unknown>, cause?: Error) {
    super(message, info, cause);
    this.name = 'OAuthVerifyUpstreamError';
  }
}

export class OAuthVerifyNetworkError extends OAuthVerifyUpstreamError {
  constructor(cause: Error) {
    super(
      `Auth server verify request failed (${cause.name})`,
      { detail: cause.name },
      cause
    );
    this.name = 'OAuthVerifyNetworkError';
  }
}

export class OAuthVerifyServerError extends OAuthVerifyUpstreamError {
  constructor(status: number) {
    super(`Auth server verify returned a server error (HTTP ${status})`, {
      status,
    });
    this.name = 'OAuthVerifyServerError';
  }
}

export class OAuthVerifyResponseParseError extends OAuthVerifyUpstreamError {
  constructor(cause: Error) {
    super('Auth server verify response was not valid JSON', undefined, cause);
    this.name = 'OAuthVerifyResponseParseError';
  }
}

export class OAuthVerifyResponseSchemaError extends OAuthVerifyUpstreamError {
  constructor() {
    super('Auth server verify response failed schema validation');
    this.name = 'OAuthVerifyResponseSchemaError';
  }
}

export class VerifyInsufficientScopeError extends FxaOAuthError {
  constructor() {
    super('Verified token is missing the required scope');
    this.name = 'VerifyInsufficientScopeError';
  }
}

export class JwtInvalidClaimsError extends FxaOAuthError {
  constructor() {
    super('JWT access token claims failed schema validation');
    this.name = 'JwtInvalidClaimsError';
  }
}

export class JwtInsufficientScopeError extends FxaOAuthError {
  constructor() {
    super('JWT access token is missing the required scope');
    this.name = 'JwtInsufficientScopeError';
  }
}
