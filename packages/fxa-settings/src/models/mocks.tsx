/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { AccountData, ProfileInfo, Session } from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import {
  AppContext,
  AppContextValue,
  defaultAppContext,
  SettingsContextValue,
} from '.';

import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';
import { getDefault } from '../lib/config';
import { AlertBarInfo } from './AlertBarInfo';
import { ReachRouterWindow } from '../lib/window';
import { UrlQueryData } from '../lib/model-data';
import { SensitiveDataClient } from '../lib/sensitive-data-client';

const DEFAULT_APP_CONTEXT = defaultAppContext();
export const MOCK_ACCOUNT: AccountData =
  DEFAULT_APP_CONTEXT.account as unknown as AccountData;

export const MOCK_SESSION: Session =
  DEFAULT_APP_CONTEXT.session as unknown as Session;

export function createHistoryWithQuery(path: string, queryParams?: string) {
  const history = createHistory(createMemorySource(path));
  if (queryParams != null) {
    history.location.search = queryParams;
  }
  return history;
}

export function createAppContext() {
  const appCtx = {
    authClient: {},
  } as AppContextValue;

  return appCtx;
}

export function produceComponent(
  ui: any,
  { route = '/', history = createHistory(createMemorySource(route)) } = {},
  appCtx?: AppContextValue
) {
  // Note that integrations are application instances. Reset them
  // to ensure a clean slate between storybook renders.

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
      ...renderWithLocalizationProvider(
        <LocationProvider {...{ history }}>{ui}</LocationProvider>
      ),
      history,
    };
  }

  return {
    ...renderWithLocalizationProvider(
      produceComponent(ui, { route, history }, appCtx)
    ),
    history,
  };
}

export function mockSession(
  verified: boolean = true,
  isError: boolean = false
) {
  const session = {
    verified,
    token: 'deadc0de',
  } as Session;
  if (typeof jest !== 'undefined') {
    session.destroy = isError
      ? jest.fn().mockRejectedValue(new Error())
      : jest.fn().mockResolvedValue(true);
    session.sendVerificationCode = isError
      ? jest.fn().mockRejectedValue(new Error())
      : jest.fn().mockResolvedValue(true);
    session.verifySession = isError
      ? jest.fn().mockRejectedValue(new Error())
      : jest.fn().mockResolvedValue(true);
    session.isSessionVerified = jest.fn().mockResolvedValue(session.verified);
  } else {
    session.destroy = isError
      ? () => Promise.reject(new Error())
      : () => Promise.resolve();
    session.sendVerificationCode = isError
      ? () => Promise.reject(new Error())
      : () => Promise.resolve();
    session.verifySession = isError
      ? () => Promise.reject(new Error())
      : () => Promise.resolve();
    session.isSessionVerified = () => Promise.resolve(session.verified);
  }

  return session;
}

export function mockSensitiveDataClient() {
  return new SensitiveDataClient();
}

export function mockStorage() {
  return {
    get: () => 'deadc0de',
    setItem(key: string, value: string) {
      return;
    },
  };
}

export function mockUrlQueryData(params: Record<string, string | undefined>) {
  const window = new ReachRouterWindow();
  const data = new UrlQueryData(window);
  for (const param of Object.keys(params)) {
    data.set(param, params[param]);
  }
  return data;
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
      sensitiveDataClient: mockSensitiveDataClient(),
      uniqueUserId: '4a9512ac-3110-43df-aa8a-958A3d210b9c3',
    },
    context
  ) as AppContextValue;
}

export function mockSettingsContext(context?: SettingsContextValue) {
  return Object.assign(
    {
      alertBarInfo: new AlertBarInfo(),
      navigatorLanguages: navigator.languages || ['en'],
    },
    context
  );
}
