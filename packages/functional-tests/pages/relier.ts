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

  clickEmailFirst() {
    return Promise.all([
      this.page.locator('button.email-first-button').click(),
      this.page.waitForNavigation(),
    ]);
  }

  clickSignIn() {
    return Promise.all([
      this.page.locator('button.sign-in-button.signin').click(),
      this.page.waitForNavigation(),
    ]);
  }

  clickForceAuth() {
    return Promise.all([
      this.page.locator('button.force-auth').click(),
      this.page.waitForNavigation(),
    ]);
  }

  clickChooseFlow() {
    return this.page.locator('button.sign-choose').click();
  }

  async clickSubscribe() {
    await Promise.all([
      this.page.getByRole('link', { name: 'Subscribe to Pro (USD)' }).click(),
      this.page.waitForNavigation({ waitUntil: 'load' }),
    ]);
  }

  async clickSubscribe6Month() {
    await Promise.all([
      this.page
        .getByRole('link', { name: 'Subscribe to Pro 6m (USD)' })
        .click(),
      this.page.waitForNavigation({ waitUntil: 'load' }),
    ]);
  }

  async clickSubscribe12Month() {
    await Promise.all([
      this.page
        .getByRole('link', { name: 'Subscribe to Pro 12m (USD)' })
        .click(),
      this.page.waitForNavigation({ waitUntil: 'load' }),
    ]);
  }
}
