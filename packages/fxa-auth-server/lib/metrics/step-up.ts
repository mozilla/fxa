/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StatsD } from 'hot-shots';

import { ClientTagsRequest, getClientServiceTags } from './client-tags';
import type { GleanMetricsType } from './glean';
import type { AuthLogger } from '../types';

export type StepUpReason =
  | 'acr_values_unmet'
  | 'max_age_stale'
  | 'auth_time_missing';

export type StepUpEvaluation = {
  requested: boolean;
  satisfied: boolean;
  reason?: StepUpReason;
  authAgeSeconds?: number;
};

export type StepUpMetricsDeps = {
  request: ClientTagsRequest;
  /** Resolves Glean's account_user_id and the metrics opt-out. */
  uid?: string;
  /** Hex client id, taken from the resolved client record rather than the payload. */
  clientId: string;
  statsd?: Pick<StatsD, 'increment' | 'histogram'>;
  glean?: Pick<GleanMetricsType, 'stepUpAuth'>;
  log?: Pick<AuthLogger, 'warn'>;
};

/**
 * Records telemetry for one RFC 9470 step-up evaluation. A no-op when the
 * relying party did not ask for step-up.
 *
 * Never throws, and never lets one backend's failure suppress the other: it
 * runs inside the authorization gate, which must not fail because a metrics
 * backend did.
 */
export function recordStepUpMetrics(
  stepUp: StepUpEvaluation,
  { request, uid, clientId, statsd, glean, log }: StepUpMetricsDeps
): void {
  if (!stepUp.requested) {
    return;
  }

  // Glean resolves the metrics opt-out against MySQL and Redis, so a backing
  // store outage empties the funnel; report it rather than reading it as
  // "no relying party asked for step-up".
  const onFailure = (err: unknown) => {
    try {
      statsd?.increment('oauth.step_up.telemetry_failed', { clientId });
      log?.warn('oauth.step_up.telemetry_failed', {
        err: err instanceof Error ? err.name : typeof err,
      });
    } catch (reportingErr) {
      // The reporter is the thing that broke; nothing left to report with.
    }
  };

  const guard = (emit: () => void) => {
    try {
      emit();
    } catch (err) {
      onFailure(err);
    }
  };

  const tags = { ...getClientServiceTags(request), clientId };

  // Each backend is guarded separately so one failing cannot empty the other,
  // and the outcome counter shares a block with `requested` so the funnel
  // invariant (requested = satisfied + rejected) survives a partial failure.
  guard(() => {
    statsd?.increment('oauth.step_up.requested', tags);
    if (stepUp.satisfied) {
      statsd?.increment('oauth.step_up.satisfied', tags);
      return;
    }
    statsd?.increment('oauth.step_up.rejected', {
      ...tags,
      reason: stepUp.reason ?? 'unknown',
    });
  });

  guard(() => {
    if (stepUp.authAgeSeconds != null) {
      statsd?.histogram('oauth.step_up.auth_age', stepUp.authAgeSeconds, tags);
    }
  });

  guard(() => {
    glean?.stepUpAuth.requested(request as any, { uid }).catch(onFailure);
    if (stepUp.satisfied) {
      glean?.stepUpAuth.satisfied(request as any, { uid }).catch(onFailure);
      return;
    }
    glean?.stepUpAuth
      .rejected(request as any, { uid, reason: stepUp.reason })
      .catch(onFailure);
  });
}
