/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

/**
 * Common user identity returned by both FxA OAuth strategies.
 * Contains only the fields reliably available from both JWT and
 * opaque-token verification paths.
 */
export const fxaOAuthUserSchema = z.object({
  sub: z.string(),
  client_id: z.string(),
  scope: z.array(z.string()),
});

export type FxaOAuthUser = z.infer<typeof fxaOAuthUserSchema>;

/**
 * Zod schema for JWT claims from an FxA OAuth access token.
 */
export const fxaAccessTokenClaimsSchema = z.object({
  sub: z.string(),
  client_id: z.string(),
  scope: z.string(),
  'fxa-generation': z.number().optional(),
  'fxa-profileChangedAt': z.number().optional(),
});

/**
 * JWT claims from an FXA OAuth access token.
 */
export type FxaAccessTokenClaims = z.infer<typeof fxaAccessTokenClaimsSchema>;

/**
 * Zod schema for the response from the FxA auth server's POST /v1/verify endpoint.
 */
export const fxaVerifyResponseSchema = z.object({
  user: z.string(),
  client_id: z.string(),
  scope: z.array(z.string()),
  generation: z.number().optional(),
  profile_changed_at: z.number().optional(),
});

/**
 * Response from the FxA auth server's POST /v1/verify endpoint.
 */
export type FxaVerifyResponse = z.infer<typeof fxaVerifyResponseSchema>;
