import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';

test.describe('connect_another_device', () => {
  test('signup Fx Desktop, load /connect_another_device page', async ({
    credentials,
    target,
  }) => {
    const { browser, page, login, connectAnotherDevice } =
      await newPagesForSync(target);
    await target.auth.accountDestroy(credentials.email, credentials.password);

    await page.goto(
      `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`,
      { waitUntil: 'load' }
    );
    await login.fillOutFirstSignUp(credentials.email, credentials.password);

    // Move on to the connect another device page
    await connectAnotherDevice.goto('load');
    await expect(connectAnotherDevice.header).toHaveCount(1);
    await expect(connectAnotherDevice.signInButton).toHaveCount(0);
    await expect(connectAnotherDevice.installFxDesktop).toHaveCount(1);
    await expect(connectAnotherDevice.success).toHaveCount(0);

    await browser?.close();
  });
});
