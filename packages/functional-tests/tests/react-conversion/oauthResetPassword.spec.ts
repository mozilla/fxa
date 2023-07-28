/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('oauth reset password react', () => {
  let resetPasswordReactFlag = false;

  test.beforeEach(async ({ pages: { login, resetPassword } }) => {
    resetPasswordReactFlag = resetPassword.react;
    resetPassword.react = true;
    test.slow();

    const config = await login.getConfig();
    test.skip(config.showReactApp.resetPasswordRoutes !== true);
    test.skip(config.showReactApp.oauthRoutes !== true);
  });

  test.afterEach(async ({ pages: { resetPassword } }) => {
    resetPassword.react = resetPasswordReactFlag;
  });

  test('reset password', async ({
    target,
    page,
    credentials,
    pages: { login, relier, resetPassword, settings },
  }) => {
    await openRelier({ pages: { settings, relier } });
    await passwordResetFlow(
      {
        target,
        page,
        credentials,
        pages: { login, relier, resetPassword },
      },
      {}
    );
  });

  test('reset password different tab', async ({
    target,
    page,
    credentials,
    pages: { login, relier, resetPassword, settings },
  }) => {
    await openRelier({ pages: { relier, settings } });
    await passwordResetFlow(
      {
        target,
        page,
        credentials,
        pages: { login, relier, resetPassword },
      },
      {
        newTab: true,
      }
    );
  });

  test('reset password scoped keys', async ({
    target,
    page,
    credentials,
    pages: { login, relier, resetPassword, settings },
  }) => {
    await openRelier({ pages: { relier, settings } });
    await passwordResetFlow(
      {
        target,
        page,
        credentials,
        pages: { login, relier, resetPassword },
      },
      {
        action: 'scopedKeys',
      }
    );
  });

  test('reset password with PKCE different tab', async ({
    target,
    page,
    credentials,
    pages: { login, relier, resetPassword },
  }) => {
    await passwordResetFlow(
      {
        target,
        page,
        credentials,
        pages: { login, relier, resetPassword },
      },
      {
        action: 'pkce',
        newTab: true,
      }
    );
  });

  test('reset password with account recovery key', async ({
    target,
    credentials,
    page,
    pages: { login, resetPassword, relier, settings, recoveryKey },
  }) => {
    const accountRecoveryKey = await addAccountRecoveryKeyFlow({
      credentials,
      pages: { settings, recoveryKey },
    });
    await openRelier({ pages: { relier, settings } });
    await passwordResetFlow(
      {
        target,
        credentials,
        page,
        pages: { login, resetPassword, relier },
      },
      {
        action: 'emailFirst',
        accountRecoveryKey,
      }
    );
  });

  test('reset password with valid totp', async ({
    target,
    credentials,
    page,
    pages: { login, resetPassword, relier, totp, settings },
  }) => {
    await addTotpFlow({ credentials, pages: { totp, settings } });
    await openRelier({ pages: { relier, settings } });
    await passwordResetFlow(
      {
        target,
        credentials,
        page,
        pages: { login, resetPassword, relier },
      },
      {
        action: 'emailFirst',
        totp: true,
      }
    );
  });
});

/**
 * Makes sure user is not signed in, and goes to the relier (ie 123done)
 */
async function openRelier({ pages: { settings, relier } }) {
  await relier.goto('showReactApp=true');
}

/**
 * Goes to settings and enables totp on user's account.
 */
async function addTotpFlow({ credentials, pages: { totp, settings } }) {
  await settings.goto();
  await settings.totp.clickAdd();
  const secret = await totp.useQRCode();
  if (secret) {
    credentials.secret = secret;
  }
  await totp.submit();
  const recoveryCodes = await totp.getRecoveryCodes();
  await totp.submit();
  await totp.setRecoveryCode(recoveryCodes[0]);
  await totp.submit();
}

/**
 * Goes to settings and enables the account recovery key on user's account.
 */
async function addAccountRecoveryKeyFlow({
  credentials,
  pages: { settings, recoveryKey },
}) {
  await settings.goto('isInRecoveryKeyExperiment=true');
  await settings.recoveryKey.clickCreate();
  await recoveryKey.clickStart();
  await recoveryKey.setPassword(credentials.password);
  await recoveryKey.clickCreateAccountRecoveryKey();
  const accountRecoveryKey = await recoveryKey.getKey();
  await recoveryKey.clickNext();
  await recoveryKey.clickFinish();

  return accountRecoveryKey;
}

