/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import AccountRecoveryResetPassword, { viewName } from '.';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { REACT_ENTRYPOINT, SHOW_BALLOON_TIMEOUT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

describe('AccountRecoveryResetPassword page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected with valid link', () => {
    render(
      <AccountRecoveryResetPassword
        email={MOCK_ACCOUNT.primaryEmail.email}
        linkStatus="valid"
      />
    );
    // testAllL10n(screen, bundle);

    screen.getByRole('heading', { name: 'Create new password' });
    screen.getByLabelText('New password');
    screen.getByLabelText('Re-enter password');

    screen.getByRole('button', { name: 'Reset password' });
    screen.getByRole('link', {
      name: 'Remember your password? Sign in',
    });
  });

  it('displays password requirements when the new password field is in focus', async () => {
    render(
      <AccountRecoveryResetPassword
        email={MOCK_ACCOUNT.primaryEmail.email}
        linkStatus="valid"
      />
    );

    const newPasswordField = screen.getByTestId('new-password-input-field');
    expect(screen.queryByText('Password requirements')).not.toBeInTheDocument();

    fireEvent.focus(newPasswordField);
    await waitFor(
      () => {
        expect(screen.getByText('Password requirements')).toBeVisible();
      },
      {
        timeout: SHOW_BALLOON_TIMEOUT,
      }
    );
  });

  it('shows a different message when given a damaged link', () => {
    render(
      <AccountRecoveryResetPassword
        email={MOCK_ACCOUNT.primaryEmail.email}
        linkStatus="damaged"
      />
    );
    screen.getByRole('heading', { name: 'Reset password link damaged' });
  });

  it('shows a different message for an expired link, with a button for getting a new link', () => {
    render(
      <AccountRecoveryResetPassword
        email={MOCK_ACCOUNT.primaryEmail.email}
        linkStatus="expired"
      />
    );
    screen.getByRole('heading', { name: 'Reset password link expired' });
    screen.getByRole('button', { name: 'Receive new link' });
  });

  it('emits a metrics event on render', () => {
    render(
      <AccountRecoveryResetPassword
        email={MOCK_ACCOUNT.primaryEmail.email}
        linkStatus="valid"
      />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
