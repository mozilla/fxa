import { useContext, useRef } from 'react';
import { AppSettingsContext, GET_INITIAL_STATE } from './AppSettingsContext';
import { GET_SESSION_VERIFIED, Session } from './Session';
import { clearSignedInAccountUid } from '../lib/cache';
import { gql, useQuery } from '@apollo/client';
import { getDefault } from '../lib/config';

export function useAccount() {
  const { account } = useContext(AppSettingsContext);
  if (!account) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return account;
}

export function useSession() {
  const ref = useRef(({} as unknown) as Session);
  const { apolloClient, session } = useContext(AppSettingsContext);
  if (session) {
    return session;
  }
  if (!apolloClient) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  const data = apolloClient.cache.readQuery<{ session: Session }>({
    query: GET_SESSION_VERIFIED,
  })!;
  if (
    ref.current.token !== data.session.token ||
    ref.current.verified !== data.session.verified
  ) {
    ref.current = Object.assign({}, data.session);
  }
  if (!ref.current.destroy) {
    ref.current.destroy = () =>
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
  }
  return ref.current;
}

export function useConfig() {
  const { config } = useContext(AppSettingsContext);
  if (!config) {
    return getDefault();
  }
  return config;
}

export function useInitialState() {
  const { apolloClient } = useContext(AppSettingsContext);
  if (!apolloClient) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return useQuery(GET_INITIAL_STATE, { client: apolloClient });
}

export function useAlertBar() {
  const { alertBarInfo } = useContext(AppSettingsContext);
  if (!alertBarInfo) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return alertBarInfo;
}
