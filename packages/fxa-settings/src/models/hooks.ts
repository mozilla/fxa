/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useContext, useRef, useEffect, useMemo, useState } from 'react';
import { isHexadecimal, length } from 'class-validator';
import { AppContext } from './contexts/AppContext';
import {
  INITIAL_SETTINGS_QUERY,
  SettingsContext,
} from './contexts/SettingsContext';
import { useQuery } from '@apollo/client';
import { useLocalization } from '@fluent/react';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { getDefault } from '../lib/config';
import { IntegrationFactory } from '../lib/integrations/integration-factory';
import { DefaultIntegrationFlags } from '../lib/integrations/integration-factory-flags';
import { ReachRouterWindow } from '../lib/window';
import { StorageData, UrlHashData, UrlQueryData } from '../lib/model-data';
import {
  GET_LOCAL_SIGNED_IN_STATUS,
  INITIAL_METRICS_QUERY,
  GET_PRODUCT_INFO,
  GET_CLIENT_INFO,
} from '../lib/app-gql';
import {
  MetricsDataResult,
  SignedInAccountStatus,
} from '../lib/app-interfaces';
import {
  RelierClientInfo,
  RelierSubscriptionInfo,
  RelierCmsInfo,
} from './integrations';
import { NimbusResult } from '../lib/nimbus';
import * as Sentry from '@sentry/browser';
import { useDynamicLocalization } from '../contexts/DynamicLocalizationContext';

const DEFAULT_CMS_ENTRYPOINT = 'default';

// Define the hook's return type, mimicking useQuery's structure
interface FetchState {
  loading: boolean;
  error?: Error;
  data?: { cmsInfo: RelierCmsInfo | undefined };
}

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

export function useSensitiveDataClient() {
  const { sensitiveDataClient } = useContext(AppContext);
  if (!sensitiveDataClient) {
    throw new Error(
      `Are you forgetting an AppContext.Provider? State:${getMissing({
        sensitiveDataClient,
      })}`
    );
  }
  return sensitiveDataClient;
}

export function useIntegration() {
  const clientInfoState = useClientInfoState();
  const productInfoState = useProductInfoState();
  const cmsInfoState = useCmsInfoState();

  return useMemo(() => {
    // If we are still loading data, just return an null integration
    if (
      clientInfoState.loading ||
      productInfoState.loading ||
      cmsInfoState.loading
    ) {
      return null;
    }

    const windowWrapper = new ReachRouterWindow();
    const urlQueryData = new UrlQueryData(windowWrapper);
    const urlHashData = new UrlHashData(windowWrapper);
    const storageData = new StorageData(windowWrapper);

    const flags = new DefaultIntegrationFlags(urlQueryData, storageData);
    const integrationFactory = new IntegrationFactory({
      flags,
      window: windowWrapper,
      clientInfo: clientInfoState.data?.clientInfo,
      cmsInfo: cmsInfoState.data?.cmsInfo,
      productInfo: productInfoState.data?.productInfo,
      data: urlQueryData,
      channelData: urlHashData,
      storageData,
    });

    return integrationFactory.getIntegration();
  }, [clientInfoState, productInfoState, cmsInfoState]);
}

/**
 * A hook to provide the Nimbus experiments within components.
 * This hook does not perform a network request.
 *
 * @returns the {@link NimbusResult} with experiment information.
 */
export function useExperiments(): NimbusResult | null {
  const { experiments: experimentInfo, uniqueUserId } = useContext(AppContext);
  const [experiments, setExperiments] = useState<null | NimbusResult>(null);
  useEffect(() => {
    async function fetchExperiments() {
      if (experimentInfo) {
        const exp = await experimentInfo;
        if (exp) {
          // Today, we don't need everything from the response so let's only add them as needed.
          // We map out the response from the doc examples here:
          // https://github.com/mozilla/experimenter/blob/main/cirrus/README.md
          setExperiments({
            features: exp.Features,
            // The ID we send and the one receive should be the same.
            // There has been a case were a bug in Nimbus sent us different IDs,
            // so for now, let us trust our own ID.
            // See: https://github.com/mozilla/blurts-server/pull/5509
            nimbusUserId: uniqueUserId,
          } as NimbusResult);
        }
      }
    }
    fetchExperiments();
  }, [experimentInfo, uniqueUserId]);
  return experiments;
}

