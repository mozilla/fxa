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

  getKey() {
    return this.page.innerText('[data-testid=datablock] span');
  }

  async invalidRecoveryKeyError() {
    return this.page.locator('#error-tooltip-159').innerText();
  }

  setPassword(password: string) {
    return this.page.locator('input[type=password]').fill(password);
  }

  async confirmRecoveryKey() {
    return this.page.locator('button[type=submit]').click();
  }

  async clickLostRecoveryKey() {
    return this.page.locator('.lost-recovery-key').click();
  }

  submit() {
    return Promise.all([
      this.page.locator('button[type=submit]').click(),
      this.page.waitForResponse(/recoveryKey$/),
    ]);
  }

  async clickStart() {
    return this.getStartedButton.click();
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

  async clickNext() {
    return this.continueWithoutDownloadingLink.click();
  }

  setHint(hint: string) {
    return this.hintTextbox.fill(hint);
  }

  async clickFinish() {
    return this.finishButton.click();
  }

  async fillOutRecoveryKeyForms(
    password: string,
    hint: string
  ): Promise<string> {
    await expect(this.accountRecoveryKeyHeading).toBeVisible();
    await expect(this.createRecoveryKeyHeading).toBeVisible();

    // View 1/4 info
    await this.getStartedButton.click();

    await expect(this.passwordHeading).toBeVisible();

    // View 2/4 confirm password and generate key
    await this.createKeyPasswordTextbox.fill(password);
    await this.createKeyButton.click();

    await expect(this.recoveryKeyCreatedHeading).toBeVisible();

    // View 3/4 key download
    const key = await this.recoveryKey.innerText(); // Store key to be used later
    await this.continueWithoutDownloadingLink.click();

    await expect(this.hintHeading).toBeVisible();

    // View 4/4 hint
    await this.hintTextbox.fill(hint);
    await this.finishButton.click();

    return key;
  }
}
