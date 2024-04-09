import { expect } from '@playwright/test';
import { SettingsLayout } from './layout';

export class DisplayNamePage extends SettingsLayout {
  readonly path = 'settings/display_name';

  get displayNameHeading() {
    return this.page.getByRole('heading', { name: 'Display name' });
  }

  get displayNameTextbox() {
    return this.page.getByTestId('input-field');
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  get saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  async fillOutForm(name: string, submit = false) {
    await expect(this.displayNameHeading).toBeVisible();

    await this.displayNameTextbox.fill(name);

    if (submit) {
      this.saveButton.click();
    }
  }
}
