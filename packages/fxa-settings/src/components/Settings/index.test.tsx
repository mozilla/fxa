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

jest.mock('./ScrollToTop', () => ({
  __esModule: true,
  ScrollToTop: ({ children }: { children: ReactNode }) => (
    <span data-testid="ScrollTop">{children}</span>
  ),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

const mockUseGeoEligibilityCheck = jest.fn().mockReturnValue({ eligible: false });
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

  it('routes to PageSecondaryEmailAdd', async () => {
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

    await navigate(SETTINGS_PATH + '/emails');

    expect(getByTestId('secondary-email-input')).toBeInTheDocument();
  });

  it('routes to PageSecondaryEmailVerify', async () => {
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

    await navigate(SETTINGS_PATH + '/emails/verify');

    expect(getByTestId('secondary-email-verify-form')).toBeInTheDocument();
  });

  it('routes to PageTwoStepAuthentication', async () => {
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

    await navigate(SETTINGS_PATH + '/two_step_authentication');

    expect(getByTestId('totp-input')).toBeInTheDocument();
  });

  it('routes to Page2faReplaceRecoveryCodes', async () => {
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

    await navigate(SETTINGS_PATH + '/two_step_authentication/replace_codes');

    expect(getByTestId('2fa-recovery-codes')).toBeInTheDocument();
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

    it('redirects PageTwoStepAuthentication', async () => {
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