export function useSession() {
  const { session } = useContext(AppContext);
  if (!session) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return session;
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

// TODO: FXA-8286, test pattern for container components, which will determine
// how we want to handle `useQuery` (e.g., directly) and tests.
export function useInitialMetricsQueryState() {
  const { apolloClient } = useContext(AppContext);
  if (!apolloClient) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return useQuery<MetricsDataResult>(INITIAL_METRICS_QUERY, {
    client: apolloClient,
  });
}

export function useClientInfoState() {
  const { apolloClient } = useContext(AppContext);
  if (!apolloClient) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  const urlQueryData = new UrlQueryData(new ReachRouterWindow());
  const clientId =
    urlQueryData.get('client_id') || urlQueryData.get('service') || '';

  return useQuery<{ clientInfo: RelierClientInfo }>(GET_CLIENT_INFO, {
    client: apolloClient,
    variables: { input: clientId },
    // an oauth client id is a 16 digit hex
    skip: !isHexadecimal(clientId) || !length(clientId, 16),
  });
}

export function useCmsInfoState() {
  const { config } = useContext(AppContext);
  if (!config) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }

  const authUrl = config?.servers.auth.url;
  const { currentLocale } = useDynamicLocalization();

  const urlQueryData = new UrlQueryData(new ReachRouterWindow());
  const clientId = urlQueryData.get('client_id');

  // If entrypoint is not provided in the URL, set a "default" value.
  // CMS customizations that have a default entrypoint created will get loaded, otw
  // the fallback experience will be loaded.
  const entrypoint = urlQueryData.get('entrypoint') || DEFAULT_CMS_ENTRYPOINT;

  const [state, setState] = useState<FetchState>({
    loading: false,
    error: undefined,
    data: undefined,
  });

  useEffect(() => {
    // We disable the CMS if:
    // 1. CMS is not enabled in the config
    // 2. l10nEnabled is false AND user's locale is not English
    // 3. User language toggle is not English
    // 4. The clientId is not provided or is not a valid 16 digit hex
    //
    // These steps are a best effort to prevent users from seeing a page with both English and non-English text.

    function shouldFetchCms() {
      // If l10nEnabled is true, fetch cms config for any locale
      if (config?.cms?.l10nEnabled === true) {
        return true;
      }

      // If l10nEnabled is false, only fetch for English locales
      // Check both browser language and user's selected locale
      let isEnglish = false;
      if (currentLocale) {
        isEnglish = currentLocale.startsWith('en');
      } else if (navigator.language) {
        isEnglish = navigator.language.startsWith('en');
      }

      return isEnglish;
    }

    if (
      !config.cms.enabled ||
      !shouldFetchCms() ||
      !clientId ||
      !isHexadecimal(clientId) ||
      !length(clientId, 16) ||
      !entrypoint
    ) {
      setState({ loading: false, error: undefined, data: undefined });
      return;
    }

    let mounted = true;
    setState((prev) => ({ ...prev, loading: true }));

    const fetchConfig = async () => {
      try {
        const url = new URL(`${authUrl}/v1/cms/config`);
        url.searchParams.append('clientId', clientId);
        url.searchParams.append('entrypoint', entrypoint);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': currentLocale,
          },
        });

        let config: RelierCmsInfo | undefined;

        if (response.ok) {
          config = await response.json();
        } else {
          Sentry.captureMessage(
            `Failure to parse CMS config for clientId ${clientId} and entrypoint ${entrypoint}`
          );
        }

        if (mounted) {
          setState({
            loading: false,
            error: undefined,
            data: { cmsInfo: config },
          });
        }
      } catch (error) {
        Sentry.captureMessage(
          `Failure to fetch CMS config for clientId ${clientId} and entrypoint ${entrypoint}`
        );

        if (mounted) {
          setState({
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
            data: undefined,
          });
        }
      }
    };

    fetchConfig();

    return () => {
      mounted = false;
    };
  }, [
    authUrl,
    clientId,
    entrypoint,
    config.cms.enabled,
    config.cms?.l10nEnabled,
    currentLocale,
  ]);

  return state;
}

export function useProductInfoState() {
  const { apolloClient } = useContext(AppContext);
  if (!apolloClient) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  const productId =
    new RegExp('/subscriptions/products/(.*)').exec(
      window.location.pathname
    )?.[1] || '';
  return useQuery<{ productInfo: RelierSubscriptionInfo }>(GET_PRODUCT_INFO, {
    client: apolloClient,
    variables: { input: productId },
    skip: !productId,
  });
}

// TODO: FXA-8286, test pattern for container components, which will determine
// how we want to handle `useQuery` (e.g., directly) and tests.
export function useLocalSignedInQueryState() {
  const { apolloClient } = useContext(AppContext);
  if (!apolloClient) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return useQuery<SignedInAccountStatus>(GET_LOCAL_SIGNED_IN_STATUS, {
    client: apolloClient,
  });
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
