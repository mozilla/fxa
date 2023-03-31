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

  submit() {
    return Promise.all([
      this.page.locator('button[type=submit]').click(),
      this.page.waitForResponse(/recoveryKey$/),
    ]);
  }

  clickClose() {
    return Promise.all([
      this.page.locator('[data-testid=close-button]').click(),
      this.page.waitForNavigation(),
    ]);
  }
}
