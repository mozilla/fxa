/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('password visibility tests', () => {
  test('show password ended with second mousedown', async ({
    page,
    target,
    pages: { configPage, login },
  }) => {
    const config = await configPage.getConfig();
    test.skip(
      config.showReactApp.signUpRoutes === true,
      'this test was replaced by a unit test'
    );
    const email = login.createEmail();
    await page.goto(target.contentServerUrl, { waitUntil: 'load' });
    await login.setEmail(email);
    await login.submit();

    // Turn password field into a text field by mouse clicking 'show password'
    await login.showPasswordMouseAction();
    expect(await login.textInputForPassword()).toBe(true);
    await login.setPassword('');

    // Turn text field back into a password field by mouse clicking 'show password' again
    await login.showPasswordMouseAction();
    expect(await login.maskPasswordInputForPassword()).toBe(true);

    //\u0008 is unicode for backspace char. By default `type` clears the
    // element value before typing, we want the character to do so.
    await login.setPassword('\u0008');
    expect(await login.showPassword()).toBe(true);
  });
});
