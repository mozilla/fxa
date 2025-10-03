/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { Page, TestInfo } from '@playwright/test';
import { Credentials } from './targets';
import { BaseTarget } from './targets/base';
import { MfaScope } from 'fxa-settings/src/lib/types';
import { getTotpCode } from './totp';

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
   * Updates the password for an account in the TestAccountTracker instance.
   * Useful for when password changes happen to ensure `destroyAllAccounts` uses
   * the updated password.
   * If the account is not found, an error is thrown.
   * @param email email address of the account to update
   * @param password new password for the account
   */
  updateAccountPassword(email: string, password: string) {
    const account = this.accounts.find((account) => account.email === email);
    if (!account) {
      throw new Error(`Account ${email} not found`);
    }
    account.password = password;
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
   *
   * Ensure that you have a hard navigation _after_ signing in with the new credentials.
   * A page on-load hook is registered but will require there to be a current account UID
   * and session token in localStorage to populate the MFA JWT cache.
   * @param param0 - Sign up options, email prefix, and MFA scope
   * @returns Credentials
   */
  async signUpAndPrimeMfa({
    options,
    prefix,
    scopes,
  }: {
    options?: any;
    prefix?: EmailPrefix;
    scopes: MfaScope[] | MfaScope;
  }): Promise<Credentials> {
    scopes = Array.isArray(scopes) ? scopes : [scopes];
    const credentials = await this.signUp(options, prefix);
    await this.primeMfaJwtCache(scopes, credentials);
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

        // Helper function to verify account or session if needed
        const verifyIfNeeded = async () => {
          try {
            await this.target.authClient.sessionResendVerifyCode(sessionToken);

            // Start checking for codes in parallel, whichever is available first will be used
            const [shortCodePromise, loginCodePromise] = [
              this.target.emailClient.getVerifyShortCode(account.email),
              this.target.emailClient.getVerifyLoginCode(account.email),
            ];
            const code = await Promise.any([
              shortCodePromise,
              loginCodePromise,
            ]);
            await this.target.authClient.sessionVerifyCode(sessionToken, code);
          } catch (err) {
            // allow console.error so we can capture this message in the trace.
            // eslint-disable-next-line no-console
            console.error(
              `Session verification skipped (might already be verified):`,
              err
            );
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
            await verifyIfNeeded();
            return true;
          }
          return false;
        };

        const elevateToAal2 = async (secret: string) => {
          const code = await getTotpCode(secret);
          await this.target.authClient.verifyTotpCode(sessionToken, code);
        };

        // Check if account has 2FA enabled before attempting to delete TOTP
        try {
          const profile =
            await this.target.authClient.accountProfile(sessionToken);
          const has2FA = profile.authenticationMethods?.includes('otp');

          if (has2FA) {
            if ('secret' in account && account.secret) {
              await elevateToAal2(account.secret);
            }
            try {
              await this.target.authClient.deleteTotpToken(sessionToken);
            } catch (totpError) {
              if (totpError.message.includes('Unconfirmed session')) {
                await verifyIfNeeded();
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
              await verifyIfNeeded();
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
            await verifyIfNeeded();
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
   * Clears the MFA JWT cache of tokens for the given scopes.
   *
   * If no scopes are provided, all tokens are cleared.
   * @param scope
   */
  async clearJwtCache(scopes?: MfaScope[] | MfaScope): Promise<void> {
    if (scopes) {
      scopes = Array.isArray(scopes) ? scopes : [scopes];
      // Clear specific scope
      await this.page.evaluate((scopes) => {
        const fxaStorageKey = '__fxa_storage';
        const mfaStorageKey = `${fxaStorageKey}.mfa_token_cache`;
        const mfaStorage = JSON.parse(
          localStorage.getItem(mfaStorageKey) || '{}'
        );

        scopes.forEach((scope) => {
          Object.keys(mfaStorage).forEach((key) => {
            if (key.endsWith(`-${scope}`)) {
              delete mfaStorage[key];
            }
          });
        });

        localStorage.setItem(mfaStorageKey, JSON.stringify(mfaStorage));
      }, scopes);
    } else {
      await this.page.evaluate(() => {
        localStorage.setItem(
          '__fxa_storage.mfa_token_cache',
          JSON.stringify({})
        );
      });
    }
  }
  /**
   * Prime the MFA JWT cache by requesting tokens. If credentials are not
   * provided, the first account in the internal accounts array will be used.
   *
   * To keep this as easy to use, an onLoad hook is registered that will
   * check if the localStorage cache is populated for the given scope, and if not,
   * it will populate it.
   * @param scope
   * @param credentials
   */
  async primeMfaJwtCache(scopes: MfaScope[], credentials?: Credentials) {
    credentials = credentials || (this.accounts[0] as Credentials);
    const { sessionToken, email } = credentials;
    const { authClient, emailClient } = this.target;
    const scopeTokenKvp: { scope: MfaScope; token: string }[] = [];

    async function getTokenByScope(scope: MfaScope) {
      // steps to fetch token by scope
      const { status } = await authClient.mfaRequestOtp(sessionToken, scope);
      if (status !== 'success') {
        throw new Error(`Failed to request MFA OTP for ${scope}`);
      }

      const code = await emailClient.getVerifyAccountChangeCode(email);

      const { accessToken } = await authClient.mfaOtpVerify(
        sessionToken,
        code,
        scope
      );
      if (!accessToken) {
        throw new Error(
          `Failed to fetch MFA JWT for scope: ${scope}. No accessToken returned`
        );
      }
      return accessToken;
    }

    for (const scope of scopes) {
      // eslint-disable-next-line no-await-in-loop
      scopeTokenKvp.push({ scope, token: await getTokenByScope(scope) });
    }

    this.registerMfaJwtOnLoadHook(scopeTokenKvp);
  }

  /**
   * This creates an `on-load` hook with Playwright that will check and populate
   * the localStorage for the MFA JWT on each page load.
   *
   * The `TestAccountTracker` will create accounts and populate the credentials
   * object with _a_ session token, but the token used by the browser session
   * will be different. So, this does the work to fetch the current account UID,
   * matching session token, and finally populate the MFA JWT cache.
   *
   * We use a page load event because the browser session token may not be available
   * at the time that the JWT is fetched. The overhead is minimal and ensures that
   * the cache is always populated when needed.
   * @param scope
   * @param accessToken
   */
  private registerMfaJwtOnLoadHook(
    scopeTokenKvp: { scope: MfaScope; token: string }[]
  ) {
    this.page.on('load', async () => {
      await this.page.evaluate(
        ({ scopeTokenKvp }) => {
          try {
            const fxaStorageKey = '__fxa_storage';
            const mfaStorageKey = `${fxaStorageKey}.mfa_token_cache`;
            let accountUid = localStorage.getItem(
              `${fxaStorageKey}.currentAccountUid`
            );

            if (!accountUid) {
              return;
            }

            accountUid = accountUid.replace(/^"(.*)"$/, '$1');
            const accounts = JSON.parse(
              localStorage.getItem(`${fxaStorageKey}.accounts`) || '{}'
            );

            const sessionToken = accounts[accountUid].sessionToken;
            if (!sessionToken) {
              // noop - can't proceed without session token
              return;
            }
            for (const { scope, token } of scopeTokenKvp) {
              const jwtKey = `${sessionToken}-${scope}`;
              const mfaStorage = JSON.parse(
                localStorage.getItem(mfaStorageKey) || '{}'
              );
              if (mfaStorage[jwtKey]) {
                continue; // noop - jwt already present
              }
              const tokenToStore = { [jwtKey]: token };
              localStorage.setItem(
                mfaStorageKey,
                JSON.stringify({ ...mfaStorage, ...tokenToStore })
              );
            }
          } catch (e) {
            // page hooks that fail are ignored by Playwright, so log to console
            // to troubleshoot if needed
            // eslint-disable-next-line no-console
            console.error('Error in onLoad hook', e);
          }
        },
        {
          scopeTokenKvp,
        }
      );
    });
  }
}
