/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  screen,
  fireEvent,
  act,
  within,
  waitFor,
} from '@testing-library/react';
import UnitRowRecoveryKey from '.';
import { mockAppContext, renderWithRouter } from '../../models/mocks';
import { Account, AppContext } from '../../models';
import * as Metrics from '../../lib/metrics';

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
    ).toContain('Not set');
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
    ).toHaveTextContent('Not set');
    await act(async () => {
      fireEvent.click(screen.getByTestId('recovery-key-refresh'));
    });
    expect(account.refresh).toBeCalledWith('recovery');
  });

  describe('delete recovery key', () => {
    let logViewEventSpy: jest.SpyInstance;

    beforeAll(() => {
      logViewEventSpy = jest
        .spyOn(Metrics, 'logViewEvent')
        .mockImplementation();
    });

    afterEach(() => {
      logViewEventSpy.mockReset();
    });

    afterAll(() => {
      logViewEventSpy.mockRestore();
    });

    const removeRecoveryKey = async (
      metricsEnabled: boolean,
      process = false
    ) => {
      const account = {
        recoveryKey: true,
        metricsEnabled,
      } as unknown as Account;

      if (process) {
        account.deleteRecoveryKey = jest.fn().mockResolvedValue(true);
      }

      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <UnitRowRecoveryKey />
        </AppContext.Provider>
      );

      fireEvent.click(await screen.findByRole('button', { name: 'Remove' }));
      fireEvent.click(
        await within(
          await screen.findByLabelText('Remove recovery key?')
        ).findByRole('button', { name: 'Remove' })
      );
    };

    const expectRevokeEvent = (event: string) => {
      expect(logViewEventSpy).toHaveBeenCalledWith(
        'flow.settings.account-recovery',
        `confirm-revoke.${event}`
      );
    };

    it('emits correct metrics submit and success events for opted in users', async () => {
      await removeRecoveryKey(true, true);
      await waitFor(() => expect(logViewEventSpy).toBeCalledTimes(2));
      expectRevokeEvent('submit');
      expectRevokeEvent('success');
    });

    it('emits metrics submit and failure events for opted in users', async () => {
      await removeRecoveryKey(true, false);
      expect(logViewEventSpy).toBeCalledTimes(2);
      expectRevokeEvent('submit');
      expectRevokeEvent('fail');
    });

    it('does not emit a metrics event for opted out users', async () => {
      await removeRecoveryKey(false);
      expect(logViewEventSpy).not.toHaveBeenCalled();
    });
  });
});
