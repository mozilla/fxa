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
    // Ensure we've navigated back to the relier before checking login status
    await this.page.waitForURL(`${this.target.relierUrl}/**`);
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

  /**
   * Wait for the settled /oauth page, not the intermediate /authorization
   * redirect a loose `${contentServerUrl}/**` glob would resolve on too early.
   */
  private waitForOauthPage() {
    return this.page.waitForURL((url) => /^\/oauth(\/|$)/.test(url.pathname));
  }

  async clickEmailFirst() {
    await expect(this.relierHeading).toBeVisible();

    await this.page.getByRole('button', { name: 'Email first' }).click();
    return this.waitForOauthPage();
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

  async clickSubscribeMonthly() {
    await this.page
      .getByRole('link', { name: 'SP3 - Sub to Pro 1m', exact: true })
      .click();
    await this.page.waitForURL(
      (url) => !url.href.includes(this.target.relierUrl)
    );
  }

  async clickSubscribe6Month() {
    await this.page.getByRole('link', { name: 'SP3 - Sub to Pro 6m' }).click();
    await this.page.waitForURL(
      (url) => !url.href.includes(this.target.relierUrl)
    );
  }

  async clickSubscribe12Month() {
    await this.page.getByRole('link', { name: 'SP3 - Sub to Pro 12m' }).click();
    await this.page.waitForURL(
      (url) => !url.href.includes(this.target.relierUrl)
    );
  }

  async clickRequire2FA() {
    await this.page.getByText('Sign In (Require AAL2 Session)').click();
    return this.waitForOauthPage();
  }

  async clickRequireProfileAAL2() {
    await this.page.getByText('Sign In (Require Profile AAL2)').click();
    return this.waitForOauthPage();
  }

  get stepUpAuthButton() {
    return this.page.locator('button.step-up-auth');
  }

  /**
   * Start a step-up flow, forwarding `maxAge` as the `max_age` authorization
   * parameter. The request carries no `prompt=none`, so the flow stops at the cached
   * signin page for confirmation; the caller drives that and whatever follows — a
   * satisfied `max_age` returns to the relier, a stale one adds a second factor.
   */
  async clickStepUpAuth(maxAge: number) {
    await this.page.locator('#step-up-max-age').fill(String(maxAge));
    await this.stepUpAuthButton.click();
  }

  /**
   * The claims 123Done captured from the id_token at redirect time, plus its
   * configured step-up default. Read over HTTP rather than scraped from the DOM so
   * assertions are on claim values, not on rendering.
   */
  async getAuthStatus(): Promise<{
    email: string | null;
    acr: string;
    amr: string[] | null;
    auth_time: number | null;
    account_aal2: boolean;
    step_up_max_age: number;
  }> {
    const response = await this.page.request.get(
      `${this.target.relierUrl}/api/auth_status`
    );
    expect(response.ok()).toBe(true);
    return response.json();
  }

  /**
   * The claims the authorization server reports for 123Done's current access token,
   * via `POST /v1/introspect`. This is the resource-server view of the elevation, as
   * opposed to the id_token 123Done was handed at redirect time.
   */
  async getTokenClaims(): Promise<{
    active: boolean;
    acr: string | null;
    amr: string[] | null;
    auth_time: number | null;
  }> {
    const response = await this.page.request.get(
      `${this.target.relierUrl}/api/token_claims`
    );
    expect(response.ok()).toBe(true);
    return response.json();
  }

  async hasAccountAAL2Badge() {
    const text = await this.page.locator('#loggedin span').innerText();
    return text.includes(String.fromCodePoint(0x1f6e1));
  }

  async hasSessionAAL2Badge() {
    const text = await this.page.locator('#loggedin span').innerText();
    return text.includes(String.fromCodePoint(0x1f512));
  }
}
