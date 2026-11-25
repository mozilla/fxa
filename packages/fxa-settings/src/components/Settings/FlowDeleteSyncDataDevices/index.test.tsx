/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../models/mocks';
import { FlowDeleteSyncDataDevices } from '.';
import { MOCK_SYNC_CLIENTS, MOCK_SYNC_DEVICES } from '../DataCollection/mocks';

const renderStep = (devices = MOCK_SYNC_DEVICES, isLoading = false) => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  renderWithRouter(
    <FlowDeleteSyncDataDevices
      {...{ devices, isLoading }}
      localizedBackButtonTitle="Back to settings"
      localizedPageTitle="Delete synced data"
      navigateBackward={jest.fn()}
      {...{ onCancel, onConfirm }}
    />
  );
  return { onConfirm, onCancel, user: userEvent.setup() };
};

describe('FlowDeleteSyncDataDevices', () => {
  it('disables the confirm button while loading', async () => {
    const { onConfirm, user } = renderStep(MOCK_SYNC_DEVICES, true);
    // The spinner's "Loading…" label joins the button name while it runs.
    const button = screen.getByRole('button', { name: /^Delete/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    for (const box of screen.getAllByRole('checkbox')) {
      expect(box).toBeDisabled();
    }
    await user.click(button);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('describes the sign-out checkbox with the resume-syncing note', () => {
    renderStep();
    expect(
      screen.getByRole('checkbox', { name: 'Sign out of Firefox' })
    ).toHaveAccessibleDescription(
      'Syncing will resume wherever you’re signed in.'
    );
  });

  it('hides the resume-syncing note once every device is checked', async () => {
    const { user } = renderStep();
    const signOutAll = screen.getByRole('checkbox', {
      name: 'Sign out of Firefox',
    });

    await user.click(signOutAll);

    expect(
      screen.queryByText('Syncing will resume wherever you’re signed in.')
    ).not.toBeInTheDocument();
    expect(signOutAll).not.toHaveAttribute('aria-describedby');

    await user.click(screen.getByRole('checkbox', { name: 'Work laptop' }));
    expect(
      screen.getByText('Syncing will resume wherever you’re signed in.')
    ).toBeVisible();
  });

  it('shows the device list expanded and labels the toggle for collapsing', async () => {
    const { user } = renderStep();
    const toggle = screen.getByRole('button', { name: 'Hide devices' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    screen.getByRole('checkbox', { name: 'Work laptop' });

    await user.click(toggle);
    expect(
      screen.getByRole('button', { name: 'Show devices' })
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('starts with no devices selected and deletes without signing out', async () => {
    const { onConfirm, user } = renderStep();

    expect(
      screen.getByRole('checkbox', {
        name: 'Sign out of Firefox',
      })
    ).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledWith([]);
  });

  it('signs out the devices the user checks', async () => {
    const { onConfirm, user } = renderStep();

    screen.getByText('Laurel’s MacBook Pro (this device)');
    const workLaptop = screen.getByRole('checkbox', { name: 'Work laptop' });
    expect(workLaptop).toHaveAccessibleDescription('Stay signed in');

    await user.click(workLaptop);
    expect(workLaptop).toHaveAccessibleDescription('Sign out');
    expect(
      screen.getByRole('checkbox', {
        name: 'Sign out of Firefox',
      })
    ).toBePartiallyChecked();

    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );
    expect(onConfirm).toHaveBeenCalledWith([MOCK_SYNC_CLIENTS[2]]);
  });

  it('selects every device from the sign-out-all checkbox', async () => {
    const { onConfirm, user } = renderStep();

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Sign out of Firefox',
      })
    );
    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );
    expect(onConfirm).toHaveBeenCalledWith(MOCK_SYNC_CLIENTS);
  });

  it('labels a device with no name as unknown', () => {
    renderStep([{ ...MOCK_SYNC_DEVICES[0], name: null }]);
    screen.getByRole('checkbox', { name: 'unknown (this device)' });
  });

  it('cancels without confirming', async () => {
    const { onConfirm, onCancel, user } = renderStep();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
