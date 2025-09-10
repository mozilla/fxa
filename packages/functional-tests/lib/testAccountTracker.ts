/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { Page, TestInfo } from '@playwright/test';
import { Credentials } from './targets';
import { BaseTarget } from './targets/base';
import { MfaScope } from 'fxa-settings/src/lib/types';


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

/**
 * TestAccountTracker manages test account lifecycle with automatic cleanup.
 *
 * Features:
 * - Tracks all created accounts for automatic cleanup
 * - Automatically disables TOTP before account destruction
 * - Handles edge cases like blocked accounts and email changes
 *
 * Best Practices:
 * - While tests should still call `settings.disconnectTotp()` for explicit cleanup,
 *   the automatic cleanup will handle cases where tests fail before reaching cleanup
 * - Update account credentials if email or password changes during the test
 * - Blocked accounts may still need manual cleanup in some cases
 */
export class TestAccountTracker {
  accounts: (AccountDetails | Credentials)[];
  private target: BaseTarget;
  private testInfo: TestInfo;
  private page: Page;
  private jwtCredentials: Credentials & { jwt: string, scope: MfaScope } | undefined = undefined;

  constructor(target: BaseTarget, testInfo: TestInfo, page: Page) {
    this.target = target;
    this.testInfo = testInfo;
    this.accounts = [];
    this.page = page;
  }

