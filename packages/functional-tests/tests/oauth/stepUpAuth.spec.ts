/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { enableTotpOnAccount } from '../../lib/pairing-helpers';
import { getTotpCode } from '../../lib/totp';

test.describe('severity-2 #smoke', () => {
  test.describe('OAuth step-up auth', () => {
    test('satisfies a step-up request from a fresh AAL2 session', async ({
      target,
      pages: { page, relier, signin, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      // Assigned to `secret` so account teardown can elevate AAL to delete it.
      credentials.secret = await enableTotpOnAccount(
        target.authClient,
        credentials.sessionToken
      );

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_totp_code/);
      await signinTotpCode.fillOutCodeForm(
        await getTotpCode(credentials.secret)
      );

      expect(await relier.isLoggedIn()).toBe(true);
      const before = await relier.getAuthStatus();
      expect(before.acr).toBe('AAL2');
      // Pinned so the equality check below can't pass vacuously on null === null.
      expect(before.auth_time).toEqual(expect.any(Number));

      await relier.clickStepUpAuth(300);

      // The request carries no prompt=none, so the flow always stops at the cached
      // signin page to confirm — with no password field, which is the point of
      // step-up. max_age is well inside the sign-in challenge above, so confirming
      // returns to the relier without a second factor. Whether a *stale* session gets
      // re-challenged is grant.js's rule, pinned in its own unit tests.
      await expect(signin.cachedSigninSubmitButton).toBeVisible();
      await expect(signin.passwordTextbox).toBeHidden();
      await signin.signInButton.click();

      // isLoggedIn waits for the relier URL, so this also asserts we came back.
      expect(await relier.isLoggedIn()).toBe(true);

      const after = await relier.getAuthStatus();
      expect(after.acr).toBe('AAL2');
      expect(after.auth_time).toBe(before.auth_time);

      // The same elevation, as the authorization server reports it for the access
      // token — the check a resource server would make before a sensitive action.
      const introspected = await relier.getTokenClaims();
      expect(introspected.active).toBe(true);
      expect(introspected.acr).toBe('AAL2');
      expect(introspected.auth_time).toBe(after.auth_time);
      // TOTP, backup codes and SMS all collapse to `otp` in amr.
      expect(introspected.amr).toContain('otp');
    });
  });
});

// Not in #smoke: this asserts local rendering, and 123Done deploys to stage and
// production separately from the train.
test.describe('severity-2', () => {
  test.describe('OAuth step-up auth', () => {
    test('hides the step-up button until the user is signed in', async ({
      pages: { page, relier, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      // 123Done shows the button off body.logged-in, which it only sets once
      // /api/auth_status resolves — and body.ready marks that point. Without this
      // gate the hidden assertion would also pass against an unrendered page.
      await expect(page.locator('body.ready')).toBeAttached();
      await expect(relier.stepUpAuthButton).toBeHidden();

      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);
      await expect(relier.stepUpAuthButton).toBeVisible();

      // The max_age box is seeded from the server's configured default.
      const { step_up_max_age } = await relier.getAuthStatus();
      await expect(page.locator('#step-up-max-age')).toHaveValue(
        String(step_up_max_age)
      );
    });
  });
});
