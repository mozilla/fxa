/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

import { usePageViewEvent } from '../../lib/metrics';
import ResetPassword, { viewName } from '.';
import { REACT_ENTRYPOINT } from '../../constants';

import { MOCK_ACCOUNT, mockAppContext } from '../../models/mocks';
import { Account } from '../../models';
import { AuthUiErrorNos } from '../../lib/auth-errors/auth-errors';
import { typeByLabelText } from '../../lib/test-utils';
import {
  createAppContext,
  createHistoryWithQuery,
  renderWithRouter,
} from '../../models/mocks';

const mockLogViewEvent = jest.fn();
const mockLogPageViewEvent = jest.fn();

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  useMetrics: jest.fn(() => ({
    logViewEventOnce: mockLogViewEvent,
    logPageViewEventOnce: mockLogPageViewEvent,
  })),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

const route = '/reset_password';
const render = (ui: any, queryParams = '', account?: Account) => {
  const history = createHistoryWithQuery(route, queryParams);
  if (account) {
    return renderWithRouter(
      ui,
      {
        route,
        history,
      },
      mockAppContext({
        ...createAppContext(history),
        account,
      })
    );
  }

  return renderWithRouter(
    ui,
    {
      route,
      history,
    },
    mockAppContext({
      ...createAppContext(history),
    })
  );
};

describe('PageResetPassword', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected when no props are provided', async () => {
    render(<ResetPassword />);
    // testAllL10n(screen, bundle);

    const headingEl = await screen.findByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Reset password to continue to account settings'
    );
    expect(screen.getByTestId('warning-message-container')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Begin reset' })
    ).toBeInTheDocument();
    // when forceEmail is NOT provided as a prop, the optional read-only email should not be rendered
    const forcedEmailEl = screen.queryByTestId('reset-password-force-email');
    expect(forcedEmailEl).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Remember your password? Sign in' })
    ).toBeInTheDocument();
  });

  it('renders a custom service name in the header when it is provided', async () => {
    render(<ResetPassword />, 'service=sync');
    const headingEl = await screen.findByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      `Reset password to continue to Firefox Sync`
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

  it('emits a metrics event on render', async () => {
    render(<ResetPassword />);
    await screen.findByText('Reset password');
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('submit success', async () => {
    const account = {
      resetPassword: jest.fn().mockResolvedValue({
        passwordForgotToken: '123',
      }),
    } as unknown as Account;

    render(
      <ResetPassword />,
      'client_id=123&service=123Done&resume=123abc&redirect_uri=foo&scope=profile:email',
      account
    );

    await act(async () => {
      const resetPasswordInput = await screen.findByTestId(
        'reset-password-input-field'
      );
      fireEvent.input(resetPasswordInput, {
        target: { value: MOCK_ACCOUNT.primaryEmail.email },
      });
    });

    await act(async () => {
      fireEvent.click(await screen.findByText('Begin reset'));
    });

    expect(account.resetPassword).toHaveBeenCalled();

    expect(account.resetPassword).toHaveBeenCalledWith(
      MOCK_ACCOUNT.primaryEmail.email,
      '123Done',
      'foo'
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

  it('submit success with trailing space in email', async () => {
    const account = {
      resetPassword: jest.fn().mockResolvedValue({
        passwordForgotToken: '123',
      }),
    } as unknown as Account;

    render(<ResetPassword />, '', account);

    await waitFor(() =>
      fireEvent.input(screen.getByTestId('reset-password-input-field'), {
        target: { value: `${MOCK_ACCOUNT.primaryEmail.email} ` },
      })
    );

    fireEvent.click(screen.getByText('Begin reset'));

    await waitFor(() => {
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
  });

  it('submit success with leading space in email', async () => {
    const account = {
      resetPassword: jest.fn().mockResolvedValue({
        passwordForgotToken: '123',
      }),
    } as unknown as Account;

    render(<ResetPassword />, '', account);

    fireEvent.input(await screen.findByTestId('reset-password-input-field'), {
      target: { value: ` ${MOCK_ACCOUNT.primaryEmail.email}` },
    });
    fireEvent.click(await screen.findByText('Begin reset'));
    await waitFor(() => {
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
  });

  describe('displays error and does not allow submission', () => {
    const account = {
      resetPassword: jest.fn().mockResolvedValue({
        passwordForgotToken: '123',
      }),
    } as unknown as Account;

    it('with an empty email', async () => {
      render(<ResetPassword />, '', account);

      const button = await screen.findByRole('button', { name: 'Begin reset' });
      fireEvent.click(button);

      await screen.findByText('Email required');
      expect(account.resetPassword).not.toHaveBeenCalled();

      // clears the error onchange
      await typeByLabelText('Email')('a');
      expect(screen.queryByText('Email required')).not.toBeInTheDocument();
    });

    it('with an invalid email', async () => {
      render(<ResetPassword />, '', account);
      await typeByLabelText('Email')('foxy@gmail.');

      const button = await screen.findByRole('button', { name: 'Begin reset' });
      fireEvent.click(button, { name: 'Begin reset' });

      await screen.findByText('Valid email required');
      expect(account.resetPassword).not.toHaveBeenCalled();

      // clears the error onchange
      await typeByLabelText('Email')('a');
      expect(
        screen.queryByText('Valid email required')
      ).not.toBeInTheDocument();
    });
  });

  it('displays an error when the account is unknown', async () => {
    const gqlError: any = AuthUiErrorNos[102]; // Unknown account error
    const account = {
      resetPassword: jest.fn().mockRejectedValue(gqlError),
    } as unknown as Account;

    render(<ResetPassword />, '', account);

    fireEvent.input(screen.getByTestId('reset-password-input-field'), {
      target: { value: MOCK_ACCOUNT.primaryEmail.email },
    });

    fireEvent.click(screen.getByRole('button'));
    await screen.findByText('Unknown account');
  });

  it('displays an error when rate limiting kicks in', async () => {
    // mocks an error that contains the required values to localize the message
    // does not test if the Account model passes in the correct information
    // does not test if the message is localized
    // does not test if the lang of localizedRetryAfter matches the lang used for the rest of the string
    const gqlThrottledErrorWithRetryAfter: any = {
      errno: 114,
      message: AuthUiErrorNos[114].message,
      retryAfter: 500,
      retryAfterLocalized: 'in 15 minutes',
    }; // Throttled error

    const account = {
      resetPassword: jest
        .fn()
        .mockRejectedValue(gqlThrottledErrorWithRetryAfter),
    } as unknown as Account;

    render(<ResetPassword />, '', account);

    const input = await screen.findByTestId('reset-password-input-field');
    fireEvent.input(input, {
      target: { value: MOCK_ACCOUNT.primaryEmail.email },
    });

    const resetButton = await screen.findByText('Begin reset');

    await act(async () => {
      resetButton.click();
    });

    await screen.findByText(
      'You’ve tried too many times. Please try again in 15 minutes.'
    );
  });

  it('handles unexpected errors on submit', async () => {
    const unexpectedError: Error = { name: 'fake', message: 'error' }; // Unknown account error
    const account = {
      resetPassword: jest.fn().mockRejectedValue(unexpectedError),
    } as unknown as Account;

    render(<ResetPassword />, '', account);

    fireEvent.input(screen.getByTestId('reset-password-input-field'), {
      target: { value: MOCK_ACCOUNT.primaryEmail.email },
    });

    fireEvent.click(screen.getByText('Begin reset'));

    await waitFor(() => screen.findByText('Unexpected error'));
  });
});
