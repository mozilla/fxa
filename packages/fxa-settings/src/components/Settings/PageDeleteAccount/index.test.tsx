/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import 'mutationobserver-shim';
import { screen, fireEvent, act, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  mockAppContext,
  mockSession,
  renderWithRouter,
} from '../../../models/mocks';
import { PageDeleteAccount } from '.';
import { typeByTestIdFn } from '../../../lib/test-utils';
import { Account, AppContext } from '../../../models';
import { logViewEvent } from '../../../lib/metrics';
import { MOCK_EMAIL } from '../../../pages/mocks';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    deleteAccount: {
      view: jest.fn(),
      engage: jest.fn(),
      submit: jest.fn(),
      passwordView: jest.fn(),
      passwordSubmit: jest.fn(),
    },
  },
}));

const account = {
  primaryEmail: {
    email: MOCK_EMAIL,
  },
  uid: '0123456789abcdef',
  metricsEnabled: true,
  hasPassword: true,
} as unknown as Account;

const pwdlessAccount = {
  primaryEmail: {
    email: MOCK_EMAIL,
  },
  uid: '0123456789abcdef',
  metricsEnabled: true,
  hasPassword: false,
  destroy: jest.fn().mockResolvedValue({}),
} as unknown as Account;

const session = mockSession(true, false);

window.URL.createObjectURL = jest.fn();
console.error = jest.fn();

const advanceStep = () => {
  const inputs = screen.getAllByTestId('checkbox-input');
  inputs.forEach((el) => fireEvent.click(el));
  const continueBtn = screen.getByTestId('continue-button');
  fireEvent.click(continueBtn);
};

describe('PageDeleteAccount', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account, session })}>
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

    const list = screen.getByTestId('delete-account-product-list');
    const items = within(list)
      .getAllByRole('link')
      .map((item) => item.textContent);
    expect(items).toMatchInlineSnapshot(`
      [
        "Syncing Firefox data",
        "Mozilla VPN",
        "Firefox Relay",
        "Firefox Add-ons",
        "Mozilla Monitor",
        "MDN Plus",
        "Mozilla Hubs",
        "Pocket",
      ]
    `);
  });

  it('Enables "continue" button once all 4 inputs are valid', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account, session })}>
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
      <AppContext.Provider value={mockAppContext({ account, session })}>
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
      <AppContext.Provider value={mockAppContext({ account, session })}>
        <PageDeleteAccount />
      </AppContext.Provider>
    );

    await advanceStep();
    expect(screen.getByTestId('delete-account-button')).toBeDisabled();

    await typeByTestIdFn('delete-account-confirm-input-field')('password');
    expect(screen.getByTestId('delete-account-button')).toBeEnabled();
  });

  it('gets valid response on submit', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account, session })}>
        <PageDeleteAccount />
      </AppContext.Provider>
    );

    await advanceStep();
    await typeByTestIdFn('delete-account-confirm-input-field')('hunter67');

    const deleteAccountButton = screen.getByTestId('delete-account-button');
    expect(deleteAccountButton).toBeEnabled();

    expect(window.location.pathname).toContainEqual('/');
  });

  it('deletes account if no password set', async () => {
    renderWithRouter(
      <AppContext.Provider
        value={mockAppContext({ account: pwdlessAccount, session })}
      >
        <PageDeleteAccount />
      </AppContext.Provider>
    );

    expect(screen.queryByText('Step 1 of 2')).toBeNull();

    await advanceStep();

    expect(logViewEvent).toHaveBeenCalledWith(
      'flow.settings.account-delete',
      'confirm-password.success'
    );
  });

  describe('glean metrics', () => {
    it('emits expect event on first step view', () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account, session })}>
          <PageDeleteAccount />
        </AppContext.Provider>
      );

      expect(GleanMetrics.deleteAccount.view).toHaveBeenCalled();
    });

    describe('account with password set', () => {
      it('emits expected metrics during account deletion flow', async () => {
        renderWithRouter(
          <AppContext.Provider value={mockAppContext({ account, session })}>
            <PageDeleteAccount />
          </AppContext.Provider>
        );

        const inputs = screen.getAllByTestId('checkbox-input');
        await Promise.all(
          inputs.map(async (el) => {
            await userEvent.click(el);
          })
        );
        expect(GleanMetrics.deleteAccount.engage).toHaveBeenCalled();
        await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
        expect(GleanMetrics.deleteAccount.submit).toHaveBeenCalled();

        // password confirmation step
        expect(GleanMetrics.deleteAccount.passwordView).toHaveBeenCalled();
        await userEvent.type(
          screen.getByLabelText('Enter password'),
          'hunter67'
        );
        await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(GleanMetrics.deleteAccount.passwordSubmit).toHaveBeenCalled();
      });
    });

    describe('account without password set', () => {
      it('emits expected metrics during account deletion flow', async () => {
        renderWithRouter(
          <AppContext.Provider
            value={mockAppContext({ account: pwdlessAccount, session })}
          >
            <PageDeleteAccount />
          </AppContext.Provider>
        );

        const inputs = screen.getAllByTestId('checkbox-input');
        await Promise.all(
          inputs.map(async (el) => {
            await userEvent.click(el);
          })
        );
        expect(GleanMetrics.deleteAccount.engage).toHaveBeenCalled();
        await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
        expect(GleanMetrics.deleteAccount.submit).toHaveBeenCalled();
        expect(GleanMetrics.deleteAccount.passwordView).not.toHaveBeenCalled();
      });
    });
  });
});
