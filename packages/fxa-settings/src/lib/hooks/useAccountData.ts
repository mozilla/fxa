/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useEffect } from 'react';
import AuthClient from 'fxa-auth-client/browser';
import { sessionToken as getSessionToken } from '../cache';
import {
  AccountState,
  RecoveryKeyStatus,
  RecoveryPhoneStatus,
  useAccountState,
} from '../../models/contexts/AccountStateContext';
import { Email, AttachedClient, LinkedAccount, SecurityEvent } from '../../models/Account';
import { AccountTotp, AccountBackupCodes, AccountAvatar } from '../interfaces';
import config from '../config';
import { ERRNO } from '@fxa/accounts/errors';

/** OAuth token TTL in seconds for profile server requests */
const PROFILE_OAUTH_TOKEN_TTL_SECONDS = 300;

/**
 * Error thrown when the session token is invalid (errno 110).
 * Indicates the user needs to sign in again.
 */
export class InvalidTokenError extends Error {
  constructor() {
    super('Invalid session token');
    this.name = 'InvalidTokenError';
  }
}

/**
 * Check if an error has INVALID_TOKEN errno (110).
 * These errors indicate the session token is no longer valid.
 */
function isInvalidTokenError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errno' in error &&
    error.errno === ERRNO.INVALID_TOKEN
  );
}

interface UseAccountDataOptions {
  authClient: AuthClient;
  onError?: (error: Error) => void;
}

interface AccountDataResult {
  data: AccountState;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  refetchField: (field: keyof AccountState) => Promise<void>;
}

/**
 * Transform the consolidated /account endpoint response to AccountState format.
 * The auth-server's /account endpoint now returns all account data in a single call,
 * including emails, linked accounts, subscriptions, 2FA status, and security events.
 */
function transformAccountResponse(response: any): Partial<AccountState> {
  const emails: Email[] = (response.emails || []).map((e: any) => ({
    email: e.email,
    isPrimary: e.isPrimary,
    verified: e.verified,
  }));

  const linkedAccounts: LinkedAccount[] = (response.linkedAccounts || []).map(
    (la: any) => ({
      providerId: la.providerId,
      authAt: la.authAt,
      enabled: la.enabled,
    })
  );

  const subscriptions = (response.subscriptions || []).map((s: any) => ({
    created: s.created || s.createdAt,
    productName: s.productName || s.product_name,
  }));

  // Transform 2FA status from consolidated response
  const totp: AccountTotp = {
    exists: response.totp?.exists ?? false,
    verified: response.totp?.verified ?? false,
  };

  const backupCodes: AccountBackupCodes = {
    hasBackupCodes: response.backupCodes?.hasBackupCodes ?? false,
    count: response.backupCodes?.count ?? 0,
  };

  const recoveryKey: RecoveryKeyStatus = {
    exists: response.recoveryKey?.exists ?? false,
    estimatedSyncDeviceCount: response.recoveryKey?.estimatedSyncDeviceCount,
  };

  const recoveryPhone: RecoveryPhoneStatus = {
    exists: response.recoveryPhone?.exists ?? false,
    phoneNumber: response.recoveryPhone?.phoneNumber ?? null,
    nationalFormat: null, // Not returned by consolidated endpoint
    available: response.recoveryPhone?.available ?? false,
  };

  const securityEvents: SecurityEvent[] = (response.securityEvents || []).map(
    (e: any) => ({
      name: e.name,
      createdAt: e.createdAt,
      verified: e.verified,
    })
  );

  return {
    emails,
    linkedAccounts,
    subscriptions,
    metricsEnabled: !response.metricsOptOutAt,
    accountCreated: response.createdAt ?? null,
    passwordCreated: response.passwordCreatedAt ?? null,
    hasPassword: response.hasPassword ?? true,
    totp,
    backupCodes,
    recoveryKey,
    recoveryPhone,
    securityEvents,
  };
}

/**
 * Fetch profile data (displayName, avatar) from the profile server.
 * The profile server requires an OAuth token with 'profile' scope,
 * so we first obtain one using the session token.
 */
async function fetchProfileData(
  authClient: AuthClient,
  sessionToken: string
): Promise<{ displayName: string | null; avatar: AccountAvatar | null }> {
  try {
    // Profile server requires OAuth token, not session token
    const { access_token } = await authClient.createOAuthToken(
      sessionToken,
      config.oauth.clientId,
      {
        scope: 'profile',
        ttl: PROFILE_OAUTH_TOKEN_TTL_SECONDS,
      }
    );

    const response = await fetch(`${config.servers.profile.url}/v1/profile`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      return { displayName: null, avatar: null };
    }

    const profile = await response.json();
    return {
      displayName: profile.displayName || null,
      avatar: profile.avatar
        ? {
            id: profile.avatarId || `default-${profile.avatar[profile.avatar.length - 1]}`,
            url: profile.avatar,
          }
        : null,
    };
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return { displayName: null, avatar: null };
  }
}

/**
 * Transform the attachedClients endpoint response to the AttachedClient[] format.
 */
