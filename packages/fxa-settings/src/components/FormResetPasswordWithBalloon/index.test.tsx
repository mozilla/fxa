/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { typeByTestIdFn } from '../../lib/test-utils';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { Subject } from './mocks';

export const inputNewPassword = typeByTestIdFn('new-password-input-field');
export const inputVerifyPassword = typeByTestIdFn(
  'verify-password-input-field'
);

describe('password form with password requirement balloons', () => {
  it('renders as expected', () => {
    render(<Subject />);
    const newPasswordField = screen.getByTestId('new-password-input-field');

    expect(newPasswordField).toBeInTheDocument();
    screen.getByTestId('verify-password-input-field');
    screen.getByRole('button', { name: 'Reset password' });
  });

  it('only displays password requirements when the new password field is in focus', async () => {
    render(<Subject />);
    const newPasswordField = screen.getByTestId('new-password-input-field');

    fireEvent.focus(newPasswordField);
    await waitFor(() => {
      expect(screen.getByText('Password requirements')).toBeVisible();
    });

    fireEvent.blur(newPasswordField);
    await waitFor(() => {
      expect(
        screen.queryByText('Password requirements')
      ).not.toBeInTheDocument();
    });
  });

  it('disables the confirm password input until the new password is valid', async () => {
    render(<Subject />);
    const verifyPasswordField = screen.getByTestId(
      'verify-password-input-field'
    );
    expect(verifyPasswordField).toBeDisabled();

    // if password is too short
    await inputNewPassword('test');
    expect(verifyPasswordField).toBeDisabled();
    // if password is user's email
    await inputNewPassword('test@example.com');
    expect(verifyPasswordField).toBeDisabled();
    // if password is common
    await inputNewPassword('password');
    expect(verifyPasswordField).toBeDisabled();
    // respects requirements
    await inputNewPassword('testotest0');
    expect(verifyPasswordField).toBeEnabled();
  });

  it('disables submission until the form is valid', async () => {
    render(<Subject />);
    const resetPasswordButton = screen.getByRole('button', {
      name: 'Reset password',
    });
    expect(resetPasswordButton).toBeDisabled();

    // only new password filled
    await inputNewPassword('testotesto');
    expect(resetPasswordButton).toBeDisabled();
    // both inputs filled and passwords match
    await inputVerifyPassword('testotesto');
    expect(resetPasswordButton).toBeEnabled();
    // both inputs filled but no match
    await inputNewPassword('testotest0');
    expect(resetPasswordButton).toBeDisabled();
  });
});
