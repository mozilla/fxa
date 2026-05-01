/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand } from '../../lib/channels';
import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('Pair entry flow', () => {
    test('direct /pair dispatches fxa_status and oauth_flow_begin and reveals the choice screen', async ({
      target,
      syncOAuthBrowserPages: { page, settings },
    }) => {
      await page.goto(`${target.contentServerUrl}/pair`);

      // testid avoids the Localized/label text-content quirk that confuses
      // getByLabel/getByRole here.
      await expect(page.getByTestId('has-mobile')).toBeVisible();
      await expect(page).toHaveURL(/\/pair(\?|$)/);

      await settings.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await settings.checkWebChannelMessage(FirefoxCommand.OAuthFlowBegin);
    });

    test('Continue on the choice screen dispatches pair_preferences', async ({
      target,
      syncOAuthBrowserPages: { page },
    }) => {
      await page.goto(`${target.contentServerUrl}/pair`);
      // Click the label so React's onChange fires; the radio is hidden behind
      // it, and check() on the input itself fails actionability.
      await page.locator('label[for="has-mobile"]').click();
      await expect(page.getByTestId('pair-continue-btn')).toBeEnabled();

      // Capture WebChannelMessageToChrome dispatches in a page-side promise
      // *before* clicking, so we observe pair_preferences even if Firefox's
      // chrome handler tears the test tab down right after.
      const dispatched = page.evaluate(
        () =>
          new Promise<string>((resolve) => {
            window.addEventListener(
              'WebChannelMessageToChrome',
              (e: Event) => {
                const detail = JSON.parse((e as CustomEvent).detail);
                if (detail.message.command === 'fxaccounts:pair_preferences') {
                  resolve(detail.message.command);
                }
              },
              { once: false }
            );
          })
      );

      await page.getByTestId('pair-continue-btn').click();
      expect(await dispatched).toBe('fxaccounts:pair_preferences');
    });

    test('direct /connect_another_device dispatches fxa_status and oauth_flow_begin', async ({
      target,
      syncOAuthBrowserPages: { page, settings },
    }) => {
      await page.goto(`${target.contentServerUrl}/connect_another_device`);

      await settings.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await settings.checkWebChannelMessage(FirefoxCommand.OAuthFlowBegin);
    });
  });
});
