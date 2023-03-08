/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

const PASSWORD = 'passwordzxcv';
let email = '';

test.describe('Firefox Desktop Sync v3 reset password', () => {
  test.beforeEach(() => {
    test.slow();
  });

  test('reset password, verify same browser', async ({ target }) => {
    const { page, login, resetPassword } = await newPagesForSync(target);
    const uaStrings = {
      desktop_firefox_58:
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:58.0) Gecko/20100101 Firefox/58.0',
    };
    const query = { forceUA: uaStrings['desktop_firefox_58'] };
    const queryParam = new URLSearchParams(query);
    email = login.createEmail();
    await target.auth.signUp(email, PASSWORD, {
      lang: 'en',
      preVerified: 'true',
    });
    await login.clearCache();
    await page.goto(
      `${
        target.contentServerUrl
      }/reset_password?context=fx_desktop_v3&service=sync/?${queryParam.toString()}`
    );
    await resetPassword.fillOutResetPassword(email);

    const link = await target.email.waitForEmail(
      email,
      EmailType.recovery,
      EmailHeader.link
    );
    await page.goto(link, { waitUntil: 'load' });
    await resetPassword.resetNewPassword('Newpassword@');
    expect(await login.loginHeader()).toBe(true);
  });

  test('reset password, verify same browser, password validation', async ({
    target,
  }) => {
    const { page, login, resetPassword } = await newPagesForSync(target);
    const query = {
      forceExperiment: 'passwordStrength',
      forceExperimentGroup: 'designF',
    };
    email = login.createEmail();
    await target.auth.signUp(email, PASSWORD, {
      lang: 'en',
      preVerified: 'true',
    });
    await login.clearCache();
    await page.goto(
      `${target.contentServerUrl}/reset_password?context=fx_desktop_v3&service=sync`
    );
    await resetPassword.fillOutResetPassword(email);

    const link = await target.email.waitForEmail(
      email,
      EmailType.recovery,
      EmailHeader.link
    );
    await resetPassword.addQueryParamsToLink(link, query);
    await page.goto(link, { waitUntil: 'load' });

    //Enter a short password
    await resetPassword.resetNewPassword('pass');

    //Verify the error
    expect(await login.minLengthFailError()).toBe(true);
    expect(await login.notEmailUnmetError()).toBe(true);
    expect(await login.notCommonPasswordUnmetError()).toBe(true);

    //Enter a common password
    await resetPassword.resetNewPassword('password');

    //Verify the error
    expect(await login.minLengthSuccess()).toBe(true);
    expect(await login.notEmailSuccess()).toBe(true);
    expect(await login.notCommonPasswordFailError()).toBe(true);

    //Enter the email as password
    await resetPassword.resetNewPassword(email);

    //Verify the error
    expect(await login.minLengthSuccess()).toBe(true);
    expect(await login.notEmailFailError()).toBe(true);
    expect(await login.notCommonPasswordUnmetError()).toBe(true);
  });
});
