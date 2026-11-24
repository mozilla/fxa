/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { SETTINGS_PATH } from '../../../constants';
import {
  mockAppContext,
  mockSettingsContext,
  renderWithRouter,
} from '../../../models/mocks';

import PageChangePassword from '.';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../../lib/metrics';
import { AppContext, Account } from '../../../models';
import { MfaContext } from '../../../lib/hooks';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import {
  inputCurrentPassword,
  inputNewPassword,
  inputVerifyPassword,
} from '../../FormPassword/index.test';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../models/AlertBarInfo');
jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  settingsViewName: 'quuz',
}));
jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      changePasswordView: jest.fn(),
      changePasswordSuccess: jest.fn(),
      changePasswordEngage: jest.fn(),
      changePasswordFormSubmit: jest.fn(),
      changePasswordError: jest.fn(),
    },
  },
}));
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

// Mock authClient with basic functions needed for password change
const mockAuthClient = {
  passwordChangeWithJWT: jest.fn().mockResolvedValue({
    uid: 'test-uid',
    sessionToken: 'new-session-token',
    verified: true,
    authAt: Date.now(),
  }),
  sessionReauth: jest.fn().mockResolvedValue({
    uid: 'test-uid',
    sessionToken: 'reauth-session-token',
    keyFetchToken: 'key-fetch-token',
    unwrapBKey: 'unwrap-b-key',
    emailVerified: true,
    sessionVerified: true,
    authAt: Date.now(),
  }),
  accountKeys: jest.fn().mockResolvedValue({
    kA: 'kA-key',
    kB: 'kB-key',
  }),
  sessionStatus: jest.fn().mockResolvedValue({
    state: 'verified',
    details: {
      sessionVerified: true,
    },
  }),
} as any; // Use 'as any' to avoid TypeScript strict typing for mock

// Mock the cache module to provide session token and JWT cache
const mockSessionToken = 'mock-session-token';
const mockJwtState: Record<string, string> = {
  [`${mockSessionToken}-password`]: 'mock-jwt-token',
};
jest.mock('../../../lib/cache', () => {
  const actual = jest.requireActual('../../../lib/cache');
  return {
    __esModule: true,
    ...actual,
    sessionToken: () => mockSessionToken,
    JwtTokenCache: {
      subscribe: jest.fn((callback) => {
        // Return unsubscribe function
        return () => {};
      }),
      getSnapshot: jest.fn(() => mockJwtState),
      hasToken: jest.fn((sessionToken: string, scope: string) => {
        const key = `${sessionToken}-${scope}`;
        return mockJwtState[key] != null;
      }),
      setToken: jest.fn(),
      getToken: jest.fn((sessionToken: string, scope: string) => {
        const key = `${sessionToken}-${scope}`;
        return mockJwtState[key] || 'mock-jwt-token';
      }),
      removeToken: jest.fn(),
    },
  };
});

const account = {
  primaryEmail: {
    email: 'test@example.com',
  },
  authClient: mockAuthClient,
  changePassword: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const settingsContext = mockSettingsContext();

const render = async (mockAccount = account) => {
  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({
        account: mockAccount,
        authClient: mockAuthClient,
      })}
    >
      <SettingsContext.Provider value={settingsContext}>
        <MfaContext.Provider value="password">
          <PageChangePassword />
        </MfaContext.Provider>
      </SettingsContext.Provider>
    </AppContext.Provider>
  );
};

const changePassword = async () => {
  await inputCurrentPassword('quuz');
  await inputNewPassword('testotesto');
  await inputVerifyPassword('testotesto');
  await act(async () => {
    fireEvent.click(screen.getByTestId('save-password-button'));
  });
};

