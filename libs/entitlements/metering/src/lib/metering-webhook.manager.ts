/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as crypto from 'node:crypto';

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { MeteringConfig } from './metering.config';
import {
  EmptyClientSecretError,
  MissingClientSecretError,
  WebhookDispatchError,
} from './metering.error';
import type { WebhookDispatchParams } from './metering.types';
import { statusBucket } from './utils/statusBucket';
import { toError } from './utils/toError';

const WEBHOOK_TIMEOUT_MS = 5_000;
const SIGNATURE_VERSION = 'v1';

@Injectable()
export class MeteringWebhookManager {
  private readonly secretByClientId: Map<string, string>;

  constructor(
    meteringConfig: MeteringConfig,
    @Inject(StatsDService) private readonly statsd: StatsD,
    @Inject(Logger) private readonly logger: LoggerService
  ) {
    this.secretByClientId = new Map();
    for (const [clientId, secret] of Object.entries(
      meteringConfig.clients ?? {}
    )) {
      const normalizedSecret = typeof secret === 'string' ? secret.trim() : '';
      if (normalizedSecret.length === 0) {
        throw new EmptyClientSecretError(clientId);
      }
      this.secretByClientId.set(clientId, normalizedSecret);
    }
  }

  /**
   * Single-attempt dispatch. Throws on a missing signing secret, non-2xx, or
   * network error; the sweep skips recording the notification so the next
   * sweep retries it.
   */
  async dispatch(params: WebhookDispatchParams): Promise<void> {
    const secret = this.secretByClientId.get(params.signingClientId);
    if (!secret) {
      this.statsd.increment('metering.webhook.no_secret', {
        signingClientId: params.signingClientId,
      });
      throw new MissingClientSecretError(params.signingClientId, params.slug);
    }

    const body = JSON.stringify({
      slug: params.slug,
      userIdentifier: params.subject,
      threshold: params.threshold,
      currentUsage: params.currentUsage,
      limit: params.limit,
      grantedAmount: params.grantedAmount,
      unit: params.unit,
      windowStart: params.windowStart.toISOString(),
      windowEnd: params.windowEnd.toISOString(),
      idempotencyKey: params.idempotencyKey,
      timestamp: new Date().toISOString(),
    });

    const response = await fetch(params.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Entitlements-Metering-Signature': `${SIGNATURE_VERSION}=${this.signWebhookBody(
          secret,
          body
        )}`,
      },
      body,
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    }).catch((err: unknown) => {
      throw this.reportDispatchError(
        params,
        new WebhookDispatchError(
          { signingClientId: params.signingClientId, slug: params.slug },
          toError(err)
        )
      );
    });

    this.statsd.increment('metering.webhook.dispatch', {
      signingClientId: params.signingClientId,
      status: statusBucket(response.status),
    });
    if (!response.ok) {
      throw this.reportDispatchError(
        params,
        new WebhookDispatchError({
          signingClientId: params.signingClientId,
          slug: params.slug,
          status: response.status,
        })
      );
    }
  }

  private reportDispatchError(
    params: WebhookDispatchParams,
    err: WebhookDispatchError
  ): WebhookDispatchError {
    Sentry.withScope((scope) => {
      scope.setTag('signingClientId', params.signingClientId);
      scope.setTag('slug', params.slug);
      Sentry.captureException(err);
    });
    this.statsd.increment('metering.webhook.dispatch_error', {
      signingClientId: params.signingClientId,
    });
    this.logger.error(err);
    return err;
  }

  private signWebhookBody(secret: string, body: string): string {
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
  }
}
