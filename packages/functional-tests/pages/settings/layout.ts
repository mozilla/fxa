import { BaseLayout } from '../layout';

export abstract class SettingsLayout extends BaseLayout {
  get bentoMenu() {
    return this.page.locator('[data-testid="drop-down-bento-menu"]');
  }

  get avatarMenu() {
    return this.page.locator('[data-testid=drop-down-avatar-menu]');
  }

  goto() {
    return super.goto('networkidle');
  }

  alertBarText() {
    return this.page.innerText('[data-testid=alert-bar-content]');
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

  async clickHelp() {
    const [helpPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.click('[data-testid=header-sumo-link]'),
    ]);
    return helpPage;
  }

  clickBentoIcon() {
    return this.page.click('[data-testid="drop-down-bento-menu-toggle"]');
  }

  clickAvatarIcon() {
    return this.page.click('[data-testid=drop-down-avatar-menu-toggle]');
  }

  clickSignOut() {
    return this.page.click('[data-testid=avatar-menu-sign-out]');
  }

  async signOut() {
    await this.clickAvatarIcon();
    await Promise.all([
      this.clickSignOut(),
      this.page.waitForURL(this.target.baseUrl, { waitUntil: 'networkidle' }),
    ]);
  }
}
