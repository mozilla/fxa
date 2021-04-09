import { useRef } from 'react';
import {
  gql,
  useApolloClient,
  useLazyQuery,
  ApolloError,
  QueryLazyOptions,
} from '@apollo/client';
import config from '../lib/config';

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

export interface Account {
  uid: hexstring;
  displayName: string | null;
  avatar: {
    id: string | null;
    url: string | null;
    isDefault: boolean;
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
        isDefault @client
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

export function useAccount() {
  // work around for https://github.com/apollographql/apollo-client/issues/6209
  // see git history for previous version
  const client = useApolloClient();
  // without the ref direct cache updates sometimes don't trigger a render :/
  const accountRef = useRef<Account>();
  const { account } = client.cache.readQuery<{ account: Account }>({
    query: GET_ACCOUNT,
  })!;
  accountRef.current = account;
  return accountRef.current;
}

export function useLazyAccount(
  onError: (error: ApolloError) => void
): [
  (options?: QueryLazyOptions<Record<string, any>> | undefined) => void,
  { accountLoading: boolean }
] {
  const [getAccount, { loading: accountLoading }] = useLazyQuery<{
    account: Account;
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
    attachedClients: Pick<Account, 'attachedClients'>;
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
    recoveryKeyExists: Pick<Account, 'recoveryKey'>;
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
    totpStatus: Pick<Account, 'totp'>;
  }>(GET_TOTP_STATUS, {
    fetchPolicy: 'network-only',
    onError,
  });

  return [getTotpStatus, { totpStatusLoading }];
}

export function hasSecondaryEmail(account: Account) {
  return account.emails.length > 1;
}

export function hasSecondaryVerifiedEmail(account: Account) {
  return hasSecondaryEmail(account) ? account.emails[1].verified : false;
}

export function hasAccountRecovery(account: Account) {
  return account.recoveryKey;
}

export function hasTwoStepAuthentication(account: Account) {
  return account.totp.exists && account.totp.verified;
}

export function getNextAvatar(
  existingId?: string,
  existingUrl?: string,
  email?: string,
  displayName?: string | null
): { id?: string | null; url?: string | null; isDefault: boolean } {
  const char =
    displayName && /[a-zA-Z0-9]/.test(displayName)
      ? displayName[0]
      : email
      ? email[0]
      : '?';
  const url = `${config.servers.profile.url}/v1/avatar/${char}`;
  if (
    !existingUrl ||
    existingUrl.startsWith(config.servers.profile.url) ||
    existingId?.startsWith('default')
  ) {
    if (/[a-zA-Z0-9]/.test(char)) {
      return { id: `default-${char}`, url, isDefault: true };
    }
    return { id: null, url: null, isDefault: true };
  }

  return { id: existingId, url: existingUrl, isDefault: false };
}
