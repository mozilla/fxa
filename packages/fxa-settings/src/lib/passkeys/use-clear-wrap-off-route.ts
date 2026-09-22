/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect } from 'react';
import { useLocation } from 'react-router';
import type { SensitiveDataClient } from '../sensitive-data-client';

/**
 * The only routes with a use for passkey wrap material: the password step
 * fills in `kB`, and the opt-in page seals it. The ceremony that sets the
 * material navigates straight to one of them.
 */
const WRAP_MATERIAL_ROUTES = [
  '/signin_passkey_fallback',
  '/inline_passwordless_sync_setup',
];

/**
 * Zeroes any pending passkey wrap material as soon as the user is on a route
 * that has no use for it. Mounted once at the app root, so no page has to
 * remember to clean up after itself. A route missing from the list above
 * zeroes the material early, costing the opt-in rather than leaking key bytes.
 */
export function useClearPasskeyWrapOffRoute(
  sensitiveDataClient: SensitiveDataClient
) {
  const { pathname } = useLocation();
  useEffect(() => {
    const holdsMaterial = WRAP_MATERIAL_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
    if (!holdsMaterial) {
      sensitiveDataClient.clearPasskeyWrapData();
    }
  }, [pathname, sensitiveDataClient]);
}
