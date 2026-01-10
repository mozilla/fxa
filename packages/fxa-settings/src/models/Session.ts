/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import {
  sessionToken,
  clearSignedInAccountUid,
  currentAccount,
} from '../lib/cache';
import {
  isSignedIn as checkIsSignedIn,
  getSessionVerified,
  setSessionVerified,
} from '../lib/account-storage';

export interface SessionData {
  verified: boolean | null;
  token: string | null;
  verifySession?: (
    code: string,
    options: {
      service?: string;
      scopes?: string[];
      marketingOptIn?: boolean;
      newsletters?: string[];
    }
  ) => Promise<void>;
  destroy?: () => void;
}

/**
 * Check if user is signed in (derived from account storage)
 */
export function getStoredSignedInStatus(): boolean {
  return checkIsSignedIn();
}

/**
 * Mark session as verified in account storage
 * Note: "signed in" status is derived from having a sessionToken,
 * so this function primarily marks the session as verified.
 */
export function setStoredSignedInStatus(isSignedIn: boolean): void {
  // When signing in, mark session as verified
  // When signing out, clearSignedInAccountUid handles removing the account
  if (isSignedIn) {
    setSessionVerified(true);
  }
  // Dispatch event for reactive updates (for backwards compatibility)
  window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { key: 'isSignedIn' } }));
}

export class Session implements SessionData {
  private readonly authClient: AuthClient;
  private _loading: boolean;

  constructor(authClient: AuthClient) {
    this.authClient = authClient;
    this._loading = false;
  }

  private async withLoadingStatus<T>(promise: Promise<T>) {
    this._loading = true;
    try {
      return await promise;
    } catch (e) {
      throw e;
    } finally {
      this._loading = false;
    }
  }

  get token(): string {
    return sessionToken() || '';
  }

  get verified(): boolean {
    return getSessionVerified();
  }

  async verifySession(
    code: string,
    options: {
      service?: string;
      scopes?: string[];
      marketingOptIn?: boolean;
      newsletters?: string[];
    } = {}
  ) {
    await this.withLoadingStatus(
      this.authClient.sessionVerifyCode(sessionToken()!, code, options)
    );
    setSessionVerified(true);
    setStoredSignedInStatus(true);
  }

  async sendVerificationCode() {
    await this.withLoadingStatus(
      this.authClient.sessionResendVerifyCode(sessionToken()!)
    );
  }

  async destroy() {
    const token = sessionToken();
    if (token) {
      await this.authClient.sessionDestroy(token);
    }
    clearSignedInAccountUid();
    // Note: clearSignedInAccountUid removes the account from storage,
    // so we don't need to explicitly set sessionVerified to false
    window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { key: 'isSignedIn' } }));
  }

  get isDestroyed() {
    return currentAccount() == null;
  }

  async isSessionVerified(): Promise<boolean> {
    const token = sessionToken();
    if (!token) {
      return false;
    }

    try {
      const status = await this.authClient.sessionStatus(token);
      const verified = status.state === 'verified';
      setSessionVerified(verified);
      return verified;
    } catch (e) {
      return false;
    }
  }

  async isValid(token: string): Promise<boolean> {
    try {
      await this.authClient.sessionStatus(token);
      setSessionVerified(true);
      return true;
    } catch (e) {
      return false;
    }
  }
}