function transformAttachedClientsResponse(response: any[]): AttachedClient[] {
  return response.map((client) => ({
    clientId: client.clientId,
    isCurrentSession: client.isCurrentSession,
    userAgent: client.userAgent,
    deviceType: client.deviceType,
    deviceId: client.deviceId,
    name: client.name,
    lastAccessTime: client.lastAccessTime,
    lastAccessTimeFormatted: client.lastAccessTimeFormatted,
    approximateLastAccessTime: client.approximateLastAccessTime,
    approximateLastAccessTimeFormatted: client.approximateLastAccessTimeFormatted,
    location: {
      city: client.location?.city || null,
      country: client.location?.country || null,
      state: client.location?.state || null,
      stateCode: client.location?.stateCode || null,
    },
    os: client.os,
    sessionTokenId: client.sessionTokenId,
    refreshTokenId: client.refreshTokenId,
  }));
}


/**
 * Hook for fetching and managing account data.
 *
 * Fetches data from 3 sources in parallel:
 * 1. authClient.account() - consolidated endpoint for account data, 2FA status, etc.
 * 2. fetchProfileData() - profile server for displayName and avatar (requires OAuth)
 * 3. authClient.attachedClients() - connected devices and sessions
 *
 * State is persisted to localStorage via AccountStateContext for cross-tab sync.
 *
 * @throws {InvalidTokenError} When the session token is invalid (triggers sign-in redirect)
 */
export function useAccountData({
  authClient,
  onError,
}: UseAccountDataOptions): AccountDataResult {
  // State is backed by localStorage via AccountStateContext
  const accountState = useAccountState();
  const {
    setAccountData,
    setLoading,
    setError,
    isLoading,
    error,
    ...stateData
  } = accountState;

  const fetchAccountData = useCallback(async () => {
    const token = getSessionToken();
    if (!token) {
      setError(new Error('No session token available'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simplified fetch: only 3 parallel calls instead of 9
      // 1. authClient.account - consolidated endpoint returns all account data including 2FA status
      // 2. fetchProfileData - profile server requires OAuth token (separate from auth-server)
      // 3. authClient.attachedClients - devices/sessions have complex logic, kept separate
      const [accountResult, profileResult, attachedClientsResult] =
        await Promise.allSettled([
          authClient.account(token),
          fetchProfileData(authClient, token),
          authClient.attachedClients(token),
        ]);

      // Check if any result has an INVALID_TOKEN error - this means the session is dead
      // and the user needs to sign in again
      const results = [accountResult, profileResult, attachedClientsResult];
      for (const result of results) {
        if (result.status === 'rejected' && isInvalidTokenError(result.reason)) {
          throw new InvalidTokenError();
        }
      }

      const accountData: Partial<AccountState> = {};

      // Process consolidated account data (emails, linkedAccounts, subscriptions, timestamps, 2FA status)
      if (accountResult.status === 'fulfilled') {
        Object.assign(accountData, transformAccountResponse(accountResult.value));
      } else {
        console.error('Failed to fetch account:', accountResult.reason);
      }

      // Process profile data (displayName, avatar)
      if (profileResult.status === 'fulfilled') {
        const { displayName, avatar } = profileResult.value;
        if (displayName !== null) accountData.displayName = displayName;
        if (avatar !== null) accountData.avatar = avatar;
      } else {
        console.error('Failed to fetch profile:', profileResult.reason);
      }

      // Process attached clients
      if (attachedClientsResult.status === 'fulfilled') {
        accountData.attachedClients = transformAttachedClientsResponse(
          attachedClientsResult.value
        );
      } else {
        console.error(
          'Failed to fetch attached clients:',
          attachedClientsResult.reason
        );
        accountData.attachedClients = [];
      }

      // Write to localStorage via context (triggers reactive update)
      setAccountData(accountData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [authClient, onError, setAccountData, setLoading, setError]);

  const refetchField = useCallback(
    async (field: keyof AccountState) => {
      const token = getSessionToken();
      if (!token) return;

      try {
        let fieldData: Partial<AccountState> = {};

        switch (field) {
          case 'attachedClients': {
            // Attached clients has its own endpoint with complex logic
            const clients = await authClient.attachedClients(token);
            fieldData.attachedClients = transformAttachedClientsResponse(clients);
            break;
          }
          case 'displayName':
          case 'avatar': {
            // Profile data requires OAuth token and profile server
            const { displayName, avatar } = await fetchProfileData(authClient, token);
            if (displayName !== null) fieldData.displayName = displayName;
            if (avatar !== null) fieldData.avatar = avatar;
            break;
          }
          default:
            // All other fields are returned by the consolidated /account endpoint:
            // totp, backupCodes, recoveryKey, recoveryPhone, emails,
            // linkedAccounts, subscriptions, securityEvents, metricsEnabled, etc.
            const account = await authClient.account(token);
            Object.assign(fieldData, transformAccountResponse(account));
        }

        // Write to localStorage via context (triggers reactive update)
        setAccountData(fieldData);
      } catch (err) {
        console.error(`Failed to refetch ${field}:`, err);
      }
    },
    [authClient, setAccountData]
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  // Return full state from context (which reads from localStorage)
  return {
    data: { ...stateData, isLoading, error } as AccountState,
    isLoading,
    error,
    refetch: fetchAccountData,
    refetchField,
  };
}
