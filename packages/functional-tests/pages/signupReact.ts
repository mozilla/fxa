import { BaseLayout } from './layout';
import { getReactFeatureFlagUrl } from '../lib/react-flag';

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
      // simple text string was matching both password inputs
      name: /^Password$/,
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

  async fillOutCodeForm(code: string) {
    await this.setCode(code);
    await this.submit('Confirm');
  }

  async submit(label: string) {
    await this.page.getByRole('button', { name: label }).click();
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
