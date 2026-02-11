/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Locator, Page } from '@playwright/test';

export class ConnectedService {
  name = '';
  constructor(
    readonly element: Locator,
    readonly page: Page
  ) {}

  static async create(element: Locator, page: Page) {
    const service = new ConnectedService(element, page);
    service.name = await service.getName();
    return service;
  }

  async getName() {
    const p = this.element.locator('[data-testid=service-name]');
    return p.innerText();
  }

  async signout() {
    /**
     * This is _not_ an ideal solution. Something about this page and how we build these
     * page objects is behaving oddly. We can see the button click as the trace shows the
     * button change color, but it doesn't actually click. This is a workaround until we
     * can figure out the underlying issue.
     *
     * TODO: https://mozilla-hub.atlassian.net/browse/FXA-12517
     */
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(1500);
    await this.page
      .locator('[data-testid=nav-link-connected-services]')
      .click();
    await this.page.waitForURL(/#connected-services/);
    const button = this.element.locator(
      '[data-testid=connected-service-sign-out]'
    );

    await button.click();
  }
}
