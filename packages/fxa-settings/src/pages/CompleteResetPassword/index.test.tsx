/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockAppContext, renderWithRouter } from '../../models/mocks';
import { AppContext, AlertBarInfo } from '../../models';
import CompleteResetPassword from '.';
import { usePageViewEvent } from '../../lib/metrics';

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

const alertBarInfo = {
  success: jest.fn(),
  error: jest.fn(),
} as unknown as AlertBarInfo;

describe('CompleteResetPassword', () => {
  it('renders the component as expected when the link is valid', () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ alertBarInfo })}>
        <CompleteResetPassword linkStatus="valid" />
      </AppContext.Provider>
    );

    screen.getByRole('heading', {
      name: 'Create new password',
    });
    screen.getByText('Password requirements');
    screen.getByLabelText('Enter new password');
    screen.getByLabelText('Confirm new password');
    screen.getByRole('button', { name: 'Save' });
    screen.getByRole('link', {
      name: 'Remember your password? Sign in',
    });

    // The current password field should not be rendered
    const currentPwField = screen.queryByLabelText('Enter current password');
    expect(currentPwField).not.toBeInTheDocument();
  });

  it('renders the component as expected when provided with an expired link', () => {
    render(<CompleteResetPassword linkStatus="expired" />);

    screen.getByRole('heading', {
      name: 'Reset password link expired',
    });
    screen.getByText('The link you clicked to reset your password is expired.');
    screen.getByRole('button', {
      name: 'Receive new link',
    });

    // Components that should not be rendered when the link is expired
    const passwordResetWarning = screen.queryByText(
      'When you reset your password, you reset your account.'
    );
    const passwordRequirements = screen.queryByText('Password requirements');
    const newPasswordField = screen.queryByLabelText('Enter new password');

    expect(passwordResetWarning).not.toBeInTheDocument();
    expect(passwordRequirements).not.toBeInTheDocument();
    expect(newPasswordField).not.toBeInTheDocument();
  });

  it('renders the component as expected when provided with a damaged link', () => {
    render(<CompleteResetPassword linkStatus="damaged" />);

    screen.getByRole('heading', {
      name: 'Reset password link damaged',
    });
    screen.getByText(
      'The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.'
    );
    screen.queryByText('When you reset your password, you reset your account.');

    // Components that should not be rendered when the link is damaged
    const passwordRequirements = screen.queryByText('Password requirements');
    const newPasswordField = screen.queryByLabelText('Enter new password');
    const receiveNewLink = screen.queryByRole('button', {
      name: 'Receive new link',
    });

    expect(receiveNewLink).not.toBeInTheDocument();
    expect(passwordRequirements).not.toBeInTheDocument();
    expect(newPasswordField).not.toBeInTheDocument();
  });

  // TODO : check for metrics event when link is expired or damaged
  it('emits the expected metrics on render when the link is valid', async () => {
    render(<CompleteResetPassword linkStatus="valid" />);
    expect(usePageViewEvent).toHaveBeenCalledWith('complete-reset-password', {
      entrypoint_variation: 'react',
    });
  });
});
