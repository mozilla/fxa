/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

import GleanMetrics from '../../lib/glean';

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
import { MozServices } from '../../lib/types';
import {
  createMockResetPasswordOAuthIntegration,
  createMockResetPasswordWebIntegration,
} from './mocks';
import { MOCK_SERVICE } from '../mocks';

const mockLogViewEvent = jest.fn();
const mockLogPageViewEvent = jest.fn();

jest.mock('../../lib/metrics', () => ({
  ...jest.requireActual('../../lib/metrics'),
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

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: { resetPassword: { view: jest.fn(), submit: jest.fn() } },
}));

const route = '/reset_password';
const render = (ui: any, account?: Account) => {
  const history = createHistoryWithQuery(route);
  return renderWithRouter(
    ui,
    {
      route,
      history,
    },
    mockAppContext({
      ...createAppContext(),
      ...(account && { account }),
    })
  );
};

const ResetPasswordWithWebIntegration = () => (
  <ResetPassword
    integration={createMockResetPasswordWebIntegration()}
    flowQueryParams={{ flowId: '00ff' }}
  />
);

describe('PageResetPassword', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  beforeEach(() => {
    (GleanMetrics.resetPassword.view as jest.Mock).mockClear();
    (GleanMetrics.resetPassword.submit as jest.Mock).mockClear();
  });

  it('renders as expected', async () => {
    render(<ResetPasswordWithWebIntegration />);
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
    expect(screen.getByText('Remember your password?')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  it('renders a custom service name in the header', async () => {
    render(
      <ResetPassword
        integration={createMockResetPasswordOAuthIntegration(
          MozServices.FirefoxSync
        )}
      />
    );
    const headingEl = await screen.findByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      `Reset password to continue to Firefox Sync`
    );
  });

  it('emits a metrics event on render', async () => {
    render(<ResetPasswordWithWebIntegration />);
    await screen.findByText('Reset password');
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
    expect(GleanMetrics.resetPassword.view).toHaveBeenCalledTimes(1);
  });

  it('submit success with OAuth integration', async () => {
    const account = {
      resetPassword: jest.fn().mockResolvedValue({
        passwordForgotToken: '123',
      }),
    } as unknown as Account;

    render(
      <ResetPassword integration={createMockResetPasswordOAuthIntegration()} />,
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

    expect(GleanMetrics.resetPassword.submit).toHaveBeenCalledTimes(1);

    expect(account.resetPassword).toHaveBeenCalled();

    expect(account.resetPassword).toHaveBeenCalledWith(
      MOCK_ACCOUNT.primaryEmail.email,
      MOCK_SERVICE,
      undefined,
      {}
    );

    expect(mockNavigate).toHaveBeenCalledWith('/confirm_reset_password', {
      replace: true,
      state: {
        email: 'johndope@example.com',
        passwordForgotToken: '123',
      },
    });
  });

  it('submit success with trailing space in email', async () => {
    const account = {
      resetPassword: jest.fn().mockResolvedValue({
        passwordForgotToken: '123',
      }),
    } as unknown as Account;

    render(<ResetPasswordWithWebIntegration />, account);

    await waitFor(() =>
      fireEvent.input(screen.getByTestId('reset-password-input-field'), {
        target: { value: `${MOCK_ACCOUNT.primaryEmail.email} ` },
      })
    );

    fireEvent.click(screen.getByText('Begin reset'));

    await waitFor(() => {
      expect(account.resetPassword).toHaveBeenCalledWith(
        MOCK_ACCOUNT.primaryEmail.email,
        undefined,
        undefined,
        { flowId: '00ff' }
      );

      expect(mockNavigate).toHaveBeenCalledWith('/confirm_reset_password', {
        replace: true,
        state: {
          email: 'johndope@example.com',
          passwordForgotToken: '123',
        },
      });
    });
  });

  it('submit success with leading space in email', async () => {
    const account = {
      resetPassword: jest.fn().mockResolvedValue({
        passwordForgotToken: '123',
      }),
    } as unknown as Account;

    render(<ResetPasswordWithWebIntegration />, account);

    fireEvent.input(await screen.findByTestId('reset-password-input-field'), {
      target: { value: ` ${MOCK_ACCOUNT.primaryEmail.email}` },
    });
    fireEvent.click(await screen.findByText('Begin reset'));
    await waitFor(() => {
      expect(account.resetPassword).toHaveBeenCalledWith(
        MOCK_ACCOUNT.primaryEmail.email,
        undefined,
        undefined,
        { flowId: '00ff' }
      );

      expect(mockNavigate).toHaveBeenCalledWith('/confirm_reset_password', {
        replace: true,
        state: {
          email: 'johndope@example.com',
          passwordForgotToken: '123',
        },
      });
    });
  });

  describe('displays error and does not allow submission', () => {
    const account = {
      resetPassword: jest.fn().mockResolvedValue({
        passwordForgotToken: '123',
      }),
    } as unknown as Account;

    it('with an empty email', async () => {
      render(<ResetPasswordWithWebIntegration />, account);

      const button = await screen.findByRole('button', { name: 'Begin reset' });
      fireEvent.click(button);

      await screen.findByText('Email required');
      expect(account.resetPassword).not.toHaveBeenCalled();

      // clears the error onchange
      await typeByLabelText('Email')('a');
      expect(screen.queryByText('Email required')).not.toBeInTheDocument();
    });

    it('with an invalid email', async () => {
      render(<ResetPasswordWithWebIntegration />, account);
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

    render(ResetPasswordWithWebIntegration, account);

    fireEvent.input(screen.getByTestId('reset-password-input-field'), {
      target: { value: MOCK_ACCOUNT.primaryEmail.email },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Begin reset' }));
    await screen.findByText('Unknown account');

    expect(GleanMetrics.resetPassword.view).toHaveBeenCalledTimes(1);
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

    render(<ResetPasswordWithWebIntegration />, account);

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

    expect(GleanMetrics.resetPassword.view).toHaveBeenCalledTimes(1);
  });

  it('handles unexpected errors on submit', async () => {
    const unexpectedError: Error = { name: 'fake', message: 'error' }; // Unknown account error
    const account = {
      resetPassword: jest.fn().mockRejectedValue(unexpectedError),
    } as unknown as Account;

    render(<ResetPasswordWithWebIntegration />, account);

    fireEvent.input(screen.getByTestId('reset-password-input-field'), {
      target: { value: MOCK_ACCOUNT.primaryEmail.email },
    });

    fireEvent.click(screen.getByText('Begin reset'));

    await waitFor(() => screen.findByText('Unexpected error'));
  });
});
