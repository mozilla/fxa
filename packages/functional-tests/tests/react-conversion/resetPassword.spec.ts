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
    test.slow(project.name !== 'local', 'email delivery can be slow');
  });

  test.skip('can reset password', async ({
    page,
    target,
    credentials,
    context,
  }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/reset_password'));

    // Verify react page has been loaded
    expect(await page.locator('#root').isVisible()).toBeTruthy();

    await page.locator('input').fill(credentials.email);
    await page.locator('text="Begin reset"').click();
    await page.waitForNavigation();

    // Verify confirm password reset page elements
    expect(
      await page.locator('text="Reset email sent"').isVisible()
    ).toBeTruthy();
    expect(
      await page.locator('text="Remember your password? Sign in"').isVisible()
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
    expect(await diffPage.locator('#root').isVisible()).toBeTruthy();
    expect(
      await diffPage.locator('text="Create new password"').isVisible()
    ).toBeTruthy();
    expect(
      await diffPage
        .locator('text="Remember your password? Sign in"')
        .isVisible()
    ).toBeTruthy();

    await diffPage.locator('input[name="newPassword"]').fill(NEW_PASSWORD);
    await diffPage.locator('input[name="confirmPassword"]').fill(NEW_PASSWORD);

    await diffPage.locator('text="Reset password"').click();
    await diffPage.waitForNavigation();

    expect(
      await diffPage.locator('text="Your password has been reset"').isVisible()
    ).toBeTruthy();
    await diffPage.close();

    // Attempt to login
    await page.waitForNavigation();
    expect(
      await page.locator('text="Enter your email"').isVisible()
    ).toBeTruthy();

    await page.locator('input[type=email]').fill(credentials.email);
    await page.locator('text="Sign up or sign in"').click();
    await page.waitForNavigation({ waitUntil: 'load' });
    await page.locator('#password').fill(NEW_PASSWORD);

    await page.locator('text="Sign in"').click();
    await page.waitForNavigation({ waitUntil: 'load' });

    const settingsHeader = await page.locator('text=Settings');
    // A bit strange, not sure why I needed to add the `waitFor` here
    await settingsHeader.waitFor();
    expect(await settingsHeader.isVisible()).toBeTruthy();

    // Cleanup requires setting this value to correct password
    credentials.password = NEW_PASSWORD;
  });
});
