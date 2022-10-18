/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { mockAppContext, renderWithRouter } from '../../models/mocks';
import { Account, AppContext } from '../../models';
import LinkedAccounts from '../LinkedAccounts';
import { act, fireEvent, screen } from '@testing-library/react';
import { MOCK_LINKED_ACCOUNTS } from '../LinkedAccounts/mocks';

const account = {
  linkedAccounts: MOCK_LINKED_ACCOUNTS,
} as unknown as Account;

const clickUnlinkButton = async () => {
  await act(async () => {
    const unlinkButtons = await screen.findAllByTestId('linked-account-unlink');
    fireEvent.click(unlinkButtons[0]);
  });
};
const clickConfirmUnlinkButton = async () => {
  await act(async () => {
    const confirmButton = await screen.findByTestId('modal-confirm');
    fireEvent.click(confirmButton);
  });
};
describe('Linked Accounts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders "fresh load" <LinkedAccounts/> with correct content', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <LinkedAccounts />
      </AppContext.Provider>
    );

    expect(await screen.findByText('Linked Accounts')).toBeTruthy();
    expect(await screen.findByText('Google')).toBeTruthy();
  });

  it('does not render linked accounts section if no linked accounts', async () => {
    const account = {
      linkedAccounts: [],
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <LinkedAccounts />
      </AppContext.Provider>
    );

    expect(screen.queryByTestId('linked-account')).toBeNull();
  });

  it('renders proper modal when "unlink" is clicked', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <LinkedAccounts />
      </AppContext.Provider>
    );
    await clickUnlinkButton();

    expect(
      screen.queryByTestId('linked-account-unlink-header-test-id')
    ).toBeInTheDocument();
  });

  it('on unlink, removes linked account', async () => {
    const linkedAccounts = MOCK_LINKED_ACCOUNTS;

    const account = {
      linkedAccounts,
      unlinkThirdParty: () => account.linkedAccounts.shift(),
    } as unknown as Account;

    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <LinkedAccounts />
      </AppContext.Provider>
    );

    await clickUnlinkButton();

    expect(
      screen.queryByTestId('linked-account-unlink-header-test-id')
    ).toBeInTheDocument();

    await clickConfirmUnlinkButton();

    expect(screen.queryAllByTestId('linked-account')).toHaveLength(0);
  });
});
