import { expect } from '@playwright/test';
import { BaseLayout } from './layout';
import { getReactFeatureFlagUrl } from '../lib/react-flag';
import { EmailHeader, EmailType } from '../lib/email';

export class SignupReactPage extends BaseLayout {
  readonly path = 'signup';

  get emailFormHeading() {
    return this.page.getByRole('heading', {
      name: /^Enter your email|^Continue to your Mozilla account/,
    });
  }

  get emailTextbox() {
    return this.page.getByRole('textbox', { name: 'Enter your email' });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Sign up or sign in' });
  }

  get signupFormHeading() {
    return this.page.getByRole('heading', { name: 'Set your password' });
  }

  get passwordTextbox() {
    return this.page
      .getByTestId('new-password-input-field') // React
      .or(this.page.getByPlaceholder('Password', { exact: true })); // Backbone
  }

  get verifyPasswordTextbox() {
    return this.page
      .getByTestId('verify-password-input-field') // React
      .or(this.page.getByPlaceholder('Repeat password', { exact: true })); // Backbone
  }

  get ageTextbox() {
    return this.page
      .getByTestId('age-input-field') // React
      .or(this.page.getByPlaceholder('How old are you?')); // Backbone
  }

  get createAccountButton() {
    return this.page.getByRole('button', { name: 'Create account' });
  }

  get codeFormHeading() {
    return this.page.getByRole('heading', { name: /^Enter confirmation code/ });
  }

  get codeTextbox() {
    return this.page
      .getByTestId('confirm-signup-code-input-field') // React
      .or(this.page.getByPlaceholder('Enter 6-digit code')); // Backbone
  }

  get confirmButton() {
    return this.page.getByRole('button', { name: 'Confirm' });
  }

  get cannotCreateAccountHeading() {
    return this.page.getByRole('heading', { name: 'Cannot create account' });
  }

  get resendCodeButton() {
    return this.page.getByRole('button', { name: /Email new code./ });
  }

  goto(route = '/', params = new URLSearchParams()) {
    params.set('forceExperiment', 'generalizedReactApp');
    params.set('forceExperimentGroup', 'react');
    return this.page.goto(
      getReactFeatureFlagUrl(this.target, route, params.toString())
    );
  }

  async fillOutEmailForm(email: string) {
    await expect(this.emailFormHeading).toBeVisible();

    await this.emailTextbox.fill(email);
    await this.submitButton.click();
  }

  async fillOutSignupForm(password: string, age: string) {
    await expect(this.signupFormHeading).toBeVisible();

    await this.passwordTextbox.fill(password);
    await this.verifyPasswordTextbox.fill(password);
    await this.ageTextbox.fill(age);
    await this.createAccountButton.click();
  }

  async fillOutCodeForm(email: string) {
    const code = await this.target.emailClient.waitForEmail(
      email,
      EmailType.verifyShortCode,
      EmailHeader.shortCode
    );

    await expect(this.codeFormHeading).toBeVisible();

    await this.codeTextbox.fill(code);
    await this.confirmButton.click();
  }

  async waitForRoot() {
    const root = this.page.locator('#root');
    await root.waitFor();
  }
}
