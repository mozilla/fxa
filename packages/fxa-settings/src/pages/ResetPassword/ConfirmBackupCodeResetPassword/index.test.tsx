/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Subject } from './mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ConfirmBackupCodeResetPassword', () => {
  let mockVerifyBackupCode: jest.Mock;
  beforeEach(() => {
    mockVerifyBackupCode = jest.fn((code: string) => Promise.resolve());
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(
      <Subject verifyBackupCode={mockVerifyBackupCode} />
    );

    expect(
      screen.getByRole('heading', { name: 'Reset your password', level: 1 })
    ).toBeVisible();

    expect(
      screen.getByRole('heading', {
        name: 'Enter backup authentication code',
        level: 2,
      })
    ).toBeVisible();

    expect(
      screen.getByText(
        'Enter one of the one-time-use codes you saved when you set up two-step authentication.'
      )
    ).toBeVisible();

    expect(
      screen.getByRole('textbox', { name: 'Enter 10-character code' })
    ).toBeVisible();

    const submitButton = screen.getByRole('button', { name: 'Confirm' });
    expect(submitButton).toBeVisible();
    expect(submitButton).toBeDisabled();

    expect(
      screen.getByRole('link', { name: /Are you locked out?/ })
    ).toBeVisible();
  });

  it('submits with valid backup code', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(
      <Subject verifyBackupCode={mockVerifyBackupCode} />
    );

    const codeInput = screen.getByRole('textbox', {
      name: 'Enter 10-character code',
    });

    await user.type(codeInput, 'ABCDEFGHJK');
    await waitFor(() => expect(codeInput).toHaveValue('ABCDEFGHJK'));

    const submitButton = screen.getByRole('button', {
      name: 'Confirm',
    });
    await waitFor(() => expect(submitButton).toBeEnabled());

    await waitFor(() => user.click(submitButton));
    expect(mockVerifyBackupCode).toHaveBeenCalledTimes(1);
    expect(mockVerifyBackupCode).toHaveBeenCalledWith('ABCDEFGHJK');
  });

  it('renders a passed‑in error message', async () => {
    renderWithLocalizationProvider(
      <Subject errorMessage="Bad recovery code" />
    );
    expect(await screen.findByText('Bad recovery code')).toBeInTheDocument();
  });
});
