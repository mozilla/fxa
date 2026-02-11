/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class PostVerifyPage extends BaseLayout {
  readonly path = '';
  readonly selectors = {
    OLD_PASSWRD: '#opassword',
    PASSWORD: '#password',
    CONFIRM_PASSWORD: '#vpassword',
    SUBMIT: '#submit-btn',
    CLICK_MAYBE_LATER: '#maybe-later-btn',
    FORCE_PASSWORD_CHANGE_HEADER: '#fxa-force-password-change-header',
  };

  async isForcePasswordChangeHeader() {
    const header = this.page.locator(
      this.selectors.FORCE_PASSWORD_CHANGE_HEADER
    );
    await header.waitFor();
    return header.isVisible();
  }

  async submit() {
    await this.page.locator(this.selectors.SUBMIT).click();
  }

  async clickMaybeLater() {
    await this.page.locator(this.selectors.CLICK_MAYBE_LATER).click();
  }

  async fillOutChangePassword(oldPassword: string, newPassword: string) {
    await this.page.locator(this.selectors.OLD_PASSWRD).fill(oldPassword);
    await this.page.locator(this.selectors.PASSWORD).fill(newPassword);
    await this.page.locator(this.selectors.CONFIRM_PASSWORD).fill(newPassword);
  }
}
