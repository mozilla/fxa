/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { History } from '@reach/router';
import { waitFor } from '@testing-library/react';
import { Account, AppContext, useInitialSettingsState } from '../../models';
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

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useInitialSettingsState: jest.fn(),
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
jest.mock('./MfaGuard', () => ({
  __esModule: true,
  MfaGuard: (props: any) => mockMfaGuard(props),
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

describe('Settings App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (useInitialSettingsState as jest.Mock).mockReturnValue({ loading: false });
    mockNavigate.mockReset();
  });

  it('renders `LoadingSpinner` component when loading initial state is true', () => {
    (useInitialSettingsState as jest.Mock).mockReturnValueOnce({
      loading: true,
    });
    const { getByLabelText } = renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>
    );

    expect(getByLabelText('Loading…')).toBeInTheDocument();
  });

  it('renders `AppErrorDialog` component when settings query errors', async () => {
    (useInitialSettingsState as jest.Mock).mockReturnValue({
      error: { message: 'Error' },
    });
    const { getByRole } = renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(getByRole('heading', { level: 2 })).toHaveTextContent(
        'General application error'
      );
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

  it('redirects to root if session is not verified', async () => {
    // this warning is expected, so we don't want to see it in the test output
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation((msg) => {
      if (
        msg === 'Account or email verification is require to access /settings!'
      )
        return;
    });
    const unverifiedSession = mockSession(false);

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

  it('redirects to CreatePassword', async () => {
    const {
      history,
      history: { navigate },
    } = renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>,
      { route: SETTINGS_PATH }
    );

    await navigate(SETTINGS_PATH + '/create_password');
    expect(history.location.pathname).toBe('/settings/change_password');
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
        pageName: 'PageMfaGuardTestWithGql',
        route: '/mfa_guard/test/gql',
        hasPassword: false,
      },
      {
        pageName: 'Page2faChange',
        route: '/two_step_authentication/change',
        hasPassword: true,
      },
      {
        pageName: 'PageSecondaryEmailAdd',
        route: '/emails',
        hasPassword: true,
      },
      {
        pageName: 'PageSecondaryEmailVerify',
        route: '/emails/verify',
        hasPassword: false,
      },
      {
        pageName: 'Page2faReplaceBackupCodes',
        route: '/two_step_authentication/replace_codes',
        hasPassword: true,
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
        hasPassword: true,
      },
      {
        pageName: 'Page2faSetup',
        route: '/two_step_authentication',
        hasPassword: true,
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

    it('redirects two-step authentication page', async () => {
      await history.navigate(SETTINGS_PATH + '/two_step_authentication');
      expect(history.location.pathname).toBe('/settings');
    });

    it('redirects Page2faReplaceRecoveryCodes', async () => {
      await history.navigate(
        SETTINGS_PATH + '/two_step_authentication/replace_codes'
      );
      expect(history.location.pathname).toBe('/settings');
    });

    it('redirects ChangePassword', async () => {
      await history.navigate(SETTINGS_PATH + '/change_password');
      expect(history.location.pathname).toBe('/settings/create_password');
    });
  });
});
