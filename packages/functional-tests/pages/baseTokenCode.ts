/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export abstract class BaseTokenCodePage extends BaseLayout {
  get tooltip() {
    this.checkPath();
    return this.page.locator('.tooltip');
  }

  get successMessage() {
    this.checkPath();
    return this.page.locator('.success');
  }

  get input() {
    this.checkPath();
    return this.page.locator('input[type=text]');
  }

  get submit() {
    this.checkPath();
    return this.page.locator('button[type=submit]');
  }
}
