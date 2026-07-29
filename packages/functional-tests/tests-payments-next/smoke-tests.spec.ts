/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test('payments-next heartbeat endpoint returns 200', async ({
    target,
    request,
  }) => {
    const res = await request.get(`${target.paymentsNextUrl}/__heartbeat__`);
    expect(res.status()).toBe(200);
  });

  test('payments-next lbheartbeat endpoint returns 200', async ({
    target,
    request,
  }) => {
    const res = await request.get(`${target.paymentsNextUrl}/__lbheartbeat__`);
    expect(res.status()).toBe(200);
  });

  test('payments-next version endpoint returns 200', async ({
    target,
    request,
  }) => {
    const res = await request.get(`${target.paymentsNextUrl}/__version__`);
    expect(res.status()).toBe(200);
  });

  test('unauthenticated /subscriptions/manage redirects to FXA sign-in', async ({
    target,
    page,
  }) => {
    await page.goto(`${target.paymentsNextUrl}/subscriptions/manage`);
    // The redirect chain may involve an OAuth prompt=none roundtrip
    // (manage → landing → auth server → callback → content server),
    // so allow extra time for the final URL to settle.
    await expect(page).toHaveURL(new RegExp(target.contentServerUrl), {
      timeout: 30_000,
    });
  });
});
