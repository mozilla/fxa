/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';
export class ConfigPage extends BaseLayout {
  readonly path = '';
  config: any;

  async getConfig() {
    if (!this.config) {
      // Create a new page
      const page = await this.page.context().newPage();

      await page.goto(this.baseUrl);

      // Content server config is stored in the `meta` tag of the html page.
      // We can check this tag to see if the content server has enabled this React feature flag.
      const metaConfig = page.locator('meta[name="fxa-content-server/config"]');
      const config = await metaConfig.getAttribute('content');

      this.config = JSON.parse(decodeURIComponent(config || '{}'));

      await page.close();
    }

    return this.config;
  }
}
