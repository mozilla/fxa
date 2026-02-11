/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import { StatsD } from 'hot-shots';
import * as Sentry from '@sentry/node';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { CmsContentValidationManager, StrapiClient } from '@fxa/shared/cms';
import { CmsWebhookAuthError } from './cms-webhooks.error';
import type { StrapiValidationWebhookPayload } from './cms-webhooks.types';

const ALLOWED_EVENTS = [
  'entry.publish',
  'entry.unpublish',
  'entry.delete',
  'entry.create',
  'entry.update',
];

@Injectable()
export class CmsWebhookService {
  constructor(
    private strapiClient: StrapiClient,
    private cmsContentValidationManager: CmsContentValidationManager,
    @Inject(StatsDService) private statsd: StatsD,
    private logger: Logger
  ) {}

  async handleValidationWebhook(
    authorization: string,
    payload: StrapiValidationWebhookPayload
  ): Promise<void> {
    if (!this.strapiClient.verifyWebhookSignature(authorization)) {
      this.statsd.increment('cms.validation.auth.error');
      this.logger.error(new CmsWebhookAuthError());
      return;
    }

    if (!ALLOWED_EVENTS.includes(payload.event)) {
      return;
    }

    try {
      const errors = await this.cmsContentValidationManager.validateAll();

      if (errors.length > 0) {
        for (const error of errors) {
          Sentry.captureException(error);

          this.statsd.increment('cms.validation.error', {
            model: error.model,
          });

          this.logger.error(error);
        }
      } else {
        this.statsd.increment('cms.validation.success');
      }
    } catch (error) {
      Sentry.captureException(error);
      this.statsd.increment('cms.validation.error');
      this.logger.error(error);
    }
  }
}
