/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { resolvePathnameWithLocale } from '@fxa/payments/ui/utils';
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle locale fallback
  const result = resolvePathnameWithLocale(
    request.nextUrl.pathname,
    request.headers.get('accept-language')
  );

  // Redirect only if the pathname has changed to avoid an infinite redirect loop
  if (result.redirect && result.pathname !== request.nextUrl.pathname) {
    return NextResponse.redirect(
      new URL(`${result.pathname}${request.nextUrl.search}`, request.url)
    );
  }

  // Read env vars directly from process.env
  // As of 05-15-2024 its not possible to use app/config in middleware
  const accountsStaticCdn = process.env.CSP__ACCOUNTS_STATIC_CDN;
  const PAYPAL_SCRIPT_URL = '*.paypal.com';
  const PAYPAL_OBJECTS = '*.paypalobjects.com';
  const PROFILE_CLIENT_URL = process.env.PROFILE_CLIENT_CONFIG__URL;
  const PROFILE_DEFAULT_IMAGES_URL = process.env.PROFILE_DEFAULT_IMAGES_URL;
  const PROFILE_UPLOADED_IMAGES_URL = process.env.PROFILE_UPLOADED_IMAGES_URL;
  const FEATURE_FLAG_SUB_MANAGE = process.env.FEATURE_FLAG_SUB_MANAGE;
  const CONTENT_SERVER_URL = process.env.CONTENT_SERVER_CLIENT_CONFIG__URL;

  if (!FEATURE_FLAG_SUB_MANAGE) {
    const pathSections = request.nextUrl.pathname.split('/').filter(Boolean);
    if (
      pathSections[0] === 'subscriptions' ||
      pathSections[1] === 'subscriptions'
    ) {
      return NextResponse.redirect(
        new URL(`${CONTENT_SERVER_URL}/subscriptions${request.nextUrl.search}`)
      );
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
    base-uri 'self';
    child-src 'self' ${PAYPAL_SCRIPT_URL} ${PAYPAL_OBJECTS};
    connect-src 'self' https://api.stripe.com ${PAYPAL_SCRIPT_URL} ${PAYPAL_OBJECTS};
    default-src 'self';
    font-src 'self';
    frame-ancestors 'none';
    frame-src https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com ${PAYPAL_SCRIPT_URL} ${PAYPAL_OBJECTS};
    img-src 'self' blob: data: ${accountsStaticCdn} ${PAYPAL_SCRIPT_URL} ${PAYPAL_OBJECTS} ${PROFILE_CLIENT_URL} ${PROFILE_DEFAULT_IMAGES_URL} ${PROFILE_UPLOADED_IMAGES_URL};
    object-src 'none';
    script-src 'self' 'nonce-${nonce}' ${
      process.env.NODE_ENV === 'production' ? '' : `'unsafe-eval'`
    } https://*.js.stripe.com https://js.stripe.com ${PAYPAL_SCRIPT_URL} ${PAYPAL_OBJECTS};
    style-src 'self' 'unsafe-hashes' 'sha256-0hAheEzaMe6uXIKV4EehS9pu1am1lj/KnnzrOYqckXk=' 'sha256-GsQC5AaXpdCaKTyWbxBzn7nitfp0Otwn7I/zu0rUKOs=' 'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk=' ${PAYPAL_SCRIPT_URL} ${PAYPAL_OBJECTS} 'nonce-${nonce}';
    upgrade-insecure-requests;
`;
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  );

  // If the user is not logged in, `getExperimentationId` uses the value we
  // set here to determine which experiments to show the user. We read it from
  // the `experimentationId` cookie, and initialise that cookie if it's unset.
  // (The reason we do this in middleware, is to ensure that every call to
  // `getExperimentationId` results in the same ID.)
  const existingExperimentationId = request.cookies.get('experimentationId');
  const experimentationId =
    existingExperimentationId?.value ?? `guest-${crypto.randomUUID()}`;
  requestHeaders.set('x-experimentation-id', experimentationId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  );

  response.cookies.set({
    name: 'experimentationId',
    value: experimentationId,
    path: '/',
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source:
        '/((?!api|error|_next/static|_next/image|favicon.ico|__heartbeat__|__lbheartbeat__|__version__|monitoring).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
