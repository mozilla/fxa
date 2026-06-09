/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import { StatsD } from 'hot-shots';
import * as Sentry from '@sentry/node';

import { StrapiClient } from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';

import { AuthServerEmailCapabilityClient } from './auth-server-email-capability.client';
import { CmsWebhookAuthError } from './cms-webhooks.error';
import type { StrapiEmailCapabilityListWebhookPayload } from './cms-webhooks.types';

const ALLOWED_EVENTS = ['entry.publish', 'entry.update', 'entry.unpublish'];
const TARGET_MODEL = 'business-entitlement';

/**
 * Receives Strapi webhooks for `business-entitlement` changes and forwards
 * them to auth-server. Strapi sends the new entry state (not a diff), so
 * we expand the matchers into explicit emails and forward each as an
 * `added` change. Auth-server then drives the `subscription:update` SQS
 * broadcast for those emails.
 *
 * Today the matcher dynamic zone has a single component
 * (`ComponentMatchersEmailList`) that carries an explicit list of emails.
 *
 * POC limitations:
 *   - We can only fire ADD broadcasts. Detecting REMOVED emails would
 *     require a previous snapshot of the entitlement, which neither
 *     Strapi's webhook nor this service tracks today.
 *
 * TODO(FXA-XXXXX): Replace this HTTP forwarder with an event channel
 * payments-api owns. The auth-server side can then track per-
 * entitlement snapshots and compute precise add/remove diffs.
 */
@Injectable()
export class EmailCapabilityWebhookService {
  constructor(
    private strapiClient: StrapiClient,
    private authServerClient: AuthServerEmailCapabilityClient,
    @Inject(StatsDService) private statsd: StatsD,
    private logger: Logger
  ) {}

  async handleEmailCapabilityListWebhook(
    authorization: string,
    payload: StrapiEmailCapabilityListWebhookPayload
  ): Promise<void> {
    if (!this.strapiClient.verifyWebhookSignature(authorization)) {
      this.statsd.increment('email_capability_list.auth.error');
      this.logger.error(new CmsWebhookAuthError());
      return;
    }

    if (!ALLOWED_EVENTS.includes(payload?.event)) {
      this.statsd.increment('email_capability_list.skipped', {
        reason: 'event',
      });
      return;
    }
    if (payload.model !== TARGET_MODEL) {
      this.statsd.increment('email_capability_list.skipped', {
        reason: 'model',
      });
      return;
    }

    const emails = extractEmails(payload.entry?.matchers);
    const capabilities = extractCapabilitySlugs(payload.entry?.capabilities);
    if (emails.length === 0 || capabilities.length === 0) {
      this.statsd.increment('email_capability_list.skipped', {
        reason: 'empty',
      });
      return;
    }

    const changes = emails.map((email) => ({ email, added: capabilities }));

    try {
      const result = await this.authServerClient.notifyChange({ changes });
      this.statsd.increment('email_capability_list.forwarded', {
        applied: String(result.applied),
        unknown: String(result.unknownAccount),
      });
    } catch (error) {
      this.statsd.increment('email_capability_list.forward.error');
      this.logger.error(error);
      Sentry.captureException(error);
    }
  }
}

function extractEmails(matchers: unknown): string[] {
  if (!Array.isArray(matchers)) return [];
  const set = new Set<string>();
  for (const matcher of matchers) {
    if (!matcher || typeof matcher !== 'object') continue;
    const obj = matcher as Record<string, unknown>;
    // ComponentMatchersEmailList — `emails: JSON` is an object keyed by
    // email address (values carry metadata we don't consume here).
    const emails = obj['emails'];
    if (!emails || typeof emails !== 'object' || Array.isArray(emails)) {
      continue;
    }
    for (const key of Object.keys(emails as Record<string, unknown>)) {
      if (key.length > 0) set.add(key.toLowerCase());
    }
  }
  return [...set];
}

function extractCapabilitySlugs(capabilities: unknown): string[] {
  if (!Array.isArray(capabilities)) return [];
  const set = new Set<string>();
  for (const capability of capabilities) {
    if (!capability || typeof capability !== 'object') continue;
    const slug = (capability as Record<string, unknown>)['slug'];
    if (typeof slug === 'string' && slug.length > 0) {
      set.add(slug);
    }
  }
  return [...set];
}
