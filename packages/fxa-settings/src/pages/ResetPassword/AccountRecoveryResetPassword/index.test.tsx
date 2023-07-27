/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import AccountRecoveryResetPassword, { viewName } from '.';
import { REACT_ENTRYPOINT } from '../../../constants';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import {
  logErrorEvent,
  logViewEvent,
  usePageViewEvent,
} from '../../../lib/metrics';
import { AppContext, AppContextValue, IntegrationType } from '../../../models';
import * as mocks from './mocks';
import { mockAppContext } from '../../../models/mocks';
import { notifyFirefoxOfLogin } from '../../../lib/channels/helpers';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

let mockHistory = mocks.mockWindowHistory();
let mockWindowWrapper = mocks.mockWindowWrapper();
let mockUrlQueryData = mocks.mockUrlQueryData();
let mockStorageData = mocks.mockStorageData();
let mockUrlHashData = mocks.mockUrlHashData();
let mockLocationStateData = mocks.mockLocationStateData();
let mockRelier = mocks.mockRelier();
let mockIntegration = mocks.mockIntegration();
let mockAccount = mocks.mockAccount();
let mockAuthClient = mocks.mockAuthClient();
let mockOauthClient = mocks.mockOauthClient();
let mockNavigate = mocks.mockNavigate();
let mockNotifier = mocks.mockNotifier();

const mockUseNavigateWithoutRerender = jest.fn();

jest.mock('../../../lib/hooks/useNavigateWithoutRerender', () => ({
  __esModule: true,
  default: () => mockUseNavigateWithoutRerender,
}));

jest.mock('../../../models/hooks', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../models/hooks'),
    useNotifier: () => mockNotifier,
    useAccount: () => mockAccount,
  };
});

jest.mock('../../../lib/channels/helpers', () => {
  return {
    notifyFirefoxOfLogin: jest.fn(),
  };
});

jest.mock('@reach/router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@reach/router'),
    useLocation: () => mockWindowWrapper.location,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../../../lib/metrics', () => {
  return {
    usePageViewEvent: jest.fn(),
    logViewEvent: jest.fn(),
    logErrorEvent: jest.fn(),
    setUserPreference: jest.fn(),
  };
});

