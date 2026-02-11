/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';
import { expect } from '@playwright/test';

export class SigninRecoveryChoicePage extends BaseLayout {
  readonly path = '/signin_recovery_choice';

  get heading() {
    return this.page.getByRole('heading', { name: 'Sign in' });
  }

  get errorBanner() {
    return this.page.locator('.banner.error');
  }

  get phoneChoice() {
    return this.page.locator('.input-radio-wrapper').first();
  }

  get codeChoice() {
    return this.page.locator('.input-radio-wrapper').nth(1);
  }

  get backButton() {
    return this.page.getByRole('button', { name: 'Back' });
  }

  get continueButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  async clickChoosePhone() {
    await this.phoneChoice.click();
  }

  async clickChooseCode() {
    await this.codeChoice.click();
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }
}
