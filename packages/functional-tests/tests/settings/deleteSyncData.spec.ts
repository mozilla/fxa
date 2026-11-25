/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

// The test account's only device has no send-tab command, and the stack runs
// no tokenserver, so the Sync-capable flag and the delete are answered here.
// The auth-server route has its own integration tests, and the failure
// branches are unit-tested on the page; these cover the real guard, reauth,
// device sign-out and the hand-off to email-first. Marking the test device as
// the current session is also a stub: it was registered on the sign-up
// session, not the one this browser signed in with, so signing it out does
// not end the browser's session. The UI path is what's under test.
async function stubSyncData(page: Page, { isCurrentSession = false } = {}) {
  await page.route('**/v1/account/attached_clients', async (route) => {
    const response = await route.fetch();
    const clients: Array<Record<string, unknown>> = await response.json();
    await route.fulfill({
      response,
      json: clients.map((client) =>
        client.deviceId
          ? { ...client, isSyncCapable: true, isCurrentSession }
          : client
      ),
    });
  });
  await page.route('**/v1/account/sync_data/destroy', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ deleted: true }),
    })
  );
}

test.describe('severity-2 #smoke', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    const config = await configPage.getConfig();
    test.skip(
      !config.featureFlags?.syncDataDeletionEnabled,
      'Sync data deletion flag is not enabled'
    );
  });

  test('deletes synced data and stays signed in', async ({
    target,
    pages: { page, deleteSyncData, settings, signin },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await stubSyncData(page);
    await signInAccount(target, page, settings, signin, credentials);

    await settings.goto();
    await settings.deleteSyncDataButton.click();
    await settings.confirmMfaGuard(credentials.email);
    await deleteSyncData.fillOutPassword(credentials.password);

    await expect(deleteSyncData.deleteButton).toHaveText('Delete');
    await deleteSyncData.deleteButton.click();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBarPanel).toHaveClass(/success/);
  });

  test('deletes synced data and signs out of this device', async ({
    target,
    pages: { page, deleteSyncData, settings, signin },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await stubSyncData(page, { isCurrentSession: true });
    await signInAccount(target, page, settings, signin, credentials);

    // Firefox opens Settings with these; they must not follow the user to
    // email-first, where they would trigger a browser hand-off for the
    // account just signed out.
    await page.goto(
      `${target.baseUrl}/settings?context=oauth_webchannel_v1&entrypoint=fxa_avatar_menu&email=${encodeURIComponent(credentials.email)}`
    );
    await expect(settings.settingsHeading).toBeVisible();
    await settings.deleteSyncDataButton.click();
    await settings.confirmMfaGuard(credentials.email);
    await deleteSyncData.fillOutPassword(credentials.password);

    await deleteSyncData.signOutAllCheckbox.check();
    await expect(deleteSyncData.deleteButton).toHaveText('Delete and sign out');
    await deleteSyncData.deleteButton.click();

    await expect(signin.emailTextbox).toBeVisible();
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page).toHaveURL((url) => url.search === '');
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  credentials: Credentials
): Promise<void> {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  await expect(settings.settingsHeading).toBeVisible();
}
