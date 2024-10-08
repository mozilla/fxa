// TODO in FXA-7890 import tests from previous design and update

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Subject } from './mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('fxa-react/lib/utils', () => ({
  ...jest.requireActual('fxa-react/lib/utils'),
  hardNavigate: jest.fn(),
}));

describe('ConfirmTotpResetPassword', () => {
  let mockVerifyCode: jest.Mock;
  beforeEach(() => {
    mockVerifyCode = jest.fn((code: string) => Promise.resolve());
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderWithLocalizationProvider(<Subject verifyCode={mockVerifyCode} />);

    expect(
      screen.getByRole('heading', { name: 'Reset your password' })
    ).toBeVisible();

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Enter your two-factor authentication security code (2FA)'
    );

    expect(screen.getByRole('textbox', { name: 'Enter code' })).toBeVisible();

    expect(
      screen.getByText('Check your authenticator app to reset your password.')
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeVisible();
    expect(screen.getByText('Trouble entering code?')).toBeVisible();
  });

  it('submits with valid 2FA code', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<Subject verifyCode={mockVerifyCode} />);

    await waitFor(() =>
      screen.getByRole('textbox', { name: 'Enter code' }).click()
    );
    await waitFor(() => {
      user.paste('123456');
    });

    const submitButton = screen.getByRole('button', {
      name: 'Confirm',
    });
    expect(submitButton).toBeEnabled();

    await waitFor(() => user.click(submitButton));
    expect(mockVerifyCode).toHaveBeenCalledTimes(1);
    expect(mockVerifyCode).toHaveBeenCalledWith('123456');
  });
});
