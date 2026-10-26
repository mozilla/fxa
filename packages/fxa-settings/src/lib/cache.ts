/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Storage from './storage';
import { searchParam } from '../lib/utilities';
import { StoredAccountData } from './storage-utils';
import { MfaScope } from './types';
import { AuthUiErrors } from './auth-errors/auth-errors';
import { dispatchStorageEvent } from './account-storage';

const storage = Storage.factory('localStorage');

let _isSigningOut = false;

export function setSigningOut(value: boolean): void {
  _isSigningOut = value;
}

export function isSigningOut(): boolean {
  return _isSigningOut;
}

type LocalAccounts = Record<hexstring, StoredAccountData>;

const UID_REGEX = /^[0-9a-f]{32}$/;

/**
 * `hexstring` is a type assertion, not a runtime check. Only a validated uid
 * may key the accounts map, or `__proto__` reaches `Object.prototype`.
 */
function isValidUid(uid: unknown): uid is hexstring {
  return typeof uid === 'string' && UID_REGEX.test(uid);
}

export function accounts(accounts?: LocalAccounts) {
  if (accounts) {
    storage.set('accounts', accounts);
    return accounts;
  }
  return storage.get('accounts') as LocalAccounts;
}

export function findAccountByEmail(
  email: string
): StoredAccountData | undefined {
  const all = accounts() || {};
  return Object.values(all).find((x) => x.email && x.email === email);
}

export function currentAccount(
  account?: StoredAccountData
): StoredAccountData | undefined {
  const all = accounts() || {};

  // Current user can be specified in url params (ex. when clicking
  // `Manage account` from sync prefs.
  const forceUid = searchParam('uid', window.location.search);
  if (isValidUid(forceUid) && all[forceUid]) {
    storage.set('currentAccountUid', forceUid);
  }

  if (account) {
    if (!isValidUid(account.uid)) {
      return undefined;
    }
    all[account.uid] = account;
    accounts(all);
    return account;
  }

  // Guarded rather than cleared: this runs during render, so it must not write.
  const uid = storage.get('currentAccountUid');
  return isValidUid(uid) ? all[uid] : undefined;
}

export function getAccountByUid(uid: string) {
  if (!isValidUid(uid)) {
    return undefined;
  }
  const all = accounts() || {};
  return all[uid];
}

export function lastStoredAccount() {
  const all = accounts() || {};

  let latestAccount: StoredAccountData | undefined = undefined;
  for (const key in all) {
    const account = all[key];
    if (
      account?.lastLogin != null &&
      (latestAccount?.lastLogin == null ||
        latestAccount.lastLogin < account.lastLogin)
    ) {
      latestAccount = account;
    }
  }
  return latestAccount;
}

export function sessionToken(newToken?: hexstring) {
  try {
    const account = currentAccount();
    if (newToken) {
      account!.sessionToken = newToken;
      currentAccount(account);
    }
    return account!.sessionToken;
  } catch (e) {
    return null;
  }
}

/**
 * Discard a session token deemed to be invalid.
 */
export function discardSessionToken() {
  try {
    // TODO: do we need to discard other values? See
    // content-server's discardSessionToken
    const account = currentAccount();
    if (account) {
      account.sessionToken = undefined;
      account.verified = undefined;
      account.sessionVerified = undefined;
      account.hasPassword = undefined;

      currentAccount(account);

      // If there was a state change, dispatch an event
      dispatchStorageEvent('accounts');
      dispatchStorageEvent('currentAccountUid');
    }
  } catch (e) {
    // noop
  }
}

export function clearSignedInAccountUid() {
  const all = accounts() || {};
  const uid = storage.get('currentAccountUid');
  if (isValidUid(uid)) {
    delete all[uid];
  }
  accounts(all);
  storage.remove('currentAccountUid');
  dispatchStorageEvent('accounts');
  dispatchStorageEvent('currentAccountUid');
}

/**
 * Fetches or generates a new client ID that is stable for that browser client/cookie jar.
 * @returns a new or existing UUIDv4 for this user.
 */
