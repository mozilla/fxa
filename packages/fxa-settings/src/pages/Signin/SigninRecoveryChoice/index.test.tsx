/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ReachRouterModule from '@reach/router';

import React from 'react';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SigninRecoveryChoice from '.';
import { MOCK_SIGNIN_LOCATION_STATE } from './mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

function renderSigninRecoveryChoice(overrides = {}) {
  const defaultProps = {
    handlePhoneChoice: jest.fn(),
    lastFourPhoneDigits: '1234',
    numBackupCodes: 4,
    signinState: MOCK_SIGNIN_LOCATION_STATE,
    ...overrides,
  };

  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninRecoveryChoice {...defaultProps} />
    </LocationProvider>
  );
}

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

describe('SigninRecoveryChoice', () => {
  it('renders as expected', () => {
    renderSigninRecoveryChoice();

    expect(
      screen.getByRole('heading', { name: 'Sign in', level: 1 })
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
    expect(screen.getByLabelText(/••••••1234/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Backup authentication codes/i)
    ).toBeInTheDocument();
    expect(screen.getByText('4 codes remaining')).toBeInTheDocument();
  });

  it('renders as expected with one backup authentication code', () => {
    renderSigninRecoveryChoice({ numBackupCodes: 1 });

    expect(screen.getByText('1 code remaining')).toBeInTheDocument();
  });

  it('calls handlePhoneChoice when Recovery phone option is selected', async () => {
    mockReachRouter('signin_recovery_choice', MOCK_SIGNIN_LOCATION_STATE);

    const user = userEvent.setup();
    const mockHandlePhoneChoice = jest.fn();
    renderSigninRecoveryChoice({ handlePhoneChoice: mockHandlePhoneChoice });

    user.click(screen.getByLabelText(/Recovery phone/i));
    user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockHandlePhoneChoice).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith('/signin_recovery_phone', {
        state: {
          signinState: MOCK_SIGNIN_LOCATION_STATE,
          lastFourPhoneDigits: '1234',
        },
      });
    });
  });

  it('displays an error banner when handlePhoneChoice fails', async () => {
    mockReachRouter('signin_recovery_choice', MOCK_SIGNIN_LOCATION_STATE);

    const user = userEvent.setup();
    const mockHandlePhoneChoice = jest
      .fn()
      .mockResolvedValueOnce(AuthUiErrors.BACKEND_SERVICE_FAILURE);
    renderSigninRecoveryChoice({ handlePhoneChoice: mockHandlePhoneChoice });

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
    mockReachRouter('signin_recovery_choice', MOCK_SIGNIN_LOCATION_STATE);

    const user = userEvent.setup();
    renderSigninRecoveryChoice();

    user.click(screen.getByLabelText(/Backup authentication codes/i));
    user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith('/signin_recovery_code', {
        state: {
          signinState: MOCK_SIGNIN_LOCATION_STATE,
          lastFourPhoneDigits: '1234',
        },
      });
    });
  });
});
