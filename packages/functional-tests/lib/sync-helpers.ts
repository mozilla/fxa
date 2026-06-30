/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { BaseTarget } from './targets/base';

/**
 * Initiate a desktop Sync sign-in/up session in the test browser.
 *
 * Today this navigates to `/pair`, which makes Firefox drive the
 * `fxaccounts:fxa_status` / OAuth handshake the Sync flow depends on. Entering
 * via a hardcoded `?context=fx_desktop_v3&service=sync` URL no longer completes
 * that handshake on Firefox 147+ (keys_optional), so the browser must drive it.
 *
 * Centralized here so that if there's a different way to initiate a Sync session
 * later, only this function changes rather than every test.
 *
 * @param query optional query string appended to the entry URL (e.g. `stretch=2`).
 */
export async function gotoSyncSession(
  page: Page,
  target: BaseTarget,
  query?: string
): Promise<void> {
  const url = `${target.contentServerUrl}/pair${query ? `?${query}` : ''}`;
  await page.goto(url);
}
