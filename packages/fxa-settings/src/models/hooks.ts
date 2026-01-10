/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useContext, useRef, useEffect, useMemo, useState } from 'react';
import { isHexadecimal, length } from 'class-validator';
import { AppContext } from './contexts/AppContext';
import { useNimbusContext } from './contexts/NimbusContext';
import { NimbusResult } from '../lib/nimbus';
import { SettingsContext } from './contexts/SettingsContext';
import { useLocalization } from '@fluent/react';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { getDefault } from '../lib/config';
import {
  DefaultIntegrationFlags,
  IntegrationFactory,
} from '../lib/integrations';
import { ReachRouterWindow } from '../lib/window';
import { StorageData, UrlHashData, UrlQueryData } from '../lib/model-data';
import { MetricsData, SignedInAccountStatus } from '../components/App/interfaces';
import {
  RelierClientInfo,
  RelierSubscriptionInfo,
  RelierCmsInfo,
  RelierLegalTerms,
} from './integrations';
import * as Sentry from '@sentry/browser';
import { useDynamicLocalization } from '../contexts/DynamicLocalizationContext';
import { sessionToken } from '../lib/cache';
import { useLocalStorageSync } from '../lib/hooks/useLocalStorageSync';
import { getFullAccountData, isSignedIn as checkIsSignedIn } from '../lib/account-storage';

const DEFAULT_CMS_ENTRYPOINT = 'default';

// Define the hook's return type, mimicking useQuery's structure
interface FetchState<T> {
  loading: boolean;
  error?: Error;
  data?: T;
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
  const legalTermsState = useLegalTermsState();

  return useMemo(() => {
    // If we are still loading data, just return an null integration
    if (
      clientInfoState.loading ||
      productInfoState.loading ||
      cmsInfoState.loading ||
      legalTermsState.loading
    ) {
      return null;
    }

    const windowWrapper = new ReachRouterWindow();
    const urlQueryData = new UrlQueryData(windowWrapper);
    const urlHashData = new UrlHashData(windowWrapper);
    const storageData = new StorageData(windowWrapper);

    const flags = new DefaultIntegrationFlags(urlQueryData, storageData);

    // Extract legal terms from REST API result
    const legalTerms = legalTermsState.data?.legalTerms;

    const integrationFactory = new IntegrationFactory({
      flags,
      window: windowWrapper,
      clientInfo: clientInfoState.data?.clientInfo,
      cmsInfo: cmsInfoState.data?.cmsInfo,
      legalTerms,
      productInfo: productInfoState.data?.productInfo,
      data: urlQueryData,
      channelData: urlHashData,
      storageData,
    });

    return integrationFactory.getIntegration();
  }, [clientInfoState, productInfoState, cmsInfoState, legalTermsState]);
}

/**
 * A hook to provide the Nimbus experiments within components.
 * This hook uses the NimbusContext to get experiment data.
 *
 * @returns the NimbusResult with experiment information, or null if not available.
 */
