import { expect } from '@playwright/test';
import { SettingsLayout } from './layout';
import { DataTrioComponent } from './components/dataTrio';

export class RecoveryKeyPage extends SettingsLayout {
  readonly path = 'settings/account_recovery';

  get dataTrio() {
    return new DataTrioComponent(this.page);
  }

  get accountRecoveryKeyHeading() {
    return this.page.getByRole('heading', {
      name: 'Account Recovery Key',
      exact: true,
    });
  }

  get createRecoveryKeyHeading() {
    return this.page.getByRole('heading', {
      name: /^Create an account recovery key/,
    });
  }

  get getStartedButton() {
    return this.page.getByRole('button', { name: 'Get started' });
  }

  get passwordHeading() {
    return this.page.getByRole('heading', {
      name: 'Re-enter your password for security',
    });
  }

  get createKeyPasswordTextbox() {
    return this.page.getByRole('textbox', { name: 'password' });
  }

  get createKeyButton() {
    return this.page.getByRole('button', {
      name: 'Create account recovery key',
    });
  }

  get recoveryKeyCreatedHeading() {
    return this.page.getByRole('heading', {
      name: /^Account recovery key created/,
    });
  }

  get recoveryKey() {
    return this.page.getByTestId('datablock');
  }

  get recoveryKeyCopyButton() {
    return this.page.getByRole('button', { name: 'Copy' });
  }

  get continueWithoutDownloadingLink() {
    return this.page.getByRole('link', {
      name: 'Continue without downloading',
    });
  }

  get hintHeading() {
    return this.page.getByRole('heading', {
      name: 'Add a hint to help find your key',
    });
  }

  get hintTextbox() {
    return this.page.getByRole('textbox', { name: 'hint' });
  }

  get finishButton() {
    return this.page.getByRole('button', { name: 'Finish' });
  }

  async clickDownload() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByText('Download and continue').click(),
    ]);
    return download;
  }

  async clickCopy(): Promise<string> {
    // override writeText so we can capture the value
    await this.page.evaluate(() => {
      //@ts-ignore
      window.clipboardText = null;
      //@ts-ignore
      navigator.clipboard.writeText = (text) => (window.clipboardText = text);
    });
    await this.recoveryKeyCopyButton.click();
    //@ts-ignore
    return this.page.evaluate(() => window.clipboardText);
  }

  async acknowledgeInfoForm(): Promise<void> {
    await expect(this.accountRecoveryKeyHeading).toBeVisible();
    await expect(this.createRecoveryKeyHeading).toBeVisible();

    await this.getStartedButton.click();
  }

  async fillOutConfirmPasswordForm(password: string): Promise<void> {
    await expect(this.passwordHeading).toBeVisible();

    await this.createKeyPasswordTextbox.fill(password);
    await this.createKeyButton.click();
  }

  async createRecoveryKey(password: string, hint: string): Promise<string> {
    await this.acknowledgeInfoForm();
    await this.fillOutConfirmPasswordForm(password);

    await expect(this.recoveryKeyCreatedHeading).toBeVisible();

    const key = await this.recoveryKey.innerText();
    await this.continueWithoutDownloadingLink.click();

    await expect(this.hintHeading).toBeVisible();

    await this.hintTextbox.fill(hint);
    await this.finishButton.click();

    return key;
  }
}
