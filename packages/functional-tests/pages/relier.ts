import { BaseLayout } from './layout';
import { selectors } from './login';

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
    // Depending on if the user is signed in or not, match /products/ or /checkout/.
    // We need to add a `waitUntil` option here because the page gets redirected from
    // content-server to payments-server, and the URL changes before the page is fully loaded.
    return this.page.waitForURL(/\/(checkout|products)\//, {
      waitUntil: 'networkidle',
    });
  }

  async clickSubscribe6Month() {
    await this.page
      .getByRole('link', { name: 'Subscribe to Pro 6m (USD)' })
      .click();
    return this.page.waitForURL(/\/(checkout|products)\//, {
      waitUntil: 'networkidle',
    });
  }

  async clickSubscribe12Month() {
    await this.page
      .getByRole('link', { name: 'Subscribe to Pro 12m (USD)' })
      .click();
    return this.page.waitForURL(/\/(checkout|products)\//, {
      waitUntil: 'networkidle',
    });
  }
}
