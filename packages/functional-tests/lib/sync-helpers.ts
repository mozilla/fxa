/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { BaseTarget } from './targets/base';

/**
 * Start a desktop Sync sign-in/up via `/pair` so Firefox drives the
 * fxa_status/OAuth handshake. A hardcoded fx_desktop_v3 URL no longer completes
 * it on FF147+ (keys_optional), so the browser must drive it.
 *
 * @param query optional query string appended to the entry URL.
 */
export async function gotoSyncSession(
  page: Page,
  target: BaseTarget,
  query?: string
): Promise<void> {
  const url = `${target.contentServerUrl}/pair${query ? `?${query}` : ''}`;
  await page.goto(url);
}
