/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, act, wait } from '@testing-library/react';
import UnitRowRecoveryKey from '.';
import {
  renderWithRouter,
  MockedCache,
  mockRecoveryKeyExistsQuery,
} from '../../models/_mocks';

describe('UnitRowRecoveryKey', () => {
  it('renders when recovery key is set', () => {
    renderWithRouter(
      <MockedCache>
        <UnitRowRecoveryKey />
      </MockedCache>
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
    renderWithRouter(
      <MockedCache account={{ recoveryKey: false }}>
        <UnitRowRecoveryKey />
      </MockedCache>
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
    await act(async () => {
      renderWithRouter(
        <MockedCache
          account={{ recoveryKey: false }}
          mocks={[mockRecoveryKeyExistsQuery({ recoveryKey: true })]}
        >
          <UnitRowRecoveryKey />
        </MockedCache>
      );
    });
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value')
    ).toHaveTextContent('Not set');
    await act(async () => {
      fireEvent.click(screen.getByTestId('recovery-key-refresh'));
    });
    // wait a tick to get past the 'loading' state of the query
    await wait();
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value')
    ).toHaveTextContent('Enabled');
  });
});
