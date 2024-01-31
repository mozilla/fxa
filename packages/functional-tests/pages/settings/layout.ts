import { BaseLayout } from '../layout';

export abstract class SettingsLayout extends BaseLayout {
  get bentoMenu() {
    return this.page.locator('[data-testid="drop-down-bento-menu"]');
  }

  get avatarMenu() {
    return this.page.locator('[data-testid=drop-down-avatar-menu]');
  }

  goto(query?: string) {
    return super.goto('load', query);
  }

  async alertBarText() {
    const alert = this.page.locator('[data-testid=alert-bar-content]');
    return alert.textContent();
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

  clickAvatarIcon() {
    return this.page
      .locator('[data-testid=drop-down-avatar-menu-toggle]')
      .click();
  }

  clickSignOut() {
    return this.page.locator('[data-testid=avatar-menu-sign-out]').click();
  }

  clickSignIn() {
    return this.page.click('button[type=submit]');
  }

  async signOut() {
    await this.clickAvatarIcon();
    const waitForURL = this.page.waitForURL(this.target.baseUrl);
    await this.clickSignOut();
    return waitForURL;
  }
}
