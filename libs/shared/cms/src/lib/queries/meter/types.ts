/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const METERING_CALENDAR_PERIODS = [
  'daily',
  'weekly',
  'monthly',
] as const;
export type MeteringCalendarPeriod = (typeof METERING_CALENDAR_PERIODS)[number];

export type MeteringWindow =
  | { kind: 'calendar'; period: MeteringCalendarPeriod }
  | { kind: 'sliding'; durationMs: number }
  | { kind: 'session'; durationMs: number };

export interface StrapiMeterWebhook {
  url: string;
  signingClientId: string;
}

interface StrapiMeterFields {
  slug: string;
  unit: string;
  limit: number;
  notificationThresholds: string;
  webhooks: StrapiMeterWebhook[];
}

export interface StrapiMeterRaw extends StrapiMeterFields {
  window: MeteringCalendarPeriod;
}

export interface StrapiMeter extends StrapiMeterFields {
  window: MeteringWindow;
}

export interface MeterBySlugResult {
  meters: StrapiMeterRaw[];
}

export type MeterBySlugVariables = {
  slug: string;
};
