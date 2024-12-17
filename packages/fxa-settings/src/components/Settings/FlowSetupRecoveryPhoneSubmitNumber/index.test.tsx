/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FlowSetupRecoveryPhoneSubmitNumber from '.';
import '@testing-library/jest-dom';

// Mock dependencies
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
  localizedBackButtonTitle: 'Back',
  localizedPageTitle: 'Confirm Phone Number',
  navigateBackward: mockNavigateBackward,
  navigateForward: mockNavigateForward,
  verifyPhoneNumber: mockVerifyPhoneNumber,
};

describe('FlowSetupRecoveryPhoneSubmitNumber', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component correctly', () => {
    render(<FlowSetupRecoveryPhoneSubmitNumber {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: /Verify your phone number/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You’ll get a text message from Mozilla/i)
    ).toBeInTheDocument();
    // expect country selector to be displayed with allowed countries
    // TO ADD
    expect(
      screen.getByRole('textbox', { name: /Enter phone number/i })
    ).toBeInTheDocument();
    // TODO check for info message once copy finalized
    expect(
      screen.getByRole('button', { name: /Send code/i })
    ).toBeInTheDocument();
    // legal terms
    expect(
      screen.getByText(
        /By providing your number, you agree to us storing it so we can text you for account verification only. Message and data rates may apply./i
      )
    ).toBeInTheDocument();
  });

  // test('enables submit button when valid phone number format is entered');

  // test('handles invalid phone number format')

  // test('handles successful number verification');

  // test('handles error during number verification');

  test('navigates backward when back button is clicked', () => {
    render(<FlowSetupRecoveryPhoneSubmitNumber {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Back/i }));

    expect(mockNavigateBackward).toHaveBeenCalledTimes(1);
  });
});
