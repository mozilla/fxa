/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test as standardTest, expect } from './standard';
import { create as createPaymentPages } from '../../pages/payments';

export type PaymentPOMS = ReturnType<typeof createPaymentPages>;

export { expect };

export const test = standardTest.extend<{
  paymentPages: PaymentPOMS;
}>({
  paymentPages: async ({ target, page }, use) => {
    const paymentPages = createPaymentPages(page, target);
    await use(paymentPages);
  },
});
