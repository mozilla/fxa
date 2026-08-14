/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { enableTotpOnAccount } from '../../lib/pairing-helpers';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { getTotpCode } from '../../lib/totp';
import { RelierPage } from '../../pages/relier';
import { SigninPage } from '../../pages/signin';
import { SigninTotpCodePage } from '../../pages/signinTotpCode';

// The authorization server allows MAX_AGE_LEEWAY_SECONDS = 5 of grace on the
// max_age comparison, so a session requested with max_age=0 is satisfied straight
// after a challenge and goes stale just over 5 seconds later. Nothing larger is
// reachable inside a test, which is why every re-challenge here uses 0.
const MAX_AGE_STALE_MS = 7000;

// Far outside that window, so a session that authenticated seconds ago satisfies
// the request outright. This is the "sudo window" end of the max_age dial.
const MAX_AGE_SUDO_WINDOW_SECONDS = 300;

// Bounds for a plausible just-issued auth_time, in seconds. Generous on the past
// side so a slow CI run cannot fail on timing alone, tight on the future side
// because that is where a milliseconds-for-seconds regression would land.
const AUTH_TIME_MAX_AGE_S = 600;
const AUTH_TIME_SKEW_S = 60;

/** An account whose TOTP secret is known, so codes can be generated for it. */
type TotpAccount = Credentials & { secret: string };

type AuthStatus = Awaited<ReturnType<RelierPage['getAuthStatus']>>;

/** An elevation snapshot whose `auth_time` is known to be present and sane. */
type Elevation = AuthStatus & { auth_time: number };

