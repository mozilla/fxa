/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { BaseLayout } from './layout';
import { getReactFeatureFlagUrl } from '../lib/react-flag';

export class SigninPage extends BaseLayout {
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

  get cachedSigninHeading() {
    return this.page.getByRole('heading', { name: /^Sign in/ });
  }

  get codeTextbox() {
    return this.page.getByRole('textbox', { name: 'Enter 6-digit code' });
  }

  get confirmButton() {
    return this.page.getByRole('button', { name: 'Confirm' });
  }

  // Use /Continue with.*Apple/ because of hidden bidi Unicode characters around "Apple" in its accessible name.
  get continueWithAppleButton() {
    return this.page.getByRole('button', { name: /Continue with .*Apple/ });
  }

  // Use /Continue with.*Google/ because of hidden bidi Unicode characters around "Google" in its accessible name.
  get continueWithGoogleButton() {
    return this.page.getByRole('button', { name: /Continue with .*Google/ });
  }

  get emailFirstHeading() {
    return this.page.getByRole('heading', { name: /^Enter your email/ });
  }

  get emailFirstSubmitButton() {
    return this.page.getByRole('button', { name: 'Sign up or sign in' });
  }

  get emailTextbox() {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  get forgotPasswordLink() {
    return this.page.getByRole('link', { name: /^Forgot password/ });
  }

  get useDifferentAccountLink() {
    return this.page.getByRole('link', { name: /^Use a different account/ });
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

  get signinBouncedHeading() {
    return this.page.getByRole('heading', {
      name: 'Sorry. We’ve locked your account.',
    });
  }

  // for backwards compatibility with Backbone
  // not currently implemented in React, see FXA-8827
  get permissionsHeading() {
    return this.page.getByRole('heading', { name: /^Request for permission/ });
  }

  // for backwards compatibility with Backbone
  // not currently implemented in React, see FXA-8827
  get permissionsAcceptButton() {
    return this.page.getByRole('button', { name: 'Accept' });
  }

  get signinBouncedCreateAccountButton() {
    const name = 'No longer own that email? Create a new account';
    return this.page
      .getByRole('button', { name }) // React
      .or(this.page.getByRole('link', { name })); // Backbone
  }

  get syncSignInHeading() {
    return this.page.getByRole('heading', {
      // Fluent inserts directional markers around "Mozilla account" so
      // just look for partial match
      name: /^Continue to your/,
    });
  }

  get badRequestHeading() {
    return this.page.getByRole('heading', {
      name: /Bad Request: Invalid Query Parameters/,
    });
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

  async fillOutEmailFirstForm(email: string) {
    await this.emailTextbox.fill(email);
    await this.emailFirstSubmitButton.click();
  }

  async fillOutPasswordForm(password: string): Promise<void> {
    await expect(this.passwordFormHeading).toBeVisible();

    await this.passwordTextbox.fill(password);
    await this.signInButton.click();
  }
}
