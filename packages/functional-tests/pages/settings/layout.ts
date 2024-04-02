import { expect } from '@playwright/test';
import { BaseLayout } from '../layout';

export abstract class SettingsLayout extends BaseLayout {
  get settingsHeading() {
    return this.page.getByRole('heading', { name: 'Settings' });
  }

  get bentoMenu() {
    return this.page.locator('[data-testid="drop-down-bento-menu"]');
  }

  get alertBar() {
    return this.page.getByTestId('alert-bar-content');
  }

  get avatarDropDownMenu() {
    return this.page.getByTestId('drop-down-avatar-menu');
  }

  get avatarDropDownMenuToggle() {
    return this.page.getByTestId('drop-down-avatar-menu-toggle');
  }

  get avatarMenuSignOut() {
    return this.page.getByTestId('avatar-menu-sign-out');
  }

  get avatarIcon() {
    return this.page.getByTestId('avatar');
  }

  goto(query?: string) {
    return super.goto('load', query);
  }

  async waitForAlertBar() {
    return this.page.waitForSelector('[data-testid=alert-bar-content]');
  }

  closeAlertBar() {
    return this.page.click('[data-testid=alert-bar-dismiss]');
  }

  clickModalConfirm() {
    return this.page.click('[data-testid=modal-confirm]');
  }

  clickRecoveryCodeAck() {
    return this.page.click('[data-testid=ack-recovery-code]');
  }

  clickChangePassword() {
    return this.page.click('[data-testid=password-unit-row-route]');
  }

  async clickHelp() {
    const [helpPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.locator('[data-testid=header-sumo-link]').click(),
    ]);
    return helpPage;
  }

  clickBentoIcon() {
    return this.page.click('[data-testid="drop-down-bento-menu-toggle"]');
  }

  clickSignIn() {
    return this.page.click('button[type=submit]');
  }

  async signOut() {
    await this.avatarDropDownMenuToggle.click();
    await this.avatarMenuSignOut.click();

    await expect(this.page).toHaveURL(this.target.baseUrl);
  }
}
