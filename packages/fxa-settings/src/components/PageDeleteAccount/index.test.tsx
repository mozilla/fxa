/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AuthContext, createAuthClient } from '../../lib/auth';
import { MockedCache, renderWithRouter } from '../../models/_mocks';
import { PageDeleteAccount } from '.';
import { typeByTestIdFn } from '../../lib/test-utils';
import { Account, AccountContext } from '../../models';

jest.mock('../../lib/auth', () => ({
  ...jest.requireActual('../../lib/auth'),
  useAccountDestroyer: jest
    .fn()
    .mockImplementation(({ onSuccess, onError }) => ({
      execute: () => onSuccess(),
      reset: () => {},
    })),
}));

const account = ({
  primaryEmail: {
    email: 'rfeeley@mozilla.com',
  },
  uid: '0123456789abcdef',
} as unknown) as Account;

const client = createAuthClient('none');
window.URL.createObjectURL = jest.fn();

const advanceStep = async () => {
  await act(async () => {
    const inputs = screen.getAllByTestId('checkbox-input');
    inputs.forEach((el) => fireEvent.click(el));
    const continueBtn = await screen.findByTestId('continue-button');
    fireEvent.click(continueBtn);
  });
};

describe('PageDeleteAccount', () => {
  it('renders as expected', () => {
    renderWithRouter(
      <AccountContext.Provider value={{ account }}>
        <AuthContext.Provider value={{ auth: client }}>
          <MockedCache>
            <PageDeleteAccount />
          </MockedCache>
        </AuthContext.Provider>
      </AccountContext.Provider>
    );

    expect(screen.getByTestId('delete-account-confirm').textContent).toContain(
      'deleting your account'
    );
    expect(screen.getByTestId('cancel-button').textContent).toContain('Cancel');
    expect(screen.getByTestId('continue-button').textContent).toContain(
      'Continue'
    );
  });

  it('Enables "continue" button once all 4 inputs are valid', async () => {
    renderWithRouter(
      <AccountContext.Provider value={{ account }}>
        <AuthContext.Provider value={{ auth: client }}>
          <MockedCache>
            <PageDeleteAccount />
          </MockedCache>
        </AuthContext.Provider>
      </AccountContext.Provider>
    );

    expect(screen.getByTestId('continue-button')).toBeDisabled();

    await act(async () => {
      const inputs = screen.getAllByTestId('checkbox-input');
      inputs.forEach((el) => fireEvent.click(el));
    });

    expect(screen.getByTestId('continue-button')).toBeEnabled();
  });

  it('Does not Enable "continue" button if all for checks are not confirmed', async () => {
    renderWithRouter(
      <AccountContext.Provider value={{ account }}>
        <AuthContext.Provider value={{ auth: client }}>
          <MockedCache>
            <PageDeleteAccount />
          </MockedCache>
        </AuthContext.Provider>
      </AccountContext.Provider>
    );

    await act(async () => {
      const inputs = screen.getAllByTestId('checkbox-input');
      // drop last checkbox so all will not be selected
      inputs.pop();
      inputs.forEach((el) => fireEvent.click(el));
    });

    expect(screen.getByTestId('continue-button')).toBeDisabled();
  });

  it('Gets valid response on submit', async () => {
    renderWithRouter(
      <AccountContext.Provider value={{ account }}>
        <AuthContext.Provider value={{ auth: client }}>
          <MockedCache>
            <PageDeleteAccount />
          </MockedCache>
        </AuthContext.Provider>
      </AccountContext.Provider>
    );

    await advanceStep();
    await typeByTestIdFn('delete-account-confirm-input-field')('hunter6');

    const deleteAccountButton = screen.getByTestId('delete-account-button');
    expect(deleteAccountButton).toBeEnabled();

    expect(location.pathname).toContainEqual('/');
  });
});
