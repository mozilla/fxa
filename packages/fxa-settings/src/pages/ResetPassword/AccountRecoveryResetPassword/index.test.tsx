/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import '@testing-library/jest-dom/extend-expect';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import AccountRecoveryResetPassword, { viewName } from '.';
import { REACT_ENTRYPOINT, SHOW_BALLOON_TIMEOUT } from '../../../constants';
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
    render(
      <AppContext.Provider value={ctx}>
        <LocationProvider
          {...{ history: mockHistory, location: mockHistory.location }}
        >
          <AccountRecoveryResetPassword {...{}} />
        </LocationProvider>
      </AppContext.Provider>
    );
  }

  function clickResetPassword() {
    screen.getByRole('button', { name: 'Reset password' }).click();
  }

  function clickReceiveNewLink() {
    screen
      .getByRole('button', {
        name: 'Receive new link',
      })
      .click();
  }

  function enterPassword(password: string, password2?: string) {
    const newPassword = screen.getByLabelText('New password');
    const newPassword2 = screen.getByLabelText('Re-enter password');
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
    async function setState(key: string) {
      mockLocationStateData.set(key, '');
      await renderPage();
    }

    it(`requires kB`, function () {
      setState('kB');
      expect(mockNavigate).toBeCalledWith(
        `/complete_reset_password?${mockUrlQueryData.toSearchQuery()}`
      );
    });

    it(`requires recoveryKeyId`, function () {
      setState('recoveryKeyId');
      expect(mockNavigate).toBeCalledWith(
        `/complete_reset_password?${mockUrlQueryData.toSearchQuery()}`
      );
    });

    it(`requires accountResetToken`, function () {
      setState('accountResetToken');
      expect(mockNavigate).toBeCalledWith(
        `/complete_reset_password?${mockUrlQueryData.toSearchQuery()}`
      );
    });
  });

  describe('damaged link', () => {
    beforeEach(async () => {
      // By setting an invalid email state, we trigger a damaged link state.
      mockUrlQueryData.set('email', 'foo');
      await renderPage();
    });

    it('shows damaged link message', () => {
      screen.getByRole('heading', { name: 'Reset password link damaged' });
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

    it('renders with valid link', () => {
      const heading = screen.getByRole('heading', {
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
      const newPasswordField = screen.getByTestId('new-password-input-field');
      expect(
        screen.queryByText('Password requirements')
      ).not.toBeInTheDocument();

      fireEvent.focus(newPasswordField);
      await waitFor(
        () => {
          expect(screen.getByText('Password requirements')).toBeVisible();
        },
        {
          timeout: SHOW_BALLOON_TIMEOUT,
        }
      );
    });

    describe('successful reset', () => {
      beforeEach(async () => {
        mockAccount.setLastLogin = jest.fn();
        mockAccount.resetPasswordWithRecoveryKey = jest.fn();

        await act(async () => {
          enterPassword('foo12356789!');
          clickResetPassword();
        });
      });

      it('emits a metric on successful reset', async () => {
        expect(logViewEvent).toHaveBeenCalledWith(
          viewName,
          'verification.success'
        );
      });

      it('calls resetPasswordWithRecoveryKey', () => {
        expect(mockAccount.resetPasswordWithRecoveryKey).toHaveBeenCalled();
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
      await act(async () => {
        enterPassword('foo12356789!');
        clickResetPassword();
      });
    });

    it('logs error event', async () => {
      expect(logErrorEvent).toBeCalled();
    });

    it('renders LinkExpired component', async () => {
      await clickReceiveNewLink();
      expect(
        screen.getByRole('heading', { name: 'Reset password link expired' })
      ).toBeInTheDocument();
    });
  });
});
