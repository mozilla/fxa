/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent, UserEvent } from '@testing-library/user-event';
import PageEmailBlocklist from './index';
import { adminApi } from '../../lib/api';

jest.mock('../../lib/api', () => ({
  adminApi: {
    getEmailBlocklist: jest.fn(),
    addEmailBlocklistEntries: jest.fn(),
    removeEmailBlocklistEntry: jest.fn(),
    deleteAllEmailBlocklistEntries: jest.fn(),
  },
}));

const mockEntries = [
  { regex: '@evil\\.com$', createdAt: 2000 },
  { regex: '@spam\\.net$', createdAt: 1000 },
];

describe('PageEmailBlocklist', () => {
  let user: UserEvent;
  let confirmSpy: jest.SpyInstance;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    user = userEvent.setup();
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    (adminApi.getEmailBlocklist as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page heading and empty state', async () => {
    render(<PageEmailBlocklist />);

    expect(screen.getByText('Email Blocklist (regex)')).toBeInTheDocument();
    expect(await screen.findByText('No entries yet.')).toBeInTheDocument();
  });

  it('shows loading state then renders entries sorted by createdAt desc', async () => {
    (adminApi.getEmailBlocklist as jest.Mock).mockResolvedValue([
      { regex: '@spam\\.net$', createdAt: 1000 },
      { regex: '@evil\\.com$', createdAt: 2000 },
    ]);

    render(<PageEmailBlocklist />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();

    const rows = await screen.findAllByRole('row');
    expect(rows[1]).toHaveTextContent('@evil\\.com$');
    expect(rows[2]).toHaveTextContent('@spam\\.net$');
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  it('shows error state when load fails', async () => {
    (adminApi.getEmailBlocklist as jest.Mock).mockRejectedValue(
      new Error('network error')
    );

    render(<PageEmailBlocklist />);

    expect(
      await screen.findByText('Failed to load blocklist.')
    ).toBeInTheDocument();
  });

  it('Add Entries button is disabled when textarea is empty', async () => {
    render(<PageEmailBlocklist />);

    const btn = screen.getByTestId('blocklist-add-btn');
    expect(btn).toBeDisabled();
  });

  it('enables Add Entries on input, submits trimmed lines, and reloads', async () => {
    (adminApi.getEmailBlocklist as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ regex: '@newevil\\.com$', createdAt: 3000 }]);
    (adminApi.addEmailBlocklistEntries as jest.Mock).mockResolvedValue({
      ok: true,
    });

    render(<PageEmailBlocklist />);
    await screen.findByText('No entries yet.');

    const textarea = screen.getByTestId('blocklist-input');
    const btn = screen.getByTestId('blocklist-add-btn');

    await user.type(textarea, '@newevil\\.com$\n   \n@haxor\\.net$');
    expect(btn).toBeEnabled();

    await user.click(btn);

    await waitFor(() => {
      expect(adminApi.addEmailBlocklistEntries).toHaveBeenCalledWith([
        '@newevil\\.com$',
        '@haxor\\.net$',
      ]);
    });
    expect(await screen.findByText('@newevil\\.com$')).toBeInTheDocument();
    expect(textarea).toHaveValue('');
  });

  it('does not submit when textarea contains only whitespace', async () => {
    render(<PageEmailBlocklist />);
    await screen.findByText('No entries yet.');

    const textarea = screen.getByTestId('blocklist-input');
    await user.type(textarea, '   ');

    expect(screen.getByTestId('blocklist-add-btn')).toBeDisabled();
    expect(adminApi.addEmailBlocklistEntries).not.toHaveBeenCalled();
  });

  it('shows alert when add fails', async () => {
    (adminApi.addEmailBlocklistEntries as jest.Mock).mockRejectedValue(
      new Error('API error 400: bad regex')
    );

    render(<PageEmailBlocklist />);
    await screen.findByText('No entries yet.');

    await user.type(screen.getByTestId('blocklist-input'), '@evil\\.com$');
    await user.click(screen.getByTestId('blocklist-add-btn'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('API error 400: bad regex')
      );
    });
  });

  it('deletes a single entry after successful API call', async () => {
    (adminApi.getEmailBlocklist as jest.Mock).mockResolvedValue(mockEntries);
    (adminApi.removeEmailBlocklistEntry as jest.Mock).mockResolvedValue({
      removed: true,
    });

    render(<PageEmailBlocklist />);
    await screen.findByText('@evil\\.com$');

    await user.click(screen.getByTestId('delete-@evil\\.com$'));

    await waitFor(() => {
      expect(adminApi.removeEmailBlocklistEntry).toHaveBeenCalledWith(
        '@evil\\.com$'
      );
      expect(screen.queryByText('@evil\\.com$')).not.toBeInTheDocument();
    });
    expect(screen.getByText('@spam\\.net$')).toBeInTheDocument();
  });

  it('shows alert when single delete fails and keeps the entry', async () => {
    (adminApi.getEmailBlocklist as jest.Mock).mockResolvedValue(mockEntries);
    (adminApi.removeEmailBlocklistEntry as jest.Mock).mockRejectedValue(
      new Error('boom')
    );

    render(<PageEmailBlocklist />);
    await screen.findByText('@evil\\.com$');

    await user.click(screen.getByTestId('delete-@evil\\.com$'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to remove entry.');
    });
    expect(screen.getByText('@evil\\.com$')).toBeInTheDocument();
  });

  it('deletes all entries after confirmation', async () => {
    (adminApi.getEmailBlocklist as jest.Mock)
      .mockResolvedValueOnce(mockEntries)
      .mockResolvedValueOnce([]);
    (adminApi.deleteAllEmailBlocklistEntries as jest.Mock).mockResolvedValue({
      ok: true,
    });

    render(<PageEmailBlocklist />);
    await screen.findByText('@evil\\.com$');

    await user.click(screen.getByText('🗑️ Delete All'));

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(adminApi.deleteAllEmailBlocklistEntries).toHaveBeenCalled();
    });
    expect(await screen.findByText('No entries yet.')).toBeInTheDocument();
  });

  it('does not delete all when confirmation is cancelled', async () => {
    confirmSpy.mockReturnValue(false);
    (adminApi.getEmailBlocklist as jest.Mock).mockResolvedValue(mockEntries);

    render(<PageEmailBlocklist />);
    await screen.findByText('@evil\\.com$');

    await user.click(screen.getByText('🗑️ Delete All'));

    expect(adminApi.deleteAllEmailBlocklistEntries).not.toHaveBeenCalled();
    expect(screen.getByText('@evil\\.com$')).toBeInTheDocument();
  });

  it('loads regex patterns from a CSV/TXT file into the textarea', async () => {
    render(<PageEmailBlocklist />);
    await screen.findByText('No entries yet.');

    const fileContent = '"@evil\\.com$"\n@spam\\.net$\n\n';
    const file = new File([fileContent], 'blocklist.csv', { type: 'text/csv' });

    // file input is hidden behind a proxy button; query it directly
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(fileInput, file);

    const textarea = screen.getByTestId(
      'blocklist-input'
    ) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('@evil\\.com$\n@spam\\.net$');
    });
    expect(screen.getByTestId('blocklist-add-btn')).toBeEnabled();
  });
});
