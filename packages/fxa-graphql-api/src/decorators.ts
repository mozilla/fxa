/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SessionTokenResult } from './auth/session-token.strategy';
import { header } from 'fxa-auth-client';

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

  // Set the x-forwarded-for header since the auth-server will use this
  // to determine client geolocation. See fxa/templates/nginx-configmap.yaml in web-infra for details
  const xForwardedFor = incomingHeaders.get('X-Forwarded-For');
  if (typeof xForwardedFor === 'string' && xForwardedFor) {
    outGoingHeaders['x-forwarded-for'] = xForwardedFor;
  } else if (req?.ip) {
    outGoingHeaders['x-forwarded-for'] = req.ip;
  }

  // Set the user agent headers. Connected devices use this header for display name purposes
  const ua = incomingHeaders.get('user-agent');
  if (ua) {
    outGoingHeaders['user-agent'] = ua;
  }

  return new Headers(outGoingHeaders);
}
