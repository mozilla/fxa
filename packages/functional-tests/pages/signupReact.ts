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

  get passwordHeader() {
    return this.page.getByText('Set your password');
  }

  setEmail(value: string) {
    return this.page.fill('[name="email"]', value);
  }
  setPassword(value: string) {
    return this.page.fill('[name="newPassword"]', value);
  }

  setPasswordConfirm(value: string) {
    return this.page.fill('[name="confirmPassword"]', value);
  }

  async setAge(value: string) {
    await this.page.fill('[name="age"]', value);
    return this.page.locator('[name="age"]').blur();
  }

  async fillOutSignupForm(password: string) {
    await this.setPassword(password);
    await this.setPasswordConfirm(password);
    await this.setAge('21');
    await this.submit();
    await this.page.waitForURL(/confirm_signup_code/);
  }

  async fillOutCodeForm(code: string) {
    await this.page.fill('[name="code"]', code);
    return this.submit();
  }

  async fillOutEmailFirst(email: string) {
    await this.setEmail(email);
    await this.submit();
    await this.page.waitForURL(/signup/);
  }

  async submit() {
    await this.page.locator('button[type="submit"]').click();
  }
}
