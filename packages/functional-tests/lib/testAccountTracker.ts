/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// We need to disable this rule so we can capture
// messages in the traces in CI.
/* eslint-disable no-console */

import crypto from 'crypto';
import { Page, TestInfo } from '@playwright/test';
import { Credentials } from './targets';
import { BaseTarget } from './targets/base';
import { MfaScope } from 'fxa-settings/src/lib/types';
import { getTotpCode } from './totp';
import { SessionStatus } from 'fxa-auth-client/lib/client';

enum EmailPrefix {
  BLOCKED = 'blocked',
  BOUNCED = 'bounced',
  BOUNCED_ALIAS = 'bounced+',
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
  generateEmail(
    prefix: EmailPrefix = EmailPrefix.SIGNIN,
    domain = 'restmail.net'
  ): string {
    const id = crypto.randomBytes(8).toString('hex');
    return `${prefix}${id}@${domain}`;
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
   * Creates a new email address with the 'bounced' prefix and a new randomized
   * password
   * @returns AccountDetails
   */
  generateBouncedAliasAccountDetails(domain: string): AccountDetails {
    return this.generateAccountDetails(EmailPrefix.BOUNCED_ALIAS, domain);
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
    prefix: EmailPrefix = EmailPrefix.SIGNIN,
    domain = 'restmail.net'
  ): AccountDetails {
    const account = {
      email: this.generateEmail(prefix, domain),
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
    // reduce accounts down to unique emails so we don't try to destroy
    // an already destroyed account, wasting time and potentially failing the test
    this.accounts = this.accounts.reduce(
      (acc, account) => {
        const existingAccount = acc.find((a) => a.email === account.email);
        return existingAccount ? acc : [...acc, account];
      },
      [] as (AccountDetails | Credentials)[]
    );
    while (this.accounts.length > 0) {
      const account = this.accounts.pop();
      if (!account) continue;

      const accountStatus = await this.target.authClient.accountStatusByEmail(
        account.email
      );
      if (!accountStatus.exists) continue;

      try {
        await this.destroyAccount(account);
      } catch (error: any) {
        throw new Error(
          `Failed to cleanup account. Check admin panel for account status and delete if necessary.
          Account: ${account.email}
          Error: ${error.message}`
        );
      }
    }
  }

  /**
   * Destroys a single account, handling session management, 2FA removal, and cleanup.
   * This takes a naive approach, defaulting to fetching a new session token, checking status,
   * verifying the session if needed, and defaulting to elevating to AAL2 when 2FA is enabled.
   *
   * Once we have a valid sessionToken, we disconnect 2FA then destroy the account.
   */
  private async destroyAccount(account: AccountDetails | Credentials) {
    const { sessionToken } = await this.target.authClient.signIn(
      account.email,
      account.password
    );

    const [status, has2FA] = await Promise.all([
      this.target.authClient.sessionStatus(sessionToken),
      this.checkIfAccountHas2FA(sessionToken),
    ]);

    if (!status.details.sessionVerified && !has2FA) {
      await this.target.authClient.sessionResendVerifyCode(sessionToken);

      const [shortCodePromise, loginCodePromise] = [
        this.target.emailClient.getVerifyShortCode(account.email),
        this.target.emailClient.getVerifyLoginCode(account.email),
      ];

      const code = await Promise.any([shortCodePromise, loginCodePromise]);
      await this.target.authClient.sessionVerifyCode(sessionToken, code);
    }

    const hasSecret = 'secret' in account && account.secret;
    const needsElevation = !status.details.sessionVerificationMeetsMinimumAAL;

    if (needsElevation && has2FA && !hasSecret) {
      throw new Error(
        `Cannot destroy account ${account.email}: Session does not meet minimum AAL, 2FA is enabled, and no TOTP secret is available.
        Check admin panel and delete manually if necessary.
        Account: ${account.email}`
      );
    }

    if (needsElevation && hasSecret) {
      await this.elevateToAal2(account.secret as string, sessionToken, status);
    }

    if (has2FA) {
      // Get MFA JWT for 2FA scope to delete TOTP
      const mfaJwt = await this.getMfaJwtForScope('2fa', sessionToken, account.email);
      await this.target.authClient.deleteTotpTokenWithJwt(mfaJwt);
    }

    await this.target.authClient.accountDestroy(
      account.email,
      account.password,
      {},
      sessionToken
    );
  }

  /**
   * Checks if an account has 2FA enabled by querying the profile.
   * Returns false if profile query fails (graceful degradation).
   */
  private async checkIfAccountHas2FA(sessionToken: string): Promise<boolean> {
    try {
      const profile = await this.target.authClient.accountProfile(sessionToken);
      return profile.authenticationMethods?.includes('otp') ?? false;
    } catch (error) {
      console.error(
        'Could not check 2FA status from profile, assuming no 2FA:',
        error
      );
      return false;
    }
  }

  /**
   * Elevates the session to AAL2 by verifying a TOTP code.
   * Uses provided session status to avoid unnecessary elevation if already at AAL2.
   */
  private async elevateToAal2(
    secret: string,
    sessionToken: string,
    status: SessionStatus
  ): Promise<void> {
    if (status.details.sessionVerificationMeetsMinimumAAL) {
      return;
    }

    const code = await getTotpCode(secret);
    await this.target.authClient.verifyTotpCode(sessionToken, code);
  }

  /**
   * Gets an MFA JWT for a specific scope by requesting and verifying an OTP.
   * This is used for operations that require MFA authentication.
   */
  private async getMfaJwtForScope(
    scope: MfaScope,
    sessionToken: string,
    email: string
  ): Promise<string> {
    const { status } = await this.target.authClient.mfaRequestOtp(
      sessionToken,
      scope
    );
    if (status !== 'success') {
      throw new Error(`Failed to request MFA OTP for scope: ${scope}`);
    }

    const code = await this.target.emailClient.getVerifyAccountChangeCode(email);

    const { accessToken } = await this.target.authClient.mfaOtpVerify(
      sessionToken,
      code,
      scope
    );
    if (!accessToken) {
      throw new Error(
        `Failed to get MFA JWT for scope: ${scope}. No accessToken returned`
      );
    }

    return accessToken;
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
