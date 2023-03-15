/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useContext, useRef, useEffect } from 'react';
import { AppContext, GET_INITIAL_STATE } from './AppContext';
import { GET_SESSION_VERIFIED, Session } from './Session';
import { clearSignedInAccountUid } from '../lib/cache';
import { gql, useQuery } from '@apollo/client';
import { useLocalization } from '@fluent/react';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { getDefault } from '../lib/config';
import { GenericContext } from '../lib/context';
import { useLocation } from '@reach/router';

export function useAccount() {
  const { account } = useContext(AppContext);
  if (!account) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return account;
}

export function useSession() {
  const ref = useRef({} as unknown as Session);
  const { apolloClient, session } = useContext(AppContext);
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

export function useAlertBar() {
  const { alertBarInfo } = useContext(AppContext);
  if (!alertBarInfo) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return alertBarInfo;
}

export function useFtlMsgResolver() {
  const config = useConfig();
  const { l10n } = useLocalization();
  return new FtlMsgResolver(l10n, config.l10n.strict);
}

export function useRelier() {
  const { relierFactory } = useContext(AppContext);
  if (relierFactory == null) {
    throw new Error('Relier factory never initialized!');
  }
  return relierFactory.getRelier();
}

export function useUrlSearchContext() {
  let { urlSearchContext } = useContext(AppContext);
  if (urlSearchContext == null) {
    throw new Error('urlSearchContext never initialized!');
  }
  return urlSearchContext;
}

export function useLocationStateContext() {
  const location = useLocation();
  if (location == null) {
    throw new Error('Location missing!');
  }

  return new GenericContext((location.state || {}) as Record<string, unknown>);
}

export function useNotifier() {
  return {
    onAccountSignIn(_account: unknown) {
      // FOLLOW-UP: Not yet implemented.
    },
  };
}

export function useBroker() {
  return {
    async invokeBrokerMethod(_name: string, _account: unknown) {
      // FOLLOW-UP: Not yet implemented.
    },
  };
}

/**
 * Hook to run a function on an interval.
 * @param callback - function to call
 * @param delay - interval in Ms to run, null to stop poll
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!delay && delay !== 0) {
      return;
    }

    const id = window.setInterval(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, delay);

    return () => window.clearInterval(id);
  }, [delay]);
}
