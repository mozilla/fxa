/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect } from '@playwright/test';
import { BaseTarget } from '../../lib/targets/base';

export class StaySubscribedPage {
  constructor(
    public page: Page,
    readonly target: BaseTarget
  ) {}

  // Resubscribe page

  get staySubscribedHeading() {
    return this.page.locator('#stay-subscribed-heading');
  }

  get productName() {
    return this.staySubscribedHeading;
  }

  get nextChargeAmount() {
    return this.page.getByText(/Your next charge will be/);
  }

  get resubscribeButton() {
    return this.page.getByRole('button', { name: /Resubscribe/i });
  }

  // Success state

  get successHeading() {
    return this.page.getByText(/Thanks! You’re all set/i);
  }

  get backToSubscriptionsLink() {
    return this.page.getByRole('link', { name: /Back to subscriptions/i });
  }

  // Error state

  get errorMessage() {
    return this.page.locator('[role="alert"]');
  }

  // Actions

  /**
   * Click the Resubscribe button and wait for success.
   */
  async resubscribe() {
    await expect(this.resubscribeButton).toBeVisible({ timeout: 10_000 });
    await this.resubscribeButton.click();
  }

  /**
   * Wait for the resubscribe success confirmation.
   */
  async waitForSuccess(timeout = 30_000) {
    await expect(this.successHeading).toBeVisible({ timeout });
  }
}
