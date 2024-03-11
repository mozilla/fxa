/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { LinkExpiredResetPassword } from '.';
import {
  mockAppContext,
  MOCK_ACCOUNT,
  createHistoryWithQuery,
  renderWithRouter,
  createAppContext,
} from '../../models/mocks';
import { Account } from '../../models';
import { FIREFOX_NOREPLY_EMAIL } from 'fxa-settings/src/constants';

const viewName = 'example-view-name';
const email = MOCK_ACCOUNT.primaryEmail.email;

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
}));

const route = '/bloop';
const renderWithHistory = (ui: any, queryParams = '', account?: Account) => {
  const history = createHistoryWithQuery(route, queryParams);
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

describe('LinkExpiredResetPassword', () => {
  const component = <LinkExpiredResetPassword {...{ email, viewName }} />;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component as expected for an expired Reset Password link', () => {
    renderWithHistory(component);

    screen.getByRole('heading', {
      name: 'Reset password link expired',
    });
    screen.getByText('The link you clicked to reset your password is expired.');
    screen.getByRole('button', {
      name: 'Receive new link',
    });
  });
  it('displays a success banner when clicking on "receive a new link" is successful', async () => {
    const account = {
      resetPassword: jest.fn().mockResolvedValue(true),
    } as unknown as Account;

    renderWithHistory(component, '', account);
    const receiveNewLinkButton = screen.getByRole('button', {
      name: 'Receive new link',
    });
    fireEvent.click(receiveNewLinkButton);
    await waitFor(() => {
      expect(
        screen.getByText(
          `Email re-sent. Add ${FIREFOX_NOREPLY_EMAIL} to your contacts to ensure a smooth delivery.`
        )
      ).toBeInTheDocument();
    });
  });
  it('displays an error banner when clicking on "receive a new link" is unsuccessful', async () => {
    const account = {
      resetPassword: jest.fn().mockRejectedValue('error'),
    } as unknown as Account;

    renderWithHistory(component, '', account);
    const receiveNewLinkButton = screen.getByRole('button', {
      name: 'Receive new link',
    });
    fireEvent.click(receiveNewLinkButton);
    await waitFor(() => {
      expect(screen.getByText(`Unexpected error`)).toBeInTheDocument();
    });
  });
});
