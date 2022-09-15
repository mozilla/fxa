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

  async fillOutChangePassword(oldPassword, newPasswod) {
    await this.setCurrentPassword(oldPassword);
    await this.setNewPassword(newPasswod);
    await this.setConfirmPassword(newPasswod);
    await this.page.click('button[type=submit]');
  }

  async changePasswordTooltip() {
    return this.page.innerText('[data-testid=tooltip]');
  }

  submit() {
    return Promise.all([
      this.page.click('button[type=submit]'),
      this.page.waitForNavigation(),
    ]);
  }
}
