/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { History } from '@reach/router';
import { waitFor } from '@testing-library/react';
import { Account, AppContext } from '../../models';
import { useAccountState } from '../../models/contexts/AccountStateContext';
import {
  mockAppContext,
  MOCK_ACCOUNT,
  renderWithRouter,
  mockSession,
} from '../../models/mocks';
import { Config } from '../../lib/config';
import { SETTINGS_PATH } from '../../constants';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import { Subject } from './mocks';

const mockSessionStatus = jest.fn();
const mockUseAccountData = jest.fn();
const mockAccountState = {
  isLoading: false,
  error: null,
  uid: 'mock-uid',
  email: 'johndoe@example.com',
  metricsEnabled: true,
  verified: true,
  primaryEmail: {
    email: 'johndoe@example.com',
    isPrimary: true,
    verified: true,
  },
  displayName: null,
  avatar: null,
  emails: [],
  totp: null,
  backupCodes: null,
  recoveryKey: null,
  recoveryPhone: null,
  attachedClients: [],
  linkedAccounts: [],
  subscriptions: [],
  securityEvents: [],
  accountCreated: null,
  passwordCreated: null,
  hasPassword: true,
  loadingFields: new Set<string>(),
  setAccountData: jest.fn(),
  updateField: jest.fn(),
  setLoading: jest.fn(),
  setFieldLoading: jest.fn(),
  setError: jest.fn(),
  clearAccount: jest.fn(),
};
jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useAuthClient: jest.fn(() => ({
    sessionStatus: mockSessionStatus,
  })),
}));

jest.mock('../../models/contexts/AccountStateContext', () => ({
  ...jest.requireActual('../../models/contexts/AccountStateContext'),
  useAccountState: jest.fn(),
}));

jest.mock('../../lib/hooks/useAccountData', () => ({
  ...jest.requireActual('../../lib/hooks/useAccountData'),
  useAccountData: (...args: any[]) => mockUseAccountData(...args),
}));

jest.mock('../../lib/totp-utils', () => {
  const mockBackupCodes = ['0123456789'];
  return {
    totpUtils: {
      generateRecoveryCodes: jest.fn().mockResolvedValue(mockBackupCodes),
    },
  };
});

jest.mock('./ScrollToTop', () => ({
  __esModule: true,
  ScrollToTop: ({ children }: { children: ReactNode }) => (
    <span data-testid="ScrollTop">{children}</span>
  ),
}));

// Mock the MFA guard so we can assert guarded pages render it without
// pulling in the guard's dependencies or child flows
const mockMfaGuard = jest.fn();
const mockMfaErrorHandler = jest.fn().mockReturnValue(false);
jest.mock('./MfaGuard', () => ({
  __esModule: true,
  MfaGuard: (props: any) => mockMfaGuard(props),
  useMfaErrorHandler: () => mockMfaErrorHandler,
}));

// Default behavior: render mock guard element
mockMfaGuard.mockImplementation(({ children }: { children: ReactNode }) => (
  <div data-testid="mfa-guard">MockMfaGuard</div>
));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

