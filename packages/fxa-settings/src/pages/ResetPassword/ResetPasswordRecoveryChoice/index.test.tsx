/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ReachRouterModule from '@reach/router';

import React from 'react';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordRecoveryChoice from '.';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../../lib/glean';
import { MOCK_MASKED_PHONE_NUMBER_WITH_COPY } from '../../mocks';

const fakeState = {
  token: 'tok',
  code: '123098',
  uid: '9001',
  email: 'testo@example.gg',
};
function renderResetPasswordRecoveryChoice(overrides = {}) {
  const defaultProps = {
    handlePhoneChoice: jest.fn(),
    maskedPhoneNumber: MOCK_MASKED_PHONE_NUMBER_WITH_COPY,
    lastFourPhoneDigits: '1234',
    numBackupCodes: 4,
    completeResetPasswordLocationState: fakeState,
    ...overrides,
  };

  renderWithLocalizationProvider(
    <LocationProvider>
      <ResetPasswordRecoveryChoice {...defaultProps} />
    </LocationProvider>
  );
}

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    passwordReset: {
      backupChoiceView: jest.fn(),
      backupChoiceSubmit: jest.fn(),
    },
  },
}));

const mockLocation = (pathname: string, mockLocationState: Object) => {
  return {
    ...global.window.location,
    pathname,
    state: mockLocationState,
  };
};

const mockNavigate = jest.fn();
function mockReachRouter(pathname = '', mockLocationState = {}) {
  mockNavigate.mockReset();
  jest.spyOn(ReachRouterModule, 'useNavigate').mockReturnValue(mockNavigate);
  jest
    .spyOn(ReachRouterModule, 'useLocation')
    .mockImplementation(() => mockLocation(pathname, mockLocationState));
}

describe('ResetPasswordRecoveryChoice', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders as expected', () => {
    renderResetPasswordRecoveryChoice();

    expect(
      screen.getByRole('heading', { name: 'Reset your password', level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Choose a recovery method',
        level: 2,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('group').querySelector('legend') as HTMLLegendElement
      ).getByText('Choose a recovery method')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Let’s make sure it’s you using your recovery methods.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Recovery phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number ending in 1234/)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Backup authentication codes/i)
    ).toBeInTheDocument();
    expect(screen.getByText('4 codes remaining')).toBeInTheDocument();
  });

  it('renders as expected with one backup authentication code', () => {
    renderResetPasswordRecoveryChoice({ numBackupCodes: 1 });

    expect(screen.getByText('1 code remaining')).toBeInTheDocument();
  });

  it('calls handlePhoneChoice when Recovery phone option is selected', async () => {
    mockReachRouter('reset_password_recovery_choice', fakeState);

    const user = userEvent.setup();
    const mockHandlePhoneChoice = jest.fn();
    renderResetPasswordRecoveryChoice({
      handlePhoneChoice: mockHandlePhoneChoice,
    });

    user.click(screen.getByLabelText(/Recovery phone/i));
    user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockHandlePhoneChoice).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith('/reset_password_recovery_phone', {
        state: {
          ...fakeState,
          lastFourPhoneDigits: '1234',
        },
      });
    });
  });

  it('displays an error banner when handlePhoneChoice fails', async () => {
    mockReachRouter('reset_password_recovery_choice', fakeState);

    const user = userEvent.setup();
    const mockHandlePhoneChoice = jest
      .fn()
      .mockResolvedValueOnce(AuthUiErrors.BACKEND_SERVICE_FAILURE);
    renderResetPasswordRecoveryChoice({
      handlePhoneChoice: mockHandlePhoneChoice,
    });

    user.click(screen.getByLabelText(/Recovery phone/i));
    user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'There was a problem sending a code to your recovery phone'
      );
      expect(mockNavigate).not.toBeCalled();
    });
  });

  it('navigates to the recovery code page when Backup authentication codes option is selected', async () => {
    mockReachRouter('reset_password_recovery_choice', fakeState);

    const user = userEvent.setup();
    renderResetPasswordRecoveryChoice();

    user.click(screen.getByLabelText(/Backup authentication codes/i));
    user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith(
        '/confirm_backup_code_reset_password',
        {
          state: fakeState,
        }
      );
    });
  });

  describe('glean metrics', () => {
    it('view event emitted on render', async () => {
      mockReachRouter('reset_password_recovery_choice', fakeState);

      renderResetPasswordRecoveryChoice();
      expect(
        screen.getByRole('heading', {
          name: 'Choose a recovery method',
          level: 2,
        })
      ).toBeInTheDocument();
      expect(GleanMetrics.passwordReset.backupChoiceView).toBeCalledTimes(1);
    });

    it('sends the correct metric when Recovery phone option is selected', async () => {
      mockReachRouter('reset_password_recovery_choice', fakeState);

      const user = userEvent.setup();
      renderResetPasswordRecoveryChoice();

      user.click(screen.getByLabelText(/Recovery phone/i));
      user.click(screen.getByRole('button', { name: 'Continue' }));

      await waitFor(() =>
        expect(GleanMetrics.passwordReset.backupChoiceSubmit).toBeCalledWith({
          event: { reason: 'phone' },
        })
      );
    });

    it('sends the correct metric when Backup authentication codes option is selected', async () => {
      mockReachRouter('reset_password_recovery_choice', fakeState);

      const user = userEvent.setup();
      renderResetPasswordRecoveryChoice();

      user.click(screen.getByLabelText(/Backup authentication codes/i));
      user.click(screen.getByRole('button', { name: 'Continue' }));

      await waitFor(() =>
        expect(GleanMetrics.passwordReset.backupChoiceSubmit).toBeCalledWith({
          event: { reason: 'code' },
        })
      );
    });
  });
});
