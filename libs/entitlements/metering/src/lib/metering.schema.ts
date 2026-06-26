/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

import { METERING_WINDOWS } from '@fxa/shared/cms';

const slugRegex = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;

export const meterSlugSchema = z.string().min(1).max(128).regex(slugRegex, {
  message:
    'slug must be lowercase alphanumeric with optional underscores or hyphens',
});

export const userIdentifierSchema = z.string().min(1).max(256);

/**
 * OpenMeter deduplicates events by source and id, so a retried ingest with the
 * same id will not double-count (within the Redis retention window).
 * Relying parties should send a stable id for
 * each logical event rather than a fresh id per HTTP attempt.
 */
export const ingestUsageRequestSchema = z.object({
  id: z.string().min(1).max(256),
  userIdentifier: userIdentifierSchema,
  slug: meterSlugSchema,
  amount: z.number().positive(),
  timestamp: z.iso.datetime({ offset: true }).optional(),
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
  windowStart: z.iso.datetime({ offset: true }),
  windowEnd: z.iso.datetime({ offset: true }),
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
