/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class FourOhFourPage extends BaseLayout {
  readonly path = 'four-oh-four';

  readonly selectors = {
    HEADER: '#fxa-404-header',
    LINK_HOME: '#fxa-404-home',
  };

  get header() {
    return this.page.locator(this.selectors.HEADER);
  }

  get homeLink() {
    return this.page.locator(this.selectors.LINK_HOME);
  }
}
