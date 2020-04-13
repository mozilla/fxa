/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Event, EventContext, Device } from './types';
import { toSnakeCase } from './common';
import { ParsedUserAgentProperties } from '../../../../../fxa-shared/metrics/user-agent';
import { mapBrowser, BrowserProps } from './user-agent';

const DAY = 1000 * 60 * 60 * 24;
const WEEK = DAY * 7;
const FOUR_WEEKS = WEEK * 4;

const NEWSLETTER_STATES = {
  optIn: 'subscribed',
  optOut: 'unsubscribed'
} as const;
type NewsLetterStates = typeof NEWSLETTER_STATES;
type NewsLetterStateKey = keyof NewsLetterStates;
type NewsLetterState = NewsLetterStates[NewsLetterStateKey];
type NewsLetterStateProp = { newsletter_state: NewsLetterState };
type NewsLettersProp = { newsletters: string[] };

type SyncDevices = {
  sync_device_count: number;
  sync_active_devices_day: number;
  sync_active_devices_week: number;
  sync_active_devices_month: number;
};
type SyncEngines = {
  sync_engines: string[];
};
export type AmplitudeUserProperties = Partial<
  SyncDevices &
    SyncEngines &
    NewsLetterStateProp &
    NewsLettersProp &
    BrowserProps & {
      entrypoint?: string;
      entrypoint_experiment?: string;
      entrypoint_variation?: string;
      flow_id?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_medium?: string;
      utm_source?: string;
      utm_term?: string;
    }
>;

export function mapAmplitudeUserProperties(
  evt: Event,
  context: EventContext,
  userAgent: ParsedUserAgentProperties
): AmplitudeUserProperties {
  const {
    entrypoint,
    entrypoint_experiment,
    entrypoint_variation,
    flowId: flowId,
    utm_campaign,
    utm_content,
    utm_medium,
    utm_source,
    utm_term
  } = context;

  return {
    entrypoint,
    entrypoint_experiment,
    entrypoint_variation,
    flow_id: flowId,
    utm_campaign,
    utm_content,
    utm_medium,
    utm_source,
    utm_term,
    ...mapBrowser(userAgent),
    ...mapSyncDevices(context),
    ...mapSyncEngines(context),
    ...mapNewsletterState(evt, context),
    ...mapNewsletters(context)
  };
}

function mapSyncDevices(context: EventContext): SyncDevices | {} {
  const { devices } = context;

  if (Array.isArray(devices)) {
    return {
      sync_device_count: devices.length,
      sync_active_devices_day: countDevices(devices, DAY),
      sync_active_devices_week: countDevices(devices, WEEK),
      sync_active_devices_month: countDevices(devices, FOUR_WEEKS)
    };
  }

  return {};
}

function countDevices(devices: Device[], period: number) {
  return devices.filter(device => device.lastAccessTime >= Date.now() - period).length;
}

function mapSyncEngines(context: EventContext): SyncEngines | {} {
  const { syncEngines: syncEngines } = context;

  if (Array.isArray(syncEngines) && syncEngines.length > 0) {
    return { sync_engines: syncEngines };
  }
  return {};
}

function mapNewsletterState(evt: Event, context: EventContext): NewsLetterStateProp | {} {
  let newsletterState;

  if (evt.category && evt.category in NEWSLETTER_STATES) {
    newsletterState = NEWSLETTER_STATES[evt.category as NewsLetterStateKey];
  }

  if (!newsletterState) {
    const { marketingOptIn } = context;

    if (marketingOptIn === true || marketingOptIn === false) {
      newsletterState = marketingOptIn ? 'subscribed' : 'unsubscribed';
    }
  }

  if (newsletterState) {
    return { newsletter_state: newsletterState };
  }

  return {};
}

function mapNewsletters(context: EventContext): NewsLettersProp | {} {
  const { newsletters: newslettersFromCtx } = context;
  if (newslettersFromCtx) {
    const newsletters = newslettersFromCtx.map(newsletter => {
      return toSnakeCase(newsletter);
    });
    return { newsletters };
  }
  return {};
}
