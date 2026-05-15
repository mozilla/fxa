/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test as standardTest, expect } from './standard';
import { create as createPaymentPages } from '../../pages/payments';

export type PaymentPOMS = ReturnType<typeof createPaymentPages>;

export { expect };

const WAF_BYPASS_TOKEN = process.env.WAF_BYPASS_TOKEN;

export const test = standardTest.extend<{
  paymentPages: PaymentPOMS;
}>({
  paymentPages: async ({ target, page }, use) => {
    // Add WAF bypass for payments-next domain (separate Fastly instance).
    // This runs inside paymentPages fixture instead of overriding page,
    // so the standard fixture's addWafBypassHeader (CI_WAF_TOKEN for FXA
    // domains) is guaranteed to run via the unmodified page fixture.
    if (WAF_BYPASS_TOKEN) {
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
    const paymentPages = createPaymentPages(page, target);
    await use(paymentPages);
  },
});
