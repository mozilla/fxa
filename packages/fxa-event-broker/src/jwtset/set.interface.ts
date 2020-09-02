/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// SET Event identifiers
export const DELETE_EVENT_ID =
  'https://schemas.accounts.firefox.com/event/delete-user';
export const PASSWORD_EVENT_ID =
  'https://schemas.accounts.firefox.com/event/password-change';
export const PROFILE_EVENT_ID =
  'https://schemas.accounts.firefox.com/event/profile-change';
export const SUBSCRIPTION_STATE_EVENT_ID =
  'https://schemas.accounts.firefox.com/event/subscription-state-change';

export type deleteEvent = {
  clientId: string;
  uid: string;
};

export type passwordEvent = {
  uid: string;
  clientId: string;
  changeTime: number;
};

export type profileEvent = deleteEvent;

export type securityEvent = {
  uid: string;
  clientId: string;
  events?: {
    [key: string]: {
      [key: string]: any;
    };
  };
};

export type subscriptionEvent = {
  uid: string;
  clientId: string;
  capabilities: string[];
  isActive: boolean;
  changeTime: number;
};
