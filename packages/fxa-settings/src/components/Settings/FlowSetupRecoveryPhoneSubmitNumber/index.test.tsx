/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import FlowSetupRecoveryPhoneSubmitNumber from '.';

jest.mock('../../../lib/error-utils', () => ({
  getLocalizedErrorMessage: jest.fn(() => 'Localized error message'),
}));

jest.mock('../../../models', () => ({
  useFtlMsgResolver: jest.fn(() => ({
    getMsg: (id: string, fallback: string) => fallback,
  })),
}));

const mockNavigateBackward = jest.fn();
const mockNavigateForward = jest.fn();
const mockVerifyPhoneNumber = jest.fn();

const defaultProps = {
  localizedPageTitle: 'Add phone number',
  navigateBackward: mockNavigateBackward,
  navigateForward: mockNavigateForward,
  verifyPhoneNumber: mockVerifyPhoneNumber,
};

describe('FlowSetupRecoveryPhoneSubmitNumber', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Renders the {@link FlowSetupRecoveryPhoneSubmitNumber} component with the provided props.
   * Uses defaultProps if none are provided.
   * @param props
   */
  async function renderWith(props = defaultProps) {
    await act(() => {
      renderWithLocalizationProvider(
        <FlowSetupRecoveryPhoneSubmitNumber {...props} />
      );
    });
  }

  test('renders component as expected', async () => {
    await renderWith();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /Verify your phone number/i })
      ).toBeInTheDocument()
    );
    expect(
      screen.getByText(/You’ll get a text message from Mozilla/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /Select country/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /Enter phone number/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Send code/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /By providing your number, you agree to us storing it so we can text you for account verification only. Message and data rates may apply./i
      )
    ).toBeInTheDocument();
  });

  test('handles successful number verification', async () => {
    const user = userEvent.setup();
    await renderWith();

    await waitFor(() =>
      user.type(
        screen.getByRole('textbox', { name: /Enter phone number/i }),
        '1231231234'
      )
    );
    user.click(screen.getByRole('button', { name: /Send code/i }));

    await waitFor(() => expect(mockVerifyPhoneNumber).toHaveBeenCalledTimes(1));
    expect(mockNavigateForward).toHaveBeenCalledTimes(1);
  });
  test('handles error during number verification', async () => {
    mockVerifyPhoneNumber.mockRejectedValueOnce(new Error('error'));
    const user = userEvent.setup();
    await renderWith();

    await waitFor(() =>
      user.type(
        screen.getByRole('textbox', { name: /Enter phone number/i }),
        '1231231234'
      )
    );
    user.click(screen.getByRole('button', { name: /Send code/i }));

    await waitFor(() => expect(mockVerifyPhoneNumber).toHaveBeenCalledTimes(0));
    expect(mockNavigateForward).toHaveBeenCalledTimes(0);
    await waitFor(() =>
      expect(screen.getByText('Localized error message')).toBeInTheDocument()
    );
  });

  test('navigates backward when back button is clicked', async () => {
    const user = userEvent.setup();
    await renderWith();

    user.click(screen.getByRole('button', { name: /Back/i }));

    await waitFor(() => expect(mockNavigateBackward).toHaveBeenCalledTimes(1));
  });
});
