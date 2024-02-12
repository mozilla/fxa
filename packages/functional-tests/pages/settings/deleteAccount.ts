import { SettingsLayout } from './layout';

export class DeleteAccountPage extends SettingsLayout {
  readonly path = 'settings/delete_account';

  async checkAllBoxes() {
    this.page.locator(':nth-match(input[type=checkbox], 4)');
    for (let i = 1; i < 5; i++) {
      await this.page.click(
        `:nth-match(label[data-testid=checkbox-container], ${i})`
      );
    }
  }

  clickContinue() {
    return this.page.click('button[data-testid=continue-button]');
  }

  clickCancel() {
    return this.page.click('button[data-testid=cancel-button]');
  }

  setPassword(password: string) {
    return this.page.fill('input[type=password]', password);
  }

  async toolTipText() {
    await this.page.isVisible('[data-testid="tooltip"]');
    return this.page.innerText('[data-testid="tooltip"]');
  }

  submit() {
    return this.page.click('[data-testid="delete-account-button"]');
  }

  async success() {
    const success = this.page.locator('.success');
    await success.waitFor();
    return success;
  }
}
