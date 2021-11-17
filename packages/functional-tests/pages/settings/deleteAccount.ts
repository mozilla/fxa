import { SettingsLayout } from './layout';

export class DeleteAccountPage extends SettingsLayout {
  readonly path = 'settings/delete_account';

  async checkAllBoxes() {
    await this.page.waitForSelector(':nth-match(input[type=checkbox], 4)');
    for (let i = 1; i < 5; i++) {
      await this.page.click(
        `:nth-match(label[data-testid=checkbox-container], ${i})`
      );
    }
  }

  clickContinue() {
    return this.page.click('button[data-testid=continue-button]');
  }

  setPassword(password: string) {
    return this.page.fill('input[type=password]', password);
  }

  submit() {
    return Promise.all([
      this.page.click('button[type=submit]'),
      this.page.waitForNavigation(),
    ]);
  }
}
