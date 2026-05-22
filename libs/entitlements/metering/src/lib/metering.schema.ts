/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

import { METERING_WINDOWS } from '@fxa/shared/cms';

const slugRegex = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;

export const meterSlugSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(slugRegex, {
    message:
      'slug must be lowercase alphanumeric with optional underscores or hyphens',
  });

export const userIdentifierSchema = z.string().min(1).max(256);

/**
 * `id` is the relying-party-supplied event id. OpenMeter de-duplicates events
 * by `(source, id)` so a retried POST with the same id is a safe no-op (the
 * second ingest will not double-count). Relying parties should generate a
 * stable id per logical event (e.g. UUIDv4 per chargeable operation), not
 * per HTTP attempt.
 */
export const ingestUsageRequestSchema = z.object({
  id: z.string().min(1).max(256),
  userIdentifier: userIdentifierSchema,
  slug: meterSlugSchema,
  amount: z.number().finite().positive(),
  timestamp: z
    .string()
    .datetime({ offset: true })
    .optional(),
});

export type IngestUsageRequest = z.infer<typeof ingestUsageRequestSchema>;

export const usageQueryParamsSchema = z.object({
  userIdentifier: userIdentifierSchema,
  slug: meterSlugSchema,
});

export type UsageQueryParams = z.infer<typeof usageQueryParamsSchema>;

export const usageQueryResponseSchema = z.object({
  usage: z.number(),
  limit: z.number(),
  unit: z.string(),
  windowStart: z.string().datetime({ offset: true }),
  windowEnd: z.string().datetime({ offset: true }),
});

export type UsageQueryResponse = z.infer<typeof usageQueryResponseSchema>;

export const meteringWindowSchema = z.enum(METERING_WINDOWS);

export const thresholdCheckTaskBodySchema = z.object({
  slug: meterSlugSchema,
  userIdentifier: userIdentifierSchema,
});

export type ThresholdCheckTaskBody = z.infer<
  typeof thresholdCheckTaskBodySchema
>;
