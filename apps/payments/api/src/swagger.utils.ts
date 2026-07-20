/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';

const INTERNAL_TAGS = ['Metering Internal'];

const HTTP_METHODS = new Set([
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
]);

/**
 * Returns a copy of the OpenAPI document with routes tagged as internal
 * removed. The production /swagger.json serves this filtered version so
 * internal-only endpoints (e.g. Cloud Tasks callbacks) are not advertised.
 */
export function stripInternalRoutes(doc: OpenAPIObject): OpenAPIObject {
  const paths: OpenAPIObject['paths'] = {};
  for (const [path, pathItem] of Object.entries(doc.paths ?? {})) {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(key)) {
        filtered[key] = value;
        continue;
      }
      const op = value as { tags?: string[] };
      if (!(op.tags ?? []).some((t) => INTERNAL_TAGS.includes(t))) {
        filtered[key] = value;
      }
    }
    if (Object.keys(filtered).length > 0) {
      paths[path] = filtered;
    }
  }
  return { ...doc, paths };
}

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
