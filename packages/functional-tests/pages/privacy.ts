/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class PrivacyPage extends BaseLayout {
  readonly path = 'legal/privacy';

  get backButton() {
    return this.page.getByRole('button', { name: 'Back' });
  }

  get pageHeader() {
    return this.page.getByRole('heading', {
      name: 'Mozilla Accounts Privacy Notice',
    });
  }
}
