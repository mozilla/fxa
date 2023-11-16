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
    const emailInput = await this.page.getByRole('textbox', { name: 'email' });
    return emailInput.fill(value);
  }

  async setPassword(value: string) {
    const newPasswordInput = await this.page.getByRole('textbox', {
      // simple text string was matching both password inputs
      name: /^Password$/,
    });
    return newPasswordInput.fill(value);
  }

  async setPasswordConfirm(value: string) {
    const confirmPasswordInput = await this.page.getByRole('textbox', {
      name: 'Repeat password',
    });
    return confirmPasswordInput.fill(value);
  }

  async setAge(value: string) {
    const ageInput = await this.page.getByLabel('How old are you?');
    await ageInput.fill(value);
  }

  async setCode(value: string) {
    const codeInput = await this.page.getByLabel('Enter 6-digit code');
    return codeInput.fill(value);
  }

  async fillOutEmailFirst(email: string) {
    await this.setEmail(email);
    await this.submit('Sign up or sign in');
  }

  async fillOutSignupForm(password: string) {
    await this.setPassword(password);
    await this.setPasswordConfirm(password);
    await this.setAge('21');
    await this.submit('Create account');
  }

  async fillOutCodeForm(code: string) {
    await this.setCode(code);
    await this.submit('Confirm');
  }

  async submit(label: string) {
    await this.page.getByRole('button', { name: label }).click();
  }
}
