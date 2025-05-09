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
      'Enter two-step authentication code'
    );

    expect(
      screen.getByRole('textbox', { name: 'Enter 6-digit code' })
    ).toBeVisible();

    screen.getByText('authenticator app', { exact: false });
    screen.getByText('to reset your password', { exact: false });
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeVisible();
    expect(screen.getByText('Trouble entering code?')).toBeVisible();
  });

  it('submits with valid 2FA code', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<Subject verifyCode={mockVerifyCode} />);

    await waitFor(() => user.type(screen.getByRole('textbox'), '123456'));

    const submitButton = screen.getByRole('button', {
      name: 'Confirm',
    });
    await waitFor(() => expect(submitButton).toBeEnabled());

    user.click(submitButton);
    await waitFor(() => expect(mockVerifyCode).toHaveBeenCalledTimes(1));
    expect(mockVerifyCode).toHaveBeenCalledWith('123456');
  });

  it('shows an error string passed via props', async () => {
    renderWithLocalizationProvider(<Subject errorMessage="Bad code" />);

    expect(await screen.findByText('Bad code')).toBeInTheDocument();
  });

  it('invokes onTroubleWithCode when the link is clicked', async () => {
    const onTrouble = jest.fn();
    const user = userEvent.setup();

    renderWithLocalizationProvider(<Subject onTroubleWithCode={onTrouble} />);

    const link = screen.getByRole('button', { name: /trouble entering code/i });
    await user.click(link);

    expect(onTrouble).toHaveBeenCalledTimes(1);
  });
});