const mockNavigateWithQuery = jest.fn();
jest.mock('../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

const mockCurrentAccount = jest.fn();
jest.mock('../../lib/cache', () => ({
  ...jest.requireActual('../../lib/cache'),
  currentAccount: () => mockCurrentAccount(),
}));

describe('Settings App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Reset account state mock to default values
    (useAccountState as jest.Mock).mockReturnValue({
      ...mockAccountState,
      isLoading: false,
      error: null,
    });
    mockUseAccountData.mockReturnValue({
      isLoading: false,
      error: null,
      data: mockAccountState,
      refetch: jest.fn(),
      refetchField: jest.fn(),
    });
    mockNavigate.mockReset();
    mockSessionStatus.mockResolvedValue({
      details: {
        sessionVerified: true,
        sessionVerificationMeetsMinimumAAL: true,
      },
    });
    mockCurrentAccount.mockReturnValue({
      email: MOCK_ACCOUNT.primaryEmail.email,
      sessionToken: 'mock-session-token',
      uid: 'mock-uid',
      verified: true,
    });
  });

  it('renders `LoadingSpinner` component when loading initial state is true', () => {
    mockUseAccountData.mockReturnValue({
      isLoading: true,
      error: null,
      data: mockAccountState,
      refetch: jest.fn(),
      refetchField: jest.fn(),
    });
    const { getByLabelText } = renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>
    );

    expect(getByLabelText('Loading…')).toBeInTheDocument();
  });

  it('renders `AppErrorDialog` component when settings query errors', async () => {
    mockUseAccountData.mockReturnValue({
      isLoading: false,
      error: new Error('Error'),
      data: mockAccountState,
      refetch: jest.fn(),
      refetchField: jest.fn(),
    });
    const { getByTestId } = renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>
    );

    // Wait for sessionStatus to be called - the component needs this to get past the loading check
    await waitFor(() => {
      expect(mockSessionStatus).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByTestId('error-loading-app')).toBeInTheDocument();
    });
  });

  it('redirects to root if account is not verified', async () => {
    // this warning is expected, so we don't want to see it in the test output
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation((msg) => {
      if (
        msg === 'Account or email verification is require to access /settings!'
      )
        return;
    });
    const unverifiedAccount = {
      ...MOCK_ACCOUNT,
      primaryEmail: {
        ...MOCK_ACCOUNT.primaryEmail,
        verified: false,
      },
      emails: MOCK_ACCOUNT.emails.map((email) =>
        email.isPrimary ? { ...email, verified: false } : email
      ),
    } as unknown as Account;

    renderWithRouter(
      <AppContext.Provider
        value={mockAppContext({ account: unverifiedAccount })}
      >
        <Subject />
      </AppContext.Provider>,
      { route: SETTINGS_PATH }
    );

    await waitFor(() => {
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/');
    });
    warnSpy.mockRestore();
  });

  it('redirects to root if session is not verified and mustVerify is true', async () => {
    // this warning is expected, so we don't want to see it in the test output
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation((msg) => {
      if (
        msg ===
        'Account or session verification is required to access /settings!'
      )
        return;
    });
    const unverifiedSession = mockSession(false);
    mockSessionStatus.mockResolvedValue({
      details: {
        sessionVerified: false,
        mustVerify: true,
        sessionVerificationMeetsMinimumAAL: true,
      },
    });

    renderWithRouter(
      <AppContext.Provider
        value={mockAppContext({ session: unverifiedSession })}
      >
        <Subject />
      </AppContext.Provider>,
      { route: SETTINGS_PATH }
    );

    await waitFor(() => {
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/');
    });
    warnSpy.mockRestore();
  });

  it('allows access when session is not verified but mustVerify is false', async () => {
    const unverifiedSession = mockSession(false);
    mockSessionStatus.mockResolvedValue({
      details: {
        sessionVerified: false,
        mustVerify: false,
        sessionVerificationMeetsMinimumAAL: true,
      },
    });

    renderWithRouter(
      <AppContext.Provider
        value={mockAppContext({ session: unverifiedSession })}
      >
        <Subject />
      </AppContext.Provider>,
      { route: SETTINGS_PATH }
    );

    // Wait for sessionStatus to resolve and guard logic to execute
    await waitFor(() => {
      expect(mockSessionStatus).toHaveBeenCalled();
    });

    // Should NOT redirect to root — mustVerify is false so unverified session is allowed
    expect(mockNavigateWithQuery).not.toHaveBeenCalledWith('/');
  });

  it('redirects to root when sessionStatus call fails', async () => {
    // this warning is expected, so we don't want to see it in the test output
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation((msg) => {
      if (
        msg === 'Account or email verification is require to access /settings!'
      )
        return;
    });
    mockSessionStatus.mockRejectedValue(new Error('Session status failed'));

    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>,
      { route: SETTINGS_PATH }
    );

    await waitFor(() => {
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/');
    });
    warnSpy.mockRestore();
  });

  it('redirects to signin_totp_code with correct state when AAL is not met', async () => {
    // this warning is expected, so we don't want to see it in the test output
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation((msg) => {
      if (msg === '2FA must be entered to access /settings!') return;
    });
    mockSessionStatus.mockResolvedValue({
      details: {
        sessionVerified: true,
        sessionVerificationMeetsMinimumAAL: false,
      },
    });

    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>,
      { route: SETTINGS_PATH }
    );

    await waitFor(() => {
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/signin_totp_code', {
        state: {
          email: MOCK_ACCOUNT.primaryEmail.email,
          sessionToken: 'mock-session-token',
          uid: 'mock-uid',
          verified: true,
          isSessionAALUpgrade: true,
        },
      });
    });
    warnSpy.mockRestore();
  });

  it('routes to PageSettings', async () => {
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>,
      {
        route: SETTINGS_PATH,
      }
    );

    await navigate(SETTINGS_PATH);

    expect(getByTestId('settings-profile')).toBeInTheDocument();
  });

  it('routes to PageDisplayName', async () => {
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>,
      { route: SETTINGS_PATH }
    );

    await navigate(SETTINGS_PATH + '/display_name');

    expect(getByTestId('input-label')).toHaveTextContent('Enter display name');
  });

  it('routes to PageAvatar', async () => {
    const {
      getAllByTestId,
      history: { navigate },
    } = renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>,
      {
        route: SETTINGS_PATH,
      }
    );

    await navigate(SETTINGS_PATH + '/avatar');

    expect(getAllByTestId('avatar-nondefault')[0]).toBeInTheDocument();
  });
  it('routes to PageChangePassword', async () => {
    // Suppress MFA guard for this test
    mockMfaGuard.mockImplementationOnce(
      ({ children }: { children: ReactNode }) => <>{children}</>
    );

    // Mock the JWT token cache to suppress MFA guard
    const mockJwtTokenCache = {
      hasToken: jest.fn().mockReturnValue(true),
      getToken: jest.fn().mockReturnValue('mock-jwt-token'),
      setToken: jest.fn(),
      removeToken: jest.fn(),
      subscribe: jest.fn(),
      getSnapshot: jest.fn(),
      getKey: jest.fn(),
    };

    jest.mock('../../lib/cache', () => ({
      ...jest.requireActual('../../lib/cache'),
      JwtTokenCache: mockJwtTokenCache,
    }));

    const session = mockSession(true);
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(
      <AppContext.Provider value={mockAppContext({ session })}>
        <Subject />
      </AppContext.Provider>,
      { route: SETTINGS_PATH }
    );

    await navigate(SETTINGS_PATH + '/change_password');

    expect(getByTestId('change-password-requirements')).toBeInTheDocument();
  });

  it('routes to PageDeleteAccount', async () => {
    const session = mockSession(true);
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(
      <AppContext.Provider value={mockAppContext({ session })}>
        <Subject />
      </AppContext.Provider>,
      { route: SETTINGS_PATH }
    );

    await navigate(SETTINGS_PATH + '/delete_account');

    expect(getByTestId('delete-account-confirm')).toBeInTheDocument();
  });

  it('redirects to ConnectedServices', async () => {
    const {
      history,
      history: { navigate },
    } = renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>,
      {
        route: SETTINGS_PATH,
      }
    );

    await navigate(SETTINGS_PATH + '/clients');

    expect(history.location.pathname).toBe('/settings#connected-services');
  });

  it('redirects to PageAvatar', async () => {
    const {
      history,
      history: { navigate },
    } = renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>,
      {
        route: SETTINGS_PATH,
      }
    );

    await navigate(SETTINGS_PATH + '/avatar/change');

    expect(history.location.pathname).toBe('/settings/avatar');
  });

  describe('guarded routes render MFA guard', () => {
    // as new guards are added to pages we just add the page name and route here
    // hasPassword is used to pass needed context to `mockAppContext`
    const guardedRoutes = [
      {
        pageName: 'PageMfaGuardTestWithAuthClient',
        route: '/mfa_guard/test/auth_client',
        hasPassword: false,
      },
      {
        pageName: 'Page2faChange',
        route: '/two_step_authentication/change',
        hasPassword: false,
      },
      {
        pageName: 'PageSecondaryEmailAdd',
        route: '/emails',
        hasPassword: false,
      },
      {
        pageName: 'PageSecondaryEmailVerify',
        route: '/emails/verify',
        hasPassword: false,
      },
      {
        pageName: 'Page2faReplaceBackupCodes',
        route: '/two_step_authentication/replace_codes',
        hasPassword: false,
      },
      {
        pageName: 'PageRecoveryPhoneSetup',
        route: '/recovery_phone/setup',
        hasPassword: false,
      },
      {
        pageName: 'PageRecoveryKeyCreate',
        route: '/account_recovery',
        hasPassword: true,
      },
      {
        pageName: 'PageChangePassword',
        route: '/change_password',
        hasPassword: true,
      },
      {
        pageName: 'PageRecoveryPhoneRemove',
        route: '/recovery_phone/remove',
        hasPassword: false,
      },
      {
        pageName: 'Page2faSetup',
        route: '/two_step_authentication',
        hasPassword: false,
      },
    ];

    it.each(guardedRoutes)(
      'renders $pageName with MFA guard',
      async ({ route, hasPassword }) => {
        const session = mockSession(true);
        const account = {
          ...MOCK_ACCOUNT,
          hasPassword,
        } as unknown as Account;
        const {
          getByTestId,
          history: { navigate },
        } = renderWithRouter(
          <AppContext.Provider value={mockAppContext({ session, account })}>
            <Subject />
          </AppContext.Provider>,
          { route: SETTINGS_PATH }
        );
        await navigate(SETTINGS_PATH + route);

        expect(getByTestId('mfa-guard')).toBeInTheDocument();
      }
    );
  });

  describe('prevents access to certain routes when account has no password', () => {
    let history: History;

    beforeEach(async () => {
      const account = {
        ...MOCK_ACCOUNT,
        hasPassword: false,
      } as unknown as Account;

      const config = {
        l10n: { strict: true },
        metrics: { navTiming: { enabled: true, endpoint: '/foobar' } },
      } as Config;

      ({ history } = renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account, config })}>
          <AppLocalizationProvider
            messages={{ en: ['testo: lol'] }}
            reportError={() => {}}
          >
            <Subject />
          </AppLocalizationProvider>
        </AppContext.Provider>,
        { route: SETTINGS_PATH }
      ));
    });

    it('redirects PageRecoveryKeyCreate', async () => {
      await history.navigate(SETTINGS_PATH + '/account_recovery');
      expect(history.location.pathname).toBe('/settings');
    });

    it('redirects ChangePassword', async () => {
      await history.navigate(SETTINGS_PATH + '/change_password');
      expect(history.location.pathname).toBe('/settings/create_password');
    });
  });
});
