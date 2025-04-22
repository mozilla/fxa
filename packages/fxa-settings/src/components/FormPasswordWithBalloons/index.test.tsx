/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import { Subject } from './mocks';
import { SHOW_BALLOON_TIMEOUT } from '../../constants';
import { MOCK_PASSWORD } from '../../pages/mocks';

describe('FormPasswordWithBalloons component', () => {
  let bundle: FluentBundle;
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  describe('signup form type', () => {
    describe('with password confirmation', () => {
      it('renders as expected', async () => {
        renderWithLocalizationProvider(<Subject />);

        await waitFor(() => {
          screen.getByLabelText('Password');
        });
        screen.getByLabelText('Repeat password');
        screen.getByRole('button', { name: 'Create account' });
      });

      it('displays the PasswordStrengthBalloon when the new password field is in focus', async () => {
        renderWithLocalizationProvider(<Subject />);
        const newPasswordField = screen.getByLabelText('Password');

        fireEvent.focus(newPasswordField);

        await waitFor(() => screen.getByText('Password requirements'));
      });

      it('displays the PasswordInfoBalloon for the signup form type when the confirm password field is in focus', async () => {
        renderWithLocalizationProvider(<Subject />);
        const passwordField = screen.getByLabelText('Password');
        const confirmPasswordField = screen.getByLabelText('Repeat password');

        fireEvent.change(passwordField, { target: { value: MOCK_PASSWORD } });
        fireEvent.focus(confirmPasswordField);

        await waitFor(
          () =>
            expect(
              screen.queryByText(
                'You need this password to access any encrypted data you store with us.'
              )
            ).toBeVisible(),
          { timeout: SHOW_BALLOON_TIMEOUT + 200 }
        );
      });

      // TODO in FXA-7482, review our password requirements and best way to display them
      it('disallows space-only passwords', async () => {
        renderWithLocalizationProvider(<Subject />);
        const passwordField = screen.getByLabelText('Password');
        user.type(passwordField, '        ');

        await waitFor(() => screen.getByText('Password requirements'));
        expect(screen.queryAllByText('icon-check-blue-50.svg')).toHaveLength(2);
        const passwordMinCharRequirement = screen.getByTestId(
          'password-min-char-req'
        );
        const imageElement = within(passwordMinCharRequirement).getByRole(
          'img'
        );
        expect(imageElement).toHaveTextContent('icon-warning-red-50.svg');
      });

      it('disallows common passwords', async () => {
        renderWithLocalizationProvider(<Subject />);
        const passwordField = screen.getByLabelText('Password');
        user.type(passwordField, 'mozilla accounts');
        await waitFor(() => screen.getByText('Password requirements'));
        expect(screen.queryAllByText('icon-check-blue-50.svg')).toHaveLength(2);

        const passwordNotCommonRequirement = screen.getByTestId(
          'password-not-common-req'
        );
        const imageElement = within(passwordNotCommonRequirement).getByRole(
          'img'
        );
        expect(imageElement).toHaveTextContent('icon-warning-red-50.svg');
      });
    });

    describe('without password confirmation', () => {
      it('renders as expected', async () => {
        renderWithLocalizationProvider(
          <Subject requirePasswordConfirmation={false} />
        );

        await waitFor(() => {
          screen.getByLabelText('Password');
        });
        expect(
          screen.queryByLabelText('Repeat password')
        ).not.toBeInTheDocument();
        screen.getByRole('button', { name: 'Create account' });
      });

      it('allows users to show and hide password input', async () => {
        renderWithLocalizationProvider(<Subject />);

        const newPasswordInput = screen.getByLabelText('Password');

        await waitFor(() => {
          expect(newPasswordInput).toHaveAttribute('type', 'password');
        });
        expect(newPasswordInput).toHaveAttribute('type', 'password');
        fireEvent.click(screen.getByTestId('new-password-visibility-toggle'));
        expect(newPasswordInput).toHaveAttribute('type', 'text');
        fireEvent.click(screen.getByTestId('new-password-visibility-toggle'));
        expect(newPasswordInput).toHaveAttribute('type', 'password');
      });
    });
  });

  describe('reset password form type', () => {
    it('renders as expected for the reset form type', async () => {
      renderWithLocalizationProvider(<Subject passwordFormType="reset" />);
      testAllL10n(screen, bundle);

      await waitFor(() => {
        screen.getByLabelText('New password');
      });
      screen.getByLabelText('Re-enter password');
      screen.getByRole('button', { name: 'Reset password' });
    });

    it('displays the PasswordStrengthBalloon when the new password field is in focus', async () => {
      renderWithLocalizationProvider(<Subject passwordFormType="reset" />);
      const newPasswordField = screen.getByLabelText('New password');

      fireEvent.focus(newPasswordField);

      await waitFor(() => screen.getByText('Password requirements'));
    });

    it('does not display the PasswordInfoBalloon for the reset form type', async () => {
      renderWithLocalizationProvider(<Subject passwordFormType="reset" />);
      const passwordField = screen.getByLabelText('New password');
      const confirmPasswordField = screen.getByLabelText('Re-enter password');

      fireEvent.change(passwordField, { target: { value: MOCK_PASSWORD } });
      fireEvent.focus(confirmPasswordField);

      await waitFor(() => {
        expect(
          screen.queryByText(
            'You need this password to access any encrypted data you store with us.'
          )
        ).not.toBeInTheDocument();
      });
    });
  });
});
