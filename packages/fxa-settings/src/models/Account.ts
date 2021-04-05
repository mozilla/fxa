import React, { useContext, useState } from 'react';
import {
  gql,
  useApolloClient,
  useLazyQuery,
  ApolloError,
  QueryLazyOptions,
  ApolloClient,
} from '@apollo/client';
import AuthClient from 'fxa-auth-client/browser';
import { useAuth } from '../lib/auth';
import { sessionToken } from '../lib/cache';
import firefox from '../lib/firefox';

export interface DeviceLocation {
  city: string | null;
  country: string | null;
  state: string | null;
  stateCode: string | null;
}

export interface Email {
  email: string;
  isPrimary: boolean;
  verified: boolean;
}

// TODO: why doesn't this match fxa-graphql-api/src/lib/resolvers/types/attachedClient.ts?
export interface AttachedClient {
  clientId: string;
  isCurrentSession: boolean;
  userAgent: string;
  deviceType: string | null;
  deviceId: string | null;
  name: string;
  lastAccessTime: number;
  lastAccessTimeFormatted: string;
  approximateLastAccessTime: number | null;
  approximateLastAccessTimeFormatted: string | null;
  location: DeviceLocation;
  os: string | null;
  sessionTokenId: string | null;
  refreshTokenId: string | null;
}

export interface AccountData {
  uid: hexstring;
  displayName: string | null;
  avatar: {
    id: string | null;
    url: string | null;
  };
  accountCreated: number;
  passwordCreated: number;
  recoveryKey: boolean;
  primaryEmail: Email;
  emails: Email[];
  attachedClients: AttachedClient[];
  totp: {
    exists: boolean;
    verified: boolean;
  };
  subscriptions: {
    created: number;
    productName: string;
  }[];
  alertTextExternal: string | null;
}

const ATTACHED_CLIENTS_FIELDS = `
      attachedClients {
        clientId
        isCurrentSession
        userAgent
        deviceType
        deviceId
        name
        lastAccessTime
        lastAccessTimeFormatted
        approximateLastAccessTime
        approximateLastAccessTimeFormatted
        location {
          city
          country
          state
          stateCode
        }
        os
        sessionTokenId
        refreshTokenId
      }
`;

export const ACCOUNT_FIELDS = `
    account {
      uid
      displayName
      avatar {
        id
        url
      }
      accountCreated
      passwordCreated
      recoveryKey
      primaryEmail @client
      emails {
        email
        isPrimary
        verified
      }
      ${ATTACHED_CLIENTS_FIELDS}
      totp {
        exists
        verified
      }
      subscriptions {
        created
        productName
      }
      alertTextExternal @client
    }
`;

export const GET_PROFILE_INFO = gql`
  query GetProfileInfo {
    account {
      uid
      displayName
      avatar {
        id
        url
      }
      primaryEmail @client
      emails {
        email
        isPrimary
        verified
      }
    }
  }
`;

export const GET_ACCOUNT = gql`
  query GetAccount {
    ${ACCOUNT_FIELDS}
  }
`;

export const GET_CONNECTED_CLIENTS = gql`
  query GetConnectedClients {
    account {
      ${ATTACHED_CLIENTS_FIELDS}
    }
  }
`;

export const GET_RECOVERY_KEY_EXISTS = gql`
  query GetRecoveryKeyExists {
    account {
      recoveryKey
    }
  }
`;

export const GET_TOTP_STATUS = gql`
  query GetRecoveryKeyExists {
    account {
      totp {
        exists
        verified
      }
    }
  }
`;

export interface AccountContextValue {
  account?: Account;
}

export const AccountContext = React.createContext<AccountContextValue>({});

export function useAccount() {
  const { account } = useContext(AccountContext);
  if (!account) {
    throw new Error('Are you forgetting an AccountContext.Provider?');
  }
  return account;
}

export function useLazyAccount(
  onError: (error: ApolloError) => void
): [
  (options?: QueryLazyOptions<Record<string, any>> | undefined) => void,
  { accountLoading: boolean }
] {
  const [getAccount, { loading: accountLoading }] = useLazyQuery<{
    account: AccountData;
  }>(GET_ACCOUNT, {
    fetchPolicy: 'network-only',
    onError,
  });

  return [getAccount, { accountLoading }];
}

