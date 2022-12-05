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
    return this.page.innerText('#error-tooltip-159');
  }

  setPassword(password: string) {
    return this.page.fill('input[type=password]', password);
  }

  async confirmRecoveryKey() {
    return this.page.click('button[type=submit]');
  }

  async clickLostRecoveryKey() {
    return this.page.click('.lost-recovery-key');
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
