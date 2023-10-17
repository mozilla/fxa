import { SettingsLayout } from './layout';
import { DataTrioComponent } from './components/dataTrio';

export class RecoveryKeyPage extends SettingsLayout {
  readonly path = 'settings/account_recovery';

  get dataTrio() {
    return new DataTrioComponent(this.page);
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

  async clickCreateAccountRecoveryKey() {
    return this.page
      .getByRole('button', { name: 'Create account recovery key' })
      .click();
  }

  submit() {
    return Promise.all([
      this.page.locator('button[type=submit]').click(),
      this.page.waitForResponse(/recoveryKey$/),
    ]);
  }

  async clickStart() {
    return this.page.getByRole('button', { name: 'Get started' }).click();
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
    await this.page.getByRole('button', { name: 'Copy' }).click();
    //@ts-ignore
    return this.page.evaluate(() => window.clipboardText);
  }

  async clickNext() {
    return this.page
      .getByRole('link', {
        name: 'Continue without downloading',
      })
      .click();
  }

  setHint(hint: string) {
    return this.page.getByRole('textbox').fill(hint);
  }

  async clickFinish() {
    return this.page.getByRole('button', { name: 'Finish' }).click();
  }
}