export function useLazyConnectedClients(
  onError: (error: ApolloError) => void
): [
  (options?: QueryLazyOptions<Record<string, any>> | undefined) => void,
  { connectedClientsLoading: boolean }
] {
  const [
    getConnectedClients,
    { loading: connectedClientsLoading },
  ] = useLazyQuery<{
    attachedClients: Pick<AccountData, 'attachedClients'>;
  }>(GET_CONNECTED_CLIENTS, {
    fetchPolicy: 'network-only',
    onError,
  });

  return [getConnectedClients, { connectedClientsLoading }];
}

export function useLazyRecoveryKeyExists(
  onError: (error: ApolloError) => void
): [
  (options?: QueryLazyOptions<Record<string, any>> | undefined) => void,
  { recoveryKeyExistsLoading: boolean }
] {
  const [
    getRecoveryKeyExists,
    { loading: recoveryKeyExistsLoading },
  ] = useLazyQuery<{
    recoveryKeyExists: Pick<AccountData, 'recoveryKey'>;
  }>(GET_RECOVERY_KEY_EXISTS, {
    fetchPolicy: 'network-only',
    onError,
  });

  return [getRecoveryKeyExists, { recoveryKeyExistsLoading }];
}

export function useLazyTotpStatus(
  onError: (error: ApolloError) => void
): [
  (options?: QueryLazyOptions<Record<string, any>> | undefined) => void,
  { totpStatusLoading: boolean }
] {
  const [getTotpStatus, { loading: totpStatusLoading }] = useLazyQuery<{
    totpStatus: Pick<AccountData, 'totp'>;
  }>(GET_TOTP_STATUS, {
    fetchPolicy: 'network-only',
    onError,
  });

  return [getTotpStatus, { totpStatusLoading }];
}

export function hasSecondaryEmail(account: AccountData) {
  return account.emails.length > 1;
}

export function hasSecondaryVerifiedEmail(account: AccountData) {
  return hasSecondaryEmail(account) ? account.emails[1].verified : false;
}

export function hasAccountRecovery(account: AccountData) {
  return account.recoveryKey;
}

export function hasTwoStepAuthentication(account: AccountData) {
  return account.totp.exists && account.totp.verified;
}

export class Account implements AccountData {
  private readonly authClient: AuthClient;
  private readonly apolloClient: ApolloClient<object>;
  private _loading: boolean;

  constructor(client: AuthClient, apolloClient: ApolloClient<object>) {
    this.authClient = client;
    this.apolloClient = apolloClient;
    this._loading = false;
  }

  private async withLoading<T>(promise: Promise<T>) {
    this._loading = true;
    try {
      return await promise;
    } catch (e) {
      throw e;
    } finally {
      this._loading = false;
    }
  }

  private get data() {
    const { account } = this.apolloClient.cache.readQuery<{
      account: AccountData;
    }>({
      query: GET_ACCOUNT,
    })!;
    return account;
  }

  get loading() {
    return this._loading;
  }

  get uid() {
    return this.data.uid;
  }

  get displayName() {
    return this.data.displayName;
  }

  get avatar() {
    return this.data.avatar;
  }

  get accountCreated() {
    return this.data.accountCreated;
  }

  get passwordCreated() {
    return this.data.passwordCreated;
  }

  get recoveryKey() {
    return this.data.recoveryKey;
  }

  get emails() {
    return this.data.emails;
  }

  get primaryEmail() {
    return this.data.primaryEmail;
  }

  get subscriptions() {
    return this.data.subscriptions;
  }

  get totp() {
    return this.data.totp;
  }

  get attachedClients() {
    return this.data.attachedClients;
  }

  get alertTextExternal() {
    return this.data.alertTextExternal;
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await this.withLoading(
      this.authClient.passwordChange(
        this.primaryEmail.email,
        oldPassword,
        newPassword,
        {
          keys: true,
          sessionToken: sessionToken()!,
        }
      )
    );
    firefox.passwordChanged(
      this.primaryEmail.email,
      response.uid,
      response.sessionToken,
      response.verified,
      response.keyFetchToken,
      response.unwrapBKey
    );
    sessionToken(response.sessionToken);
    this.apolloClient.cache.writeQuery({
      query: gql`
        query UpdatePassword {
          account {
            passwordCreated
          }
          session {
            verified
          }
        }
      `,
      data: {
        account: {
          passwordCreated: response.authAt * 1000,
          __typename: 'Account',
        },
        session: { verified: response.verified, __typename: 'Session' },
      },
    });
  }
}
