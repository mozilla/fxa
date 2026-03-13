/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGleanMetrics } from '../hooks/useGleanMetrics';
import type {
  Action,
  EligibilityStatus,
  ErrorReason,
  FlowType,
  Interval,
  Outcome,
} from '@fxa/payments/metrics/client';

type GleanRetentionResultProps = {
  metricsEnabled: boolean;
  eventType: 'retention_flow' | 'interstitial_offer';
  flowType: FlowType;
  eligibilityStatus: EligibilityStatus;
  outcome: Outcome;
  action?: Action;
  errorReason?: string;
  offeringId?: string;
  interval?: string;
};

export function GleanRetentionResult({
  metricsEnabled,
  eventType,
  flowType,
  eligibilityStatus,
  outcome,
  action,
  errorReason,
  offeringId,
  interval,
}: GleanRetentionResultProps) {
  const glean = useGleanMetrics(metricsEnabled);
  const searchParams = useSearchParams();

  useEffect(() => {
    const base = {
      step: 'result' as const,
      flowType,
      eligibilityStatus,
      outcome,
      action,
      errorReason: errorReason as ErrorReason,
      offeringId,
      interval: interval as Interval,
      utmSource: searchParams.get('utm_source') ?? undefined,
      utmMedium: searchParams.get('utm_medium') ?? undefined,
      utmCampaign: searchParams.get('utm_campaign') ?? undefined,
      nimbusUserId: searchParams.get('nimbus_user_id') ?? undefined,
    };

    if (eventType === 'retention_flow') {
      glean.recordRetentionFlow({
        ...base,
        entrypoint: searchParams.get('entrypoint') ?? undefined,
      });
    } else {
      glean.recordInterstitialOffer(base);
    }
  }, []); // eslint-disable-line

  return null;
}
