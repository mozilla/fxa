import { BaseLayout } from './layout';
import { getReactFeatureFlagUrl } from '../lib/react-flag';
import { EmailHeader, EmailType } from '../lib/email';

export class SignupReactPage extends BaseLayout {
  readonly path = 'signup';

  goto(route = '/', params = new URLSearchParams()) {
    params.set('forceExperiment', 'generalizedReactApp');
    params.set('forceExperimentGroup', 'react');
    return this.page.goto(
      getReactFeatureFlagUrl(this.target, route, params.toString())
    );
  }

  async setEmail(value: string) {
    const emailInput = await this.getEmail();
    return emailInput.fill(value);
  }

  getEmail() {
    return this.page.getByRole('textbox', { name: 'email' });
  }

  async setPassword(value: string) {
    const newPasswordInput = this.getPassword();
    return newPasswordInput.fill(value);
  }

  getPassword() {
    return this.page.getByRole('textbox', {
      name: 'Password',
      exact: true,
    });
  }

  async setPasswordConfirm(value: string) {
    const confirmPasswordInput = this.getPasswordConfirm();
    return confirmPasswordInput.fill(value);
  }

  getPasswordConfirm() {
    return this.page.getByRole('textbox', {
      name: 'Repeat password',
    });
  }

  async setAge(value: string) {
    const ageInput = this.getAge();
    await ageInput.fill(value);
  }

  getAge() {
    return this.page.getByLabel('How old are you?');
  }

  async setCode(value: string) {
    const codeInput = await this.page.getByLabel('Enter 6-digit code');
    return codeInput.fill(value);
  }

  async fillOutEmailFirst(email: string) {
    await this.setEmail(email);
    await this.submit('Sign up or sign in');
  }

  async fillOutSignupForm(password: string, age = '21', submit = true) {
    await this.setPassword(password);
    await this.setPasswordConfirm(password);
    await this.setAge(age);
    if (submit) {
      await this.submit('Create account');
    }
  }

  async fillOutCodeForm(email: string) {
    const code = await this.target.email.waitForEmail(
      email,
      EmailType.verifyShortCode,
      EmailHeader.shortCode
    );
    await this.setCode(code);
    await this.submit('Confirm');
  }

  async goToEmailFirstAndCreateAccount(
    params: URLSearchParams,
    email: string,
    password: string
  ) {
    await this.goto('/', params);
    // fill out email first form
    await this.fillOutEmailFirst(email);
    await this.page.waitForURL(/signup/);
    await this.page.waitForSelector('#root');
    await this.fillOutSignupForm(password);
    await this.page.waitForURL(/confirm_signup_code/);
    await this.fillOutCodeForm(email);
  }

  async submit(label: string) {
    await this.page.getByRole('button', { name: label }).click();
  }

  async confirmCodeHeading() {
    await this.page.getByRole('heading', { name: /Enter confirmation code/ });
  }

  async visitTermsOfServiceLink() {
    const link = await this.page.getByText('Terms of Service');
    link.click();
  }

  async visitPrivacyPolicyLink() {
    const link = await this.page.getByText('Privacy Notice');
    link.click();
  }
}
