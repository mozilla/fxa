/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { StatsD } from 'hot-shots';

import { FreeAccessProgramConfigurationManager, StrapiClient } from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';

import {
  classifyAccessWebhook,
  type FreeAccessProgramWebhookResult,
  type StrapiAccessWebhookPayload,
} from './util/classifyAccessWebhook';
import { isDuplicateAccessWebhook } from './util/isDuplicateAccessWebhook';

/**
 * Handles the Strapi Free Access Program `access` webhook for payments-api by
 * invalidating this process's projection cache. Journal diffing and RP
 * notifications remain auth-server's responsibility; this endpoint is additive.
 */
@Injectable()
export class FreeAccessProgramWebhooksService {
  private readonly seenEvents = new Map<string, number>();

  constructor(
    private strapiClient: StrapiClient,
    private freeAccessManager: FreeAccessProgramConfigurationManager,
    @Inject(StatsDService) private statsd: StatsD,
    private logger: Logger
  ) {}

  async handleAccessWebhook(
    authorization: string,
    body: StrapiAccessWebhookPayload
  ): Promise<FreeAccessProgramWebhookResult> {
    if (!this.strapiClient.verifyWebhookSignature(authorization)) {
      this.statsd.increment('free_access_program.webhook.auth.error');
      throw new UnauthorizedException();
    }

    const classification = classifyAccessWebhook(body);
    if ('skip' in classification) {
      return { handled: false, reason: classification.skip };
    }

    if (isDuplicateAccessWebhook(this.seenEvents, classification.dedupeKey, Date.now())) {
      return { handled: true, dedupe: true };
    }

    try {
      await this.freeAccessManager.invalidateProjectionCache();
    } catch (err) {
      // Swallow: the periodic cron sweep is the backstop.
      this.logger.error('freeAccessProgramWebhook.invalidate.error', { err });
    }

    return { handled: true };
  }
}
