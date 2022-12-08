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
        <CompleteResetPassword />
      </AppContext.Provider>
    );

    const createNewPasswordHeader = screen.getByRole('heading', {
      name: 'Create new password',
    });
    const passwordRequirements = screen.getByText('Password requirements');
    const newPasswordField = screen.getByLabelText('Enter new password');
    const confirmNewPasswordField = screen.getByLabelText(
      'Confirm new password'
    );
    const currentPwField = screen.queryByLabelText('Enter current password');
    const passwordSaveButton = screen.getByRole('button', { name: 'Save' });
    const rememberPassword = screen.getByRole('link', {
      name: 'Remember your password? Sign in',
    });

    expect(createNewPasswordHeader).toBeInTheDocument();
    expect(passwordRequirements).toBeInTheDocument();
    expect(currentPwField).not.toBeInTheDocument();
    expect(newPasswordField).toBeInTheDocument();
    expect(confirmNewPasswordField).toBeInTheDocument();
    expect(passwordSaveButton).toBeInTheDocument();
    expect(rememberPassword).toBeInTheDocument();
  });

  it('renders the component as expected when provided with an expired link', () => {
    render(<CompleteResetPassword isLinkExpired={true} />);

    const expiredLinkHeader = screen.getByRole('heading', {
      name: 'Reset password link expired',
    });
    const expiredLinkMessage = screen.getByText(
      'The link you clicked to reset your password is expired.'
    );
    const receiveNewLink = screen.getByRole('button', {
      name: 'Receive new link',
    });
    const passwordResetWarning = screen.queryByText(
      'When you reset your password, you reset your account.'
    );
    const passwordRequirements = screen.queryByText('Password requirements');
    const newPasswordField = screen.queryByLabelText('Enter new password');

    expect(expiredLinkHeader).toBeInTheDocument();
    expect(expiredLinkMessage).toBeInTheDocument();
    expect(receiveNewLink).toBeInTheDocument();
    expect(passwordResetWarning).not.toBeInTheDocument();
    expect(passwordRequirements).not.toBeInTheDocument();
    expect(newPasswordField).not.toBeInTheDocument();
  });

  it('renders the component as expected when provided with a damaged link', () => {
    render(<CompleteResetPassword isLinkDamaged={true} />);

    const damagedLinkHeader = screen.getByRole('heading', {
      name: 'Reset password link damaged',
    });
    const damagedLinkMessage = screen.getByText(
      'The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.'
    );
    const passwordResetWarning = screen.queryByText(
      'When you reset your password, you reset your account.'
    );
    const passwordRequirements = screen.queryByText('Password requirements');
    const newPasswordField = screen.queryByLabelText('Enter new password');
    const receiveNewLink = screen.queryByRole('button', {
      name: 'Receive new link',
    });

    expect(damagedLinkHeader).toBeInTheDocument();
    expect(damagedLinkMessage).toBeInTheDocument();
    expect(receiveNewLink).not.toBeInTheDocument();
    expect(passwordResetWarning).not.toBeInTheDocument();
    expect(passwordRequirements).not.toBeInTheDocument();
    expect(newPasswordField).not.toBeInTheDocument();
  });

  it('emits the expected metrics on render', async () => {
    render(<CompleteResetPassword />);
    expect(usePageViewEvent).toHaveBeenCalledWith('complete-reset-password', {
      entrypoint_variation: 'react',
    });
  });
});
