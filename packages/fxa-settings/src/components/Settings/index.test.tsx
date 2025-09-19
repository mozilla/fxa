/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { History } from '@reach/router';
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

// Mocking the component here avoids dealing with all the dependecies required to start the 2fa setup flow
// Those are tested in Page2faSetup/index.test.tsx
jest.mock('./Page2faSetup', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mock-2fa-setup-page">Mock 2FA Setup Page</div>
  ),
}));

jest.mock('./ScrollToTop', () => ({
  __esModule: true,
  ScrollToTop: ({ children }: { children: ReactNode }) => (
    <span data-testid="ScrollTop">{children}</span>
  ),
}));

// Mock the MFA guard so we can assert guarded pages render it without
// pulling in the guard's dependencies or child flows
jest.mock('./MfaGuard', () => ({
  __esModule: true,
  MfaGuard: ({ children }: { children: ReactNode }) => (
    <div data-testid="mfa-guard">MockMfaGuard</div>
  ),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

const mockUseGeoEligibilityCheck = jest
  .fn()
  .mockReturnValue({ eligible: false });
jest.mock('../../lib/hooks/useGeoEligibilityCheck', () => ({
  useGeoEligibilityCheck: () => mockUseGeoEligibilityCheck(),
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

  it('renders `AppErrorDialog` component when settings query errors', () => {
    (useInitialSettingsState as jest.Mock).mockReturnValueOnce({
      error: { message: 'Error' },
    });
    const { getByRole } = renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <Subject />
      </AppContext.Provider>
    );

    expect(getByRole('heading', { level: 2 })).toHaveTextContent(
      'General application error'
    );
  });

  it('redirects to root if account is not verified', async () => {
    // this warning is expected, so we don't want to see it in the test output
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation((msg) => {
      if (msg === 'Account verification is require to access /settings!')
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

    await Promise.resolve();
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/');
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

  it('routes to two step authentication page', async () => {
    const session = mockSession(true);
    const account = {
      ...MOCK_ACCOUNT,
      hasPassword: true,
    } as unknown as Account;
    const {
      getByTestId,
      history,
      history: { navigate },
    } = renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account, session })}>
        <Subject />
      </AppContext.Provider>,
      { route: SETTINGS_PATH }
    );

    await navigate(SETTINGS_PATH + '/two_step_authentication');

    expect(history.location.pathname).toBe('/settings/two_step_authentication');
    expect(getByTestId('mock-2fa-setup-page')).toBeInTheDocument();
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
        getMonitorPlusPromoEligibility: () => Promise.resolve(false),
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
