import {
  gql,
  useApolloClient,
  useLazyQuery,
  ApolloError,
  QueryLazyOptions,
} from '@apollo/client';

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
  avatarUrl: string | null;
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

export const ACCOUNT_FIELDS = `
    account {
      uid
      displayName
      avatarUrl
      accountCreated
      passwordCreated
      recoveryKey
      primaryEmail @client
      emails {
        email
        isPrimary
        verified
      }
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

export const GET_ACCOUNT = gql`
  query GetAccount {
    ${ACCOUNT_FIELDS}
  }
`;

export function useAccount() {
  // work around for https://github.com/apollographql/apollo-client/issues/6209
  // see git history for previous version
  const client = useApolloClient();
  const { account } = client.cache.readQuery<{ account: Account }>({
    query: GET_ACCOUNT,
  })!;

  return account;
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
