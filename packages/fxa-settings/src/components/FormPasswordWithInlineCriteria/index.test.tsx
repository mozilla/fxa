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

describe('FormPasswordWithInlineCriteria component', () => {
  let bundle: FluentBundle;
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });
  it('renders as expected for the reset form type', async () => {
    renderWithLocalizationProvider(<Subject passwordFormType="reset" />);
    testAllL10n(screen, bundle);

    await waitFor(() => {
      screen.getByLabelText('New password');
    });
    screen.getByLabelText('Re-enter password');
    screen.getByRole('button', { name: 'Reset password' });
  });

  it('renders as expected for the signup form type', async () => {
    renderWithLocalizationProvider(<Subject passwordFormType="signup" />);

    await waitFor(() => {
      screen.getByLabelText('Password');
    });
    screen.getByLabelText('Repeat password');
    screen.getByRole('button', { name: 'Create account' });
  });

  it('displays the Password Strength Criteria when the new password field is in focus', async () => {
    renderWithLocalizationProvider(<Subject passwordFormType="reset" />);
    const newPasswordField = screen.getByLabelText('New password');

    fireEvent.focus(newPasswordField);

    await waitFor(() => screen.getByText('At least 8 characters'));
    await waitFor(() => screen.getByText('Not your email address'));
    await waitFor(() => screen.getByText('Not a commonly used password'));
  });

  // TODO in FXA-7482, review our password requirements and best way to display them
  it('disallows space-only passwords', async () => {
    renderWithLocalizationProvider(<Subject passwordFormType="signup" />);
    const passwordField = screen.getByLabelText('Password');
    await user.type(passwordField, '        ');

    expect(screen.getAllByLabelText('passed')).toHaveLength(2);
    expect(screen.getAllByLabelText('failed')).toHaveLength(2);
    const passwordMinCharRequirement = screen.getByTestId(
      'password-min-char-req'
    );
    expect(passwordMinCharRequirement.querySelector('svg')).toHaveTextContent(
      'icon-x.svg'
    );
  });

  it('disallows common passwords', async () => {
    renderWithLocalizationProvider(<Subject passwordFormType="signup" />);
    const passwordField = screen.getByLabelText('Password');
    await user.type(passwordField, 'mozilla accounts');
    expect(screen.getAllByLabelText('passed')).toHaveLength(2);
    expect(screen.getAllByLabelText('failed')).toHaveLength(2);
    expect(
      screen.getByTestId('password-not-common-req').querySelector('svg')
    ).toHaveTextContent('icon-x.svg');
  });
});
