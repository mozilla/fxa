/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { OpenAPIObject } from '@nestjs/swagger';
import { annotateWebhookRoutes } from './swagger.utils';

function createDoc(paths: OpenAPIObject['paths'] = {}): OpenAPIObject {
  return { openapi: '3.0.0', info: { title: 'Test', version: '1.0' }, paths };
}

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
