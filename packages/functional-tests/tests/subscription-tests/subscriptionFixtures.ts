import { Page, test as base, expect } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

export const test = base.extend<{ credentials: Credentials }>({
  // Signin is pre-requisite for all subscription tests
  // In order to avoid failures due to coupon rate limiting by IP, we signin so
  // that rate limiting is applied on an account basis
  credentials: [
    async (
      { target, page, pages: { settings, signin }, testAccountTracker },
      use
    ) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await use(credentials);
    },
    { auto: true },
  ],
});
export { expect } from '../../lib/fixtures/standard';

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  await expect(page).toHaveURL(/settings/);
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
