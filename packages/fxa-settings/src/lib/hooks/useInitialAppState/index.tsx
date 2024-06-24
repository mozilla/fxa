/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useEffect, useMemo } from 'react';
import {
  Integration,
  useConfig,
  useInitialMetricsQueryState,
  useLocalSignedInQueryState,
} from '../../../models';
import GleanMetrics from '../../glean';
import * as Metrics from '../../../lib/metrics';
import { QueryParams } from '../../..';
import sentryMetrics from 'fxa-shared/sentry/browser';

export function useInitialAppState(
  flowQueryParams: QueryParams,
  integration: Integration
) {
  const config = useConfig();

  // GQL call for minimal metrics data
  const { loading: metricsLoading, data } = useInitialMetricsQueryState() ?? {};

  // Because this query depends on the result of an initial query (in this case,
  // metrics), we need to run it separately.
  const { data: isSignedInData } = useLocalSignedInQueryState();
  const isSignedIn = isSignedInData?.isSignedIn;

  const getMetricsEnabled = useCallback(() => {
    if (metricsLoading || isSignedIn === undefined) {
      return;
    }
    return data?.account?.metricsEnabled || !isSignedIn;
  }, [metricsLoading, isSignedIn, data?.account?.metricsEnabled]);
  const metricsEnabled = getMetricsEnabled();

  useMemo(() => {
    if (!metricsEnabled || GleanMetrics.getEnabled()) {
      return;
    }

    GleanMetrics.initialize(
      {
        ...config.glean,
        enabled: metricsEnabled,
        appDisplayVersion: config.version,
        channel: config.glean.channel,
      },
      {
        flowQueryParams,
        account: {
          metricsEnabled: data?.account?.metricsEnabled,
          uid: data?.account?.uid,
        },
        userAgent: navigator.userAgent,
        integration,
      }
    );
  }, [
    config.glean,
    config.version,
    data?.account?.metricsEnabled,
    data?.account?.uid,
    flowQueryParams,
    integration,
    metricsEnabled,
  ]);

  useEffect(() => {
    if (!metricsEnabled) {
      return;
    }
    Metrics.init(metricsEnabled, flowQueryParams);
    if (data?.account?.metricsEnabled) {
      Metrics.initUserPreferences({
        recoveryKey: data.account.recoveryKey,
        hasSecondaryVerifiedEmail:
          data.account.emails.length > 1 && data.account.emails[1].verified,
        totpActive: data.account.totp.exists && data.account.totp.verified,
      });
    }
  }, [
    data,
    data?.account?.metricsEnabled,
    data?.account?.emails,
    data?.account?.totp,
    data?.account?.recoveryKey,
    isSignedIn,
    flowQueryParams,
    config,
    metricsLoading,
    metricsEnabled,
  ]);

  useEffect(() => {
    if (metricsEnabled) {
      sentryMetrics.enable();
    } else {
      sentryMetrics.disable();
    }
  }, [
    data?.account?.metricsEnabled,
    config.sentry,
    config.version,
    metricsLoading,
    isSignedIn,
    metricsEnabled,
  ]);

  return {
    metricsLoading,
    isSignedIn,
  };
}
