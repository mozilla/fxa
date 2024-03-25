/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { BaseLayout } from './layout';
import { getReactFeatureFlagUrl } from '../lib/react-flag';

export class SigninReactPage extends BaseLayout {
  readonly path = 'signin';

  get authenticationFormHeading() {
    return this.page.getByRole('heading', {
      name: /^Enter (?:authentication|security) code/,
    });
  }

  get authenticationCodeTextbox() {
    return this.page
      .getByRole('textbox', { name: 'code' })
      .or(this.page.getByPlaceholder('Enter 6-digit code'));
  }

  get authenticationCodeTextboxTooltip() {
    return this.page.getByText('Invalid two-step authentication code', {
      exact: true,
    });
  }

  get confirmButton() {
    return this.page.getByRole('button', { name: 'Confirm' });
  }

  get passwordFormHeading() {
    return this.page.getByRole('heading', { name: /^Enter your password/ });
  }

  get passwordTextbox() {
    return this.page.getByRole('textbox', { name: 'password' });
  }

  get signInButton() {
    return this.page.getByRole('button', { name: 'Sign in' });
  }

  goto(route = '/', params = new URLSearchParams()) {
    params.set('forceExperiment', 'generalizedReactApp');
    params.set('forceExperimentGroup', 'react');
    return this.page.goto(
      getReactFeatureFlagUrl(this.target, route, params.toString())
    );
  }

  async fillOutAuthenticationForm(code: string): Promise<void> {
    await expect(this.authenticationFormHeading).toBeVisible();

    await this.authenticationCodeTextbox.fill(code);
    await this.confirmButton.click();
  }

  async fillOutPasswordForm(password: string): Promise<void> {
    await expect(this.passwordFormHeading).toBeVisible();

    await this.passwordTextbox.fill(password);
    await this.signInButton.click();
  }
}
