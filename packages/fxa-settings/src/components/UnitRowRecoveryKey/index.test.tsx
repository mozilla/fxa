/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import UnitRowRecoveryKey from '.';
import { mockAppContext, renderWithRouter } from '../../models/mocks';
import { Account, AppContext } from '../../models';

const account = {
  recoveryKey: true,
  deleteRecoveryKey: jest.fn().mockResolvedValue(true),
} as unknown as Account;

describe('UnitRowRecoveryKey', () => {
  it('renders when recovery key is set', () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <UnitRowRecoveryKey />
      </AppContext.Provider>
    );
    expect(
      screen.getByTestId('recovery-key-unit-row-header').textContent
    ).toContain('rk-header');
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value').textContent
    ).toContain('Enabled');
    expect(
      screen.getByTestId('recovery-key-unit-row-modal').textContent
    ).toContain('Remove');
  });

  it('renders when recovery key is not set', () => {
    const account = {
      recoveryKey: false,
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <UnitRowRecoveryKey />
      </AppContext.Provider>
    );
    expect(
      screen.getByTestId('recovery-key-unit-row-header').textContent
    ).toContain('rk-header');
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value').textContent
    ).toContain('Not Set');
    expect(
      screen.getByTestId('recovery-key-unit-row-route').textContent
    ).toContain('Create');
  });

  it('can be refreshed', async () => {
    const account = {
      recoveryKey: false,
      refresh: jest.fn(),
    } as unknown as Account;
    await act(async () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <UnitRowRecoveryKey />
        </AppContext.Provider>
      );
    });
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value')
    ).toHaveTextContent('Not Set');
    await act(async () => {
      fireEvent.click(screen.getByTestId('recovery-key-refresh'));
    });
    expect(account.refresh).toBeCalledWith('recovery');
  });
});
