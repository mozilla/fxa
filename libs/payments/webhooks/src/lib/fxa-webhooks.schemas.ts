/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

// Atomic event payload schemas

export const fxaPasswordChangeEventSchema = z.object({
  changeTime: z.number(),
});

export const fxaProfileChangeEventSchema = z.object({
  uid: z.string().optional(),
  email: z.string().optional(),
  locale: z.string().optional(),
  totpEnabled: z.boolean().optional(),
  accountDisabled: z.boolean().optional(),
  accountLocked: z.boolean().optional(),
  metricsEnabled: z.boolean().optional(),
});

export const fxaSubscriptionStateChangeEventSchema = z.object({
  capabilities: z.array(z.string()),
  isActive: z.boolean(),
  changeTime: z.number(),
});

export const fxaDeleteUserEventSchema = z.object({});
export const fxaMetricsOptOutEventSchema = z.object({});
export const fxaMetricsOptInEventSchema = z.object({});

// Top-level SET (Security Event Token) payload schema

export const fxaSecurityEventTokenPayloadSchema = z.object({
  iss: z.string(),
  sub: z.string(),
  aud: z.string(),
  iat: z.number(),
  jti: z.string(),
  events: z.record(z.string(), z.record(z.string(), z.any())),
});
