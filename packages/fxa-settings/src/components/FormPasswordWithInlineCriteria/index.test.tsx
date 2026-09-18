/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, fireEvent, waitFor } from '@testing-library/react';
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
    screen.getByLabelText('Confirm password');
    screen.getByRole('button', { name: 'Create new password' });
  });

  it('renders as expected for the signup form type', async () => {
    renderWithLocalizationProvider(
      <Subject passwordFormType="signup" requirePasswordConfirmation={true} />
    );

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
    expect(screen.getAllByLabelText('failed')).toHaveLength(1);
    const passwordMinCharRequirement = screen.getByTestId(
      'password-min-char-req'
    );
    expect(passwordMinCharRequirement.querySelector('svg')).toHaveTextContent(
      'icon-x.svg'
    );
  });

  it('sets IME action hints on the password fields', () => {
    renderWithLocalizationProvider(<Subject passwordFormType="reset" />);

    expect(screen.getByLabelText('New password')).toHaveAttribute(
      'enterkeyhint',
      'next'
    );
    expect(screen.getByLabelText('Confirm password')).toHaveAttribute(
      'enterkeyhint',
      'done'
    );
  });

  it('sets the done IME action hint when there is no confirm field', () => {
    renderWithLocalizationProvider(<Subject passwordFormType="signup" />);

    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'enterkeyhint',
      'done'
    );
  });

  it('submits on Enter when there is no confirm field', async () => {
    const onFormSubmit = jest.fn();
    renderWithLocalizationProvider(
      <Subject passwordFormType="signup" {...{ onFormSubmit }} />
    );

    await user.type(screen.getByLabelText('Password'), 'ANiceLongPassword');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(onFormSubmit).toHaveBeenCalled());
  });

  it('moves focus to the confirm field on Enter instead of submitting', async () => {
    const onFormSubmit = jest.fn();
    renderWithLocalizationProvider(
      <Subject passwordFormType="reset" {...{ onFormSubmit }} />
    );

    await user.type(screen.getByLabelText('New password'), 'ANiceLongPassword');
    await user.keyboard('{Enter}');

    expect(screen.getByLabelText('Confirm password')).toHaveFocus();
    expect(onFormSubmit).not.toHaveBeenCalled();
  });

  it('keeps the focus on the new password field when Enter ends an IME composition', async () => {
    renderWithLocalizationProvider(<Subject passwordFormType="reset" />);

    const newPasswordField = screen.getByLabelText('New password');
    await user.type(newPasswordField, 'ANiceLongPassword');
    // userEvent cannot set isComposing. fireEvent returns false when the
    // handler cancelled the event.
    const notCancelled = fireEvent.keyDown(newPasswordField, {
      key: 'Enter',
      isComposing: true,
    });

    expect(notCancelled).toBe(true);
    expect(newPasswordField).toHaveFocus();
  });

  it('does not submit on Enter when the form is invalid', async () => {
    const onFormSubmit = jest.fn();
    renderWithLocalizationProvider(
      <Subject passwordFormType="reset" {...{ onFormSubmit }} />
    );

    await user.type(screen.getByLabelText('New password'), 'short');
    await user.type(screen.getByLabelText('Confirm password'), 'short');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(onFormSubmit).not.toHaveBeenCalled());
  });

  it('disallows common passwords', async () => {
    renderWithLocalizationProvider(<Subject passwordFormType="signup" />);
    const passwordField = screen.getByLabelText('Password');
    await user.type(passwordField, 'mozilla accounts');
    expect(screen.getAllByLabelText('passed')).toHaveLength(2);
    expect(screen.getAllByLabelText('failed')).toHaveLength(1);
    expect(
      screen.getByTestId('password-not-common-req').querySelector('svg')
    ).toHaveTextContent('icon-x.svg');
  });
});
