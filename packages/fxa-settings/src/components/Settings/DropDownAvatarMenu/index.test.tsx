/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, fireEvent, act } from '@testing-library/react';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import {
  mockAppContext,
  mockSession,
  mockSettingsContext,
} from '../../../models/mocks';
import DropDownAvatarMenu from '.';
import { logViewEvent, settingsViewName } from 'fxa-settings/src/lib/metrics';
import { Account, AppContext } from '../../../models';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import firefox from '../../../lib/channels/firefox';
import { PLACEHOLDER_IMAGE_URL } from '../../../pages/mocks';
import { JwtTokenCache, MfaOtpRequestCache } from '../../../lib/cache';
import { getDefault, Config } from '../../../lib/config';
import Storage from '../../../lib/storage';
import { setCurrentAccountUid } from '../../../lib/account-storage';

jest.mock('../../../models/AlertBarInfo');
jest.mock('fxa-settings/src/lib/metrics', () => ({
  logViewEvent: jest.fn(),
  settingsViewName: 'quuz',
}));

jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  JwtTokenCache: {
    clearTokens: jest.fn(),
  },
  MfaOtpRequestCache: {
    clear: jest.fn(),
  },
}));

jest.mock('../../../lib/account-storage', () => ({
  ...jest.requireActual('../../../lib/account-storage'),
  setCurrentAccountUid: jest.fn(),
}));

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks', () => ({
  ...jest.requireActual('../../../lib/hooks'),
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

const account = {
  avatar: {
    id: 'abc1234',
    url: PLACEHOLDER_IMAGE_URL,
    isDefault: false,
  },
  primaryEmail: {
    email: 'johndope@example.com',
  },
  displayName: 'John Dope',
} as unknown as Account;

