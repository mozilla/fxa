/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { test as standardTest, expect } from './standard';
import { create as createPaymentPages } from '../../pages/payments';
import { BaseTarget } from '../targets/base';

export type PaymentPOMS = ReturnType<typeof createPaymentPages>;

export { expect };

const WAF_BYPASS_TOKEN = process.env.WAF_BYPASS_TOKEN;

/**
 * Adds a route handler that injects the WAF bypass header on requests to
 * the payments-next domain only. No-op when WAF_BYPASS_TOKEN is unset.
 */
async function addPaymentsWafBypassHeader(page: Page, target: BaseTarget) {
  if (!WAF_BYPASS_TOKEN) return;
  const paymentsHost = new URL(target.paymentsNextUrl).host;
  const pattern = new RegExp(
    paymentsHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  await page.route(pattern, async (route) => {
    await route.continue({
      headers: {
        ...route.request().headers(),
        'fxa-ci': WAF_BYPASS_TOKEN,
      },
    });
  });
}

export const test = standardTest.extend<{
  paymentPages: PaymentPOMS;
}>({
  page: async ({ page, target }, use) => {
    await addPaymentsWafBypassHeader(page, target);
    await use(page);
  },

  paymentPages: async ({ target, page }, use) => {
    const paymentPages = createPaymentPages(page, target);
    await use(paymentPages);
  },
});
