/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class InlineRecoveryKey extends BaseLayout {
  readonly path = 'inline_recovery_key_setup';

  async getHeader() {
    const header = this.page.getByText('Secure your account');
    await header.waitFor();
    return header;
  }

  getBannerCreateLink() {
    return this.page.getByTestId('submit_create_recovery_key');
  }

  async getInlineRecoveryHeader() {
    const header = this.page.getByRole('heading', {
      name: 'Secure your account',
    });
    await header.waitFor();
    return header;
  }

  fillOutHint(value: string) {
    return this.page
      .getByRole('textbox', { name: 'Enter a hint (optional)' })
      .fill(value);
  }

  clickFinish() {
    return this.page.getByRole('button', { name: 'Finish' }).click();
  }

  clickDownloadAndContinue() {
    return this.page
      .getByRole('button', { name: 'Download and continue' })
      .click();
  }

  clickCreateRecoveryKey() {
    return this.page
      .getByRole('button', { name: 'Create account recovery key' })
      .click();
  }

  clickDoItLater() {
    return this.page.getByRole('button', { name: 'Do it later' }).click();
  }
}
