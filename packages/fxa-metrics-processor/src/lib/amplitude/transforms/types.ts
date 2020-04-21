/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AmplitudeUserProperties } from './user-properties';
import { AmplitudeEventProperties } from './event-properties';

export enum GROUPS {
  activity = 'fxa_activity',
  button = 'fxa_rp_button',
  connectDevice = 'fxa_connect_device',
  email = 'fxa_email',
  emailFirst = 'fxa_email_first',
  login = 'fxa_login',
  notify = 'fxa_notify',
  registration = 'fxa_reg',
  rp = 'fxa_rp',
  settings = 'fxa_pref',
  sms = 'fxa_sms',
  sub = 'fxa_subscribe',
  subCancel = 'fxa_subscribe_cancel',
  subManage = 'fxa_subscribe_manage',
  subPayManage = 'fxa_pay_manage',
  subPaySetup = 'fxa_pay_setup',
  subPayUpgrade = 'fxa_pay_upgrade',
  subSupport = 'fxa_subscribe_support'
}

export type OptionalString = string | null;
export type Groups = typeof GROUPS;
export type Group = Groups[keyof Groups];
export type EventAndGroup = {
  event: string;
  group: Group;
};
export type PlainEvents = { [key: string]: EventAndGroup };
export type FuzzyEventGroup = {
  event: string | ((c: OptionalString, t: OptionalString) => OptionalString);
  group: Group | ((c: OptionalString) => OptionalString);
};
export type FuzzyEvents = Map<RegExp, FuzzyEventGroup>;
export type Event = {
  type: string;
  group: string;
  category?: OptionalString;
  target?: OptionalString;
};
export type Services = { [key: string]: string };
export type Device = { lastAccessTime: number };
type Newsletter =
  | 'firefox-accounts-journey'
  | 'knowledge-is-power'
  | 'take-action-for-the-internet'
  | 'test-pilot';
export type Location = { state: OptionalString; country: OptionalString };

export type RawEvent = {
  type: string;
  time: number;
  flowTime?: number;
  offset?: number;
};
export type EventContext = {
  eventSource: 'content' | 'auth' | 'oauth' | 'payments';
  version: string;
  browser?: string;
  browserVersion?: string;
  deviceId?: string;
  devices?: Device[];
  emailDomain?: string;
  emailSender?: string;
  emailService?: string;
  emailTypes?: { [key: string]: string };
  entrypoint_experiment?: string;
  entrypoint_variation?: string;
  entrypoint?: string;
  experiments?: { choice: string; group: string }[];
  flowBeginTime?: number;
  flowId?: string;
  lang?: string;
  location?: Location | {};
  marketingOptIn?: boolean;
  newsletters?: Newsletter[];
  planId?: string;
  productId?: string;
  service?: string;
  syncEngines?: string[];
  templateVersion?: string;
  uid?: string;
  userAgent?: string;
  userPreferences?: { [key: string]: string };
  utm_campaign?: string;
  utm_content?: string;
  utm_medium?: string;
  utm_source?: string;
  utm_term?: string;
};

export type AmplitudeHttpEvent = {
  op: 'amplitudeEvent';
  insert_id: string;
  user_id?: string;
  event_type: string;
  time: number;
  device_id?: string;
  session_id?: number;
  app_version?: string;
  language?: string;
  country?: string;
  region?: string;
  os_name?: string;
  os_version?: string;
  event_properties: AmplitudeEventProperties;
  user_properties: AmplitudeUserProperties;
};