describe('AccountRecoveryResetPassword page', () => {
  let ctx: AppContextValue;

  function resetMocks() {
    // Restores default implementations of the mocks
    mocks.resetMocks();

    // Create new references to mocks
    mockHistory = mocks.mockWindowHistory();
    mockWindowWrapper = mocks.mockWindowWrapper();
    mockUrlQueryData = mocks.mockUrlQueryData();
    mockStorageData = mocks.mockStorageData();
    mockUrlHashData = mocks.mockUrlHashData();
    mockLocationStateData = mocks.mockLocationStateData();
    mockRelier = mocks.mockRelier();
    mockIntegration = mocks.mockIntegration();
    mockAccount = mocks.mockAccount();
    mockAuthClient = mocks.mockAuthClient();
    mockOauthClient = mocks.mockOauthClient();
    mockNavigate = mocks.mockNavigate();
    mockNotifier = mocks.mockNotifier();

    // Reset the mock implementations
    jest.restoreAllMocks();
  }

  async function renderPage() {
    renderWithLocalizationProvider(
      <AppContext.Provider value={ctx}>
        <LocationProvider
          {...{ history: mockHistory, location: mockHistory.location }}
        >
          <AccountRecoveryResetPassword {...{}} />
        </LocationProvider>
      </AppContext.Provider>
    );
  }

  async function clickResetPassword() {
    const button = await screen.findByRole('button', {
      name: 'Reset password',
    });
    await act(async () => {
      button.click();
    });
  }

  async function clickReceiveNewLink() {
    const button = await screen.findByRole('button', {
      name: 'Receive new link',
    });

    await act(async () => {
      button.click();
    });
  }

  async function enterPassword(password: string, password2?: string) {
    const newPassword = await screen.findByLabelText('New password');
    const newPassword2 = await screen.findByLabelText('Re-enter password');
    fireEvent.change(newPassword, { target: { value: password } });
    fireEvent.change(newPassword2, {
      target: { value: password2 || password },
    });
  }

  beforeEach(() => {
    resetMocks();
    ctx = mockAppContext({
      windowWrapper: mockWindowWrapper,
      urlQueryData: mockUrlQueryData,
      urlHashData: mockUrlHashData,
      storageData: mockStorageData,
      account: mockAccount,
      authClient: mockAuthClient,
      locationStateData: mockLocationStateData,
      oauthClient: mockOauthClient,
    });
  });

  afterAll(() => {
    resetMocks();
  });

  describe('required recovery key info', () => {
    async function setEmptyState(key: string) {
      mockLocationStateData.set(key, '');
      await renderPage();
    }

    let mockConsoleWarn: jest.SpyInstance;

    beforeEach(() => {
      mockConsoleWarn = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      mockConsoleWarn.mockClear();
    });

    it(`requires kB`, async () => {
      setEmptyState('kB');
      expect(mockNavigate).toBeCalledWith(
        `/complete_reset_password?${await mockUrlQueryData.toSearchQuery()}`
      );
      expect(mockConsoleWarn).toBeCalled();
    });

    it(`requires recoveryKeyId`, async () => {
      setEmptyState('recoveryKeyId');
      expect(mockNavigate).toBeCalledWith(
        `/complete_reset_password?${await mockUrlQueryData.toSearchQuery()}`
      );
      expect(mockConsoleWarn).toBeCalled();
    });

    it(`requires accountResetToken`, async () => {
      setEmptyState('accountResetToken');
      expect(mockNavigate).toBeCalledWith(
        `/complete_reset_password?${await mockUrlQueryData.toSearchQuery()}`
      );
      expect(mockConsoleWarn).toBeCalled();
    });
  });

  describe('damaged link', () => {
    beforeEach(async () => {
      // By setting an invalid email state, we trigger a damaged link state.
      mockUrlQueryData.set('email', 'foo');
      await renderPage();
    });

    it('shows damaged link message', async () => {
      await screen.findByRole('heading', {
        name: 'Reset password link damaged',
      });
    });
  });

  describe('valid link', () => {
    beforeEach(async () => {
      await renderPage();
    });

    it('has valid l10n', () => {
      // TODO
      // testAllL10n(screen, bundle);
    });

    it('renders with valid link', async () => {
      const heading = await screen.findByRole('heading', {
        name: 'Create new password',
      });
      screen.getByLabelText('New password');
      screen.getByLabelText('Re-enter password');

      screen.getByRole('button', { name: 'Reset password' });
      screen.getByRole('link', {
        name: 'Remember your password? Sign in',
      });

      expect(heading).toBeDefined();
    });

    it('emits event', () => {
      expect(usePageViewEvent).toHaveBeenCalled();
      expect(usePageViewEvent).toHaveBeenCalledWith(
        'account-recovery-reset-password',
        REACT_ENTRYPOINT
      );
    });

    it('displays password requirements when the new password field is in focus', async () => {
      const newPasswordField = await screen.findByTestId(
        'new-password-input-field'
      );
      expect(
        screen.queryByText('Password requirements')
      ).not.toBeInTheDocument();

      fireEvent.focus(newPasswordField);
      await waitFor(() => {
        expect(screen.getByText('Password requirements')).toBeVisible();
      });
    });

    describe('successful reset', () => {
      beforeEach(async () => {
        mockAccount.setLastLogin = jest.fn();
        mockAccount.resetPasswordWithRecoveryKey = jest
          .fn()
          .mockResolvedValue(mocks.MOCK_RESET_DATA);
        mockAccount.isSessionVerifiedAuthClient = jest.fn();
        mockAccount.hasTotpAuthClient = jest.fn().mockResolvedValue(false);

        await enterPassword('foo12356789!');
        await clickResetPassword();
      });

      it('emits a metric on successful reset', async () => {
        expect(logViewEvent).toHaveBeenCalledWith(
          viewName,
          'verification.success'
        );
      });

      it('calls account API methods', () => {
        // Check that resetPasswordWithRecoveryKey was the first function called
        // because it retrieves the session token required by other calls
        expect(
          (mockAccount.resetPasswordWithRecoveryKey as jest.Mock).mock.calls[0]
        ).toBeTruthy();
        expect(mockAccount.isSessionVerifiedAuthClient).toHaveBeenCalled();
        expect(mockAccount.hasTotpAuthClient).toHaveBeenCalled();
      });

      it('sets relier state', () => {
        expect(logViewEvent).toHaveBeenCalledWith(
          viewName,
          'verification.success'
        );
      });

      it('invokes webchannel', () => {
        expect(mockNotifier.onAccountSignIn).toHaveBeenCalled();
      });

      it('sets last login data', () => {
        expect(mockAccount.setLastLogin).toHaveBeenCalled();
      });

      it('sets relier resetPasswordConfirm state', () => {
        expect(mockRelier.resetPasswordConfirm).toBeTruthy();
      });

      describe('SyncDesktop integration', () => {
        beforeEach(() => {
          mockIntegration = mocks.mockIntegration(
            mocks.syncIntegrationUrlQueryData
          );
        });
        it('calls notifyFirefoxOfLogin', () => {
          expect(mockIntegration.type).toEqual(IntegrationType.SyncDesktop);
          expect(notifyFirefoxOfLogin).toHaveBeenCalled();
        });
      });

      it('navigates as expected without totp', async () => {
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith(
            '/reset_password_with_recovery_key_verified'
          );
        });
      });
    });
  });

  describe('successful reset with totp', () => {
    // Window mocks not needed once this page doesn't use `hardNavigateToContentServer`
    const originalWindow = window.location;
    beforeAll(() => {
      // @ts-ignore
      delete window.location;
      window.location = { ...originalWindow, href: '' };
    });
    beforeEach(async () => {
      window.location.href = originalWindow.href;
      mockAccount.setLastLogin = jest.fn();
      mockAccount.resetPasswordWithRecoveryKey = jest
        .fn()
        .mockResolvedValue(mocks.MOCK_RESET_DATA);
      mockAccount.isSessionVerifiedAuthClient = jest.fn();
      mockAccount.hasTotpAuthClient = jest.fn().mockResolvedValue(true);
      await renderPage();

      await enterPassword('foo12356789!');
      await clickResetPassword();
    });
    afterAll(() => {
      window.location = originalWindow;
    });

    it('navigates as expected', async () => {
      expect(window.location.href).toContain('/signin_totp_code');
    });
  });

  describe('expired link', () => {
    beforeEach(async () => {
      // A link is deemed expired if the server returns an invalid token error.
      mockAccount.resetPasswordWithRecoveryKey = jest
        .fn()
        .mockRejectedValue(AuthUiErrors['INVALID_TOKEN']);
      mockAccount.resetPassword = jest.fn();

      await renderPage();
      await enterPassword('foo12356789!');
      await clickResetPassword();
    });

    it('logs error event', async () => {
      expect(logErrorEvent).toBeCalled();
      expect(true).toBeTruthy();
    });

    it('renders LinkExpired component', async () => {
      await clickReceiveNewLink();
      await screen.findByRole('heading', {
        name: 'Reset password link expired',
      });
    });
  });
});
