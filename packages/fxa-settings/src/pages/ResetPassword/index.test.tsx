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
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../lib/auth-errors/auth-errors';
import { typeByLabelText } from '../../lib/test-utils';
import {
  createAppContext,
  createHistoryWithQuery,
  renderWithRouter,
} from '../../models/mocks';
import { MozServices } from '../../lib/types';
import { BeginResetPasswordResult } from './container';

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
const render = ({
  ui = (
    <ResetPassword
      {...{ beginResetPasswordHandler }}
      beginResetPasswordResult={createBeginResetPasswordResult()}
    />
  ),
  queryParams = '',
}: {
  ui?: JSX.Element;
  queryParams?: string;
} = {}) => {
  const history = createHistoryWithQuery(route, queryParams);
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

const beginResetPasswordHandler = jest.fn();

const createBeginResetPasswordResult = (
  options: {
    data?: BeginResetPasswordResult['data'];
    loading?: BeginResetPasswordResult['loading'];
    error?: BeginResetPasswordResult['error'];
  } = {}
): BeginResetPasswordResult => {
  const {
    data = {
      passwordForgotSendCode: {
        passwordForgotToken: '123',
      },
    },
    loading = false,
    error,
  } = options;
  return {
    data,
    loading,
    error,
  };
};

describe('PageResetPassword', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    render();
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
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

  it('renders a custom service name in the header when it is provided', () => {
    render({ queryParams: 'service=sync' });
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      `Reset password to continue to Firefox Sync`
    );
  });

  // we're getting rid of forceAuth logic
  // it('renders a read-only email but no text input when forceAuth is true', () => {
  //   render(
  //     <ResetPassword
  //       prefillEmail={MOCK_ACCOUNT.primaryEmail.email}
  //       forceAuth={true}
  //     />
  //   );
  //   expect(
  //     screen.getByTestId('reset-password-force-email')
  //   ).toBeInTheDocument();
  //   expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  // });

  it('emits a metrics event on render', () => {
    render();
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('submit success', async () => {
    render();

    await act(async () => {
      fireEvent.input(screen.getByTestId('reset-password-input-field'), {
        target: { value: MOCK_ACCOUNT.primaryEmail.email },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Begin reset'));
    });

    expect(beginResetPasswordHandler).toHaveBeenCalledWith(
      MOCK_ACCOUNT.primaryEmail.email,
      MozServices.Default
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      'confirm_reset_password?showReactApp=true',
      {
        replace: true,
        state: {
          email: MOCK_ACCOUNT.primaryEmail.email,
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

    renderWithAccount(account);

    await waitFor(() =>
      fireEvent.input(screen.getByTestId('reset-password-input-field'), {
        target: { value: `${MOCK_ACCOUNT.primaryEmail.email} ` },
      })
    );

    fireEvent.click(screen.getByText('Begin reset'));

    await waitFor(() => {
      expect(account.resetPassword).toHaveBeenCalledWith(
        MOCK_ACCOUNT.primaryEmail.email,
        MozServices.Default
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

    renderWithAccount(account);

    await waitFor(() =>
      fireEvent.input(screen.getByTestId('reset-password-input-field'), {
        target: { value: ` ${MOCK_ACCOUNT.primaryEmail.email}` },
      })
    );

    fireEvent.click(screen.getByText('Begin reset'));

    await waitFor(() => {
      expect(account.resetPassword).toHaveBeenCalledWith(
        MOCK_ACCOUNT.primaryEmail.email,
        MozServices.Default
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
    it('with an empty email', async () => {
      render();
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Begin reset' }));
      });
      await screen.findByText('Email required');
      expect(beginResetPasswordHandler).not.toHaveBeenCalled();

      // clears the error onchange
      await typeByLabelText('Email')('a');
      expect(screen.queryByText('Email required')).not.toBeInTheDocument();
    });

    it('with an invalid email', async () => {
      render();
      await typeByLabelText('Email')('foxy@gmail.');
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Begin reset' }));
      });
      await screen.findByText('Valid email required');
      expect(beginResetPasswordHandler).not.toHaveBeenCalled();

      // clears the error onchange
      await typeByLabelText('Email')('a');
      expect(
        screen.queryByText('Valid email required')
      ).not.toBeInTheDocument();
    });
  });
});