  /**
   * Gets a short test context string for logging
   */
  private getTestContext(): string {
    const titlePath = this.testInfo.titlePath;
    // Return the last two elements (test suite and test name) for brevity
    return titlePath.slice(-2).join(' > ');
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
   * Signs up an account with the AuthClient and primes the MFA JWT cache.
   *
   * Use this if you need to prime the MFA JWT cache immediately after signup.
   * @param param0 - Sign up options, email prefix, and MFA scope
   * @returns Credentials
   */
  async signUpAndPrimeMfa({ options, prefix, scope }: {
    options?: any;
    prefix?: EmailPrefix;
    scope: MfaScope;
  }): Promise<Credentials> {
    const credentials = await this.signUp(options, prefix);
    await this.primeMfaJwtCache(scope, credentials);
    return credentials;
  }

  /**
   * Destroys all accounts tracked by this TestAccountTracker.
   * Fails fast if any account cleanup fails.
   */
  async destroyAllAccounts() {
    while (this.accounts.length > 0) {
      const account = this.accounts.pop();
      if (!account) continue;

      // Check if account exists
      const accountStatus = await this.target.authClient.accountStatusByEmail(
        account.email
      );
      if (!accountStatus.exists) continue;

      try {
        // Get session token (existing or new)
        let sessionToken: string;
        if ('sessionToken' in account && account.sessionToken) {
          sessionToken = account.sessionToken;
        } else {
          const credentials = await this.target.authClient.signIn(
            account.email,
            account.password
          );
          sessionToken = credentials.sessionToken;
        }

        // Helper function to verify session if needed
        const verifySessionIfNeeded = async () => {
          try {
            await this.target.authClient.sessionResendVerifyCode(sessionToken);
            const code = await this.target.emailClient.getVerifyLoginCode(
              account.email
            );
            await this.target.authClient.sessionVerifyCode(sessionToken, code);
          } catch {
            // Ignore verification errors - session might already be verified
          }
        };

        // Helper function to get fresh session if current one is invalid
        const getFreshSessionIfNeeded = async (error: any) => {
          if (
            error.message.includes('Invalid authentication token') ||
            error.message.includes('Missing authentication')
          ) {
            const credentials = await this.target.authClient.signIn(
              account.email,
              account.password
            );
            sessionToken = credentials.sessionToken;
            await verifySessionIfNeeded();
            return true;
          }
          return false;
        };

        // Check if account has 2FA enabled before attempting to delete TOTP
        try {
          const profile =
            await this.target.authClient.accountProfile(sessionToken);
          const has2FA = profile.authenticationMethods?.includes('otp');

          if (has2FA) {
            try {
              await this.target.authClient.deleteTotpToken(sessionToken);
            } catch (totpError) {
              if (totpError.message.includes('Unconfirmed session')) {
                await verifySessionIfNeeded();
                await this.target.authClient.deleteTotpToken(sessionToken);
              } else if (await getFreshSessionIfNeeded(totpError)) {
                await this.target.authClient.deleteTotpToken(sessionToken);
              } else {
                throw totpError;
              }
            }
          }
        } catch (profileError) {
          // If we can't get profile info, fall back to trying TOTP deletion
          // This handles edge cases where profile endpoint might fail
          try {
            await this.target.authClient.deleteTotpToken(sessionToken);
          } catch (totpError) {
            if (totpError.message.includes('Unconfirmed session')) {
              await verifySessionIfNeeded();
              await this.target.authClient.deleteTotpToken(sessionToken);
            } else if (await getFreshSessionIfNeeded(totpError)) {
              await this.target.authClient.deleteTotpToken(sessionToken);
            }
            // Ignore TOTP errors in fallback case - account might not have TOTP
          }
        }

        // Try to destroy the account
        try {
          await this.target.authClient.accountDestroy(
            account.email,
            account.password,
            {},
            sessionToken
          );
        } catch (destroyError) {
          if (destroyError.message.includes('Unconfirmed session')) {
            await verifySessionIfNeeded();
            await this.target.authClient.accountDestroy(
              account.email,
              account.password,
              {},
              sessionToken
            );
          } else if (await getFreshSessionIfNeeded(destroyError)) {
            await this.target.authClient.accountDestroy(
              account.email,
              account.password,
              {},
              sessionToken
            );
          } else {
            throw destroyError;
          }
        }
      } catch (error) {
        throw new Error(
          `Failed to cleanup account ${account.email}: ${error.message}`
        );
      }
    }
  }


  /**
   * Prime the MFA JWT cache by requesting a new token. If credentials are not
   * provided, the first account in the internal accounts array will be used.
   *
   * After completion, a call to register a page on-load hook is
   * @param scope
   * @param credentials
   */
  async primeMfaJwtCache(scope: MfaScope, credentials?: Credentials) {
    credentials = credentials || this.accounts[0] as Credentials;

    const { sessionToken, email } = credentials;
    const { authClient, emailClient } = this.target;

    const { status } = await authClient.mfaRequestOtp(sessionToken, scope);
    if (status !== 'success') {
      throw new Error(`Failed to request MFA OTP for ${scope}`);
    }

    const code = await emailClient.getVerifyAccountChangeCode(email);

    const { accessToken } = await authClient.mfaOtpVerify(sessionToken, code, scope);
    if ( !accessToken ) {
      throw new Error('Failed to prime mfa jwt cache, no accessToken returned');
    }

    // store the jwt for clearing it later, debugging, or for page.on('load') hook.
    this.jwtCredentials = { ...credentials, scope, jwt: accessToken };

    // await this.page.evaluate(({ sessionToken, scope, jwt }) => {
    //   window.dispatchEvent(new CustomEvent('jwtCache:set', { detail: { sessionToken, scope, jwt } }));
    // }, { sessionToken, scope, jwt: this.jwtCredentials.jwt });

    this.registerPageLoadJwtCacheHook();
  }

  /**
   * Checks for JWT cache on page load and sets it if available.
   */
  registerPageLoadJwtCacheHook = () => {
    if ( !this.jwtCredentials || (!this?.jwtCredentials.jwt && !this?.jwtCredentials?.sessionToken)) {
      // noop if we don't have jwtCredentials, protects against direct calls without
      // having called primeMfaJwtCache first.
      return;
    }
    const {sessionToken, jwt, scope } = this.jwtCredentials
    this.page.on('load', async () => {
      await this.page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('jwtCache:set', { detail: {sessionToken, scope, jwt } }));
      }, {sessionToken, scope, jwt});
    });
  }
}
