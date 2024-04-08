import { SettingsLayout } from './layout';

export class DeleteAccountPage extends SettingsLayout {
  readonly path = 'settings/delete_account';

  get deleteAccountHeading() {
    return this.page.getByRole('heading', { name: 'Delete account' });
  }

  get step1Heading() {
    return this.page.getByRole('heading', { name: 'Step 1 of 2' });
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  get continueButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get step2Heading() {
    return this.page.getByRole('heading', { name: 'Step 2 of 2' });
  }

  get passwordTextbox() {
    return this.page.getByRole('textbox', { name: 'password' });
  }

  get deleteButton() {
    return this.page.getByRole('button', { name: 'Delete' });
  }

  get tooltip() {
    return this.page.getByTestId('tooltip');
  }

  async checkAllBoxes() {
    const checkBoxes = this.page.getByTestId('checkbox-container');
    for (let i = 0; i < (await checkBoxes.count()); i++) {
      await checkBoxes.nth(i).click();
    }
  }

  clickContinue() {
    return this.page.click('button[data-testid=continue-button]');
  }

  setPassword(password: string) {
    return this.page.fill('input[type=password]', password);
  }

  submit() {
    return this.page.click('[data-testid="delete-account-button"]');
  }

  success() {
    return this.page.locator('.success');
  }
}
