/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import firefox, { FirefoxCommand } from '../../lib/channels/firefox';
import { AlertBarInfo } from '../AlertBarInfo';
import { getCurrentAccountUid, updateExtendedAccountState } from '../../lib/account-storage';

// TODO, move some values from AppContext to SettingsContext after
// using container components, FXA-8107
export interface SettingsContextValue {
  alertBarInfo?: AlertBarInfo;
  navigatorLanguages?: readonly string[];
}

export function initializeSettingsContext() {
  const alertBarInfo = new AlertBarInfo();

  const isForCurrentUser = (event: Event) => {
    const currentUid = getCurrentAccountUid();
    if (!currentUid) {
      return false;
    }
    const eventUid = (event as CustomEvent).detail?.uid;
    return currentUid != null && currentUid === eventUid;
  };

  firefox.addEventListener(FirefoxCommand.ProfileChanged, (event) => {
    if (isForCurrentUser(event)) {
      // Profile changed events will trigger a refetch via useAccountData
      // The localStorage will be updated when the data is fetched
      window.dispatchEvent(
        new CustomEvent('localStorageChange', {
          detail: { key: 'profileChanged' },
        })
      );
    }
  });

  firefox.addEventListener(FirefoxCommand.PasswordChanged, (event) => {
    if (isForCurrentUser(event)) {
      // Update passwordCreated in localStorage
      updateExtendedAccountState({ passwordCreated: Date.now() });
    }
  });

  firefox.addEventListener(FirefoxCommand.AccountDeleted, (event) => {
    if (isForCurrentUser(event)) {
      window.location.assign('/');
    }
  });

  firefox.addEventListener(FirefoxCommand.Error, (event) => {
    console.error(event);
  });

  const context: SettingsContextValue = {
    alertBarInfo,
    navigatorLanguages: navigator.languages || ['en'],
  };

  return context;
}

export function defaultSettingsContext(context?: SettingsContextValue) {
  return Object.assign(
    {
      alertBarInfo: new AlertBarInfo(),
      navigatorLanguages: navigator.languages || ['en'],
    },
    context
  ) as SettingsContextValue;
}

export const SettingsContext = React.createContext<SettingsContextValue>(
  defaultSettingsContext()
);
