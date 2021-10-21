/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { AccountData, Session } from '.';
import { AppContextValue } from './AppContext';
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';
import { render } from '@testing-library/react';
import { getDefault } from '../lib/config';
import { AlertBarInfo } from './AlertBarInfo';

export const MOCK_ACCOUNT: AccountData = {
  uid: 'abc123',
  displayName: 'John Dope',
  avatar: {
    id: 'abc1234',
    url: 'http://placekitten.com/512/512',
    isDefault: false,
  },
  accountCreated: 123456789,
  passwordCreated: 123456789,
  recoveryKey: true,
  metricsEnabled: true,
  attachedClients: [],
  subscriptions: [],
  primaryEmail: {
    email: 'johndope@example.com',
    isPrimary: true,
    verified: true,
  },
  emails: [
    {
      email: 'johndope@example.com',
      isPrimary: true,
      verified: true,
    },
  ],
  totp: {
    exists: true,
    verified: true,
  },
};

export function renderWithRouter(
  ui: any,
  { route = '/', history = createHistory(createMemorySource(route)) } = {}
) {
  return {
    ...render(<LocationProvider {...{ history }}>{ui}</LocationProvider>),
    history,
  };
}

export function mockSession(verified: boolean = true) {
  return {
    verified,
    token: 'deadc0de',
  } as Session;
}

export const mockEmail = (
  email: string,
  isPrimary = true,
  verified = true
) => ({
  email,
  isPrimary,
  verified,
});

export function mockAppContext(context?: AppContextValue) {
  return Object.assign(
    {
      account: MOCK_ACCOUNT,
      session: mockSession(),
      config: getDefault(),
      alertBarInfo: new AlertBarInfo(),
    },
    context
  ) as AppContextValue;
}
