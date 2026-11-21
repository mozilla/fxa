/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthClient from 'fxa-auth-client/browser';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { AppContext } from '../../../models';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { FlowDeleteSyncDataConfirmPwd } from '.';

jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  sessionToken: () => 'session-token',
}));

const mockAuthClient = {
  accountEmails: jest.fn().mockResolvedValue({
    primary: 'user@example.com',
    original: 'user@example.com',
  }),
  sessionReauth: jest.fn(),
};

const renderStep = () => {
  const navigateForward = jest.fn();
  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({
        authClient: mockAuthClient as unknown as AuthClient,
      })}
    >
      <FlowDeleteSyncDataConfirmPwd
        localizedBackButtonTitle="Back to settings"
        localizedPageTitle="Delete synced data"
        navigateBackward={jest.fn()}
        {...{ navigateForward }}
      />
    </AppContext.Provider>
  );
  return { navigateForward, user: userEvent.setup() };
};

const submitPassword = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Enter your password'), 'hunter22');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
};

describe('FlowDeleteSyncDataConfirmPwd', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reauthenticates the session and continues', async () => {
    mockAuthClient.sessionReauth.mockResolvedValue({});
    const { navigateForward, user } = renderStep();

    await submitPassword(user);

    await waitFor(() => expect(navigateForward).toHaveBeenCalled());
    expect(mockAuthClient.sessionReauth).toHaveBeenCalledWith(
      'session-token',
      { primary: 'user@example.com', original: 'user@example.com' },
      'hunter22',
      { reason: 'sync_data' }
    );
  });

  it('shows an incorrect password inline and stays on the step', async () => {
    mockAuthClient.sessionReauth.mockRejectedValue(
      AuthUiErrors.INCORRECT_PASSWORD
    );
    const { navigateForward, user } = renderStep();

    await submitPassword(user);

    await screen.findByText('Incorrect password');
    expect(navigateForward).not.toHaveBeenCalled();
  });

  it('shows other errors in a banner', async () => {
    mockAuthClient.sessionReauth.mockRejectedValue(
      AuthUiErrors.UNEXPECTED_ERROR
    );
    const { navigateForward, user } = renderStep();

    await submitPassword(user);

    await screen.findByText('Unexpected error');
    expect(navigateForward).not.toHaveBeenCalled();
  });
});
