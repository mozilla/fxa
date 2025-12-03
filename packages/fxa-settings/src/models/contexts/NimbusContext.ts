/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * NimbusContext - Provides Nimbus experiment data to the FxA Settings app
 *
 * Fetches and manages experiment data from the Nimbus API for A/B testing and feature flags.
 *
 * Usage:
 * ```typescript
 * const experiments = useExperiments();
 * const featureEnabled = experiments?.features?.['my-feature']?.enabled;
 * ```
 */

import React, { createContext, useContext, ReactNode, useEffect, useState, useMemo } from 'react';
import { NimbusResult, initializeNimbus, NimbusContextT } from '../../lib/nimbus';
import { AppContext } from './AppContext';
import { useDynamicLocalization } from '../../contexts/DynamicLocalizationContext';
import { parseAcceptLanguage } from '@fxa/shared/l10n';
import { searchParams } from '../../lib/utilities';
import * as Sentry from '@sentry/react';
import { currentAccount } from '../../lib/cache';

interface NimbusApiResponse {
  Features?: Record<string, any>;
  features?: Record<string, any>;
  nimbusUserId?: string;
}

const NIMBUS_PREVIEW_PARAM = 'nimbusPreview';
const SENTRY_TAGS = {
  area: 'NimbusProvider',
  component: 'NimbusContext'
} as const;

export interface NimbusContextValue {
  experiments: NimbusResult | null;
  loading: boolean;
  error?: Error;
}

const NimbusContext = createContext<NimbusContextValue | undefined>(undefined);

export function useNimbusContext() {
  const context = useContext(NimbusContext);
  if (context === undefined ) {
    // Return default values when no NimbusProvider is present
    return {
      experiments: null,
      loading: false,
      error: undefined,
    };
  }
  return context;
}

export interface NimbusProviderProps {
  children: ReactNode;
}

export function NimbusProvider({ children }: NimbusProviderProps) {
  const { config, uniqueUserId } = useContext(AppContext);

  const { currentLocale } = useDynamicLocalization();

  if (!config) {
    throw new Error('NimbusProvider requires AppContext with config');
  }

  const [experiments, setExperiments] = useState<NimbusResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {

    // Disable Nimbus if metrics are opted out, note that we specifically check
    // the local storage account because the account stored in the AppContext is
    // not available at this point
    const legacyLocalStorageAccount = currentAccount();
    if (legacyLocalStorageAccount && legacyLocalStorageAccount.metricsEnabled === false) {
      setExperiments(null);
      setLoading(false);
      setError(undefined);
      return;
    }

    if (!config?.nimbus.enabled || !uniqueUserId) {
      setExperiments(null);
      setLoading(false);
      setError(undefined);
      return;
    }

    let mounted = true;
    setLoading(true);

    const fetchNimbusExperiments = async (): Promise<void> => {
      try {
        const [locale] = parseAcceptLanguage(
          currentLocale || navigator.languages.join(', ')
        );
        let [language, region] = locale.split('-');
        if (region) {
          region = region.toLowerCase();
        }

        const nimbusPreview = config.nimbus.preview
          ? config.nimbus.preview
          : searchParams(window.location.search)[NIMBUS_PREVIEW_PARAM] === 'true';

        const nimbusResult = await initializeNimbus(
          uniqueUserId,
          nimbusPreview,
          {
            language,
            region,
          } as NimbusContextT
        );

        if (mounted) {
          if (nimbusResult) {
            const apiResponse = nimbusResult as NimbusApiResponse;
            const features = apiResponse.Features || apiResponse.features;
            setExperiments({
              features: features,
              nimbusUserId: uniqueUserId,
            } as NimbusResult);
          } else {
            setExperiments(null);
          }
          setLoading(false);
        }
      } catch (err) {
        Sentry.captureException(err, {
          tags: SENTRY_TAGS,
          extra: {
            uniqueUserId,
            nimbusEnabled: config.nimbus.enabled,
            previewMode: config.nimbus.preview
          },
        });

        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch nimbus experiments'));
          setLoading(false);
        }
      }
    };

    fetchNimbusExperiments();

    return () => {
      mounted = false;
    };
  }, [config?.nimbus.enabled, config?.nimbus.preview, uniqueUserId, currentLocale]);

  const value: NimbusContextValue = useMemo(() => ({
    experiments,
    loading,
    error,
  }), [experiments, loading, error]);

  return React.createElement(NimbusContext.Provider, { value }, children);
}
