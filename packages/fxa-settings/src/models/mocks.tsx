/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { AccountData, ProfileInfo, Session } from '.';
import { AppContext, AppContextValue, defaultAppContext } from './AppContext';

import {
  createHistory,
  createMemorySource,
  LocationProvider,
  History,
} from '@reach/router';
import { render } from '@testing-library/react';
import { getDefault } from '../lib/config';
import { AlertBarInfo } from './AlertBarInfo';
import { ReachRouterWindow } from '../lib/window';
import { UrlHashData, UrlQueryData } from '../lib/model-data';

const DEFAULT_APP_CONTEXT = defaultAppContext();
export const MOCK_ACCOUNT: AccountData =
  DEFAULT_APP_CONTEXT.account as unknown as AccountData;

export function createHistoryWithQuery(path: string, queryParams?: string) {
  const history = createHistory(createMemorySource(path));
  if (queryParams) {
    history.location.search = queryParams;
  }
  return history;
}

export function createAppContext(history: History) {
  const windowWrapper = new ReachRouterWindow(history);
  const appCtx = {
    windowWrapper,
    urlQueryData: new UrlQueryData(windowWrapper),
    urlHashData: new UrlHashData(windowWrapper),
    oauthClient: {},
    authClient: {},
    storageData: {},
  } as AppContextValue;
  return appCtx;
}

export function produceComponent(
  ui: any,
  { route = '/', history = createHistory(createMemorySource(route)) } = {},
  appCtx?: AppContextValue
) {
  if (appCtx) {
    return (
      <AppContext.Provider value={appCtx}>
        <LocationProvider {...{ history }}>{ui}</LocationProvider>
      </AppContext.Provider>
    );
  }
  return <LocationProvider {...{ history }}>{ui}</LocationProvider>;
}

export function renderWithRouter(
  ui: any,
  { route = '/', history = createHistory(createMemorySource('/')) } = {},
  appCtx?: AppContextValue
) {
  if (!appCtx) {
    return {
      ...render(<LocationProvider {...{ history }}>{ui}</LocationProvider>),
      history,
    };
  }

  return {
    ...render(produceComponent(ui, { route, history }, appCtx)),
    history,
  };
}

export function mockSession(verified: boolean = true) {
  return {
    verified,
    token: 'deadc0de',
  } as Session;
}

export function mockStorage() {
  return {
    get: () => 'deadc0de',
    setItem(key: string, value: string) {
      return;
    },
  };
}

export const mockEmail = (
  email = 'johndope@example.com',
  isPrimary = true,
  verified = true
) => ({
  email,
  isPrimary,
  verified,
});

export const MOCK_PROFILE_INFO: ProfileInfo = {
  uid: MOCK_ACCOUNT.uid,
  displayName: null,
  avatar: {
    id: null,
    url: null,
  },
  primaryEmail: MOCK_ACCOUNT.primaryEmail,
  emails: MOCK_ACCOUNT.emails,
};

export function mockAppContext(context?: AppContextValue) {
  return Object.assign(
    {
      account: MOCK_ACCOUNT,
      session: mockSession(),
      config: getDefault(),
      alertBarInfo: new AlertBarInfo(),
      storageData: mockStorage(),
    },
    context
  ) as AppContextValue;
}
