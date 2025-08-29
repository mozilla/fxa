/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { InMemoryCache } from '@apollo/client';
import { AccountData, Email } from '../types';
import {
  GET_ACCOUNT,
  GET_ACCOUNT_UID,
  GET_LOCAL_SIGNED_IN_STATUS,
  GET_VERIFIED_SESSION,
  UPDATE_PASSWORD,
} from './apollo-cache.gql';
import { InvalidCachedAccountState, MissingCachedAccount } from './errors';
import { getCurrentAccount } from './account-cache';
import config from '../config';

/** In memory apollo cache. Held in page memory! Does not persist beyond page. */
const _apolloMemCache = new InMemoryCache({
  typePolicies: {
    Account: {
      fields: {
        primaryEmail: {
          read(_, o) {
            const emails = o.readField<Email[]>('emails');
            return emails?.find((email: Email) => email.isPrimary);
          },
        },
      },
      keyFields: [],
    },
    Avatar: {
      fields: {
        isDefault: {
          read(_, o) {
            const url = o.readField<string>('url');
            const id = o.readField<string>('id');
            return !!(
              url?.startsWith(config.servers.profile.url) ||
              id?.startsWith('default')
            );
          },
        },
      },
    },
    Session: {
      fields: {
        token: {
          read() {
            const account = getCurrentAccount();

            if (account == null) {
              // TBD - What do we do...
              throw new MissingCachedAccount();
            }

            if (account?.sessionToken == null) {
              // TBD - What do we do
              throw new InvalidCachedAccountState('Missing session token');
            }

            // This feels off to me. I think we should be doing a write and keeping
            // apollo's cache up to date when se set the current account instead of
            // hijacking it like this.
            return account.sessionToken;
          },
        },
      },
    },
  },
});

/**
 * Wrapper around apollo memory cache. Creates consistent access point.
 */
class ApolloCacheWrapper {
  /**
   * Do not use directly, expect for spying, mocking, or initial apollo client creation!
   */
  public get _cache() {
    return this.cache;
  }

  constructor(private readonly cache: InMemoryCache) {}

  getAccountData() {
    const result = this.cache.readQuery<{ account: AccountData }>({
      query: GET_ACCOUNT,
    });
    return result;
  }

  setAccountPasswordCreated(passwordCreated: number) {
    this.cache.modify({
      id: this.cache.identify({ __typename: 'Account' }),
      fields: {
        passwordCreated() {
          return passwordCreated;
        },
      },
    });
  }

  getAccountUid() {
    const result = this.cache.readQuery<{ account: { uid: string } }>({
      query: GET_ACCOUNT_UID,
    });

    return result;
  }

  setAccountRecoveryKeyExists(exists: boolean) {
    this.cache.modify({
      id: this.cache.identify({ __typename: 'Account' }),
      fields: {
        recoveryKey(existingData) {
          return {
            exists,
            estimatedSyncDeviceCount: existingData.estimatedSyncDeviceCount,
          };
        },
      },
    });
  }

  setAccountTotpStatus(exists: boolean, verified: boolean) {
    this.cache.modify({
      id: this.cache.identify({ __typename: 'Account' }),
      fields: {
        totp() {
          return { exists, verified };
        },
      },
    });
  }

  setUpdatedPassword(authAt: number, verified: boolean) {
    this.cache.writeQuery({
      query: UPDATE_PASSWORD,
      data: {
        account: {
          passwordCreated: authAt * 1000,
          __typename: 'Account',
        },
        session: { verified: verified, __typename: 'Session' },
      },
    });
  }

  getLocalSignedInStatus() {
    const data = this.cache.readQuery<{ isSignedIn: boolean }>({
      query: GET_LOCAL_SIGNED_IN_STATUS,
    });

    return data;
  }
  setLocalSignedInStatus(isSignedIn: boolean) {
    this.cache.writeQuery({
      query: GET_LOCAL_SIGNED_IN_STATUS,
      data: { isSignedIn },
    });
  }

  setSessionVerified(verified: boolean) {
    this.cache.modify({
      fields: {
        session: () => {
          return {
            verified,
          };
        },
      },
    });
  }

  /** Get's the local session state from the cache. */
  getSessionVerified() {
    const result = this.cache.readQuery<{
      session: {
        verified: boolean;
      };
    }>({
      query: GET_VERIFIED_SESSION,
    });

    return result?.session;
  }
}

/**
 * Singleton for cache access. All cache manipulations should use this.
 */
export const apolloCache = new ApolloCacheWrapper(_apolloMemCache);