/**
 * Primary function for running various permutations on reset password flows
 * @param param0
 * @param opts {
 *  action - The button to click on the relier 123done
 *  newTab - Whether or not the flow is conducted in a single tab, or if the processes is carried out
 *           in one tab, and then another after the confirmation email is received.
 *  accountRecoveryKey - If account recovery keys were enabled, then supply the key and activate that
 *                       part of the flow.
 *  totp - If 2 factor auth is enabled, then activate that part of the flow.
 * }
 */
async function passwordResetFlow(
  { target, page, credentials, pages: { login, relier, resetPassword } },
  opts: {
    action?: 'emailFirst' | 'scopedKeys' | 'pkce';
    newTab?: boolean;
    accountRecoveryKey?: string;
    totp?: boolean;
  }
) {
  const { action, newTab, accountRecoveryKey, totp } = opts;

  // Decide which flow to start from 123done
  if (action == null || action === 'emailFirst') {
    await relier.clickEmailFirst();
  } else if (action === 'scopedKeys') {
    await relier.clickSignInScopedKeys();
  } else if (action === 'pkce') {
    // TODO, the PKCE button is broken at the moment, so for now navigate directly to the link.
    // TODO: PKCE button doesn't appear to work at the moment locally. Some sort of cors error keeps getting in the way. Just go to link directly for now.
    await page.goto(
      'http://localhost:3030/authorization?showReactApp=true&access_type=offline&client_id=dcdb5ae7add825d2&pkce_client_id=38a6b9b3a65a1871&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth&scope=profile%20openid&action=signin&state=12eeaba43cc7548bf1f6b478b9de95328855b46df1e754fe94b21036c41c9cba',
      {
        waitUntil: 'load',
      }
    );
  }

  // Step 1 - Begin the password reset.
  // - Go to the login page
  // - Enter current email
  // - Select the forgot password link

  // TODO: Update once we port signin / signup.
  // param is set, this view is still using backbone.
  await login.setEmail(credentials.email);
  await login.submit();
  await login.clickForgotPassword();

  // TODO: Once the full flow is implemented in react, we can remove this. For now, we must 'refresh'
  // the page so that the 'showReactApp' param takes effect. Once conversion is complete this can be removed
  await page.reload();
  await checkForReactApp({ page });

  // Verify reset password header
  expect(
    await resetPassword.resetPasswordHeader(
      'Reset password to continue to 123Done'
    )
  ).toBe(true);

  await resetPassword.fillOutResetPassword(credentials.email);

  // Step 2 - Get the confirmation email
  let link = await target.email.waitForEmail(
    credentials.email,
    EmailType.recovery,
    EmailHeader.link
  );
  // Make sure showReactApp is appended to link
  link = link.includes('showReactApp=true')
    ? link
    : link.includes('?')
    ? `${link}&showReactApp=true`
    : `${link}?showReactApp=true`;

  // Clearing session state simulates a 'new' tab, and changes the navigation at the end of the flow.
  if (newTab) {
    await page.evaluate(() => window.sessionStorage.clear());
  }

  // Step 3 (optional) - Reset the password!
  await page.goto(link, { waitUntil: 'load' });
  await checkForReactApp({ page });

  // This is an alternate flow for accounts with recovery keys
  if (accountRecoveryKey) {
    await login.setRecoveryKey(accountRecoveryKey);
    await login.submit();
  }
  await resetPassword.resetNewPassword(credentials.password);

  // This is an alternate flow. The account is expecting to have 2FA, ie totp enabled.
  if (totp) {
    await login.setTotp(credentials.secret);
  }

  // Step 4 - Verify the end state. The user should either be:
  //  - logged into the relying party
  //  - or see a nice success message in fxa
  if (newTab) {
    await isSuccessMessageDisplayed({ page });
  } else {
    await isRelierLoggedIn({ page, pages: { relier } });
  }
}

/** Checks that the relier (ie 123 Done) is showing a logged in state. */
async function isRelierLoggedIn({ page, pages: { relier } }) {
  await page.waitForLoadState();
  const isLoggedIn = await relier.isLoggedIn();
  expect(isLoggedIn).toBe(true);
}

/** Checks that the reset password success screen is being displayed. */
async function isSuccessMessageDisplayed({ page }) {
  // The user should get a verification message and the orginating
  // service's name should be displayed.
  await page.waitForURL(/reset_password_verified/);
  await page.getByText('Your password has been reset');
  await page.getByText('You’re now ready to use 123Done');
}

/** Checks that the version of the app being used is the React Version. */
async function checkForReactApp({ page }) {
  expect(await page.locator('#root')).toBeVisible();
}
