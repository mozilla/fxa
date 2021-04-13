import { useContext } from 'react';
import { AppContext, GET_INITIAL_STATE } from './AppContext';
import { GET_SESSION_VERIFIED, Session } from './Session';
import { clearSignedInAccountUid } from '../lib/cache';
import { gql, useQuery } from '@apollo/client';
import { getDefault } from '../lib/config';

export function useAccount() {
  const { account } = useContext(AppContext);
  if (!account) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return account;
}

export function useSession() {
  const { apolloClient, session } = useContext(AppContext);
  if (session) {
    return session;
  }
  if (!apolloClient) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  const data = apolloClient.cache.readQuery<{ session: Session }>({
    query: GET_SESSION_VERIFIED,
  });
  const s = Object.assign({}, data!.session);
  // TODO: this feels like a temporary solution
  s.destroy = () =>
    apolloClient
      .mutate({
        mutation: gql`
          mutation destroySession($input: DestroySessionInput!) {
            destroySession(input: $input) {
              clientMutationId
            }
          }
        `,
        variables: { input: {} },
      })
      .then((result) => {
        clearSignedInAccountUid();
      });
  return s as Session;
}

export function useConfig() {
  const { config } = useContext(AppContext);
  if (!config) {
    return getDefault();
  }
  return config;
}

export function useInitialState() {
  const { apolloClient } = useContext(AppContext);
  if (!apolloClient) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return useQuery(GET_INITIAL_STATE, { client: apolloClient });
}
