/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

const ADMIN_PANEL_URL = process.env.ADMIN_PANEL_URL ?? 'http://localhost:8091';
const ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL ?? 'http://localhost:8095';

// Admin panel tests only run locally (stage/prod require SSO)
test.skip(({ target }) => target.name !== 'local');

test.describe('Admin Panel', () => {
  test('admin panel loads and renders navigation', async ({ page }) => {
    await page.goto(ADMIN_PANEL_URL);
    await expect(
      page.getByRole('link', { name: /account search/i })
    ).toBeVisible();
  });

  test('admin panel heartbeat is healthy', async () => {
    const res = await fetch(`${ADMIN_PANEL_URL}/__lbheartbeat__`);
    expect(res.status).toBe(200);
  });

  test('admin server heartbeat is healthy', async () => {
    const res = await fetch(`${ADMIN_SERVER_URL}/__lbheartbeat__`);
    expect(res.status).toBe(200);
  });

  test('account search by email returns account data via API', async ({
    target,
    testAccountTracker,
  }) => {
    const credentials = testAccountTracker.generateAccountDetails();
    await target.createAccount(credentials.email, credentials.password);

    const res = await fetch(
      `${ADMIN_SERVER_URL}/api/account/by-email?email=${encodeURIComponent(credentials.email)}`,
      {
        headers: {
          'oidc-claim-id-token-email': 'test-admin@mozilla.com',
          'remote-groups': 'vpn_fxa_admin_panel_prod',
        },
      }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.email).toBe(credentials.email);
  });

  test('account search from UI shows results', async ({
    target,
    page,
    testAccountTracker,
  }) => {
    const credentials = testAccountTracker.generateAccountDetails();
    await target.createAccount(credentials.email, credentials.password);

    await page.goto(`${ADMIN_PANEL_URL}/account-search`);

    const searchInput = page.getByTestId('email-input');
    await searchInput.fill(credentials.email);
    await page.getByTestId('search-button').click();

    await expect(page.getByText(credentials.email)).toBeVisible({
      timeout: 10000,
    });
  });
});
