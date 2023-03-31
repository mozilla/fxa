/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';
import { EmailHeader, EmailType } from '../../lib/email';

function getReactFeatureFlagUrl(target: BaseTarget, path: string) {
  return `${target.contentServerUrl}${path}?showReactApp=true`;
}

const NEW_PASSWORD = 'notYourAveragePassW0Rd';

test.describe('reset password', () => {
  test.beforeEach(async ({}, { project }) => {
    test.slow();
  });

  test('can reset password', async ({ page, target, credentials, context }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/reset_password'));

    // Verify react page has been loaded
    await page.waitForSelector('#root');

    await page.locator('input').fill(credentials.email);
    let waitForNavigation = page.waitForNavigation();
    await page.locator('text="Begin reset"').click();
    await waitForNavigation;

    // Verify confirm password reset page elements
    expect(
      await page.locator('text="Reset email sent"').isEnabled()
    ).toBeTruthy();
    expect(
      await page.locator('text="Remember your password? Sign in"').isEnabled()
    ).toBeTruthy();
    expect(
      await page
        .locator('text="Not in inbox or spam folder? Resend"')
        .isVisible()
    ).toBeTruthy();

    // We need to append `&showReactApp=true` to reset link inorder to enroll in reset password experiment
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&showReactApp=true`;

    // Open link in a new window
    const diffPage = await context.newPage();
    await diffPage.goto(link);

    // Loads the React version
    expect(await diffPage.locator('#root').isEnabled()).toBeTruthy();
    expect(
      await diffPage.locator('text="Create new password"').isEnabled()
    ).toBeTruthy();
    expect(
      await diffPage
        .locator('text="Remember your password? Sign in"')
        .isEnabled()
    ).toBeTruthy();

    await diffPage.locator('input[name="newPassword"]').fill(NEW_PASSWORD);
    await diffPage.locator('input[name="confirmPassword"]').fill(NEW_PASSWORD);

    const pageWaitForNavigation = page.waitForNavigation();
    const diffPageWaitForNavigation = diffPage.waitForNavigation();
    await diffPage.locator('text="Reset password"').click();
    await diffPageWaitForNavigation;
    await pageWaitForNavigation;

    expect(
      await diffPage.locator('text="Your password has been reset"').isEnabled()
    ).toBeTruthy();

    await diffPage.close();

    expect(
      await page.locator('text="Enter your email"').isEnabled()
    ).toBeTruthy();

    await page.locator('input[type=email]').fill(credentials.email);

    waitForNavigation = page.waitForNavigation();
    await page.locator('text="Sign up or sign in"').click();
    await waitForNavigation;

    await page.locator('#password').fill(NEW_PASSWORD);

    waitForNavigation = page.waitForNavigation();
    await page.locator('text="Sign in"').click();
    await waitForNavigation;

    const settingsHeader = await page.locator('text=Settings');
    expect(await settingsHeader.isEnabled()).toBeTruthy();

    // Cleanup requires setting this value to correct password
    credentials.password = NEW_PASSWORD;
  });
});
