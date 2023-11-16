/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class PostVerifyPage extends BaseLayout {
  readonly path = '';
  readonly selectors = {
    ACCOUNT_RECOVERY_HEADER: '#fxa-add-account-recovery-header',
    ADD_RECOVERY_KEY: 'button[type="submit"]',
    OLD_PASSWRD: '#opassword',
    PASSWORD: '#password',
    CONFIRM_PASSWORD: '#vpassword',
    SUBMIT: '#submit-btn',
    RECOVERY_KEY_TEXT: '.recovery-key',
    RECOVERY_KEY_INPUT: '#recovery-key',
    DONE: '.primary-button',
    TOOLTIP: '.tooltip',
    RECOVERY_KEY_VERIFIED_HEADER: '#fxa-account-recovery-complete-header',
    CLICK_MAYBE_LATER: '#maybe-later-btn',
    FORCE_PASSWORD_CHANGE_HEADER: '#fxa-force-password-change-header',
  };

  async isAccountRecoveryHeader() {
    const header = this.page.locator(this.selectors.ACCOUNT_RECOVERY_HEADER);
    await header.waitFor();
    return header.isVisible();
  }

  async isAccountRecoveryVerifiedHeader() {
    const header = this.page.locator(
      this.selectors.RECOVERY_KEY_VERIFIED_HEADER
    );
    await header.waitFor();
    return header.isVisible();
  }

  async isForcePasswordChangeHeader() {
    const header = this.page.locator(
      this.selectors.FORCE_PASSWORD_CHANGE_HEADER
    );
    await header.waitFor();
    return header.isVisible();
  }

  async addRecoveryKey(password) {
    return Promise.all([
      this.page.locator(this.selectors.ADD_RECOVERY_KEY).click(),
      this.page.locator(this.selectors.PASSWORD).fill(password),
    ]);
  }

  async getKey() {
    return this.page.innerText(this.selectors.RECOVERY_KEY_TEXT);
  }

  async submit() {
    await this.page.locator(this.selectors.SUBMIT).click();
  }

  async clickDone() {
    await this.page.locator(this.selectors.DONE).click();
  }

  async clickMaybeLater() {
    await this.page.locator(this.selectors.CLICK_MAYBE_LATER).click();
  }

  async inputRecoveryKey(key) {
    await this.page.locator(this.selectors.RECOVERY_KEY_INPUT).fill(key);
    await this.submit();
  }

  async getTooltipError() {
    return this.page.locator(this.selectors.TOOLTIP).innerText();
  }

  async fillOutChangePassword(oldPassword, newPassword) {
    await this.page.locator(this.selectors.OLD_PASSWRD).fill(oldPassword);
    await this.page.locator(this.selectors.PASSWORD).fill(newPassword);
    await this.page.locator(this.selectors.CONFIRM_PASSWORD).fill(newPassword);
  }
}
