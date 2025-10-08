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
    const button = this.element.locator(
      '[data-testid=connected-service-sign-out]'
    );
    return button.click();
  }
}
