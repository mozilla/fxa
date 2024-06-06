/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';
import { expect } from '../lib/fixtures/standard';

export class RelierPage extends BaseLayout {
  get relierHeading() {
    return this.page.getByRole('heading', { name: '123done' });
  }

  goto(query?: string) {
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
    // We need to add a `waitUntil` option here because the page gets redirected from
    // /authorization to /oauth before the page is fully loaded.
    return this.page.waitForURL(`${this.target.contentServerUrl}/oauth/**`);
  }

  async signInPromptNone() {
    return this.page.locator('.ready .prompt-none').click();
  }

  async promptNoneError() {
    this.page.locator('.error');
    return this.page.innerText('.error');
  }

  async clickSubscribe() {
    await this.page
      .getByRole('link', { name: 'Subscribe to Pro (USD)' })
      .click();
    // We need to add a `waitUntil` option here because the page gets redirected from
    // content-server to payments-server, and the URL changes before the page is fully loaded.
    return this.page.waitForURL(`${this.target.paymentsServerUrl}/**`);
  }

  async clickSubscribe6Month() {
    await this.page
      .getByRole('link', { name: 'Subscribe to Pro 6m (USD)' })
      .click();
    return this.page.waitForURL(`${this.target.paymentsServerUrl}/**`);
  }

  async clickSubscribe12Month() {
    await this.page
      .getByRole('link', { name: 'Subscribe to Pro 12m (USD)' })
      .click();
    return this.page.waitForURL(`${this.target.paymentsServerUrl}/**`);
  }

  async clickSubscribeRPFlowMetrics() {
    await this.page
      .getByRole('link', { name: 'Subscribe to Pro (RP flow metrics)' })
      .click();
    return this.page.waitForURL(`${this.target.paymentsServerUrl}/**`);
  }

  async getUrl() {
    const expectedPathRegExp = new RegExp(
      `\\/subscriptions\\/products\\/${this.target.subscriptionConfig.product}\\?plan=${this.target.subscriptionConfig.plan}&service=(\\w+)`,
      'i'
    );
    const subscribeButton = this.page.locator('[data-testid=rp-flow-metrics]');
    await expect(subscribeButton).toHaveAttribute('href', expectedPathRegExp);
    return subscribeButton.getAttribute('href');
  }

  getRpAcquisitionParams(searchParams) {
    return {
      entrypoint: searchParams.get('entrypoint'),
      entrypoint_experiment: searchParams.get('entrypoint_experiment'),
      entrypoint_variation: searchParams.get('entrypoint_variation'),
      form_type: searchParams.get('form_type'),
      utm_source: searchParams.get('utm_source'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_content: searchParams.get('utm_content'),
      utm_term: searchParams.get('utm_term'),
      utm_medium: searchParams.get('utm_medium'),
      context: searchParams.get('context'),
    };
  }

  getRpFlowParams(searchParams) {
    return {
      flow_id: searchParams.get('flow_id'),
      device_id: searchParams.get('device_id'),
      flow_begin_time: searchParams.get('flow_begin_time'),
    };
  }

  getRpSearchParams(url) {
    return new URL(url).searchParams;
  }
}
