/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class CookiesDisabledPage extends BaseLayout {
  readonly path = 'cookies_disabled';

  async cookiesDisabledHeader() {
    const header = this.page.locator('.card-header');
    await header.waitFor();
    return header;
  }

  async clickRetry() {
    return this.page.getByRole('button', { name: 'Try again' }).click();
  }

  async isCookiesDiabledError() {
    return this.page.getByText('Local storage or cookies are still disabled');
  }
}
