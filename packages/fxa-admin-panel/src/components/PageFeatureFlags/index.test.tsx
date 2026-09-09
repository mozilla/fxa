/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent, UserEvent } from '@testing-library/user-event';
import PageFeatureFlags from './index';
import { adminApi } from '../../lib/api';

jest.mock('../../lib/api', () => ({
  adminApi: {
    getFeatureFlags: jest.fn(),
    upsertFeatureFlag: jest.fn(),
    deleteFeatureFlag: jest.fn(),
  },
}));

const mockFlags = [
  {
    name: 'new-checkout',
    enabled: true,
    description: 'New checkout flow',
    updatedAt: 1_700_000_000_000,
    updatedBy: 'admin@example.com',
  },
  {
    name: 'passkey-upsell',
    enabled: false,
    description: 'Passkey promotion',
    updatedAt: 1_700_000_000_000,
    updatedBy: 'admin@example.com',
  },
];

describe('PageFeatureFlags', () => {
  let user: UserEvent;
  let confirmSpy: jest.SpyInstance;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    user = userEvent.setup();
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    (adminApi.getFeatureFlags as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the heading and empty state', async () => {
    render(<PageFeatureFlags />);

    expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    expect(
      await screen.findByText('No feature flags defined.')
    ).toBeInTheDocument();
  });

  it('renders flags with their state', async () => {
    (adminApi.getFeatureFlags as jest.Mock).mockResolvedValue(mockFlags);

    render(<PageFeatureFlags />);

    expect(await screen.findByText('new-checkout')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle new-checkout')).toHaveTextContent(
      'ON'
    );
    expect(screen.getByLabelText('Toggle passkey-upsell')).toHaveTextContent(
      'OFF'
    );
  });

  it('shows an error when loading fails', async () => {
    (adminApi.getFeatureFlags as jest.Mock).mockRejectedValue(
      new Error('boom')
    );

    render(<PageFeatureFlags />);

    expect(
      await screen.findByText('Failed to load feature flags.')
    ).toBeInTheDocument();
  });

  it('creates a flag in the off state', async () => {
    (adminApi.upsertFeatureFlag as jest.Mock).mockResolvedValue({ ok: true });

    render(<PageFeatureFlags />);
    await screen.findByText('No feature flags defined.');

    await user.type(screen.getByLabelText('Flag name'), 'New-Checkout');
    await user.type(
      screen.getByLabelText('Flag description'),
      'New checkout flow'
    );
    await user.click(screen.getByRole('button', { name: 'Create (off)' }));

    await waitFor(() =>
      expect(adminApi.upsertFeatureFlag).toHaveBeenCalledWith({
        name: 'new-checkout',
        enabled: false,
        description: 'New checkout flow',
      })
    );
  });

  it('toggles a flag and preserves its other fields', async () => {
    (adminApi.getFeatureFlags as jest.Mock).mockResolvedValue(mockFlags);
    (adminApi.upsertFeatureFlag as jest.Mock).mockResolvedValue({ ok: true });

    render(<PageFeatureFlags />);

    await user.click(await screen.findByLabelText('Toggle new-checkout'));

    await waitFor(() =>
      expect(adminApi.upsertFeatureFlag).toHaveBeenCalledWith({
        name: 'new-checkout',
        enabled: false,
        description: 'New checkout flow',
      })
    );
  });

  it('deletes a flag after confirmation', async () => {
    (adminApi.getFeatureFlags as jest.Mock).mockResolvedValue(mockFlags);
    (adminApi.deleteFeatureFlag as jest.Mock).mockResolvedValue({
      removed: true,
    });

    render(<PageFeatureFlags />);

    await user.click(await screen.findByLabelText('Delete new-checkout'));

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() =>
      expect(adminApi.deleteFeatureFlag).toHaveBeenCalledWith('new-checkout')
    );
  });

  it('does not delete when confirmation is dismissed', async () => {
    (adminApi.getFeatureFlags as jest.Mock).mockResolvedValue(mockFlags);
    confirmSpy.mockReturnValue(false);

    render(<PageFeatureFlags />);

    await user.click(await screen.findByLabelText('Delete new-checkout'));

    expect(adminApi.deleteFeatureFlag).not.toHaveBeenCalled();
  });

  it('alerts when a toggle fails', async () => {
    (adminApi.getFeatureFlags as jest.Mock).mockResolvedValue(mockFlags);
    (adminApi.upsertFeatureFlag as jest.Mock).mockRejectedValue(
      new Error('boom')
    );

    render(<PageFeatureFlags />);

    await user.click(await screen.findByLabelText('Toggle new-checkout'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Failed to toggle "new-checkout".')
    );
  });
});
