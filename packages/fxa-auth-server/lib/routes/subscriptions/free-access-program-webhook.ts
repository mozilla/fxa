/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Boom from '@hapi/boom';
import { ServerRoute } from '@hapi/hapi';
import isA from 'joi';

import {
  classifyAccessWebhook,
  FreeAccessProgramService,
  isDuplicateAccessWebhook,
  type FreeAccessProgramWebhookResult,
  type StrapiAccessWebhookPayload,
} from '@fxa/free-access-program';
import { StrapiClient } from '@fxa/shared/cms';

import type { AuthLogger, AuthRequest } from '../../types';

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
  const seenEvents = new Map<string, number>();

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
      handler: async (
        request: AuthRequest
      ): Promise<FreeAccessProgramWebhookResult> => {
        log.begin('subscriptions.freeAccessProgramWebhook', request);

        const authorization =
          (request.headers.authorization as string | undefined) ?? '';
        if (!strapiClient.verifyWebhookSignature(authorization)) {
          throw Boom.unauthorized('Invalid Strapi webhook signature');
        }

        const classification = classifyAccessWebhook(
          request.payload as StrapiAccessWebhookPayload
        );
        if ('skip' in classification) {
          return { handled: false, reason: classification.skip };
        }

        if (
          isDuplicateAccessWebhook(seenEvents, classification.dedupeKey, Date.now())
        ) {
          return { handled: true, dedupe: true };
        }

        try {
          await reconciler.reconcile();
        } catch (err) {
          // Swallow: the periodic cron sweep is the backstop.
          log.error('subscriptions.freeAccessProgramWebhook.reconcile.error', {
            err,
          });
        }

        return { handled: true };
      },
    },
  ];
};
