/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Boom from '@hapi/boom';
import { ServerRoute } from '@hapi/hapi';
import isA from 'joi';

import { FreeAccessProgramService } from '@fxa/free-access-program';
import { StrapiClient } from '@fxa/shared/cms';

import type { AuthLogger, AuthRequest } from '../../types';

const TARGET_MODEL = 'access';
const UPSERT_EVENTS = new Set(['entry.publish', 'entry.update']);
const DELETE_EVENTS = new Set(['entry.unpublish', 'entry.delete']);

// Dedupe replays of Strapi's static bearer token; longer than realistic retry intervals.
const DEDUPE_TTL_MS = 60_000;
const DEDUPE_MAX_ENTRIES = 1000;

type StrapiAccessWebhookPayload = {
  event: string;
  model?: string;
  createdAt?: string;
  entry?: {
    documentId?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
};

export class FreeAccessProgramWebhookHandler {
  private readonly seenEvents = new Map<string, number>();

  constructor(
    private log: AuthLogger,
    private strapiClient: StrapiClient,
    private reconciler: FreeAccessProgramService
  ) {}

  async postAccess(request: AuthRequest) {
    this.log.begin('subscriptions.freeAccessProgramWebhook', request);

    const authorization =
      (request.headers.authorization as string | undefined) ?? '';
    if (!this.strapiClient.verifyWebhookSignature(authorization)) {
      throw Boom.unauthorized('Invalid Strapi webhook signature');
    }

    const payload = request.payload as StrapiAccessWebhookPayload;
    if (payload.model !== TARGET_MODEL) {
      return { handled: false, reason: 'model' as const };
    }

    const documentId = payload.entry?.documentId;
    if (!documentId) {
      return { handled: false, reason: 'no_document_id' as const };
    }

    const dedupeKey = `${payload.event}|${documentId}|${payload.createdAt ?? ''}`;
    if (this.isReplay(dedupeKey)) {
      return { handled: true, dedupe: true as const };
    }
    this.markSeen(dedupeKey);

    if (
      !UPSERT_EVENTS.has(payload.event) &&
      !DELETE_EVENTS.has(payload.event)
    ) {
      return { handled: false, reason: 'event' as const };
    }

    try {
      await this.reconciler.reconcile();
    } catch (err) {
      // Swallow: the periodic cron sweep is the backstop.
      this.log.error(
        'subscriptions.freeAccessProgramWebhook.reconcile.error',
        { err }
      );
    }

    return { handled: true };
  }

  private isReplay(key: string): boolean {
    const expiresAt = this.seenEvents.get(key);
    if (expiresAt === undefined) return false;
    if (expiresAt <= Date.now()) {
      this.seenEvents.delete(key);
      return false;
    }
    return true;
  }

  private markSeen(key: string): void {
    const now = Date.now();
    if (this.seenEvents.size >= DEDUPE_MAX_ENTRIES) {
      for (const [k, exp] of this.seenEvents) {
        if (exp <= now) this.seenEvents.delete(k);
      }
    }
    this.seenEvents.set(key, now + DEDUPE_TTL_MS);
  }
}

const payloadSchema = isA
  .object({
    event: isA.string().required(),
    model: isA.string().optional(),
    uid: isA.string().optional(),
    createdAt: isA.string().optional(),
    entry: isA
      .object({
        documentId: isA.string().optional(),
      })
      .unknown(true)
      .optional(),
  })
  .unknown(true);

export const freeAccessProgramWebhookRoutes = (
  log: AuthLogger,
  strapiClient: StrapiClient,
  reconciler: FreeAccessProgramService
): ServerRoute[] => {
  const handler = new FreeAccessProgramWebhookHandler(
    log,
    strapiClient,
    reconciler
  );

  return [
    {
      method: 'POST',
      path: '/webhooks/strapi/free-access-program/access',
      options: {
        auth: false,
        validate: {
          payload: payloadSchema,
        },
        response: {
          schema: isA
            .object({
              handled: isA.boolean().required(),
              reason: isA
                .string()
                .valid('model', 'no_document_id', 'event')
                .optional(),
              dedupe: isA.boolean().optional(),
            })
            .unknown(false),
        },
      },
      handler: (request: AuthRequest) => handler.postAccess(request),
    },
  ];
};