describe('DropDownAvatarMenu', () => {
  const dropDownId = 'drop-down-avatar-menu';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders and toggles as expected with default values', () => {
    const account = {
      avatar: { url: null, id: null },
      displayName: null,
      primaryEmail: {
        email: 'johndope@example.com',
      },
    } as unknown as Account;
    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <DropDownAvatarMenu />
      </AppContext.Provider>
    );

    const toggleButton = screen.getByTestId('drop-down-avatar-menu-toggle');

    expect(toggleButton).toHaveAttribute('title', 'Mozilla account menu');
    expect(toggleButton).toHaveAttribute('aria-label', 'Mozilla account menu');
    expect(toggleButton).toHaveAttribute('aria-haspopup', 'menu');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();
    expect(screen.getByTestId('drop-down-name-or-email').textContent).toContain(
      'johndope@example.com'
    );

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();
  });

  it('renders as expected with avatar url and displayName set', () => {
    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <DropDownAvatarMenu />
      </AppContext.Provider>
    );
    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(screen.getByTestId('drop-down-name-or-email').textContent).toContain(
      'John Dope'
    );
  });

  it('closes on esc keypress', () => {
    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <DropDownAvatarMenu />
      </AppContext.Provider>
    );

    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();
  });

  it('closes on mousedown outside', () => {
    const { container } = renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <div className="w-full flex justify-end">
          <div className="flex pr-10 pt-4">
            <DropDownAvatarMenu />
          </div>
        </div>
      </AppContext.Provider>
    );

    fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    expect(screen.queryByTestId(dropDownId)).toBeInTheDocument();
    fireEvent.mouseDown(container);
    expect(screen.queryByTestId(dropDownId)).not.toBeInTheDocument();
  });

  describe('destroySession', () => {
    it('redirects the user on success', async () => {
      //@ts-ignore
      delete window.location;
      window.location = {
        ...window.location,
        assign: jest.fn(),
      };

      renderWithLocalizationProvider(
        <AppContext.Provider
          value={mockAppContext({ account, session: mockSession() })}
        >
          <DropDownAvatarMenu />
        </AppContext.Provider>
      );

      fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('avatar-menu-sign-out'));
      });
      expect(logViewEvent).toHaveBeenCalledWith(
        settingsViewName,
        'signout.success'
      );
      expect(window.location.assign).toHaveBeenCalledWith(
        window.location.origin
      );
      expect(JwtTokenCache.clearTokens).toHaveBeenCalledWith(
        mockSession().token
      );
      expect(MfaOtpRequestCache.clear).toHaveBeenCalledWith(
        mockSession().token
      );
    });

    it('displays an error in the AlertBar', async () => {
      const context = mockAppContext({
        account,
        session: mockSession(true, true),
      });
      const settingsContext = mockSettingsContext();
      renderWithLocalizationProvider(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <DropDownAvatarMenu />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );

      fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('avatar-menu-sign-out'));
      });
      expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('fxaLogout web channel command', () => {
    let fxaLogoutSpy: jest.SpyInstance;
    beforeEach(() => {
      fxaLogoutSpy = jest.spyOn(firefox, 'fxaLogout');
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('is called', async () => {
      renderWithLocalizationProvider(
        <AppContext.Provider
          value={mockAppContext({ account, session: mockSession() })}
        >
          <DropDownAvatarMenu />
        </AppContext.Provider>
      );
      fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('avatar-menu-sign-out'));
      });
      expect(fxaLogoutSpy).toHaveBeenCalledWith({ uid: account.uid });
    });
  });

  describe('account switcher', () => {
    const CURRENT_UID = 'uid-current';
    const OTHER_UID = 'uid-other';

    const storage = Storage.factory('localStorage');

    const configWithSwitcher = {
      ...getDefault(),
      featureFlags: {
        ...getDefault().featureFlags,
        accountSwitcherEnabled: true,
      },
    };

    const currentAccount = {
      ...account,
      uid: CURRENT_UID,
    } as unknown as Account;

    const seedAccounts = (
      accounts: Record<string, Record<string, unknown>>
    ) => {
      storage.set('accounts', accounts);
      storage.set('currentAccountUid', CURRENT_UID);
    };

    const seedTwoAccounts = () =>
      seedAccounts({
        [CURRENT_UID]: {
          uid: CURRENT_UID,
          email: 'johndope@example.com',
          sessionToken: 'token',
        },
        [OTHER_UID]: {
          uid: OTHER_UID,
          email: 'other@example.com',
          sessionToken: 'other-token',
        },
      });

    const renderMenu = (config: Config = configWithSwitcher) => {
      renderWithLocalizationProvider(
        <AppContext.Provider
          value={mockAppContext({ account: currentAccount, config })}
        >
          <DropDownAvatarMenu />
        </AppContext.Provider>
      );
      fireEvent.click(screen.getByTestId('drop-down-avatar-menu-toggle'));
    };

    beforeEach(() => {
      storage.clear();
      mockNavigateWithQuery.mockClear();
      //@ts-ignore
      delete window.location;
      window.location = {
        ...window.location,
        origin: 'https://accounts.example.com',
        assign: jest.fn(),
      };
    });

    afterEach(() => {
      storage.clear();
    });

    it('identifies the account by email rather than display name', () => {
      // The rows below list accounts by email, so the header has to match or the
      // user cannot tell whether they are already on one of them.
      seedTwoAccounts();
      renderMenu();

      expect(
        screen.getByTestId('drop-down-name-or-email').textContent
      ).toContain('johndope@example.com');
      expect(screen.queryByText('John Dope')).not.toBeInTheDocument();
    });

    it('is hidden when the feature flag is off', () => {
      seedTwoAccounts();
      renderMenu(getDefault());

      expect(screen.queryByTestId('account-switcher')).not.toBeInTheDocument();
    });

    it('still offers "Use another account" when no other account is stored', () => {
      seedAccounts({
        [CURRENT_UID]: {
          uid: CURRENT_UID,
          email: 'johndope@example.com',
          sessionToken: 'token',
        },
      });
      renderMenu();

      // Without this, signing out is the only way to reach another account.
      expect(
        screen.getByTestId('account-switcher-use-another-account')
      ).toBeInTheDocument();
      // Nothing to switch to, so no list and no "Switch to" label.
      expect(screen.queryByText('Other accounts')).not.toBeInTheDocument();
    });

    it('lists the other accounts, excluding the current one', () => {
      seedTwoAccounts();
      renderMenu();

      expect(screen.getByTestId('account-switcher')).toBeInTheDocument();
      expect(screen.getByText('other@example.com')).toBeInTheDocument();
      expect(
        screen.queryByTestId('account-switcher-row-johndope@example.com')
      ).not.toBeInTheDocument();
    });

    // Catches a rendered FtlMsg id that is missing from the bundle, which
    // otherwise falls back silently to the English child and never reaches
    // localizers.
    it('passes l10n with every state rendered', async () => {
      const bundle: FluentBundle = await getFtlBundle('settings');
      seedTwoAccounts();
      storage.set('firefoxSignedInUid', CURRENT_UID);
      renderMenu();

      testAllL10n(screen, bundle);
    });

    it('marks the current account as signed in to the browser', () => {
      seedTwoAccounts();
      storage.set('firefoxSignedInUid', CURRENT_UID);
      renderMenu();

      expect(
        screen.getByTestId('drop-down-signed-into-browser')
      ).toBeInTheDocument();
      expect(screen.getByText('Signed in to Firefox')).toBeInTheDocument();
    });

    it('badges the row, not the header, when another account is the browser one', () => {
      seedTwoAccounts();
      storage.set('firefoxSignedInUid', OTHER_UID);
      renderMenu();

      expect(
        screen.getByTestId('account-switcher-row-other@example.com')
      ).toHaveTextContent('Signed in to Firefox');
      expect(
        screen.queryByTestId('drop-down-signed-into-browser')
      ).not.toBeInTheDocument();
    });

    it('does not mark the current account when the browser has none', () => {
      seedTwoAccounts();
      renderMenu();

      expect(
        screen.queryByTestId('drop-down-signed-into-browser')
      ).not.toBeInTheDocument();
    });

    it('switches the current account and reloads settings', () => {
      seedTwoAccounts();
      renderMenu();

      fireEvent.click(
        screen.getByTestId('account-switcher-row-other@example.com')
      );

      expect(setCurrentAccountUid).toHaveBeenCalledWith(OTHER_UID);
      expect(window.location.assign).toHaveBeenCalledWith(
        'https://accounts.example.com/settings'
      );
    });

    it('routes an account with no stored session to sign in', () => {
      seedAccounts({
        [CURRENT_UID]: {
          uid: CURRENT_UID,
          email: 'johndope@example.com',
          sessionToken: 'token',
        },
        [OTHER_UID]: { uid: OTHER_UID, email: 'stale@example.com' },
      });
      renderMenu();

      fireEvent.click(
        screen.getByTestId('account-switcher-row-stale@example.com')
      );

      expect(setCurrentAccountUid).not.toHaveBeenCalled();
      expect(window.location.assign).toHaveBeenCalledWith(
        '/signin?email=stale%40example.com'
      );
    });

    it('sends "use another account" to index without signing out', () => {
      seedTwoAccounts();
      renderMenu();

      fireEvent.click(
        screen.getByTestId('account-switcher-use-another-account')
      );

      expect(setCurrentAccountUid).not.toHaveBeenCalled();
      // prefillEmail is what stops Index auto-submitting the cached account and
      // forwarding straight back to cached sign-in.
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/', {
        state: { prefillEmail: currentAccount.primaryEmail.email },
      });
      expect(window.location.assign).not.toHaveBeenCalled();
    });
  });
});
