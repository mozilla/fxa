/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { BaseLayout } from './layout';

export abstract class BaseTokenCodePage extends BaseLayout {
  // Only valid for confirmSignupCode, signinTokenCode, signinUnblock and
  // signinPasswordlessCode, whose single h1 is the page headline. The totp,
  // recovery-code and recovery-phone pages render a generic "Sign in" h1
  // (HeadingPrimary) with their headline in an h2, so this would match that
  // instead — silently, since it still resolves to one element.
  protected get pageHeading() {
    return this.page.getByRole('heading', { level: 1 });
  }

  get codeInput() {
    this.checkPath();
    return this.page.getByRole('textbox', { name: /code/i });
  }

  get resendCodeButton() {
    this.checkPath();
    return (
      this.page
        .getByRole('button', { name: /^Email new code/ })
        // compatibility with backbone
        .or(this.page.getByRole('link', { name: /^Email new code/ }))
    );
  }

  get submitButton() {
    this.checkPath();
    return this.formSubmitButton;
  }

  get successMessage() {
    this.checkPath();
    return this.page.locator('.success');
  }

  get invalidCodeError() {
    return this.page.getByText(/Invalid two-step authentication code/);
  }

  get tooltip() {
    this.checkPath();
    return this.page.locator('.tooltip');
  }

  /**
   * Enters the code and clicks 'submit' button.
   *
   * @param code 2FA backup code
   */
  async fillOutCodeForm(code: string) {
    this.checkPath();
    await this.codeInput.fill(code);
    await expect(this.codeInput).toHaveValue(code);
    await this.submitButton.click();
  }
}
