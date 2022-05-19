/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { UnitRowTwoStepAuth } from '.';
import { renderWithRouter, mockAppContext } from '../../models/mocks';
import { Account, AppContext } from '../../models';

jest.mock('../../models/AlertBarInfo');
const account = {
  hasPassword: true,
  totp: { exists: true, verified: true },
  disableTwoStepAuth: jest.fn().mockResolvedValue(true),
} as unknown as Account;

describe('UnitRowTwoStepAuth', () => {
  it('renders when Two-step authentication is enabled', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );
    expect(
      screen.getByTestId('two-step-unit-row-header').textContent
    ).toContain('Two-step authentication');
    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Enabled');
    expect(
      screen.getByTestId('two-step-disable-button-unit-row-modal').textContent
    ).toContain('Disable');
  });

  it('renders proper modal when Two-step authentication is enabled and "change" is clicked', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
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
    const account = {
      hasPassword: true,
      totp: { exists: false, verified: false },
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );
    expect(
      screen.getByTestId('two-step-unit-row-header').textContent
    ).toContain('Two-step authentication');
    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Not Set');
    expect(screen.getByTestId('two-step-unit-row-route').textContent).toContain(
      'Add'
    );
  });

  it('can be refreshed', async () => {
    const account = {
      hasPassword: true,
      totp: { exists: false, verified: false },
      refresh: jest.fn(),
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );
    expect(
      screen.getByTestId('two-step-unit-row-header-value')
    ).toHaveTextContent('Not Set');
    await act(async () => {
      fireEvent.click(screen.getByTestId('two-step-refresh'));
    });
    expect(account.refresh).toBeCalledWith('totp');
  });

  it('renders view as not enabled after disabling TOTP', async () => {
    const context = mockAppContext({ account });
    renderWithRouter(
      <AppContext.Provider value={context}>
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

    expect(context.alertBarInfo?.success).toBeCalledTimes(1);
  });

  it('renders disabled state when account has no password', async () => {
    const account = {
      hasPassword: false,
      totp: { exists: false, verified: false },
    } as unknown as Account;

    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('two-step-unit-row-route').textContent).toContain(
      'Add'
    );
    expect(
      screen
        .getByTestId('two-step-unit-row-route')
        .attributes.getNamedItem('title')?.value
    ).toEqual(
      'Set a password to sync and use certain account security features.'
    );
  });
});
