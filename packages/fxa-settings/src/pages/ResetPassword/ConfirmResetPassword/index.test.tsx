/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import ConfirmResetPassword, { viewName } from '.';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import {
  MOCK_PASSWORD_FORGOT_TOKEN,
  createMockConfirmResetPasswordOAuthIntegration,
} from './mocks';
import { REACT_ENTRYPOINT } from '../../../constants';
import { Account } from '../../../models';
import {
  mockAppContext,
  MOCK_ACCOUNT,
  createAppContext,
  renderWithRouter,
  createHistoryWithQuery,
} from '../../../models/mocks';
import { usePageViewEvent, logViewEvent } from '../../../lib/metrics';
import { MOCK_EMAIL, MOCK_REDIRECT_URI, MOCK_SERVICE } from '../../mocks';
import { createMockWebIntegration } from '../../../lib/integrations/mocks';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

const account = MOCK_ACCOUNT as unknown as Account;

const route = '/confirm_reset_password';
const renderWithHistory = (ui: any, account?: Account) => {
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

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => {
    return {
      state: {
        email: MOCK_EMAIL,
        passwordForgotToken: MOCK_PASSWORD_FORGOT_TOKEN,
      },
    };
  },
}));

const ConfirmResetPasswordWithWebIntegration = () => (
  <ConfirmResetPassword integration={createMockWebIntegration()} />
);

describe('ConfirmResetPassword page', () => {
  // TODO enable l10n testing
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    renderWithHistory(<ConfirmResetPasswordWithWebIntegration />);

    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Reset email sent');

    const confirmPwResetInstructions = screen.getByText(
      `Click the link emailed to ${MOCK_EMAIL} within the next hour to create a new password.`
    );
    expect(confirmPwResetInstructions).toBeInTheDocument();

    const resendEmailButton = screen.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });
    expect(resendEmailButton).toBeInTheDocument();
  });

  it('sends a new email when clicking on resend button, with OAuth integration', async () => {
    account.resetPassword = jest.fn().mockImplementation(() => {
      return {
        passwordForgotToken: '123',
      };
    });

    renderWithHistory(
      <ConfirmResetPassword
        integration={createMockConfirmResetPasswordOAuthIntegration()}
      />,
      account
    );

    const resendEmailButton = await screen.findByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });

    expect(resendEmailButton).toBeInTheDocument();
    fireEvent.click(resendEmailButton);

    await waitFor(() => new Promise((r) => setTimeout(r, 100)));

    expect(account.resetPassword).toHaveBeenCalledWith(
      MOCK_EMAIL,
      MOCK_SERVICE
    );
    expect(logViewEvent).toHaveBeenCalledWith(
      'confirm-reset-password',
      'resend',
      REACT_ENTRYPOINT
    );
  });

  it('emits the expected metrics on render', async () => {
    renderWithHistory(<ConfirmResetPasswordWithWebIntegration />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('renders a "Remember your password?" link', () => {
    renderWithHistory(<ConfirmResetPasswordWithWebIntegration />);
    expect(screen.getByText('Remember your password?')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });
});
