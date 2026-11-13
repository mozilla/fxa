/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../models/mocks';
import { ModalDeleteSyncedData } from './ModalDeleteSyncedData';
import { MOCK_SYNC_DEVICES } from './mocks';

const renderModal = (variant: 'warning' | 'signOut') => {
  const onConfirm = jest.fn();
  renderWithRouter(
    <ModalDeleteSyncedData
      devices={MOCK_SYNC_DEVICES}
      onDismiss={jest.fn()}
      {...{ variant, onConfirm }}
    />
  );
  return { onConfirm, user: userEvent.setup() };
};

describe('ModalDeleteSyncedData', () => {
  it('lists each device with a warning in the warning variant', async () => {
    const { onConfirm, user } = renderModal('warning');

    screen.getByText(/3 devices may be syncing/);
    screen.getByText('Laurel’s MacBook Pro (this device)');
    screen.getByText('Laurel’s iPhone');
    screen.getByText('Work laptop');

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledWith([]);
  });

  it('starts with no devices selected for sign-out', async () => {
    const { onConfirm, user } = renderModal('signOut');

    expect(
      screen.getByRole('checkbox', {
        name: 'Sign out of Firefox on all my devices (3)',
      })
    ).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledWith([]);
  });

  it('signs out the devices the user checks', async () => {
    const { onConfirm, user } = renderModal('signOut');

    await user.click(screen.getByRole('button', { name: 'Show devices' }));
    const workLaptop = screen.getByRole('checkbox', { name: 'Work laptop' });
    expect(workLaptop).toHaveAccessibleDescription('Stay signed in');

    await user.click(workLaptop);
    expect(workLaptop).toHaveAccessibleDescription('Sign out');

    expect(
      screen.getByRole('checkbox', {
        name: 'Sign out of Firefox on all my devices (3)',
      })
    ).toHaveProperty('indeterminate', true);

    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );
    expect(onConfirm).toHaveBeenCalledWith([MOCK_SYNC_DEVICES[2].deviceId]);
  });

  it('selects every device from the sign-out-all checkbox', async () => {
    const { onConfirm, user } = renderModal('signOut');

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Sign out of Firefox on all my devices (3)',
      })
    );
    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );

    expect(onConfirm).toHaveBeenCalledWith(
      MOCK_SYNC_DEVICES.map((d) => d.deviceId)
    );
  });
});
