/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import { AccountData, ProfileInfo, Session } from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import {
  AppContext,
  AppContextValue,
  defaultAppContext,
  SettingsContextValue,
} from './contexts/AppContext';

import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
} from 'react-router';
import type { MemoryRouterProps } from 'react-router';
import { act } from '@testing-library/react';
import { getDefault } from '../lib/config';
import { AlertBarInfo } from './AlertBarInfo';
import { RouterWindow } from '../lib/window';
import { UrlQueryData } from '../lib/model-data';
import { SensitiveDataClient } from '../lib/sensitive-data-client';

const DEFAULT_APP_CONTEXT = defaultAppContext();
export const MOCK_ACCOUNT: AccountData =
  DEFAULT_APP_CONTEXT.account as unknown as AccountData;

export const MOCK_SESSION: Session =
  DEFAULT_APP_CONTEXT.session as unknown as Session;

type RouteEntry = NonNullable<MemoryRouterProps['initialEntries']>[number];

function normalizeEntry(entry: RouteEntry): RouteEntry {
  if (typeof entry === 'string' && !entry.startsWith('/')) {
    return `/${entry}`;
  }
  return entry;
}

export function createHistoryWithQuery(
  path: string,
  queryParams?: string,
  state?: object
): RouteEntry {
  return {
    pathname: path,
    search: queryParams || '',
    ...(state !== undefined && { state }),
  };
}

export function createAppContext() {
  const appCtx = {
    authClient: {},
  } as AppContextValue;

  return appCtx;
}

function createTestRouter(ui: any, route: RouteEntry = '/') {
  return createMemoryRouter(
    [{ path: '*', element: ui }],
    { initialEntries: [normalizeEntry(route)] }
  );
}

export function produceComponent(
  ui: any,
  { route = '/' as RouteEntry } = {},
  appCtx?: AppContextValue
) {
  const content = (
    <MemoryRouter initialEntries={[normalizeEntry(route)]}>
      {ui}
    </MemoryRouter>
  );

  if (appCtx) {
    return (
      <AppContext.Provider value={appCtx}>
        {content}
      </AppContext.Provider>
    );
  }

  return content;
}

export function renderWithRouter(
  ui: any,
  { route = '/' as RouteEntry } = {},
  appCtx?: AppContextValue
) {
  const router = createTestRouter(ui, route);

  const content = <RouterProvider router={router} />;

  const wrapped = appCtx ? (
    <AppContext.Provider value={appCtx}>
      {content}
    </AppContext.Provider>
  ) : (
    content
  );

  // Wrap the router's navigate in act() so React processes state updates
  const wrappedRouter = {
    get state() {
      return router.state;
    },
    async navigate(
      to: string | number,
      options?: { replace?: boolean; state?: any }
    ) {
      await act(async () => {
        await router.navigate(to as any, options);
      });
    },
  };

  return {
    ...renderWithLocalizationProvider(wrapped),
    router: wrappedRouter,
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

export function mockAuthClient() {
  const mockSessionStatus = {
    state: 'verified',
    details: {
      verified: true,
      accountEmailVerified: true,
      sessionVerified: true,
      sessionVerificationMeetsMinimumAAL: true,
      sessionVerificationMethod: 'email',
    },
  };
  // There are plenty more methods to mock here, but this is these are the ones
  // that get commonly used.
  if (typeof jest !== 'undefined') {
    return {
      sessionStatus: jest.fn().mockResolvedValue(mockSessionStatus),
      sessionResendVerifyCode: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthClient;
  } else {
    return {
      sessionStatus: () => Promise.resolve(mockSessionStatus),
      sessionResendVerifyCode: () => Promise.resolve(undefined),
    } as unknown as AuthClient;
  }
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
  const window = new RouterWindow();
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

function mockExperiment() {
  return Promise.resolve({
    Features: {
      'example-feature': {
        enabled: true,
        emoji: ':)',
      },
    },
    Enrollments: [
      {
        nimbus_user_id: '4a9512ac-3110-43df-aa8a-958A3d210b9c3',
      },
    ],
  });
}

export function mockAppContext(context?: AppContextValue) {
  const base = Object.assign(
    {
      authClient: mockAuthClient(),
      account: MOCK_ACCOUNT,
      session: mockSession(),
      config: getDefault(),
      sensitiveDataClient: mockSensitiveDataClient(),
      uniqueUserId: '4a9512ac-3110-43df-aa8a-958A3d210b9c3',
      experiments: mockExperiment(),
    },
    context
  ) as AppContextValue;
  // Ensure a sane default for MFA OTP expiry minutes to avoid flakiness in tests
  try {
    if (base.config?.mfa?.otp?.expiresInMinutes === 0) {
      base.config.mfa.otp.expiresInMinutes = 1;
    }
  } catch {}
  return base;
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
