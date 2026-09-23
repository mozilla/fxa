/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { SigninPage } from '../../pages/signin';
import { RelierPage } from '../../pages/relier';

/** Drives a relying party through email-first signin to the password form. */
async function signInAtRelier(
  relier: RelierPage,
  signin: SigninPage,
  credentials: { email: string; password: string }
) {
  await relier.goto();
  await relier.clickEmailFirst();
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
}

test.describe('severity-2', () => {
  test.describe('OAuth untrusted relier', () => {
    test('prompts for permissions on first signin, then returns to the relier', async ({
      target,
      pages: { page, signin, untrustedRelier, permissions },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signInAtRelier(untrustedRelier, signin, credentials);

      await permissions.waitForPage();
      // 321done requests openid, profile:uid, profile:email and
      // profile:display_name. Only the last two name profile information.
      await expect(permissions.scopeRows).toHaveCount(2);
      await expect(permissions.scopeRow('profile:email')).toContainText(
        credentials.email
      );
      await expect(permissions.scopeRow('profile:display_name')).toBeVisible();
      // The screen informs; the server is what restricts scope.
      await expect(page.getByRole('checkbox')).toHaveCount(0);
      await permissions.continueButton.click();

      expect(await untrustedRelier.isLoggedIn()).toBe(true);
      expect(page.url()).toContain(target.untrustedRelierUrl);
    });

    test('prompts for permissions after signup, then returns to the relier', async ({
      target,
      pages: { page, signup, confirmSignupCode, untrustedRelier, permissions },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSignupAccountDetails();

      await untrustedRelier.goto('force_passwordless=false');
      await untrustedRelier.clickEmailFirst();
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      await permissions.waitForPage();
      await permissions.continueButton.click();

      expect(await untrustedRelier.isLoggedIn()).toBe(true);
    });

    test('does not prompt again on a later signin for the same scopes', async ({
      pages: { signin, untrustedRelier, permissions },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signInAtRelier(untrustedRelier, signin, credentials);
      await permissions.waitForPage();
      await permissions.continueButton.click();
      expect(await untrustedRelier.isLoggedIn()).toBe(true);

      await untrustedRelier.signOut();
      await untrustedRelier.clickEmailFirst();
      await signin.signInButton.click();

      expect(await untrustedRelier.isLoggedIn()).toBe(true);
    });

    test('returns access_denied to the relier when the user cancels', async ({
      target,
      pages: { page, signin, untrustedRelier, permissions },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signInAtRelier(untrustedRelier, signin, credentials);

      await permissions.waitForPage();
      await permissions.cancelButton.click();

      await expect(page).toHaveURL(
        new RegExp(
          `^${target.untrustedRelierUrl}/api/oauth\\?.*error=access_denied`
        )
      );
    });
  });
});

test.describe('severity-1', () => {
  test.describe('OAuth trusted relier consent', () => {
    test('never prompts for permissions', async ({
      pages: { signin, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signInAtRelier(relier, signin, credentials);

      // A trusted client reads all profile information, so there is nothing to
      // inform the user of. It also may hold a key-bearing scope, which cannot
      // survive a detour through an interstitial page.
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });
});
