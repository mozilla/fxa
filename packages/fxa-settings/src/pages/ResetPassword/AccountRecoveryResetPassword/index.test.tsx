/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider, NavigateFn } from '@reach/router';
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
  GenericData,
  StorageData,
  UrlHashData,
  UrlQueryData,
} from '../../../lib/model-data';
import {
  logErrorEvent,
  logViewEvent,
  usePageViewEvent,
} from '../../../lib/metrics';
import { Account, AppContext, AppContextValue, Relier } from '../../../models';
import {
  mockAccount,
  mockLocationData,
  mockRelierFactory,
  mockStorageData,
  mockUrlHashData,
  mockUrlQueryData,
  resetDataStore,
} from './mocks';
import { RelierFactory } from '../../../lib/reliers';
import { mockAppContext } from '../../../models/mocks';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  logErrorEvent: jest.fn(),
  setUserPreference: jest.fn(),
}));

const mockOnAccountSignIn = jest.fn();
const mockInvokeBrokerMethod = jest.fn();
jest.mock('../../../models/hooks', () => ({
  __esModule: true,
  ...jest.requireActual('../../../models/hooks'),
  useNotifier: () => ({
    onAccountSignIn: mockOnAccountSignIn,
  }),
  useBroker: () => ({
    invokeBrokerMethod: mockInvokeBrokerMethod,
  }),
}));

describe('AccountRecoveryResetPassword page', () => {
  let urlQueryData: UrlQueryData;
  let urlHashData: UrlHashData;
  let storageData: StorageData;
  let account: Account;
  let locationData: GenericData;
  let navigate: NavigateFn;
  let relierFactory: RelierFactory;
  let relier: Relier;
  let ctx: AppContextValue;

  async function renderPage() {
    const overrides = {
      navigate,
      locationData,
    };
    render(
      <AppContext.Provider value={ctx}>
        <LocationProvider>
          <AccountRecoveryResetPassword {...{ overrides }} />
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

  function resetDataStores() {
    resetDataStore(mockUrlQueryData(), urlQueryData);
    resetDataStore(mockUrlHashData(), urlHashData);
    resetDataStore(mockStorageData(), storageData);
    resetDataStore(mockLocationData(), locationData);
  }

  beforeAll(() => {
    account = mockAccount();
    navigate = jest.fn();
    urlQueryData = mockUrlQueryData();
    urlHashData = mockUrlHashData();
    storageData = mockStorageData();
    locationData = mockLocationData();
    relierFactory = mockRelierFactory(urlQueryData, urlHashData, storageData);
    relier = relierFactory.getRelier();

    ctx = mockAppContext({
      urlQueryData,
      urlHashData,
      storageData,
      account,
      relierFactory,
    });
  });

  afterEach(() => {
    resetDataStores();
    jest.restoreAllMocks();
  });

  describe('required recovery key info', () => {
    async function setState(key: string) {
      locationData.set(key, '');
      await renderPage();
    }

    it(`requires kB`, function () {
      setState('kB');
      expect(navigate).toBeCalledWith(
        `/complete_reset_password?${urlQueryData.toSearchQuery()}`
      );
    });

    it(`requires recoveryKeyId`, function () {
      setState('recoveryKeyId');
      expect(navigate).toBeCalledWith(
        `/complete_reset_password?${urlQueryData.toSearchQuery()}`
      );
    });

    it(`requires accountResetToken`, function () {
      setState('accountResetToken');
      expect(navigate).toBeCalledWith(
        `/complete_reset_password?${urlQueryData.toSearchQuery()}`
      );
    });
  });

  describe('damaged link', () => {
    beforeEach(async () => {
      // By setting an invalid email state, we trigger a damaged link state.
      urlQueryData.set('email', 'foo');
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
      beforeAll(() => {
        account.setLastLogin = jest.fn();
        account.resetPasswordWithRecoveryKey = jest.fn();
      });

      beforeEach(async () => {
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
        expect(account.resetPasswordWithRecoveryKey).toHaveBeenCalled();
      });

      it('sets relier state', () => {
        expect(logViewEvent).toHaveBeenCalledWith(
          viewName,
          'verification.success'
        );
      });

      it('invokes broker', () => {
        expect(mockInvokeBrokerMethod).toHaveBeenCalled();
      });

      it('invokes webchannel', () => {
        expect(mockOnAccountSignIn).toHaveBeenCalled();
      });

      it('sets last login data', () => {
        expect(account.setLastLogin).toHaveBeenCalled();
      });

      it('sets relier resetPasswordConfirm state', () => {
        expect(relier.resetPasswordConfirm).toBeTruthy();
      });
    });
  });

  describe('expired link', () => {
    beforeAll(() => {
      // A link is deemed expired if the server returns an invalid token error.
      account.resetPasswordWithRecoveryKey = jest
        .fn()
        .mockRejectedValue(AuthUiErrors['INVALID_TOKEN']);
      account.resetPassword = jest.fn();
    });

    beforeEach(async () => {
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
