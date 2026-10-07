/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { FirefoxCommand, FxAStatusResponse } from './channels';
import { BaseTarget } from './targets/base';

type SignedInUser = FxAStatusResponse['message']['data']['signedInUser'];

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

/**
 * Ask Firefox which account it holds, over the web channel Settings uses.
 * Rejects if Firefox does not answer within `timeoutMs`.
 */
export async function requestBrowserSignedInUser(
  page: Page,
  timeoutMs = 5000
): Promise<SignedInUser> {
  return page.evaluate(
    ({ command, timeoutMs }) =>
      new Promise<SignedInUser>((resolve, reject) => {
        const timer = setTimeout(() => {
          removeEventListener('WebChannelMessageToContent', listener);
          reject(new Error(`${command} got no reply from Firefox`));
        }, timeoutMs);
        function listener(e: Event) {
          const detail = (e as CustomEvent).detail;
          const { message } =
            typeof detail === 'string' ? JSON.parse(detail) : detail;
          if (message?.command !== command) {
            return;
          }
          clearTimeout(timer);
          removeEventListener('WebChannelMessageToContent', listener);
          resolve(message.data.signedInUser);
        }
        addEventListener('WebChannelMessageToContent', listener);
        dispatchEvent(
          new CustomEvent('WebChannelMessageToChrome', {
            detail: JSON.stringify({
              id: 'account_updates',
              message: {
                command,
                data: { context: '', isPairing: false, service: 'sync' },
                messageId: `${Date.now()}`,
              },
            }),
          })
        );
      }),
    { command: FirefoxCommand.FxAStatus, timeoutMs }
  );
}
