/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useEffect, useRef, useState } from 'react';
import AuthClient from 'fxa-auth-client/browser';
import { sessionToken as getSessionToken } from '../cache';
import {
  AccountState,
  RecoveryKeyStatus,
  RecoveryPhoneStatus,
  useAccountState,
} from '../../models/contexts/AccountStateContext';
import { Email, LinkedAccount, SecurityEvent, mapAttachedClient } from '../../models/Account';
import { AccountTotp, AccountBackupCodes, AccountAvatar } from '../interfaces';
import config from '../config';
import { ERRNO } from '@fxa/accounts/errors';
import * as Sentry from '@sentry/browser';

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

/** Shape returned by the consolidated /account auth-server endpoint. */
interface AccountResponse {
  emails?: Array<{ email: string; isPrimary: boolean; verified: boolean }>;
  linkedAccounts?: Array<{ providerId: number; authAt: number; enabled: boolean }>;
  subscriptions?: Array<{ created?: number; createdAt?: number; productName?: string; product_name?: string }>;
  totp?: { exists?: boolean; verified?: boolean };
  backupCodes?: { hasBackupCodes?: boolean; count?: number };
  recoveryKey?: { exists?: boolean; estimatedSyncDeviceCount?: number };
  recoveryPhone?: { exists?: boolean; phoneNumber?: string; available?: boolean };
  securityEvents?: Array<{ name: string; createdAt: number; verified?: boolean }>;
  metricsOptOutAt?: number | null;
  createdAt?: number;
  passwordCreatedAt?: number;
  hasPassword?: boolean;
}

/** Transform the consolidated /account endpoint response to AccountState format. */
function transformAccountResponse(response: AccountResponse): Partial<AccountState> {
  const emails: Email[] = (response.emails || []).map((e) => ({
    email: e.email,
    isPrimary: e.isPrimary,
    verified: e.verified,
  }));

  const linkedAccounts: LinkedAccount[] = (response.linkedAccounts || []).map(
    (la) => ({
      providerId: la.providerId,
      authAt: la.authAt,
      enabled: la.enabled,
    })
  );

  const subscriptions = (response.subscriptions || []).map((s) => ({
    created: s.created ?? s.createdAt ?? 0,
    productName: s.productName || s.product_name || '',
  }));

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
    (e) => ({
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

/** Fetch profile data from the profile server (requires OAuth token). */
async function fetchProfileData(
  authClient: AuthClient,
  sessionToken: string
): Promise<{ displayName: string | null; avatar: AccountAvatar | null }> {
  try {
    const { access_token } = await authClient.createOAuthToken(
      sessionToken,
      config.oauth.clientId,
      { scope: 'profile', ttl: PROFILE_OAUTH_TOKEN_TTL_SECONDS }
    );

    const response = await fetch(`${config.servers.profile.url}/v1/profile`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!response.ok) {
      return { displayName: null, avatar: null };
    }

    const profile = await response.json();
    return {
      displayName: profile.displayName || null,
      avatar: profile.avatar
        ? { id: profile.avatarId || 'default', url: profile.avatar }
        : null,
    };
  } catch (error) {
    // Re-throw invalid token errors to trigger sign-in redirect
    if (isInvalidTokenError(error)) {
      throw error;
    }
    console.error('Failed to fetch profile:', error);
    return { displayName: null, avatar: null };
  }
}

/**
 * Hook for fetching account data from auth-server, profile server, and attached clients.
 * @throws {InvalidTokenError} When the session token is invalid
 */
export function useAccountData({
  authClient,
  onError,
}: UseAccountDataOptions): AccountDataResult {
  // Refs prevent infinite re-renders from unstable callback/object references
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const authClientRef = useRef(authClient);
  authClientRef.current = authClient;

  const accountState = useAccountState();
  const {
    setAccountData,
    ...stateData
  } = accountState;

  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<Error | null>(null);

  const fetchAccountData = useCallback(async () => {
    const client = authClientRef.current;
    const token = getSessionToken();
    if (!token) {
      setLocalError(new Error('No session token available'));
      setLocalLoading(false);
      return;
    }

    setLocalLoading(true);
    setLocalError(null);

    try {
      // allSettled (not .all) so a single failure doesn't discard other results
      const [accountResult, profileResult, attachedClientsResult] =
        await Promise.allSettled([
          client.account(token),
          fetchProfileData(client, token),
          client.attachedClients(token),
        ]);

      // Check for invalid token errors - user needs to sign in again
      const rejectedResults = [accountResult, profileResult, attachedClientsResult]
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected');
      if (rejectedResults.some((r) => isInvalidTokenError(r.reason))) {
        throw new InvalidTokenError();
      }

      let accountData: Partial<AccountState> = {};

      if (accountResult.status === 'fulfilled') {
        accountData = { ...accountData, ...transformAccountResponse(accountResult.value) };
      } else {
        Sentry.captureMessage(`Failed to fetch account: ${accountResult.reason}`);
      }

      if (profileResult.status === 'fulfilled') {
        const { displayName, avatar } = profileResult.value;
        if (displayName !== null) accountData.displayName = displayName;
        if (avatar !== null) accountData.avatar = avatar;
      } else {
        Sentry.captureMessage(`Failed to fetch profile: ${profileResult.reason}`);
      }

      if (attachedClientsResult.status === 'fulfilled') {
        accountData.attachedClients = attachedClientsResult.value.map(mapAttachedClient);
      } else {
        Sentry.captureMessage(`Failed to fetch attached clients: ${attachedClientsResult.reason}`);
        accountData.attachedClients = [];
      }

      setAccountData(accountData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setLocalError(error);
      onErrorRef.current?.(error);
    } finally {
      setLocalLoading(false);
    }
  }, [setAccountData]);

  const refetchField = useCallback(
    async (field: keyof AccountState) => {
      const client = authClientRef.current;
      const token = getSessionToken();
      if (!token) return;

      try {
        let fieldData: Partial<AccountState> = {};

        switch (field) {
          case 'attachedClients': {
            const clients = await client.attachedClients(token);
            fieldData.attachedClients = clients.map(mapAttachedClient);
            break;
          }
          case 'displayName':
          case 'avatar': {
            const { displayName, avatar } = await fetchProfileData(client, token);
            if (displayName !== null) fieldData.displayName = displayName;
            if (avatar !== null) fieldData.avatar = avatar;
            break;
          }
          default: {
            const account = await client.account(token);
            fieldData = { ...fieldData, ...transformAccountResponse(account) };
            break;
          }
        }

        setAccountData(fieldData);
      } catch (err) {
        console.error(`Failed to refetch ${field}:`, err);
      }
    },
    [setAccountData]
  );

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  return {
    data: { ...stateData, isLoading: localLoading, error: localError } as AccountState,
    isLoading: localLoading,
    error: localError,
    refetch: fetchAccountData,
    refetchField,
  };
}
