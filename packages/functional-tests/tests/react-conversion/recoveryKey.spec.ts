import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { BaseTarget } from '../../lib/targets/base';

let status;
let key;

const NEW_PASSWORD = 'notYourAveragePassW0Rd';

function getReactFeatureFlagUrl(target: BaseTarget, path: string) {
  return `${target.contentServerUrl}${path}?showReactApp=true`;
}

test.describe('recovery key', () => {
  test.beforeEach(
    async ({ credentials, page, pages: { settings, recoveryKey } }) => {
      // Generating and consuming recovery keys is a slow process
      test.slow();

      await settings.goto();
      let status = await settings.recoveryKey.statusText();
      expect(status).toEqual('Not Set');
      await settings.recoveryKey.clickCreate();
      await recoveryKey.setPassword(credentials.password);
      await recoveryKey.submit();

      // Store key to be used later
      key = await recoveryKey.getKey();
      await recoveryKey.clickClose();

      // Verify status as 'enabled'
      status = await settings.recoveryKey.statusText();
      expect(status).toEqual('Enabled');
    }
  );

  test.only('can reset password with recovery key', async ({
    credentials,
    target,
    page,
  }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/reset_password'));

    // Verify react page has been loaded
    expect(await page.locator('#root').isVisible()).toBeTruthy();

    await page.locator('input').fill(credentials.email);
    await page.locator('text="Begin reset"').click();
    await page.waitForNavigation();

    expect(
      await page.locator('text="Reset email sent"').isVisible()
    ).toBeTruthy();

    // We need to append `&showReactApp=true` to reset link inorder to enroll in reset password experiment
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&showReactApp=true`;

    // Loads the React verion
    await page.goto(link);
    expect(await page.locator('#root').isVisible()).toBeTruthy();

    expect(
      await page.locator('text="Enter account recovery key"').isVisible()
    ).toBeTruthy();
    await page.locator('input').fill(key);
    await page.locator('text="Confirm account recovery key"').click();
    await page.waitForNavigation();

    await page.locator('input[name="newPassword"]').fill(NEW_PASSWORD);
    await page.locator('input[name="confirmPassword"]').fill(NEW_PASSWORD);

    // await page.locator('text="Reset password"').click();
    // await page.waitForNavigation();
    //
    // Attempt to login
    // await page.goto(target.contentServerUrl);
    // expect(
    //  await page.locator('text="Enter your email"').isVisible()
    // ).toBeTruthy();
    //
    // await page.locator('input[type=email]').fill(credentials.email);
    // await page.locator('text="Sign up or sign in"').click();
    // await page.waitForNavigation({ waitUntil: 'load' });
    // await page.locator('#password').fill(NEW_PASSWORD);
    //
    // await page.locator('text="Sign in"').click();
    // await page.waitForNavigation({ waitUntil: 'load' });
    //
    // const settingsHeader = await page.locator('text=Settings');
    // // A bit strange, not sure why I needed to add the `waitFor` here
    // await settingsHeader.waitFor();
    // expect(await settingsHeader.isVisible()).toBeTruthy();
    //
    // // Cleanup requires setting this value to correct password
    // credentials.password = NEW_PASSWORD;
  });
});
