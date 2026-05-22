/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const METERING_WINDOWS = ['daily', 'weekly', 'monthly'] as const;
export type MeteringWindow = (typeof METERING_WINDOWS)[number];

export interface StrapiMeterWebhook {
  url: string;
  signingClientId: string;
}

export interface StrapiMeter {
  slug: string;
  unit: string;
  limit: number;
  window: MeteringWindow;
  notificationThresholds: number[];
  webhooks: StrapiMeterWebhook[];
}

export interface MeterBySlugResult {
  meters: StrapiMeter[];
}

export type MeterBySlugVariables = {
  slug: string;
};
