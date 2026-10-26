/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { BaseLayout } from './layout';

export class SignupPage extends BaseLayout {
  readonly path = 'signup';

  get emailTextbox() {
    return this.page.getByRole('textbox', { name: 'Enter your email' });
  }

  get submitButton() {
    return this.formSubmitButton;
  }

  get passwordTextbox() {
    return this.page.getByLabel('Password', { exact: true });
  }

  get verifyPasswordTextbox() {
    return this.page.getByLabel('Repeat password', { exact: true });
  }

  get ageTextbox() {
    return this.page.getByLabel('How old are you?');
  }

  get createAccountButton() {
    return this.formSubmitButton;
  }

  get changeEmailLink() {
    return this.page.getByRole('link', { name: 'Change email' });
  }

  goto(route = '/', params = new URLSearchParams()) {
    if (!params.has('force_passwordless')) {
      params.set('force_passwordless', 'false');
    }
    return this.page.goto(`${this.target.contentServerUrl}${route}?${params}`);
  }

  async fillOutEmailForm(email: string) {
    await expect(this.emailTextbox).toBeVisible();

    await this.emailTextbox.fill(email);
    await this.submitButton.click();
  }

  async fillOutSignupForm(password: string) {
    await expect(this.passwordTextbox).toBeVisible();

    await this.passwordTextbox.fill(password);
    await this.createAccountButton.click();
  }

  async fillOutSyncSignupForm(password: string) {
    await expect(this.passwordTextbox).toBeVisible();

    await this.passwordTextbox.fill(password);
    await this.verifyPasswordTextbox.fill(password);
    await this.createAccountButton.click();
  }
}
