/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';

/**
 * Adds tags, summaries, and header docs to webhook routes.
 * These decorators can't live on the shared webhook controllers
 * because importing @nestjs/swagger there breaks the payments-next
 * Next.js build (transitive class-transformer dependency).
 */
export function annotateWebhookRoutes(document: OpenAPIObject): void {
  const webhookMeta: Record<
    string,
    {
      summary: string;
      headers?: Record<string, { description: string; required: boolean }>;
    }
  > = {
    '/webhooks/stripe': {
      summary: 'Handle Stripe webhook events',
      headers: {
        'stripe-signature': {
          description: 'Stripe webhook signature for payload verification',
          required: true,
        },
      },
    },
    '/webhooks/strapi/validation': {
      summary: 'Handle CMS content validation webhook',
      headers: {
        authorization: {
          description: 'Webhook authorization token',
          required: true,
        },
      },
    },
    '/webhooks/strapi/free-access-program/access': {
      summary:
        'Refresh the Free Access Program projection cache on a Strapi access change',
      headers: {
        authorization: {
          description: 'Webhook authorization token',
          required: true,
        },
      },
    },
    '/webhooks/fxa': {
      summary: 'Handle FXA account event webhook',
      headers: {
        authorization: {
          description: 'JWT authorization token for FXA events',
          required: true,
        },
      },
    },
  };

  for (const [path, meta] of Object.entries(webhookMeta)) {
    const pathItem = document.paths?.[path];
    if (!pathItem?.post) {
      Logger.warn(
        `annotateWebhookRoutes: expected POST ${path} not found in OpenAPI document`,
        'Swagger'
      );
      continue;
    }

    pathItem.post.tags = ['Webhooks'];
    pathItem.post.summary = meta.summary;

    if (meta.headers) {
      const params = pathItem.post.parameters ?? [];
      for (const [name, header] of Object.entries(meta.headers)) {
        params.push({
          name,
          in: 'header',
          description: header.description,
          required: header.required,
          schema: { type: 'string' },
        });
      }
      pathItem.post.parameters = params;
    }
  }
}