describe('PageChangePassword', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders', async () => {
    await render();
    expect(screen.getByTestId('flow-container')).toBeInTheDocument();
    screen.getByLabelText('Enter current password');
    expect(screen.getByTestId('nav-link-reset-password')).toBeInTheDocument();
  });

  it('emits a metrics event on render', async () => {
    await render();
    expect(usePageViewEvent).toHaveBeenCalledWith('settings.change-password');
  });

  it('emits a metrics event on success', async () => {
    await render();
    await changePassword();
    expect(logViewEvent).toHaveBeenCalledWith(
      settingsViewName,
      'change-password.success'
    );
  });

  it('shows an error when old and new password are the same', async () => {
    await render();
    await inputCurrentPassword('testotesto');
    await inputNewPassword('testotesto');
    await inputVerifyPassword('testotesto');
    await act(async () => {
      fireEvent.click(screen.getByTestId('save-password-button'));
    });

    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveTextContent(
      'new password must be different'
    );
  });

  it.each([
    { name: 'INCORRECT_PASSWORD', error: AuthUiErrors.INCORRECT_PASSWORD },
    { name: 'INCORRECT_EMAIL_CASE', error: AuthUiErrors.INCORRECT_EMAIL_CASE },
  ])(
    'shows an incorrect password error message in tooltip for $name',
    async ({ error }) => {
      const mockAccount = {
        primaryEmail: {
          email: 'test@example.com',
        },
        changePassword: jest.fn().mockRejectedValue(error),
      } as unknown as Account;
      await render(mockAccount);
      await changePassword();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toHaveTextContent(
        'Incorrect password'
      );
    }
  );

  it('shows an unexpected error message in alertBar when error is unknown', async () => {
    const mockAccount = {
      primaryEmail: {
        email: 'test@example.com',
      },
      changePassword: jest.fn().mockRejectedValue({ error: 'bloop' }),
    } as unknown as Account;
    await render(mockAccount);
    await changePassword();
    await waitFor(() =>
      expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledTimes(1)
    );
    expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledWith(
      'Unexpected error'
    );
  });

  describe('glean metrics', () => {
    it('records the view event once on render', async () => {
      await render();
      expect(GleanMetrics.accountPref.changePasswordView).toHaveBeenCalledTimes(
        1
      );
    });

    it('records engage, submit and success once on success', async () => {
      await render();
      await changePassword();
      expect(
        GleanMetrics.accountPref.changePasswordEngage
      ).toHaveBeenCalledTimes(1);
      expect(
        GleanMetrics.accountPref.changePasswordFormSubmit
      ).toHaveBeenCalledTimes(1);
      expect(
        GleanMetrics.accountPref.changePasswordSuccess
      ).toHaveBeenCalledTimes(1);
      expect(
        GleanMetrics.accountPref.changePasswordError
      ).not.toHaveBeenCalled();
    });

    it('does not record success when old and new password are the same', async () => {
      await render();
      await inputCurrentPassword('testotesto');
      await inputNewPassword('testotesto');
      await inputVerifyPassword('testotesto');
      await act(async () => {
        fireEvent.click(screen.getByTestId('save-password-button'));
      });
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      expect(
        GleanMetrics.accountPref.changePasswordFormSubmit
      ).not.toHaveBeenCalled();
      expect(
        GleanMetrics.accountPref.changePasswordSuccess
      ).not.toHaveBeenCalled();
    });

    it.each([
      {
        name: 'an MFA error',
        error: AuthUiErrors.INVALID_MFA_TOKEN,
        errorEvents: 0,
      },
      {
        name: 'an incorrect password',
        error: AuthUiErrors.INCORRECT_PASSWORD,
        errorEvents: 1,
      },
      { name: 'an unknown error', error: { error: 'bloop' }, errorEvents: 1 },
    ])(
      'records $errorEvents error events and no success on $name',
      async ({ error, errorEvents }) => {
        const mockAccount = {
          primaryEmail: {
            email: 'test@example.com',
          },
          changePassword: jest.fn().mockRejectedValue(error),
        } as unknown as Account;
        await render(mockAccount);
        await changePassword();
        expect(mockAccount.changePassword).toHaveBeenCalled();
        expect(
          GleanMetrics.accountPref.changePasswordFormSubmit
        ).toHaveBeenCalledTimes(1);
        expect(
          GleanMetrics.accountPref.changePasswordError
        ).toHaveBeenCalledTimes(errorEvents);
        expect(
          GleanMetrics.accountPref.changePasswordSuccess
        ).not.toHaveBeenCalled();
      }
    );
  });

  it('redirects on success', async () => {
    await render();
    await changePassword();
    await waitFor(() =>
      expect(settingsContext.alertBarInfo?.success).toHaveBeenCalledTimes(1)
    );
    expect(mockNavigate).toHaveBeenCalledWith(SETTINGS_PATH + '#password', {
      replace: true,
    });
  });
});
