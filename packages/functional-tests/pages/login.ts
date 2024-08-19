/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export const selectors = {
  AGE: '#age',
  FIREFOX_HEADER: '[data-testid=logo]',
  EMAIL: 'input[type=email]',
  EMAIL_PREFILLED: '#prefillEmail',
  EMAIL_HEADER: '#fxa-enter-email-header',
  ERROR: '.error',
  LINK_USE_DIFFERENT: 'a:has-text("Use a different account")',
  PASSWORD: ':nth-match(input[type=password],1)',
  PASSWORD_HEADER: 'h1:has-text("Enter your password")',
  RESET_PASSWORD_EXPIRED_HEADER: '#fxa-reset-link-expired-header',
  RESET_PASSWORD_HEADER: '#fxa-reset-password-header',
  SIGN_UP_CODE_HEADER: 'h1:has-text("Enter confirmation code")',
  CONFIRM_EMAIL: '.email',
  COPPA_HEADER: '#fxa-cannot-create-account-header',
  SUBMIT: 'button[type=submit]',
  RECOVERY_KEY_TEXT_INPUT: 'input[type=text]',
  TOOLTIP: '.tooltip',
  VPASSWORD: ':nth-match(input[type=password],2)',
};

type FirstSignUpOptions = {
  verify?: boolean;
  enterEmail?: boolean;
  waitForNavOnSubmit?: boolean;
};

export class LoginPage extends BaseLayout {
  readonly path = '';

  get CWTSEngineHeader() {
    return this.page.getByRole('heading', { name: 'Choose what to sync' });
  }

  get CWTSEngineBookmarks() {
    return this.page.getByLabel('Bookmarks', { exact: true });
  }

  get CWTSEngineHistory() {
    return this.page.getByLabel('History', { exact: true });
  }

  get CWTSEnginePasswords() {
    return this.page.getByLabel('Passwords', { exact: true });
  }

  get CWTSEngineAddons() {
    return this.page.getByLabel('Add-ons', { exact: true });
  }

  get CWTSEnginePreferences() {
    return this.page.getByLabel('Preferences', { exact: true });
  }

  get CWTSEngineCreditCards() {
    return this.page.getByLabel('Payment Methods', { exact: true });
  }

  get CWTSEngineAddresses() {
    return this.page.getByLabel('Addresses', { exact: true });
  }

  get CWTSDoNotSync() {
    return this.page.getByLabel('Do not sync', { exact: true });
  }

  get signUpPasswordHeader() {
    return this.page.getByRole('heading', { name: 'Set your password' });
  }

  get signUpCodeHeader() {
    return this.page.locator(selectors.SIGN_UP_CODE_HEADER);
  }

  async fillOutFirstSignUp(
    email: string,
    password: string,
    {
      verify = true,
      enterEmail = true,
      waitForNavOnSubmit = true,
    }: FirstSignUpOptions = {}
  ) {
    if (enterEmail) {
      await this.setEmail(email);
      await this.submit();
    }
    await this.page.fill(selectors.PASSWORD, password);
    await this.page.fill(selectors.VPASSWORD, password);
    await this.page.fill(selectors.AGE, '24');
    await this.submit();
    if (verify) {
      await this.fillOutSignUpCode(email, waitForNavOnSubmit);
    }
  }

  async fillOutSignUpCode(code: string, waitForNavOnSubmit = true) {
    await this.setCode(code);
    await this.submit(waitForNavOnSubmit);
  }

  async waitForEmailHeader() {
    const emailHeader = this.page.locator(selectors.EMAIL_HEADER);
    await emailHeader.waitFor({ state: 'visible', timeout: 2000 });
    return emailHeader.isVisible();
  }

  cannotCreateAccountHeader() {
    return this.page.locator(selectors.COPPA_HEADER);
  }

  getConfirmEmail() {
    return this.page.locator(selectors.CONFIRM_EMAIL);
  }

  setEmail(email: string) {
    return this.page.fill(selectors.EMAIL, email);
  }

  setPassword(password: string) {
    return this.page.fill(selectors.PASSWORD, password);
  }

  confirmPassword(password: string) {
    return this.page.fill(selectors.VPASSWORD, password);
  }

  async setCode(code: string) {
    return this.page.fill(selectors.RECOVERY_KEY_TEXT_INPUT, code);
  }

  async isUserLoggedIn() {
    const header = this.page.locator(selectors.FIREFOX_HEADER);
    await header.waitFor();
    return header.isVisible();
  }

  async signInError() {
    const error = this.page.locator(selectors.ERROR);
    await error.waitFor();
    return error.textContent();
  }

  async getUseDifferentAccountLink() {
    return this.page.locator(selectors.LINK_USE_DIFFERENT);
  }

  getTooltipError() {
    return this.page.locator(selectors.TOOLTIP);
  }

  async unblock(code: string) {
    await this.setCode(code);
    await this.submit();
  }

  async submit(waitForNav = true) {
    if (waitForNav) {
      const waitForNavigation = this.page.waitForEvent('framenavigated');
      await this.page.locator(selectors.SUBMIT).click();
      await waitForNavigation;
    }
    //using waitForNav just as parameters as
    //waitForNavigation() has been deprecated
    await this.page.locator(selectors.SUBMIT).click();
  }

  async waitForPasswordHeader() {
    const header = this.page.locator(selectors.PASSWORD_HEADER);
    await header.waitFor();
    return header;
  }

  async clickSubmit() {
    return this.page.locator(selectors.SUBMIT).click();
  }

  setAge(age: string) {
    return this.page.locator(selectors.AGE).fill(age);
  }

  async setNewPassword(password: string) {
    await this.page.locator(selectors.PASSWORD).fill(password);
    await this.page.locator(selectors.VPASSWORD).fill(password);
    await this.submit();
  }

  async getPrefilledEmail() {
    return this.page.locator(selectors.EMAIL_PREFILLED).innerText();
  }

  async getEmailInputElement() {
    return this.page.locator(selectors.EMAIL);
  }

  async getEmailInput() {
    return this.page.locator(selectors.EMAIL).inputValue();
  }

  getPasswordInput() {
    return this.page.locator(selectors.PASSWORD);
  }

  getErrorMessage() {
    return this.page.locator(selectors.ERROR);
  }
}
