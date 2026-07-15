/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { BaseTarget } from './targets/base';

const CI_WAF_TOKEN = process.env.CI_WAF_TOKEN;

/**
 * Adds a route handler that injects the WAF bypass header on requests to
 * FXA-owned domains only, leaving third-party origins (Stripe, hCaptcha)
 * untouched. No-op when CI_WAF_TOKEN is unset.
 *
 * Registered on the browser context, so it also covers pages opened later
 * (e.g. `context().newPage()` in ConfigPage.getConfig), not just this page.
 */
export async function addWafBypassHeader(page: Page, target: BaseTarget) {
  if (!CI_WAF_TOKEN) {
    if (target.name === 'stage' || target.name === 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        `⚠ CI_WAF_TOKEN is not set for target "${target.name}". Requests may be blocked by the WAF.`
      );
    }
    return;
  }
  const fxaDomains = [
    new URL(target.contentServerUrl).host,
    new URL(target.authServerUrl).host,
    new URL(target.paymentsNextUrl).host,
    new URL(target.relierUrl).host,
  ];
  const pattern = new RegExp(
    fxaDomains.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  );
  await page.context().route(pattern, async (route) => {
    await route.continue({
      headers: {
        ...route.request().headers(),
        'fxa-ci': CI_WAF_TOKEN,
      },
    });
  });
}
