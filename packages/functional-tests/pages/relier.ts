import { BaseLayout } from './layout';

export class RelierPage extends BaseLayout {
  goto(query?: string) {
    const url = query
      ? `${this.target.relierUrl}?${query}`
      : this.target.relierUrl;
    return this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async isLoggedIn() {
    const login = this.page.locator('#loggedin');
    await login.waitFor({ state: 'visible' });
    return login.isVisible();
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
    const waitForNavigation = this.page.waitForNavigation();
    await this.page.locator('button.email-first-button').click();
    return waitForNavigation;
  }

  async clickSignIn() {
    const waitForNavigation = this.page.waitForNavigation();
    await this.page.locator('button.sign-in-button.signin').click();
    return waitForNavigation;
  }

  async clickForceAuth() {
    const waitForNavigation = this.page.waitForNavigation();
    await this.page.locator('button.force-auth').click();
    return waitForNavigation;
  }

  clickChooseFlow() {
    return this.page.locator('button.sign-choose').click();
  }

  async clickSubscribe() {
    await this.page
      .getByRole('link', { name: 'Subscribe to Pro (USD)' })
      .click();
    // We need to add a `waitUntil` option here because the page gets redirected from
    // content-server to payments-server, and the URL changes before the page is fully loaded.
    return this.page.waitForURL(`${this.target.paymentsServerUrl}/**`, {
      waitUntil: 'load',
    });
  }

  async clickSubscribe6Month() {
    await this.page
      .getByRole('link', { name: 'Subscribe to Pro 6m (USD)' })
      .click();
    return this.page.waitForURL(`${this.target.paymentsServerUrl}/**`, {
      waitUntil: 'load',
    });
  }

  async clickSubscribe12Month() {
    await this.page
      .getByRole('link', { name: 'Subscribe to Pro 12m (USD)' })
      .click();
    return this.page.waitForURL(`${this.target.paymentsServerUrl}/**`, {
      waitUntil: 'load',
    });
  }

  async clickSubscribeRPFlowMetrics() {
    await this.page
      .getByRole('link', { name: 'Subscribe to Pro (RP flow metrics)' })
      .click();
    return this.page.waitForURL(`${this.target.paymentsServerUrl}/**`, {
      waitUntil: 'load',
    });
  }

  getUrl() {
    return this.page
      .locator('[data-testid=rp-flow-metrics]')
      .getAttribute('href');
  }

  async getRpFlowParams(searchParams) {
    return {
      flow_id: searchParams.get('flow_id'),
      device_id: searchParams.get('device_id'),
      flow_begin_time: searchParams.get('flow_begin_time'),
    };
  }

  async getRpSearchParams(url) {
    return new URL(url).searchParams;
  }
}
