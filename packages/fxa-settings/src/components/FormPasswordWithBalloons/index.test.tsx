/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { typeByLabelText, typeByTestIdFn } from '../../lib/test-utils';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { Subject } from './mocks';
import { SHOW_BALLOON_TIMEOUT, HIDE_BALLOON_TIMEOUT } from '../../constants';

export const inputNewPassword = typeByTestIdFn('new-password-input-field');
export const inputVerifyPassword = typeByTestIdFn(
  'verify-password-input-field'
);

describe('FormPasswordWithBalloons component', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  it('renders as expected for the reset form type', () => {
    render(<Subject passwordFormType="reset" />);
    // capitalization mismatch on "Stay safe — Don’t reuse" vs "Stay safe — don’t reuse"
    // testAllL10n(screen, bundle);
    screen.getByLabelText('New password');
    screen.getByLabelText('Re-enter password');
    screen.getByRole('button', { name: 'Reset password' });
  });

  it('renders as expected for the signup form type', () => {
    render(<Subject passwordFormType="signup" />);
    screen.getByLabelText('Password');
    screen.getByLabelText('Repeat password');
    screen.getByRole('button', { name: 'Create account' });
  });

  it('displays the PasswordStrengthBalloon on render and when the new password field is in focus', async () => {
    render(<Subject passwordFormType="reset" />);
    screen.getByText('Password requirements');

    typeByLabelText('New password')('testo123');
    const newPasswordField = screen.getByLabelText('New password');

    fireEvent.blur(newPasswordField);

    await waitFor(
      () => {
        expect(
          screen.queryByText('Password requirements')
        ).not.toBeInTheDocument();
      },
      {
        timeout: SHOW_BALLOON_TIMEOUT,
      }
    );

    fireEvent.focus(newPasswordField);

    await waitFor(
      () => expect(screen.getByText('Password requirements')).toBeVisible(),
      {
        timeout: SHOW_BALLOON_TIMEOUT,
      }
    );
  });

  it('does not display the PasswordInfoBalloon for the reset form type', async () => {
    render(<Subject passwordFormType="reset" />);
    fireEvent.change(screen.getByTestId('new-password-input-field'), {
      target: { value: 'testo12345' },
    });
    const confirmPasswordField = screen.getByLabelText('Re-enter password');

    fireEvent.focus(confirmPasswordField);
    await waitFor(() => {
      expect(
        screen.queryByText(
          'You need this password to access any encrypted data you store with us.'
        )
      ).not.toBeInTheDocument();
    });
  });

  it('displays the PasswordInfoBalloon for the signup form type when the confirm password field is in focus', async () => {
    render(<Subject passwordFormType="signup" />);
    // must have valid PW for the first input balloon to hide and 2nd to be shown
    fireEvent.change(screen.getByTestId('new-password-input-field'), {
      target: { value: 'testo12345' },
    });

    const confirmPasswordField = screen.getByLabelText('Repeat password');

    fireEvent.focus(confirmPasswordField);
    await waitFor(
      () =>
        expect(
          screen.queryByText(
            'You need this password to access any encrypted data you store with us.'
          )
        ).toBeVisible(),
      { timeout: SHOW_BALLOON_TIMEOUT }
    );

    fireEvent.blur(confirmPasswordField);
    await waitFor(
      () =>
        expect(
          screen.queryByText(
            'You need this password to access any encrypted data you store with us.'
          )
        ).not.toBeInTheDocument(),
      { timeout: HIDE_BALLOON_TIMEOUT }
    );
  });
});