test.describe('severity-2 #smoke', () => {
  test.describe('OAuth step-up auth', () => {
    test('satisfies a step-up request from a fresh AAL2 session', async ({
      target,
      pages: { page, relier, signin, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await signUpWithTotp(target, testAccountTracker);
      await signInToRelierWithTotp({
        credentials,
        page,
        relier,
        signin,
        signinTotpCode,
      });

      const before = await captureElevation(relier);

      await relier.clickStepUpAuth(MAX_AGE_SUDO_WINDOW_SECONDS);

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
      // Unchanged, because no challenge happened — same authentication event.
      expect(after.auth_time).toBe(before.auth_time);

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

// severity-2 puts these on stage but not production, which runs severity-1 only.
// They fail on stage until 123Done is redeployed there — it ships to stage and
// production separately from the train — and that window is accepted rather than
// carried as a gate someone has to remember to remove.
test.describe('severity-2', () => {
  test.describe('OAuth step-up auth re-challenges', () => {
    test('re-challenges a stale AAL2 session for TOTP and advances auth_time', async ({
      target,
      pages: { page, relier, signin, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await signUpWithTotp(target, testAccountTracker);
      await signInToRelierWithTotp({
        credentials,
        page,
        relier,
        signin,
        signinTotpCode,
      });

      const before = await captureElevation(relier);
      await goStale(page);

      await startStepUp({ maxAge: 0, page, relier, signin });

      // A step-up on an already-verified session currently reaches the TOTP page
      // via a bounce through /inline_totp_setup, so wait on the destination rather
      // than asserting the immediate URL.
      await page.waitForURL(/signin_totp_code/);
      await signinTotpCode.fillOutCodeForm(
        await getTotpCode(credentials.secret)
      );

      expect(await relier.isLoggedIn()).toBe(true);
      await expectElevationAdvanced(relier, before);
    });

    test('accepts a backup authentication code as the second factor', async ({
      target,
      pages: { page, relier, signin, signinRecoveryCode, signinTotpCode },
      testAccountTracker,
    }) => {
      const { credentials, recoveryCodes } = await signUpWithTotpAndBackupCodes(
        target,
        testAccountTracker
      );
      await signInToRelierWithTotp({
        credentials,
        page,
        relier,
        signin,
        signinTotpCode,
      });

      const before = await captureElevation(relier);
      await goStale(page);

      await startStepUp({ maxAge: 0, page, relier, signin });
      await page.waitForURL(/signin_totp_code/);
      await signinTotpCode.clickTroubleEnteringCode();
      // No recovery phone on this account, so the choice screen is skipped.
      await page.waitForURL(/signin_recovery_code/);
      await signinRecoveryCode.fillOutCodeForm(recoveryCodes[0]);

      expect(await relier.isLoggedIn()).toBe(true);
      // `recovery-code` maps to the same `otp` amr value as `totp-2fa`, so amr
      // cannot show which method was used — auth_time advancing is the only signal
      // that this one satisfied the challenge.
      await expectElevationAdvanced(relier, before);
    });

    test('drops elevation from a refreshed access token', async ({
      target,
      pages: { page, relier, signin, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await signUpWithTotp(target, testAccountTracker);
      await signInToRelierWithTotp({
        credentials,
        page,
        relier,
        signin,
        signinTotpCode,
      });

      const elevated = await relier.getTokenClaims();
      expect(elevated.active).toBe(true);
      expect(elevated.acr).toBe('AAL2');
      expect(typeof elevated.auth_time).toBe('number');

      await relier.refreshAccessToken();

      // The refresh grant never re-evaluates acr_values/max_age, and the stored
      // refresh token carries no authentication event, so the new access token has
      // no assurance level to report. A resource server has to run step-up again
      // rather than treat a refreshed token as still elevated.
      // `active: true` is load-bearing: it proves the authorization server knows
      // this token and considers it live, so the two null claims below describe a
      // real unelevated token rather than a failed introspection. Introspection's
      // iat/exp cannot be used to tell the two tokens apart — they are second
      // granular, so a refresh inside the same second reports identical values.
      const refreshed = await relier.getTokenClaims();
      expect(refreshed.active).toBe(true);
      expect(refreshed.acr).toBe(null);
      expect(refreshed.auth_time).toBe(null);
    });

    test('enrols a second factor inline when the account has none', async ({
      target,
      pages: { page, inlineTotpSetup, relier, signin, totp },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      expect(await relier.isLoggedIn()).toBe(true);
      expect((await relier.getAuthStatus()).acr).toBe('AAL1');

      await startStepUp({ maxAge: 0, page, relier, signin });

      // There is no AAL2 method to challenge, so errno 170 routes to enrolment.
      const { available: recoveryPhoneAvailable } =
        await target.authClient.recoveryPhoneAvailable(
          credentials.sessionToken
        );
      // Sets credentials.secret, which account teardown needs to elevate and delete.
      await totp.completeInlineSetupWithBackupCodes(
        inlineTotpSetup,
        credentials,
        recoveryPhoneAvailable
      );

      expect(await relier.isLoggedIn()).toBe(true);
      const after = await relier.getAuthStatus();
      expect(after.acr).toBe('AAL2');
      expect(typeof after.auth_time).toBe('number');
    });
  });
});

// Local only, and not for the same reason as the block above: two 7 second sleeps
// plus three TOTP entries put this near the 60 second test ceiling, so remote
// latency would make it flake rather than fail honestly.
test.describe('OAuth step-up auth repeat challenges (local only)', () => {
  test('re-challenges each successive sensitive action under a tight max_age', async ({
    target,
    pages: { page, relier, signin, signinTotpCode },
    testAccountTracker,
  }) => {
    const credentials = await signUpWithTotp(target, testAccountTracker);
    await signInToRelierWithTotp({
      credentials,
      page,
      relier,
      signin,
      signinTotpCode,
    });

    const first = await captureElevation(relier);
    await goStale(page);

    await startStepUp({ maxAge: 0, page, relier, signin });
    await page.waitForURL(/signin_totp_code/);
    await signinTotpCode.fillOutCodeForm(await getTotpCode(credentials.secret));
    expect(await relier.isLoggedIn()).toBe(true);
    const second = await expectElevationAdvanced(relier, first);

    await goStale(page);

    // The elevation granted moments ago has itself gone stale, so a second
    // sensitive action is challenged afresh rather than reusing it.
    await startStepUp({ maxAge: 0, page, relier, signin });
    await page.waitForURL(/signin_totp_code/);
    await signinTotpCode.fillOutCodeForm(await getTotpCode(credentials.secret));
    expect(await relier.isLoggedIn()).toBe(true);
    await expectElevationAdvanced(relier, second);
  });
});

// Local only — see "Routing SMS tests in CI" in the README. SmsClient.getCode()
// rejects a severity-labelled test that reads an SMS code without a #phone tag,
// so this describe deliberately carries no severity label.
test.describe('OAuth step-up auth with recovery phone (local only)', () => {
  test.beforeAll(({ target }) => {
    target.smsClient.guardTestPhoneNumber();
  });

  test('accepts a recovery phone code as the second factor', async ({
    target,
    pages: {
      page,
      recoveryPhone,
      relier,
      settings,
      signin,
      signinRecoveryChoice,
      signinRecoveryPhone,
      signinTotpCode,
    },
    testAccountTracker,
  }) => {
    const { credentials } = await signUpWithTotpAndBackupCodes(
      target,
      testAccountTracker
    );
    await signInToRelierWithTotp({
      credentials,
      page,
      relier,
      signin,
      signinTotpCode,
    });

    // Recovery phone has no API shortcut, so enrol it through Settings on the
    // session we already have. The MFA guard still applies: it is a separate
    // emailed-code check on account changes, independent of the session's AAL.
    await settings.goto();
    await settings.totp.addRecoveryPhoneButton.click();
    await settings.confirmMfaGuard(credentials.email);
    await recoveryPhone.submitPhoneNumber();
    await expect(recoveryPhone.confirmHeader).toBeVisible();
    await recoveryPhone.submitCode(
      await target.smsClient.getCode({ ...credentials })
    );
    await expect(settings.alertBar).toHaveText('Recovery phone added');

    await relier.goto();
    const before = await captureElevation(relier);
    await goStale(page);

    await startStepUp({ maxAge: 0, page, relier, signin });
    await page.waitForURL(/signin_totp_code/);
    await signinTotpCode.clickTroubleEnteringCode();
    // Both a phone and backup codes are set up, so the choice screen renders.
    await page.waitForURL(/signin_recovery_choice/);
    await signinRecoveryChoice.clickChoosePhone();
    await signinRecoveryChoice.clickContinue();
    await page.waitForURL(/signin_recovery_phone/);
    await signinRecoveryPhone.enterCode(
      await target.smsClient.getCode({ ...credentials })
    );
    await signinRecoveryPhone.clickConfirm();

    expect(await relier.isLoggedIn()).toBe(true);
    await expectElevationAdvanced(relier, before);
  });
});

/**
 * Sign up an account with TOTP enabled over the API rather than the Settings UI.
 * `credentials.secret` is set so account teardown can elevate to AAL2 and delete it.
 */
async function signUpWithTotp(
  target: BaseTarget,
  testAccountTracker: TestAccountTracker
): Promise<TotpAccount> {
  const credentials = await testAccountTracker.signUp();
  credentials.secret = await enableTotpOnAccount(
    target.authClient,
    credentials.sessionToken
  );
  // Narrowed rather than copied: the tracker holds this same object, and helpers
  // like completeInlineSetupWithBackupCodes mutate it, so a copy could drift.
  return credentials as TotpAccount;
}

/**
 * As `signUpWithTotp`, plus a set of backup authentication codes. Codes can only be
 * generated once TOTP is enabled (FXA-14058), and the endpoint needs a verified
 * session at the account's required assurance level — both true only in this order.
 */
async function signUpWithTotpAndBackupCodes(
  target: BaseTarget,
  testAccountTracker: TestAccountTracker
): Promise<{ credentials: TotpAccount; recoveryCodes: string[] }> {
  const credentials = await signUpWithTotp(target, testAccountTracker);
  const { recoveryCodes } = await target.authClient.replaceRecoveryCodes(
    credentials.sessionToken
  );
  return { credentials, recoveryCodes };
}

/**
 * Start a step-up from a signed-in RP session and confirm the cached-signin screen.
 *
 * Step-up deliberately sends no `action`, so FxA reuses the signed-in session and
 * asks the user to confirm it. Nothing happens until that button is clicked — no
 * second-factor challenge, and no grant — which is why every scenario goes through
 * here rather than calling clickStepUpAuth directly.
 *
 * The confirmation screen is also where a password would be demanded if `max_age`
 * were folded back into `wantsLogin()`, so asserting its absence here guards that
 * regression for every scenario at no extra cost.
 *
 * `expectChallenge: false` is for a session that already satisfies the request: the
 * grant is issued immediately and the user never leaves the RP, so this waits on the
 * redirect_uri response. Waiting on the relier URL instead would match the page we
 * are already on and resolve before the round trip had started.
 */
async function startStepUp({
  expectChallenge = true,
  maxAge,
  page,
  relier,
  signin,
}: {
  expectChallenge?: boolean;
  maxAge: number;
  page: Page;
  relier: RelierPage;
  signin: SigninPage;
}): Promise<void> {
  await relier.clickStepUpAuth(maxAge);
  await expect(signin.cachedSigninSubmitButton).toBeVisible();
  await expect(signin.passwordTextbox).toBeHidden();

  if (expectChallenge) {
    await signin.cachedSigninSubmitButton.click();
    return;
  }
  await Promise.all([
    page.waitForResponse(/\/api\/oauth/),
    signin.cachedSigninSubmitButton.click(),
  ]);
}

/** Reach the RP signed in and session-AAL2, by way of a TOTP challenge. */
async function signInToRelierWithTotp({
  credentials,
  page,
  relier,
  signin,
  signinTotpCode,
}: {
  credentials: TotpAccount;
  page: Page;
  relier: RelierPage;
  signin: SigninPage;
  signinTotpCode: SigninTotpCodePage;
}): Promise<void> {
  await relier.goto();
  await relier.clickEmailFirst();
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/signin_totp_code/);
  await signinTotpCode.fillOutCodeForm(await getTotpCode(credentials.secret));

  expect(await relier.isLoggedIn()).toBe(true);
}

/**
 * Snapshot the RP's current AAL2 elevation, with `auth_time` narrowed to a number so
 * comparisons against it cannot pass vacuously against null.
 *
 * The bounds are the assertion that matters. `auth_time` is seconds since the epoch
 * while introspection reports `iat`/`exp` in milliseconds, and that asymmetry is
 * exactly the regression to guard: a millisecond value would land tens of thousands
 * of years in the future and sail past any typeof or non-null check.
 */
async function captureElevation(relier: RelierPage): Promise<Elevation> {
  const status = await relier.getAuthStatus();
  expect(status.acr).toBe('AAL2');

  if (typeof status.auth_time !== 'number') {
    throw new Error(`expected a numeric auth_time, got ${status.auth_time}`);
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  expect(status.auth_time).toBeGreaterThan(nowSeconds - AUTH_TIME_MAX_AGE_S);
  expect(status.auth_time).toBeLessThanOrEqual(nowSeconds + AUTH_TIME_SKEW_S);

  return { ...status, auth_time: status.auth_time };
}

/**
 * Assert a fresh AAL2 elevation relative to `before`, from both the id_token the RP
 * was handed and the authorization server's own view of the access token — the
 * check a resource server would make before a sensitive action.
 */
async function expectElevationAdvanced(
  relier: RelierPage,
  before: Elevation
): Promise<Elevation> {
  const after = await captureElevation(relier);
  expect(after.auth_time).toBeGreaterThan(before.auth_time);

  const introspected = await relier.getTokenClaims();
  expect(introspected.active).toBe(true);
  expect(introspected.acr).toBe('AAL2');
  expect(introspected.auth_time).toBe(after.auth_time);
  // Every second factor maps to `otp`, so this cannot identify which one ran — it
  // guards against the claim going missing entirely.
  expect(introspected.amr).toContain('otp');

  return after;
}

/**
 * Let the session age past the leeway-adjusted `max_age=0` window. A real
 * wall-clock wait: freshness is evaluated server-side against the session's
 * authentication event, so there is no clock to fake from here and no observable
 * state to poll for — the session goes stale silently.
 */
async function goStale(page: Page): Promise<void> {
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(MAX_AGE_STALE_MS);
}