export function useExperiments(): NimbusResult | null {
  const { experiments } = useNimbusContext();
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

// useInitialSettingsState is no longer needed - account data is loaded via
// AccountStateContext and useAccountData hook. Components should use
// useAccountState() from AccountStateContext instead.

// Hook to get initial metrics data for Glean and amplitude initialization
// Uses localStorage for account data and auth-client for fetching if needed
export function useInitialMetricsQueryState() {
  const { authClient } = useContext(AppContext);
  const [state, setState] = useState<{
    loading: boolean;
    error?: Error;
    data?: { account: MetricsData };
  }>({ loading: true });

  useEffect(() => {
    let mounted = true;

    const fetchMetricsData = async () => {
      const token = sessionToken();
      if (!token) {
        if (mounted) {
          setState({ loading: false, data: undefined });
        }
        return;
      }

      try {
        // First check localStorage for cached data
        const cachedData = getFullAccountData();
        if (cachedData && cachedData.uid) {
          if (mounted) {
            setState({
              loading: false,
              data: {
                account: {
                  uid: cachedData.uid,
                  recoveryKey: cachedData.recoveryKey,
                  metricsEnabled: cachedData.metricsEnabled,
                  primaryEmail: cachedData.primaryEmail,
                  emails: cachedData.emails,
                  totp: cachedData.totp,
                },
              },
            });
          }
          return;
        }

        // If no cached data, fetch from auth-client
        if (!authClient) {
          throw new Error('AuthClient not available');
        }

        const [accountResult, totpResult, recoveryKeyResult] = await Promise.allSettled([
          authClient.account(token),
          authClient.checkTotpTokenExists(token),
          authClient.recoveryKeyExists(token, undefined),
        ]);

        const accountData = accountResult.status === 'fulfilled' ? accountResult.value : null;
        const totpData = totpResult.status === 'fulfilled' ? totpResult.value : null;
        const recoveryKeyData = recoveryKeyResult.status === 'fulfilled' ? recoveryKeyResult.value : null;

        if (mounted && accountData) {
          const emails = accountData.emails || [];
          setState({
            loading: false,
            data: {
              account: {
                uid: accountData.uid,
                recoveryKey: recoveryKeyData
                  ? { exists: recoveryKeyData.exists, estimatedSyncDeviceCount: recoveryKeyData.estimatedSyncDeviceCount }
                  : null,
                metricsEnabled: accountData.metricsEnabled ?? true,
                primaryEmail: emails.find((e: any) => e.isPrimary) || null,
                emails,
                totp: totpData || null,
              },
            },
          });
        } else if (mounted) {
          setState({ loading: false, data: undefined });
        }
      } catch (error) {
        if (mounted) {
          setState({
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchMetricsData();

    return () => {
      mounted = false;
    };
  }, [authClient]);

  return state;
}

// Hook to fetch OAuth client info directly from auth-server
export function useClientInfoState() {
  const { config } = useContext(AppContext);
  const [state, setState] = useState<{
    loading: boolean;
    error?: Error;
    data?: { clientInfo: RelierClientInfo };
  }>({ loading: false });

  const urlQueryData = new UrlQueryData(new ReachRouterWindow());
  const clientId =
    urlQueryData.get('client_id') || urlQueryData.get('service') || '';

  // Validate client ID - must be 16 digit hex
  const isValidClientId = isHexadecimal(clientId) && length(clientId, 16);

  useEffect(() => {
    if (!isValidClientId || !config) {
      setState({ loading: false });
      return;
    }

    let mounted = true;
    setState((prev) => ({ ...prev, loading: true }));

    const fetchClientInfo = async () => {
      try {
        const response = await fetch(
          `${config.servers.auth.url}/v1/oauth/client/${clientId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch client info: ${response.status}`);
        }

        const data = await response.json();

        if (mounted) {
          setState({
            loading: false,
            data: {
              clientInfo: {
                clientId: data.id || clientId,
                imageUri: data.image_uri || null,
                redirectUri: data.redirect_uri || null,
                serviceName: data.name || null,
                trusted: data.trusted || false,
              },
            },
          });
        }
      } catch (error) {
        if (mounted) {
          setState({
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchClientInfo();

    return () => {
      mounted = false;
    };
  }, [clientId, isValidClientId, config]);

  return state;
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

  const [state, setState] = useState<
    FetchState<{ cmsInfo: RelierCmsInfo | undefined }>
  >({
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

        if (!response.ok) {
          Sentry.captureMessage('Non-OK response from CMS fetchConfig.', {
            tags: { area: 'useCmsInfoState' },
            extra: { clientId, entrypoint, status: response.status },
          });
        }

        config = await response.json();

        if (mounted) {
          setState({
            loading: false,
            error: undefined,
            data: { cmsInfo: config },
          });
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { area: 'useCmsInfoState' },
          extra: { clientId, entrypoint },
        });

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

// Hook to fetch subscription product info directly from auth-server
export function useProductInfoState() {
  const { config } = useContext(AppContext);
  const [state, setState] = useState<{
    loading: boolean;
    error?: Error;
    data?: { productInfo: RelierSubscriptionInfo };
  }>({ loading: false });

  const productId =
    new RegExp('/subscriptions/products/(.*)').exec(
      window.location.pathname
    )?.[1] || '';

  useEffect(() => {
    if (!productId || !config) {
      setState({ loading: false });
      return;
    }

    let mounted = true;
    setState((prev) => ({ ...prev, loading: true }));

    const fetchProductInfo = async () => {
      try {
        const response = await fetch(
          `${config.servers.auth.url}/v1/oauth/subscriptions/productname?productId=${encodeURIComponent(productId)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch product info: ${response.status}`);
        }

        const data = await response.json();

        if (mounted) {
          setState({
            loading: false,
            data: {
              productInfo: {
                subscriptionProductId: data.productId || productId,
                subscriptionProductName: data.productName || null,
              },
            },
          });
        }
      } catch (error) {
        if (mounted) {
          setState({
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchProductInfo();

    return () => {
      mounted = false;
    };
  }, [productId, config]);

  return state;
}

export function useLegalTermsState() {
  const { config } = useContext(AppContext);
  if (!config) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }

  const authUrl = config?.servers.auth.url;
  const { currentLocale } = useDynamicLocalization();

  const urlQueryData = new UrlQueryData(new ReachRouterWindow());
  const clientId = urlQueryData.get('client_id');
  const service = urlQueryData.get('service');
  const context = urlQueryData.get('context');

  const [state, setState] = useState<
    FetchState<{ legalTerms: RelierLegalTerms | undefined }>
  >({
    loading: false,
    error: undefined,
    data: undefined,
  });

  useEffect(() => {
    // Determine if we should fetch by clientId or service
    const isOAuth = !!clientId;
    const isOAuthNative = context === 'oauth_webchannel_v1';

    let shouldFetch = false;
    let queryParam = '';
    let queryValue = '';

    if (
      isOAuth &&
      !isOAuthNative &&
      clientId &&
      isHexadecimal(clientId) &&
      length(clientId, 16)
    ) {
      // OAuth RP redirect flow - query by clientId
      shouldFetch = true;
      queryParam = 'clientId';
      queryValue = clientId;
    } else if (isOAuthNative && service) {
      // OAuth native flow - query by service
      shouldFetch = true;
      queryParam = 'service';
      queryValue = service;
    }

    if (!shouldFetch) {
      setState({ loading: false, error: undefined, data: undefined });
      return;
    }

    let mounted = true;
    setState((prev) => ({ ...prev, loading: true }));

    const fetchLegalTerms = async () => {
      try {
        const url = new URL(`${authUrl}/v1/cms/legal-terms`);
        url.searchParams.append(queryParam, queryValue);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': currentLocale,
          },
        });

        let legalTerms: RelierLegalTerms | null = null;

        if (!response.ok) {
          Sentry.captureMessage('Non-OK response from legal terms endpoint.', {
            tags: { area: 'useLegalTermsState' },
            extra: { queryParam, queryValue, status: response.status },
          });
        }

        // Check if response has content before parsing
        const responseText = await response.text();

        if (responseText) {
          try {
            legalTerms = JSON.parse(responseText);
          } catch (parseError) {
            Sentry.captureException(parseError, {
              tags: { area: 'useLegalTermsState' },
              extra: { responseText },
            });
          }
        }

        if (mounted) {
          setState({
            loading: false,
            error: undefined,
            data: legalTerms ? { legalTerms } : undefined,
          });
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { area: 'useLegalTermsState' },
          extra: { queryParam, queryValue },
        });

        if (mounted) {
          setState({
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
            data: undefined,
          });
        }
      }
    };

    fetchLegalTerms();

    return () => {
      mounted = false;
    };
  }, [authUrl, clientId, service, context, currentLocale]);

  return state;
}

// TODO: FXA-8286, test pattern for container components, which will determine
// how we want to handle `useQuery` (e.g., directly) and tests.

// Hook to check if user is signed in - uses unified account storage
export function useLocalSignedInQueryState() {
  // Listen for changes to both accounts and isSignedIn keys for reactivity
  // The accounts key contains sessionToken, and isSignedIn events are dispatched for compatibility
  const accountsData = useLocalStorageSync('accounts');
  const currentAccountUid = useLocalStorageSync('currentAccountUid');
  // Also listen for explicit isSignedIn events (dispatched for backwards compatibility)
  useLocalStorageSync('isSignedIn');

  // User is signed in if they have a current account uid with a sessionToken
  const isSignedIn = useMemo(() => {
    // These dependencies trigger re-computation when localStorage changes
    void accountsData;
    void currentAccountUid;
    // Use the unified check function which looks at currentAccountUid + sessionToken
    return checkIsSignedIn();
  }, [accountsData, currentAccountUid]);

  return {
    loading: false,
    data: { isSignedIn } as SignedInAccountStatus,
  };
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

/**
 * Hook to run a function on an interval.
 * @param callback - function to call
 * @param delay - interval in ms to run, null to stop poll
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
