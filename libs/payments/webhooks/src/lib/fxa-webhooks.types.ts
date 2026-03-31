/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

import {
  fxaPasswordChangeEventSchema,
  fxaProfileChangeEventSchema,
  fxaSubscriptionStateChangeEventSchema,
  fxaDeleteUserEventSchema,
  fxaMetricsOptOutEventSchema,
  fxaMetricsOptInEventSchema,
  fxaSecurityEventTokenPayloadSchema,
} from './fxa-webhooks.schemas';

export const FXA_DELETE_EVENT_URI =
  'https://schemas.accounts.firefox.com/event/delete-user';
export const FXA_PASSWORD_EVENT_URI =
  'https://schemas.accounts.firefox.com/event/password-change';
export const FXA_PROFILE_EVENT_URI =
  'https://schemas.accounts.firefox.com/event/profile-change';
export const FXA_SUBSCRIPTION_STATE_EVENT_URI =
  'https://schemas.accounts.firefox.com/event/subscription-state-change';
export const FXA_METRICS_OPT_OUT_EVENT_URI =
  'https://schemas.accounts.firefox.com/event/metrics-opt-out';
export const FXA_METRICS_OPT_IN_EVENT_URI =
  'https://schemas.accounts.firefox.com/event/metrics-opt-in';

export type FxaPasswordChangeEvent = z.infer<
  typeof fxaPasswordChangeEventSchema
>;
export type FxaProfileChangeEvent = z.infer<
  typeof fxaProfileChangeEventSchema
>;
export type FxaSubscriptionStateChangeEvent = z.infer<
  typeof fxaSubscriptionStateChangeEventSchema
>;
export type FxaDeleteUserEvent = z.infer<typeof fxaDeleteUserEventSchema>;
export type FxaMetricsOptOutEvent = z.infer<
  typeof fxaMetricsOptOutEventSchema
>;
export type FxaMetricsOptInEvent = z.infer<typeof fxaMetricsOptInEventSchema>;
export type FxaSecurityEventTokenPayload = z.infer<
  typeof fxaSecurityEventTokenPayloadSchema
>;
