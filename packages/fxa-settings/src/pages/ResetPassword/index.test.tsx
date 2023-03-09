/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, render, screen } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

import { logPageViewEvent } from '../../lib/metrics';
import ResetPassword, { viewName } from '.';
import { REACT_ENTRYPOINT } from '../../constants';

import { MOCK_ACCOUNT, mockAppContext } from '../../models/mocks';
import { MozServices } from '../../lib/types';
import { Account, AppContext } from '../../models';
import { AuthUiErrorNos } from '../../lib/auth-errors/auth-errors';

jest.mock('../../lib/metrics', () => ({
  logPageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

function renderWithAccount(account: Account) {
  render(
    <AppContext.Provider value={mockAppContext({ account })}>
      <ResetPassword />
    </AppContext.Provider>
  );
}

describe('PageResetPassword', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected when no props are provided', () => {
    render(<ResetPassword />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Reset password to continue to account settings'
    );
    expect(screen.getByTestId('warning-message-container')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Begin Reset' })
    ).toBeInTheDocument();
    // when forceEmail is NOT provided as a prop, the optional read-only email should not be rendered
    const forcedEmailEl = screen.queryByTestId('reset-password-force-email');
    expect(forcedEmailEl).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Remember your password? Sign in' })
    ).toBeInTheDocument();
  });

  it('renders a custom service name in the header when it is provided', () => {
    render(<ResetPassword serviceName={MozServices.MozillaVPN} />);
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      `Reset password to continue to Mozilla VPN`
    );
  });

  it('renders a read-only email but no text input when forceAuth is true', () => {
    render(
      <ResetPassword
        prefillEmail={MOCK_ACCOUNT.primaryEmail.email}
        forceAuth={true}
      />
    );
    expect(
      screen.getByTestId('reset-password-force-email')
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });

  it('emits a metrics event on render', () => {
    render(<ResetPassword />);
    expect(logPageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('submit success', async () => {
    const account = {
      resetPassword: jest.fn().mockResolvedValue({
        passwordForgotToken: '123',
      }),
    } as unknown as Account;

    renderWithAccount(account);

    await act(async () => {
      fireEvent.input(screen.getByTestId('reset-password-input-field'), {
        target: { value: MOCK_ACCOUNT.primaryEmail.email },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Begin Reset'));
    });

    expect(account.resetPassword).toHaveBeenCalledWith(
      MOCK_ACCOUNT.primaryEmail.email
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      'confirm_reset_password?showReactApp=true',
      {
        replace: true,
        state: {
          email: 'johndope@example.com',
          passwordForgotToken: '123',
        },
      }
    );
  });

  it('displays errors', async () => {
    const gqlError: any = AuthUiErrorNos[102]; // Unknown account error
    const account = {
      resetPassword: jest.fn().mockRejectedValue(gqlError),
    } as unknown as Account;

    renderWithAccount(account);

    await act(async () => {
      fireEvent.click(screen.getByText('Begin Reset'));
    });

    await screen.findByText('Unknown account');
  });
});
