/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { OpenAPIObject } from '@nestjs/swagger';
import { stripInternalRoutes, annotateWebhookRoutes } from './swagger.utils';

function createDoc(paths: OpenAPIObject['paths'] = {}): OpenAPIObject {
  return { openapi: '3.0.0', info: { title: 'Test', version: '1.0' }, paths };
}

describe('stripInternalRoutes', () => {
  it('removes routes tagged with an internal tag', () => {
    const doc = createDoc({
      '/v1/metering/internal/threshold-check': {
        post: {
          tags: ['Metering Internal'],
          responses: {},
        },
      },
      '/v1/billing': {
        get: {
          tags: ['Billing & Subscriptions'],
          responses: {},
        },
      },
    });

    const result = stripInternalRoutes(doc);

    expect(result.paths).not.toHaveProperty(
      '/v1/metering/internal/threshold-check'
    );
    expect(result.paths).toHaveProperty('/v1/billing');
  });

  it('preserves path-level properties like summary and parameters', () => {
    const doc = createDoc({
      '/v1/billing': {
        summary: 'Billing operations',
        parameters: [{ name: 'x-req-id', in: 'header' }],
        get: {
          tags: ['Billing & Subscriptions'],
          responses: {},
        },
      } as OpenAPIObject['paths'][string],
    });

    const result = stripInternalRoutes(doc);
    const pathItem = result.paths['/v1/billing'];

    expect(pathItem).toHaveProperty('summary', 'Billing operations');
    expect(pathItem).toHaveProperty('parameters');
    expect(pathItem).toHaveProperty('get');
  });

  it('removes only internal methods from a path with mixed operations', () => {
    const doc = createDoc({
      '/v1/metering/usage': {
        get: {
          tags: ['Metering'],
          responses: {},
        },
        post: {
          tags: ['Metering Internal'],
          responses: {},
        },
      },
    });

    const result = stripInternalRoutes(doc);
    const pathItem = result.paths['/v1/metering/usage'];

    expect(pathItem).toHaveProperty('get');
    expect(pathItem).not.toHaveProperty('post');
  });

  it('removes a path entirely when all methods are internal', () => {
    const doc = createDoc({
      '/v1/internal-only': {
        post: {
          tags: ['Metering Internal'],
          responses: {},
        },
      },
    });

    const result = stripInternalRoutes(doc);

    expect(result.paths).not.toHaveProperty('/v1/internal-only');
  });

  it('keeps routes with no tags', () => {
    const doc = createDoc({
      '/healthcheck': {
        get: { responses: {} },
      },
    });

    const result = stripInternalRoutes(doc);

    expect(result.paths).toHaveProperty('/healthcheck');
  });

  it('does not mutate the original document', () => {
    const doc = createDoc({
      '/v1/internal': {
        post: { tags: ['Metering Internal'], responses: {} },
      },
      '/v1/public': {
        get: { tags: ['Billing & Subscriptions'], responses: {} },
      },
    });

    stripInternalRoutes(doc);

    expect(doc.paths).toHaveProperty('/v1/internal');
  });
});

describe('annotateWebhookRoutes', () => {
  it('adds Webhooks tag and summary to known webhook routes', () => {
    const doc = createDoc({
      '/webhooks/stripe': {
        post: { responses: {} },
      },
    });

    annotateWebhookRoutes(doc);

    const post = doc.paths['/webhooks/stripe']?.post;
    expect(post).toBeDefined();
    expect(post?.tags).toEqual(['Webhooks']);
    expect(post?.summary).toBe('Handle Stripe webhook events');
  });

  it('adds header parameters to stripe webhook route', () => {
    const doc = createDoc({
      '/webhooks/stripe': {
        post: { responses: {} },
      },
    });

    annotateWebhookRoutes(doc);

    const params = doc.paths['/webhooks/stripe']?.post?.parameters;
    expect(params).toEqual([
      expect.objectContaining({
        name: 'stripe-signature',
        in: 'header',
        required: true,
      }),
    ]);
  });

  it('annotates all three webhook routes', () => {
    const doc = createDoc({
      '/webhooks/stripe': { post: { responses: {} } },
      '/webhooks/strapi/validation': { post: { responses: {} } },
      '/webhooks/fxa': { post: { responses: {} } },
    });

    annotateWebhookRoutes(doc);

    expect(doc.paths['/webhooks/stripe']?.post?.tags).toEqual(['Webhooks']);
    expect(doc.paths['/webhooks/strapi/validation']?.post?.tags).toEqual([
      'Webhooks',
    ]);
    expect(doc.paths['/webhooks/fxa']?.post?.tags).toEqual(['Webhooks']);
  });

  it('warns and skips when a webhook route is missing', () => {
    const doc = createDoc({});
    const warnSpy = jest
      .spyOn(jest.requireActual('@nestjs/common').Logger, 'warn')
      .mockImplementation();

    annotateWebhookRoutes(doc);

    expect(warnSpy).toHaveBeenCalledTimes(3);
    warnSpy.mockRestore();
  });
});
