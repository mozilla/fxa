/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import ConfirmResetPassword, { viewName } from '.';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { MOCK_EMAIL, MOCK_PASSWORD_FORGOT_TOKEN } from './mocks';
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
import { MozServices } from '../../../lib/types';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

const account = MOCK_ACCOUNT as unknown as Account;

const route = '/confirm_reset_password';
const renderWithHistory = (ui: any, queryParams = '', account?: Account) => {
  const history = createHistoryWithQuery(route, queryParams);
  return renderWithRouter(
    ui,
    {
      route,
      history,
    },
    mockAppContext({
      ...createAppContext(history),
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

describe('ConfirmResetPassword page', () => {
  // TODO enable l10n testing
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    renderWithHistory(<ConfirmResetPassword />);

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

  it('sends a new email when clicking on resend button', async () => {
    renderWithHistory(<ConfirmResetPassword />, '', account);
    account.resetPassword = jest.fn().mockResolvedValue('');

    const resendEmailButton = screen.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });

    fireEvent.click(resendEmailButton);

    await waitFor(() =>
      expect(account.resetPassword).toHaveBeenCalledWith(
        MOCK_EMAIL,
        MozServices.Default
      )
    );
    expect(logViewEvent).toHaveBeenCalledWith(
      'confirm-reset-password',
      'resend',
      REACT_ENTRYPOINT
    );
  });

  it('emits the expected metrics on render', async () => {
    renderWithHistory(<ConfirmResetPassword />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('renders a "Remember your password?" link', () => {
    renderWithHistory(<ConfirmResetPassword />);
    expect(
      screen.getByRole('link', { name: 'Remember your password? Sign in' })
    ).toBeInTheDocument();
  });
});
