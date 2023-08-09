/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useContext, useRef, useEffect, useMemo } from 'react';
import { AppContext } from './contexts/AppContext';
import {
  INITIAL_SETTINGS_QUERY,
  SettingsContext,
} from './contexts/SettingsContext';
import { GET_SESSION_VERIFIED, Session } from './Session';
import { clearSignedInAccountUid } from '../lib/cache';
import { gql, useQuery } from '@apollo/client';
import { useLocalization } from '@fluent/react';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import config, { getDefault } from '../lib/config';
import {
  DefaultIntegrationFlags,
  IntegrationFactory,
} from '../lib/integrations';
import { ReachRouterWindow } from '../lib/window';
import { StorageData, UrlHashData, UrlQueryData } from '../lib/model-data';
import { OAuthClient } from '../lib/oauth';

export function useAccount() {
  const { account } = useContext(AppContext);
  if (!account) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return account;
}

function getMissing(obj: any) {
  const missingKeys: string[] = [];
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

export function useIntegration() {
  const authClient = useAuthClient();

  return useMemo(() => {
    const windowWrapper = new ReachRouterWindow();
    const urlQueryData = new UrlQueryData(windowWrapper);
    const urlHashData = new UrlHashData(windowWrapper);
    const storageData = new StorageData(windowWrapper);
    const oauthClient = new OAuthClient(config.servers.oauth.url);

    // TODO: we shouldn't do this here, move to shared hook or read from config. FXA-6836
    const delegates = {
      getClientInfo: (id: string) => oauthClient.getClientInfo(id),
      getProductInfo: (id: string) => authClient.getProductInfo(id),
      getProductIdFromRoute: () => {
        const re = new RegExp('/subscriptions/products/(.*)');
        return re.exec(window.location.pathname)?.[1] || '';
      },
    };
    const flags = new DefaultIntegrationFlags(urlQueryData, storageData);
    const integrationFactory = new IntegrationFactory({
      flags,
      window: windowWrapper,
      delegates,
      data: urlQueryData,
      channelData: urlHashData,
      storageData,
    });
    return integrationFactory.getIntegration();
  }, [authClient]);
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

export function useInitialSettingsState() {
  const { apolloClient } = useContext(AppContext);
  if (!apolloClient) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return useQuery(INITIAL_SETTINGS_QUERY, { client: apolloClient });
}

export function useAlertBar() {
  const { alertBarInfo } = useContext(SettingsContext);
  if (!alertBarInfo) {
    throw new Error('Are you forgetting a SettingsContext.Provider?');
  }
  return alertBarInfo;
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

// TODO: use apollo-client provided polling, FXA-6991
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