export function getUniqueUserId(): string {
  // Check local storage for an existing unique user id
  let uniqueUserId = storage.get('uniqueUserId');
  // Generate a new id if one is not found
  if (!uniqueUserId) {
    uniqueUserId = crypto.randomUUID();
    storage.set('uniqueUserId', uniqueUserId);
  }

  return uniqueUserId;
}

export function consumeAlertTextExternal() {
  const account = currentAccount();
  const text = account?.alertText || null;
  if (text) {
    account!.alertText = undefined;
    currentAccount(account);
  }
  return text;
}

/** Decoded JWT payload state */
export type JwtPayload = {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  stid: string;
  sub: string;
  scope: Array<string>;
};

/**
 * External Container for holding JWTs.
 *
 * Tokens are backed by local storage so they survive hard navigates and page
 * refreshes. `static state` is an in-memory cache of that stored value; it is
 * lazily hydrated on first read and written through on every mutation.
 */
export class JwtTokenCache {
  /** The following works with React.useSyncExternalStore. */

  /** Key where data is held in persistent storage */
  private static readonly storageKey = 'mfa_token_cache';

  /** Internal state, access is protected by getters / setters below. */
  private static _state?: Record<string, string>;

  /** Gets the current state with backing in persistent storage */
  private static get state(): Record<string, string> {
    if (this._state != null) {
      return this._state;
    }

    // Fallback to stored state, if stored state is invalid, then
    // assume fresh slate, and create new state object
    this._state = storage.get(this.storageKey);
    if (this._state == null) {
      this._state = {};
    }

    return this._state;
  }

  /** Writes the current state to persistent storage */
  private static set state(val: Record<string, string>) {
    storage.set(this.storageKey, val);
    this._state = val;
  }

  private static listeners = new Set<() => void>();
  static subscribe(listener: () => void) {
    JwtTokenCache.listeners.add(listener);
    return () => {
      JwtTokenCache.listeners.delete(listener);
    };
  }
  static getSnapshot() {
    return JwtTokenCache.state;
  }

  /**
   * Get's the key for the JWT in the store
   * @param sessionToken
   * @param scope
   * @returns
   */
  static getKey(sessionToken: string, scope: MfaScope) {
    return `${sessionToken}-${scope}`;
  }

  /**
   * Looks up if the token exists.
   * @param sessionToken SessionToken that jwt was derived from.
   * @param scope Scope that jwt applies to.
   * @returns
   */
  static hasToken(sessionToken: string, scope: MfaScope) {
    const key = JwtTokenCache.getKey(sessionToken, scope);
    const jwt = this.state[key];
    return jwt != null && !this.isExpired(jwt);
  }

  /**
   * Checks if a token is expired. If the token cannot be decoded or the exp
   * claim cannot be found in the payload, then we will also return false.
   * @param token A valid JWT
   * @returns True if the token's exp claim is greater than now.
   */
  static isExpired(token: string) {
    const decodedJwt = this.decodeTokenPayload(token);

    // Under real use this shouldn't happen. If a token could be decode
    // we can't tell if it expired so return false. We get a little fast
    // and loose with some our mocks, and this helps keep them simple...
    if (!decodedJwt) {
      return false;
    }

    return decodedJwt.exp * 1000 < Date.now();
  }

  /**
   * Decodes a jwt's payload
   * @param token
   * @returns
   */
  static decodeTokenPayload(token: string) {
    try {
      const [, payload] = token.split('.');
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);

      // Type guard for JwtPayload
      if (
        decoded &&
        typeof decoded.aud === 'string' &&
        typeof decoded.exp === 'number' &&
        typeof decoded.iat === 'number' &&
        typeof decoded.iss === 'string' &&
        typeof decoded.jti === 'string' &&
        typeof decoded.stid === 'string' &&
        typeof decoded.sub === 'string' &&
        decoded.scope instanceof Array
      ) {
        return decoded as JwtPayload;
      }
    } catch {}

