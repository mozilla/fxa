/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { mockAppContext, renderWithRouter } from '../../models/mocks';
import { PageDeleteAccount } from '.';
import { typeByTestIdFn } from '../../lib/test-utils';
import { Account, AppContext } from '../../models';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

const account = {
  primaryEmail: {
    email: 'rfeeley@mozilla.com',
  },
  uid: '0123456789abcdef',
  metricsEnabled: true,
} as unknown as Account;

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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageDeleteAccount />
      </AppContext.Provider>
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
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageDeleteAccount />
      </AppContext.Provider>
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
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageDeleteAccount />
      </AppContext.Provider>
    );

    await act(async () => {
      const inputs = screen.getAllByTestId('checkbox-input');
      // drop last checkbox so all will not be selected
      inputs.pop();
      inputs.forEach((el) => fireEvent.click(el));
    });

    expect(screen.getByTestId('continue-button')).toBeDisabled();
  });

  it('Enables "Delete" button once the password length is of 8 characters or more', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageDeleteAccount />
      </AppContext.Provider>
    );

    await advanceStep();
    expect(screen.getByTestId('delete-account-button')).toBeDisabled();

    await typeByTestIdFn('delete-account-confirm-input-field')('password');
    expect(screen.getByTestId('delete-account-button')).toBeEnabled();
  });

  it('Gets valid response on submit and emits metrics events', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageDeleteAccount />
      </AppContext.Provider>
    );

    await advanceStep();
    await typeByTestIdFn('delete-account-confirm-input-field')('hunter67');

    // TODO: more extensive metrics tests
    expect(usePageViewEvent).toHaveBeenCalledWith('settings.delete-account');
    expect(logViewEvent).toHaveBeenCalledWith(
      'flow.settings.account-delete',
      'terms-checked.success'
    );

    const deleteAccountButton = screen.getByTestId('delete-account-button');
    expect(deleteAccountButton).toBeEnabled();

    expect(location.pathname).toContainEqual('/');
  });
});
