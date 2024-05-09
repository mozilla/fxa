import { expect, Page } from '@playwright/test';
import { BaseLayout } from '../layout';

export abstract class SettingsLayout extends BaseLayout {
  get settingsHeading() {
    return this.page.getByRole('heading', { name: /^Settings/ });
  }

  get helpLink() {
    return this.page.getByTestId('header-sumo-link');
  }

  get bentoDropDownMenu() {
    return this.page.getByTestId('drop-down-bento-menu');
  }

  get bentoDropDownMenuToggle() {
    return this.page.getByTestId('drop-down-bento-menu-toggle');
  }

  get alertBar() {
    return this.page.getByTestId('alert-bar-content');
  }

  get alertBarDismissButton() {
    return this.page.getByTestId('alert-bar-dismiss');
  }

  get avatarDropDownMenu() {
    return this.page.getByTestId('drop-down-avatar-menu');
  }

  get avatarDropDownMenuToggle() {
    return this.page.getByTestId('drop-down-avatar-menu-toggle');
  }

  get avatarDropDownMenuPhoto() {
    return this.page
      .getByTestId('drop-down-avatar-menu-toggle')
      .getByTestId('avatar-nondefault');
  }

  get avatarMenuSignOut() {
    return this.page.getByTestId('avatar-menu-sign-out');
  }

  get avatarIcon() {
    return this.page.getByTestId('avatar');
  }

  get recoveryKeyModalHeading() {
    return this.page.getByRole('heading', {
      name: 'Remove account recovery key?',
    });
  }

  get modalConfirmButton() {
    return this.page.getByTestId('modal-confirm');
  }

  goto(query?: string) {
    return super.goto('load', query);
  }

  clickModalConfirm() {
    return this.page.click('[data-testid=modal-confirm]');
  }

  clickChangePassword() {
    return this.page.click('[data-testid=password-unit-row-route]');
  }

  async clickHelp(): Promise<Page> {
    const pagePromise = this.page.context().waitForEvent('page');
    await this.helpLink.click();
    const newPage = await pagePromise;
    await newPage.waitForLoadState();
    return newPage;
  }

  async signOut() {
    await this.avatarDropDownMenuToggle.click();
    await this.avatarMenuSignOut.click();

    await expect(this.page).toHaveURL(this.target.baseUrl);
  }
}
