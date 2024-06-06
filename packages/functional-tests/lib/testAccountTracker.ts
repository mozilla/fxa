/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { Credentials } from './targets';
import { BaseTarget } from './targets/base';

enum EmailPrefix {
  BLOCKED = 'blocked',
  BOUNCED = 'bounced',
  FORCED_PWD_CHANGE = 'forcepwdchange',
  SIGNIN = 'signin',
  SIGNUP = 'signup',
  SYNC = 'sync',
}

type AccountDetails = {
  email: string;
  password: string;
};

export class TestAccountTracker {
  accounts: (AccountDetails | Credentials)[];
  private target: BaseTarget;

  constructor(target: BaseTarget) {
    this.target = target;
    this.accounts = [];
  }

  /**
   * Creates a new email address with the 'blocked' prefix
   * @returns email
   */
  generateBlockedEmail(): string {
    return this.generateEmail(EmailPrefix.BLOCKED);
  }

  /**
   * Creates a new email with the 'sync' prefix
   * @returns email
   */
  generateSyncEmail(): string {
    return this.generateEmail(EmailPrefix.SYNC);
  }

  /**
   * Creates a new email address with a given prefix
   * @param prefix email prefix to use when generating email
   * @returns email
   */
  generateEmail(prefix: EmailPrefix = EmailPrefix.SIGNIN): string {
    const id = crypto.randomBytes(8).toString('hex');
    return `${prefix}${id}@restmail.net`;
  }

  /**
   * Creates a new randomized password
   * @returns password
   */
  generatePassword(): string {
    return `${crypto.randomBytes(10).toString('hex')}`;
  }

  /**
   * Creates a new email address with the 'bounced' prefix and a new randomized
   * password
   * @returns AccountDetails
   */
  generateBouncedAccountDetails(): AccountDetails {
    return this.generateAccountDetails(EmailPrefix.BOUNCED);
  }

  /**
   * Creates a new email address with the 'signup' prefix and a new
   * randomized password
   * @returns AccountDetails
   */
  generateSignupAccountDetails(): AccountDetails {
    return this.generateAccountDetails(EmailPrefix.SIGNUP);
  }

  /**
   * Creates a new email address with the 'sync' prefix and a new randomized
   * password
   * @returns AccountDetails
   */
  generateSyncAccountDetails(): AccountDetails {
    return this.generateAccountDetails(EmailPrefix.SYNC);
  }

  /**
   * Creates a new email address with the 'blocked' prefix and a new randomized
   * password
   * @returns AccountDetails
   */
  generateBlockedAccountDetails(): AccountDetails {
    return this.generateAccountDetails(EmailPrefix.BLOCKED);
  }

  /**
   * Creates a new email address with a given prefix and a new randomized
   * password
   * @param prefix email prefix to use when generating email
   * @returns AccountDetails
   */
  generateAccountDetails(
    prefix: EmailPrefix = EmailPrefix.SIGNIN
  ): AccountDetails {
    const account = {
      email: this.generateEmail(prefix),
      password: this.generatePassword(),
    };
    this.accounts.push(account);
    return account;
  }

  /**
   * Signs up an account with the AuthClient with a new email address created
   * with the 'blocked' prefix and a new randomized password
   * @param options AuthClient signup options
   * @returns Credentials
   */
  async signUpBlocked(options?: any): Promise<Credentials> {
    return await this.signUp(options, EmailPrefix.BLOCKED);
  }

  /**
   * Signs up an account with the AuthClient with a new email address created
   * with the 'forcepwdchange' prefix and a new randomized password
   * @param options AuthClient signup options
   * @returns Credentials
   */
  async signUpForced(options?: any): Promise<Credentials> {
    return await this.signUp(options, EmailPrefix.FORCED_PWD_CHANGE);
  }

  /**
   * Signs up an account with the AuthClient with a new email address created
   * with the 'sync' prefix and a new randomized password
   * @param options AuthClient signup options
   * @returns Credentials
   */
  async signUpSync(options?: any): Promise<Credentials> {
    return await this.signUp(options, EmailPrefix.SYNC);
  }

  /**
   * Signs up an account with the AuthClient with a new email address created
   * with a given prefix and a new randomized password
   * @param options AuthClient signup options
   * @param prefix email prefix to use when generating email
   * @returns Credentials
   */
  async signUp(
    options?: any,
    prefix: EmailPrefix = EmailPrefix.SIGNIN
  ): Promise<Credentials> {
    const email = this.generateEmail(prefix);
    const password = this.generatePassword();
    const credentials = await this.target.createAccount(
      email,
      password,
      options
    );
    this.accounts.push(credentials);
    return credentials;
  }

  /**
   * Destroys all accounts tracked by this TestAccountTracker
   */
  async destroyAllAccounts() {
    while (this.accounts.length > 0) {
      const account = this.accounts.pop();
      if (!account) {
        continue;
      }

      const accountStatus = await this.target.authClient.accountStatusByEmail(
        account.email
      );

      if (!accountStatus.exists) {
        continue;
      }

      /**
       * Troubleshooting if accounts fail to destroy:
       *
       * Error Message: 'Sign in with this email type is not currently supported'
       * The primary email was most likely changed, the test case must
       * update the account with the new email
       *
       * Error Message: 'The request was blocked for security reasons'
       * Some accounts are always prompted to unblock, ie emails starting
       * with `blocked.`. These accounts need to be destroyed in the test
       * case
       *
       * Error Message: 'Unconfirmed session'
       * The account is most likely using TOTP. Disable TOTP or remove the
       * account in the test
       */
      const credentials = await this.target.authClient.signIn(
        account.email,
        account.password
      );
      await this.target.authClient.accountDestroy(
        account.email,
        account.password,
        {},
        credentials.sessionToken
      );
    }
  }
}
