/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class LegalPage extends BaseLayout {
  readonly path = 'legal';

  get pageHeader() {
    return this.page.getByRole('heading', { name: 'Legal' });
  }

  get privacyNoticeLink() {
    return this.page.getByRole('link', { name: 'Privacy Notice' });
  }

  get termsOfServiceLink() {
    return this.page.getByRole('link', { name: 'Terms of Service' });
  }
}
