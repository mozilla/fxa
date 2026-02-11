/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SessionTokenResult } from './auth/session-token.strategy';

/**
 * Extracts the token from an authenticated user for a GraphQL request.
 */
export const GqlSessionToken = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const ctx = GqlExecutionContext.create(context).getContext();
    return (ctx.req?.user as SessionTokenResult).token;
  }
);

/**
 * Extracts the session user id from an authenticated user for a GraphQL request.
 */
export const GqlUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const ctx = GqlExecutionContext.create(context).getContext();
    return (ctx.req?.user as SessionTokenResult).session.uid;
  }
);

/**
 * Extracts the session user id from an authenticated user for a GraphQL request.
 */
export const GqlUserState = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const ctx = GqlExecutionContext.create(context).getContext();
    return (ctx.req?.user as SessionTokenResult).session.state;
  }
);

/**
 * Extracts headers to be sent to auth-server
 */
export const GqlXHeaders = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Headers => {
    const ctx = GqlExecutionContext.create(context).getContext();

    return extractRequiredHeaders(ctx.req);
  }
);

export function extractRequiredHeaders(req?: {
  ip: string;
  headers: Record<string, string>;
}): Headers {
  const incomingHeaders = new Headers(req?.headers || {});
  const outGoingHeaders: Record<string, string> = {};

  function propagate(key: string, fallback?: string) {
    const val = incomingHeaders.get(key);
    if (val != null) {
      outGoingHeaders[key.toLowerCase()] = val;
      return true;
    } else if (fallback) {
      outGoingHeaders[key.toLowerCase()] = fallback;
    }
    return false;
  }

  // Set the x-forwarded-for header since the auth-server will use this
  // to determine client geolocation. See fxa/templates/nginx-configmap.yaml in web-infra for details
  propagate('X-Forwarded-For', req?.ip);

  // Set the accept language. This is important for any action that will deliver an email at
  // a later point in time, e.g. signup.
  propagate('Accept-Language');

  // Copy tracing headers
  propagate('sentry-trace');
  propagate('baggage');

  // Copy the user agent. Matters for customs and error reporting.
  propagate('user-agent');

  return new Headers(outGoingHeaders);
}
