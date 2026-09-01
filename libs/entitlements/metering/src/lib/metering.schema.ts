/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

import { METERING_CALENDAR_PERIODS } from '@fxa/shared/cms';

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;

export const meterSlugSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(SLUG_REGEX, {
    message:
      'slug must be lowercase alphanumeric with optional underscores or hyphens',
  })
  .describe(
    'Meter slug identifier (lowercase alphanumeric, hyphens, underscores)'
  );

export const userIdentifierSchema = z
  .string()
  .min(1)
  .max(256)
  .describe('Unique identifier for the user being metered');

/**
 * Duplicates are dropped at ingest: the first copy of an event id to reach the
 * consumer is stored and every later copy is discarded. Relying parties should
 * send a stable id for each logical event rather than a fresh id per HTTP
 * attempt.
 */
export const ingestUsageRequestSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(256)
    .describe(
      'Stable idempotency key for this usage event; retries with the same id will not double-count'
    ),
  userIdentifier: userIdentifierSchema,
  slug: meterSlugSchema,
  amount: z
    .number()
    .int()
    .positive()
    .describe('Usage amount to record (must be a positive integer)'),
  timestamp: z.iso
    .datetime({ offset: true })
    .optional()
    .describe(
      'ISO 8601 timestamp with offset; defaults to server time if omitted'
    ),
});

export type IngestUsageRequest = z.infer<typeof ingestUsageRequestSchema>;

export const meteringWireEventSchema = z.object({
  id: z.string().min(1).max(256),
  clientId: z.string().min(1).max(256),
  slug: meterSlugSchema,
  userIdentifier: userIdentifierSchema,
  amount: z.number().int().positive(),
  timestamp: z.iso.datetime({ offset: true }),
});

export type MeteringWireEvent = z.infer<typeof meteringWireEventSchema>;

export const usageQueryParamsSchema = z.object({
  userIdentifier: userIdentifierSchema.describe(
    'User identifier to query usage for'
  ),
  slug: meterSlugSchema.describe('Meter slug to query'),
});

export type UsageQueryParams = z.infer<typeof usageQueryParamsSchema>;

export const usageQueryResponseSchema = z.object({
  usage: z.number().describe('Current usage amount within the billing window'),
  limit: z
    .number()
    .describe(
      'Effective usage limit for the current plan, including any active grants'
    ),
  grantedAmount: z
    .number()
    .describe(
      'Additional usage granted on top of the plan limit within the current window'
    ),
  unit: z.string().describe('Unit of measurement (e.g. "requests", "gb")'),
  windowStart: z.iso
    .datetime({ offset: true })
    .describe('ISO 8601 start of the current metering window'),
  windowEnd: z.iso
    .datetime({ offset: true })
    .describe('ISO 8601 end of the current metering window'),
});

export type UsageQueryResponse = z.infer<typeof usageQueryResponseSchema>;

export const meteringCalendarPeriodSchema = z.enum(METERING_CALENDAR_PERIODS);

export const sweepRequestSchema = z.object({
  clientId: z
    .string()
    .min(1)
    .max(256)
    .describe('Relying party whose meter should be swept'),
  slug: meterSlugSchema.describe('Meter slug to sweep'),
});

export type SweepRequest = z.infer<typeof sweepRequestSchema>;
