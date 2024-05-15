/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export abstract class BaseTokenCodePage extends BaseLayout {
  get heading() {
    this.checkPath();
    return this.page.getByRole('heading');
  }

  get tooltip() {
    this.checkPath();
    return this.page.locator('.tooltip');
  }

  get successMessage() {
    this.checkPath();
    return this.page.getByRole('status');
  }

  get input() {
    this.checkPath();
    return this.page.getByRole('textbox');
  }

  get submit() {
    this.checkPath();
    return this.page.getByRole('button', { name: 'Confirm' });
  }

  async fillOutCodeForm(code: string) {
    this.checkPath();
    await this.input.fill(code);
    await this.submit.click();
  }
}
