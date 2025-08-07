/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';
import { expect } from '../lib/fixtures/standard';

export class RelierPage extends BaseLayout {
  get path() {
    // Sub classes should define this
    return '';
  }

  get relierHeading() {
    return this.page.getByRole('heading', { name: '123done' });
  }

  async goto(query?: string) {
    const url = query
      ? `${this.target.relierUrl}?${query}`
      : this.target.relierUrl;
    return this.page.goto(url);
  }

  async isLoggedIn() {
    const loggedInStatus = this.page.locator('#loggedin');
    await loggedInStatus.waitFor();
    return loggedInStatus.isVisible();
  }

  async isOauthSuccessHeader() {
    const header = this.page.locator('#fxa-oauth-success-header');
    await header.waitFor();
    return header.isVisible();
  }

  async isPro() {
    const pro = this.page.locator('.pro-status');
    await pro.waitFor({ state: 'visible' });
    return pro.isVisible();
  }

  async signOut() {
    await Promise.all([
      this.page.locator('#logout').click(),
      this.page.waitForResponse(/\/api\/logout/),
    ]);
  }

  async clickEmailFirst() {
    await expect(this.relierHeading).toBeVisible();

    await this.page.getByRole('button', { name: 'Email first' }).click();
    // We need to add a `waitUntil` option here because the page gets redirected from
    // /authorization to /oauth before the page is fully loaded.
    return this.page.waitForURL(`${this.target.contentServerUrl}/**`);
  }

  async clickSignIn() {
    const waitForNavigation = this.page.waitForEvent('framenavigated');
    await this.page.locator('button.sign-in-button.signin').click();
    return waitForNavigation;
  }

  async clickSignInScopedKeys() {
    const waitForNavigation = this.page.waitForEvent('framenavigated');
    await this.page.locator('button.scope-keys').click();
    return waitForNavigation;
  }

  async clickForceAuth() {
    const waitForNavigation = this.page.waitForEvent('framenavigated');
    await this.page.locator('button.force-auth').click();
    return waitForNavigation;
  }

  async clickChooseFlow() {
    await expect(this.relierHeading).toBeVisible();

    await this.page
      .getByRole('button', { name: 'Choose my sign-in flow for me' })
      .click();
  }

  async signInPromptNone() {
    return this.page.locator('.ready .prompt-none').click();
  }

  async clickRequire2FA() {
    await this.page.getByText('Sign In (Require 2FA)').click();
    return this.page.waitForURL(`${this.target.contentServerUrl}/**`);
  }
}
