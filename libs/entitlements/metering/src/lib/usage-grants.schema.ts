/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

import { meterSlugSchema, userIdentifierSchema } from './metering.schema';

export const usageGrantLifetimeSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('unending'),
    }),
    z.object({
      type: z.literal('currentWindow'),
    }),
    z.object({
      type: z.literal('expires'),
      expiresAt: z.iso
        .datetime({ offset: true })
        .describe('ISO 8601 timestamp with offset at which the grant expires'),
    }),
  ])
  .describe(
    'When the grant stops applying: unending, the end of the meter’s current window, or an explicit expiry'
  );

export type UsageGrantLifetime = z.infer<typeof usageGrantLifetimeSchema>;

export const createUsageGrantRequestSchema = z.object({
  userIdentifier: userIdentifierSchema.describe(
    'User identifier the grant applies to'
  ),
  slug: meterSlugSchema.describe('Meter slug the grant applies to'),
  amount: z
    .number()
    .positive()
    .finite()
    .describe(
      'Additional usage to grant on top of the meter limit (must be a positive, finite number)'
    ),
  reason: z
    .string()
    .min(1)
    .max(1024)
    .optional()
    .describe('Optional human-readable note recorded for audit'),
  lifetime: usageGrantLifetimeSchema.default({ type: 'unending' }),
});

export type CreateUsageGrantRequest = z.infer<
  typeof createUsageGrantRequestSchema
>;

export const usageGrantSchema = z.object({
  id: z.string().describe('Unique identifier for the grant'),
  userIdentifier: userIdentifierSchema,
  slug: meterSlugSchema,
  amount: z
    .number()
    .describe('Additional usage granted on top of the meter limit'),
  grantedBy: z
    .string()
    .describe('Metering client identifier that created the grant'),
  reason: z
    .string()
    .optional()
    .describe('Human-readable note recorded for audit'),
  createdAt: z.iso
    .datetime({ offset: true })
    .describe('ISO 8601 time the grant was created'),
  expiresAt: z.iso
    .datetime({ offset: true })
    .nullable()
    .describe('ISO 8601 expiry, or null when the grant never expires'),
  active: z
    .boolean()
    .describe('Whether the grant currently applies at the time of the query'),
});

export type UsageGrant = z.infer<typeof usageGrantSchema>;

export const listUsageGrantsParamsSchema = z.object({
  userIdentifier: userIdentifierSchema.describe(
    'User identifier to list grants for'
  ),
  slug: meterSlugSchema
    .optional()
    .describe('Optional meter slug to filter the grants by'),
});

export type ListUsageGrantsParams = z.infer<typeof listUsageGrantsParamsSchema>;

export const listUsageGrantsResponseSchema = z.object({
  grants: z.array(usageGrantSchema).describe('Grants for the requested user'),
});

export type ListUsageGrantsResponse = z.infer<
  typeof listUsageGrantsResponseSchema
>;

export const deleteUsageGrantParamsSchema = z.object({
  grantId: z
    .string()
    .min(1)
    .max(256)
    .regex(/^[A-Za-z0-9_-]+$/, {
      message:
        'grantId must be a single-segment identifier (letters, digits, hyphens, underscores)',
    })
    .describe('Identifier of the grant to delete'),
});

export type DeleteUsageGrantParams = z.infer<
  typeof deleteUsageGrantParamsSchema
>;
