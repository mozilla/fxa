/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import UnitRowRecoveryKey from '.';
import {
  renderWithRouter,
  MockedCache,
  mockAccountQuery,
} from '../../models/_mocks';

describe('UnitRowRecoveryKey', () => {
  it('renders when recovery key is set', () => {
    renderWithRouter(
      <MockedCache>
        <UnitRowRecoveryKey />
      </MockedCache>
    );
    expect(screen.getByTestId('unit-row-header').textContent).toContain(
      'Recovery key'
    );
    expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
      'Enabled'
    );
    expect(screen.getByTestId('unit-row-modal').textContent).toContain(
      'Remove'
    );
  });

  it('renders when recovery key is not set', () => {
    renderWithRouter(
      <MockedCache account={{ recoveryKey: false }}>
        <UnitRowRecoveryKey />
      </MockedCache>
    );
    expect(screen.getByTestId('unit-row-header').textContent).toContain(
      'Recovery key'
    );
    expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
      'Not Set'
    );
    expect(screen.getByTestId('unit-row-route').textContent).toContain(
      'Create'
    );
  });

  it('can be refreshed', async () => {
    renderWithRouter(
      <MockedCache
        account={{ recoveryKey: false }}
        mocks={[mockAccountQuery({ recoveryKey: true })]}
      >
        <UnitRowRecoveryKey />
      </MockedCache>
    );
    expect(screen.getByTestId('unit-row-header-value')).toHaveTextContent(
      'Not Set'
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('recovery-key-refresh'));
    });
    expect(screen.getByTestId('unit-row-header-value')).toHaveTextContent(
      'Enabled'
    );
  });
});
