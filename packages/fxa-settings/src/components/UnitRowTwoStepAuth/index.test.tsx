/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { UnitRowTwoStepAuth } from '.';
import { renderWithRouter, mockSession } from '../../models/_mocks';
import { Account, AppContext } from '../../models';

const account = ({
  totp: { exists: true, verified: true },
  disableTwoStepAuth: jest.fn().mockResolvedValue(true),
} as unknown) as Account;
const session = mockSession();

describe('UnitRowTwoStepAuth', () => {
  it('renders when Two-step authentication is enabled', async () => {
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );
    expect(
      screen.getByTestId('two-step-unit-row-header').textContent
    ).toContain('tfa-row-header');
    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Enabled');
    expect(
      screen.getByTestId('two-step-disable-button-unit-row-modal').textContent
    ).toContain('Disable');
  });

  it('renders proper modal when Two-step authentication is enabled and "change" is clicked', async () => {
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );

    await act(async () => {
      fireEvent.click(await screen.getByTestId('two-step-unit-row-modal'));
    });

    expect(
      screen.queryByTestId('change-codes-modal-header')
    ).toBeInTheDocument();
  });

  it('renders when Two-step authentication is not enabled', () => {
    const account = ({
      totp: { exists: false, verified: false },
    } as unknown) as Account;
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );
    expect(
      screen.getByTestId('two-step-unit-row-header').textContent
    ).toContain('tfa-row-header');
    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Not set');
    expect(screen.getByTestId('two-step-unit-row-route').textContent).toContain(
      'Add'
    );
  });

  it('can be refreshed', async () => {
    const account = ({
      totp: { exists: false, verified: false },
      refresh: jest.fn(),
    } as unknown) as Account;
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );
    expect(
      screen.getByTestId('two-step-unit-row-header-value')
    ).toHaveTextContent('Not set');
    await act(async () => {
      fireEvent.click(screen.getByTestId('two-step-refresh'));
    });
    expect(account.refresh).toBeCalledWith('totp');
  });

  it('renders view as not enabled after disabling TOTP', async () => {
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );

    await act(async () => {
      fireEvent.click(
        screen.getByTestId('two-step-disable-button-unit-row-modal')
      );
    });

    expect(
      screen.queryByTestId('disable-totp-modal-header')
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('modal-confirm'));
    });

    expect(screen.getByTestId('delete-totp-success')).toBeInTheDocument();
  });
});
