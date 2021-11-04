import { SettingsLayout } from './layout';

export class ChangePasswordPage extends SettingsLayout {
  readonly path = 'settings/change_password';

  setCurrentPassword(password: string) {
    return this.page.fill(
      '[data-testid=current-password-input-field]',
      password
    );
  }

  setNewPassword(password: string) {
    return this.page.fill('[data-testid=new-password-input-field]', password);
  }

  setConfirmPassword(password: string) {
    return this.page.fill(
      '[data-testid=verify-password-input-field]',
      password
    );
  }

  submit() {
    return Promise.all([
      this.page.click('button[type=submit]'),
      this.page.waitForNavigation(),
    ]);
  }
}
