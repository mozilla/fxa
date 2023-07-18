/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useContext, useRef, useEffect, useMemo } from 'react';
import { AppContext, GET_INITIAL_STATE } from './AppContext';
import { GET_SESSION_VERIFIED, Session } from './Session';
import { clearSignedInAccountUid } from '../lib/cache';
import { gql, useQuery } from '@apollo/client';
import { useLocalization } from '@fluent/react';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { getDefault } from '../lib/config';
import { IntegrationFactory } from '../lib/integrations/integration-factory';
import { DefaultIntegrationFlags } from '../lib/integrations/integration-factory-flags';
import { DefaultRelierFlags, RelierFactory } from '../lib/reliers';

export function useAccount() {
  const { account } = useContext(AppContext);
  if (!account) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return account;
}

function getMissing(obj: any) {
  const missingKeys = [];
  for (const x of Object.keys(obj)) {
    if (obj[x] == null) {
      missingKeys.push(x);
    }
  }

  return missingKeys.join(',');
}

export function useAuthClient() {
  const { authClient } = useContext(AppContext);
  if (!authClient) {
    throw new Error(
      `Are you forgetting an AppContext.Provider? State:${getMissing({
        authClient,
      })}`
    );
  }
  return authClient;
}

export function useRelier() {
  const {
    windowWrapper: window,
    urlQueryData,
    urlHashData,
    oauthClient,
    authClient,
    storageData,
  } = useContext(AppContext);

  if (
    !window ||
    !urlHashData ||
    !urlQueryData ||
    !oauthClient ||
    !authClient ||
    !storageData
  ) {
    throw new Error(
      `Are you forgetting an AppContext.Provider or to mock something in app context?\n Context: ${getMissing(
        {
          window,
          urlQueryData,
          urlHashData,
          oauthClient,
          authClient,
          storageData,
        }
      )}`
    );
  }

  return useMemo(() => {
    const delegates = {
      getClientInfo: (id: string) => oauthClient.getClientInfo(id),
      getProductInfo: (id: string) => authClient.getProductInfo(id),
      getProductIdFromRoute: () => {
        const re = new RegExp('/subscriptions/products/(.*)');
        return re.exec(window.location.pathname)?.[1] || '';
      },
    };
    const flags = new DefaultRelierFlags(urlQueryData, storageData);
    const factory = new RelierFactory({
      window,
      delegates,
      data: urlQueryData,
      channelData: urlHashData,
      storageData,
      flags,
    });

    return factory.getRelier();
  }, [urlQueryData, storageData, window, urlHashData, oauthClient, authClient]);
}

export function useIntegration() {
  const {
    windowWrapper: window,
    urlQueryData,
    storageData,
  } = useContext(AppContext);

  if (!window || !urlQueryData || !storageData) {
    throw new Error(
      `Are you forgetting an AppContext.Provider? Missing: ${getMissing({
        window,
        urlQueryData,
        storageData,
      })}`
    );
  }

  const relier = useRelier();
  const authClient = useAuthClient();

  return useMemo(() => {
    const flags = new DefaultIntegrationFlags(urlQueryData, storageData);

    const factory = new IntegrationFactory(
      flags,
      relier,
      authClient,
      window,
      urlQueryData
    );

    return factory.getIntegration();
  }, [authClient, relier, storageData, urlQueryData, window]);
}

export function useSession() {
  const ref = useRef({} as unknown as Session);
  const { apolloClient, session } = useContext(AppContext);
  if (session) {
    return session;
  }
  if (!apolloClient) {
    throw new Error(
      `Are you forgetting an AppContext.Provider? Missing ${getMissing({
        apolloClient,
        session,
      })}`
    );
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

export function useWindowWrapper() {
  const { windowWrapper } = useContext(AppContext);
  if (windowWrapper == null) {
    throw new Error('windowWrapper never initialized!');
  }
  return windowWrapper;
}

export function useFtlMsgResolver() {
  const config = useConfig();
  const { l10n } = useLocalization();
  return new FtlMsgResolver(l10n, config.l10n.strict);
}

export function useNotifier() {
  return {
    onAccountSignIn(_account: unknown) {
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
