import {
  gql,
  useApolloClient,
  useLazyQuery,
  ApolloError,
  QueryLazyOptions,
} from '@apollo/client';

export interface Email {
  email: string;
  isPrimary: boolean;
  verified: boolean;
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
  attachedClients: {
    clientId: string;
    isCurrentSession: boolean;
    userAgent: string;
    deviceType: string;
    deviceId: string;
  }[];
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

export const GET_ACCOUNT = gql`
  query GetAccount {
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
