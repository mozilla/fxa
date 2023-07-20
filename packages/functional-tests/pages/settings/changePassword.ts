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

  async fillOutChangePassword(oldPassword, newPassword) {
    await this.setCurrentPassword(oldPassword);
    await this.setNewPassword(newPassword);
    await this.setConfirmPassword(newPassword);
  }

  async changePasswordTooltip() {
    return this.page.innerText('[data-testid=tooltip]');
  }

  async passwordLengthError() {
    const error = this.page.locator('[data-testid=icon-invalid]');
    error.locator(':scope', { hasText: 'At least 8 characters' });
    await error.waitFor();
    return error.isVisible();
  }

  async validPasswordLength() {
    const error = this.page.locator('[data-testid=change-password-length]', {
      has: this.page.locator('[data-testid=icon-unset]'),
    });
    error.locator(':scope', { hasText: 'At least 8 characters' });
    await error.waitFor();
    return error.isVisible();
  }

  async passwordSameAsEmailError() {
    const error = this.page.locator('[data-testid=icon-invalid]');
    error.locator(':scope', { hasText: 'Not your email address' });
    await error.waitFor();
    return error.isVisible();
  }

  async commonPasswordError() {
    const error = this.page.locator('[data-testid=icon-invalid]');
    error.locator(':scope', { hasText: 'Not a commonly used password' });
    await error.waitFor();
    return error.isVisible();
  }

  async confirmPasswordError() {
    const error = this.page.locator('[data-testid=icon-invalid]');
    error.locator(':scope', { hasText: 'New password matches confirmation' });
    await error.waitFor();
    return error.isVisible();
  }

  async submitButton() {
    const submit = this.page.locator('button[type=submit]');
    await submit.waitFor();
    return submit.isEnabled();
  }

  async clickCancelChangePassword() {
    return this.page.locator('[data-testid=cancel-password-button]').click();
  }

  async changePasswordSuccess() {
    return this.page.innerText('[data-testid=alert-bar-content]');
  }

  submit() {
    return Promise.all([
      this.page.locator('button[type=submit]').click(),
      this.page.waitForEvent('framenavigated'),
    ]);
  }
}
