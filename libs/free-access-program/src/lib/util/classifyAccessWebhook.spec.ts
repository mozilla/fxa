/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  classifyAccessWebhook,
  type StrapiAccessWebhookPayload,
} from './classifyAccessWebhook';

describe('classifyAccessWebhook', () => {
  const payload = (
    overrides: Partial<StrapiAccessWebhookPayload> = {}
  ): StrapiAccessWebhookPayload => ({
    event: 'entry.publish',
    model: 'access',
    entry: { documentId: 'ent-1' },
    ...overrides,
  });

  it('skips with reason "model" when the payload is not for access', () => {
    expect(classifyAccessWebhook(payload({ model: 'offering' }))).toEqual({
      skip: 'model',
    });
  });

  it('skips with reason "no_document_id" when entry.documentId is missing', () => {
    expect(classifyAccessWebhook(payload({ entry: {} }))).toEqual({
      skip: 'no_document_id',
    });
  });

  it('skips with reason "event" for unknown event types', () => {
    expect(classifyAccessWebhook(payload({ event: 'media.upload' }))).toEqual({
      skip: 'event',
    });
  });

  it.each([
    ['entry.publish'],
    ['entry.update'],
    ['entry.unpublish'],
    ['entry.delete'],
  ])('returns a dedupe key for a relevant %s event', (event) => {
    expect(
      classifyAccessWebhook(
        payload({ event, createdAt: '2026-06-23T12:00:00.000Z' })
      )
    ).toEqual({ dedupeKey: `${event}|ent-1|2026-06-23T12:00:00.000Z` });
  });

  it('uses an empty createdAt segment when absent', () => {
    expect(classifyAccessWebhook(payload())).toEqual({
      dedupeKey: 'entry.publish|ent-1|',
    });
  });
});
