/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as crypto from 'node:crypto';

import { Inject, Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { StatsD } from 'hot-shots';

import { StatsDService } from '@fxa/shared/metrics/statsd';

import { MeteringConfig } from './metering.config';
import { buildIdempotencyKey } from './utils/buildIdempotencyKey';
import { statusBucket } from './utils/statusBucket';

const WEBHOOK_TIMEOUT_MS = 5_000;
const SIGNATURE_VERSION = 'v1';

@Injectable()
export class MeteringWebhookManager {
  private readonly secretByClientId: Map<string, string>;

  constructor(
    meteringConfig: MeteringConfig,
    @Inject(StatsDService) private statsd: StatsD,
    private logger: Logger
  ) {
    this.secretByClientId = new Map();
    for (const [clientId, secret] of Object.entries(
      meteringConfig.clients ?? {}
    )) {
      const normalizedSecret = typeof secret === 'string' ? secret.trim() : '';
      if (normalizedSecret.length === 0) {
        throw new Error(
          `MeteringConfig.clients[${clientId}] has an empty secret`
        );
      }
      this.secretByClientId.set(clientId, normalizedSecret);
    }
  }

  /**
   * Single-attempt dispatch. Throws on non-2xx or network error.
   * The caller is expected to re-enqueue / DLQ in that case.
   */
  async dispatch(args: {
    signingClientId: string;
    url: string;
    slug: string;
    userIdentifier: string;
    threshold: number;
    currentUsage: number;
    limit: number;
    grantedAmount: number;
    unit: string;
    windowStart: Date;
    windowEnd: Date;
    eventId: string;
  }): Promise<void> {
    const secret = this.secretByClientId.get(args.signingClientId);
    if (!secret) {
      this.statsd.increment('metering.webhook.skip.no_secret', {
        signingClientId: args.signingClientId,
      });
      return;
    }

    const body = JSON.stringify({
      slug: args.slug,
      userIdentifier: args.userIdentifier,
      threshold: args.threshold,
      currentUsage: args.currentUsage,
      limit: args.limit,
      grantedAmount: args.grantedAmount,
      unit: args.unit,
      windowStart: args.windowStart.toISOString(),
      windowEnd: args.windowEnd.toISOString(),
      eventId: args.eventId,
      idempotencyKey: buildIdempotencyKey(args),
      timestamp: new Date().toISOString(),
    });
    try {
      const response = await fetch(args.url, {
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
      });
      this.statsd.increment('metering.webhook.dispatch', {
        signingClientId: args.signingClientId,
        status: statusBucket(response.status),
      });
      if (!response.ok) {
        throw new Error(
          `Webhook target returned ${response.status} for signingClientId=${args.signingClientId} slug=${args.slug}`
        );
      }
    } catch (err) {
      Sentry.withScope((scope) => {
        scope.setTag('signingClientId', args.signingClientId);
        scope.setTag('slug', args.slug);
        Sentry.captureException(err);
      });
      this.statsd.increment('metering.webhook.dispatch.error', {
        signingClientId: args.signingClientId,
      });
      this.logger.error(err);
      throw err;
    }
  }

  private signWebhookBody(secret: string, body: string): string {
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
  }
}