    return null;
  }

  /**
   * Retrieves a token from the cache. If the token is missing, throws an error.
   * @param sessionToken SessionToken that jwt was derived from.
   * @param scope Scope that jwt applies to.
   * @returns jwt token
   * @throws JwtNotFoundError
   */
  static getToken(sessionToken: string, scope: MfaScope) {
    const key = JwtTokenCache.getKey(sessionToken, scope);
    const jwt = JwtTokenCache.state[key];
    if (jwt == null) {
      throw new JwtNotFoundError();
    }
    return jwt;
  }

  /**
   * Sets the state of a token in the cache.
   * @param sessionToken SessionToken that jwt was derived from.
   * @param scope Scope that jwt applies to.
   * @param jwt The token
   */
  static setToken(sessionToken: string, scope: MfaScope, jwt: string) {
    if (!sessionToken) {
      throw new Error('Invalid sessionToken');
    }
    if (!scope) {
      throw new Error('Invalid scope');
    }
    if (!jwt) {
      throw new Error('Invalid jwt');
    }

    const key = JwtTokenCache.getKey(sessionToken, scope);
    this.state[key] = jwt;
    this.state = {
      ...this.state,
      [key]: jwt,
    };
    JwtTokenCache.listeners.forEach((l) => l());
  }

  /**
   * Removes a token from the cache.
   * @param sessionToken SessionToken that jwt was derived from.
   * @param scope Scope that jwt applies to.
   */
  static removeToken(sessionToken: string, scope: MfaScope) {
    const key = JwtTokenCache.getKey(sessionToken, scope);
    delete this.state[key];
    this.state = { ...this.state };
    JwtTokenCache.listeners.forEach((l) => l());
  }

  /**
   * Remove all cached tokens associated with the provided session.
   * @param sessionToken
   */
  static clearTokens(sessionToken: string) {
    for (const key of Object.keys(this.state)) {
      if (key.startsWith(sessionToken)) {
        delete this.state[key];
      }
    }
    this.state = { ...this.state };
    JwtTokenCache.listeners.forEach((l) => l());
  }
}

/**
 * Special error state that arises if jwt is not found in cache.
 */
export class JwtNotFoundError extends Error {
  // Mimic auth error status
  errno = AuthUiErrors.INVALID_MFA_TOKEN.errno;
  code = 401;
  constructor(message = 'Could not locate jwt in cache.') {
    super(message);
  }
}

/**
 * Manages OTP request cache
 *
 * The main purpose of this cache is to track when we email users
 * MFA OTP codes. This info can then be used to debounce sends.
 */
export class MfaOtpRequestCache {
  /** Key where data is held in persistent storage */
  private static readonly storageKey = 'mfa_otp_requests';

  /** Internal state, access is protected by getters / setters below. */
  private static _state?: Record<string, number>;

  /** Gets the current state with backing in persistent storage */
  private static get state(): Record<string, number> {
    if (this._state != null) {
      return this._state;
    }

    // Fallback to stored state, if stored state is invalid, then
    // assume fresh slate, and create new state object
    this._state = storage.get(this.storageKey);
    if (this._state == null) {
      this._state = {};
    }

    return this._state;
  }

  private static set state(val: Record<string, number>) {
    this._state = val;
    this.store();
  }

  static getKey(sessionToken: string, scope: MfaScope) {
    return `${sessionToken}-${scope}`;
  }

  private static store() {
    storage.set(this.storageKey, this._state);
  }

  static set(sessionToken: string, requiredScope: MfaScope) {
    this.state[this.getKey(sessionToken, requiredScope)] = Date.now();
    this.store();
  }

  static remove(sessionToken: string, requiredScope: MfaScope) {
    delete this.state[this.getKey(sessionToken, requiredScope)];
    this.store();
  }

  static get(sessionToken: string, requiredScope: MfaScope) {
    return this.state[this.getKey(sessionToken, requiredScope)];
  }

  static clear(sessionToken: string) {
    for (const key of Object.keys(this.state)) {
      if (key.startsWith(sessionToken)) {
        delete this.state[key];
      }
    }
  }
}
