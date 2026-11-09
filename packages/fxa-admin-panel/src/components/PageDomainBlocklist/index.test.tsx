/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent, UserEvent } from '@testing-library/user-event';
import PageDomainBlocklist from './index';
import { PAGE_SIZE } from '../BlocklistTable';
import { adminApi } from '../../lib/api';

jest.mock('../../lib/api', () => ({
  adminApi: {
    getDomainBlocklist: jest.fn(),
    addDomainBlocklistEntries: jest.fn(),
    disableDomainBlocklistMatches: jest.fn(),
    removeDomainBlocklistEntry: jest.fn(),
    deleteAllDomainBlocklistEntries: jest.fn(),
    syncDomainBlocklist: jest.fn(),
  },
}));

const mockEntries = [
  { domain: 'evil.com', createdAt: 2000 },
  { domain: 'spam.net', createdAt: 1000 },
];

const SYNC_URL = 'https://example.com/domains.txt';

describe('PageDomainBlocklist', () => {
  let user: UserEvent;
  let confirmSpy: jest.SpyInstance;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    user = userEvent.setup();
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    (adminApi.getDomainBlocklist as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page heading and empty state', async () => {
    render(<PageDomainBlocklist />);

    expect(screen.getByText('Email Blocklist (string)')).toBeInTheDocument();
    expect(await screen.findByText('No entries yet.')).toBeInTheDocument();
  });

  it('shows loading state then renders entries', async () => {
    (adminApi.getDomainBlocklist as jest.Mock).mockResolvedValue(mockEntries);

    render(<PageDomainBlocklist />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();

    expect(await screen.findByText('evil.com')).toBeInTheDocument();
    expect(screen.getByText('spam.net')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  it('reaches entries past the first page by page and by filter', async () => {
    const many = Array.from({ length: PAGE_SIZE + 3 }, (_, i) => ({
      domain: `spam${i}.example`,
      createdAt: 1000,
    }));
    (adminApi.getDomainBlocklist as jest.Mock).mockResolvedValue(many);

    render(<PageDomainBlocklist />);

    expect(
      await screen.findByText(
        `Showing 1 to ${PAGE_SIZE} of ${PAGE_SIZE + 3} entries.`
      )
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next →' }));
    expect(
      screen.getByText(`spam${PAGE_SIZE + 2}.example`)
    ).toBeInTheDocument();

    // paste fires one input event; type re-renders the 500-row table per key.
    await user.click(screen.getByLabelText('Filter by domain'));
    await user.paste(`SPAM${PAGE_SIZE + 1}`);
    expect(
      screen.getByText(`spam${PAGE_SIZE + 1}.example`)
    ).toBeInTheDocument();
    // One entry row plus the header row.
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('shows error state when load fails', async () => {
    (adminApi.getDomainBlocklist as jest.Mock).mockRejectedValue(
      new Error('network error')
    );

    render(<PageDomainBlocklist />);

    expect(
      await screen.findByText('Failed to load blocklist.')
    ).toBeInTheDocument();
  });

  it('Add Entries button is disabled when textarea is empty', async () => {
    render(<PageDomainBlocklist />);

    const btn = screen.getByTestId('domain-blocklist-add-btn');
    expect(btn).toBeDisabled();
  });

  it('Add Entries button enables after typing and submits', async () => {
    (adminApi.getDomainBlocklist as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ domain: 'newevilsite.com', createdAt: 3000 }]);
    (adminApi.addDomainBlocklistEntries as jest.Mock).mockResolvedValue({
      ok: true,
    });

    render(<PageDomainBlocklist />);
    await screen.findByText('No entries yet.');

    const textarea = screen.getByTestId('domain-blocklist-input');
    const btn = screen.getByTestId('domain-blocklist-add-btn');

    await user.type(textarea, 'newevilsite.com');
    expect(btn).toBeEnabled();

    await user.click(btn);

    await waitFor(() => {
      expect(adminApi.addDomainBlocklistEntries).toHaveBeenCalledWith([
        'newevilsite.com',
      ]);
    });
    expect(await screen.findByText('newevilsite.com')).toBeInTheDocument();
  });

  it('shows alert when add fails', async () => {
    (adminApi.addDomainBlocklistEntries as jest.Mock).mockRejectedValue(
      new Error('API error 400: bad domain')
    );

    render(<PageDomainBlocklist />);
    await screen.findByText('No entries yet.');

    await user.type(screen.getByTestId('domain-blocklist-input'), 'evil.com');
    await user.click(screen.getByTestId('domain-blocklist-add-btn'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('API error 400: bad domain')
      );
    });
  });

  it('syncs from the typed URL and reports the submitted count', async () => {
    (adminApi.getDomainBlocklist as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockEntries);
    (adminApi.syncDomainBlocklist as jest.Mock).mockResolvedValue({
      ok: true,
      total: 40000,
      submitted: 39990,
    });

    render(<PageDomainBlocklist />);
    await screen.findByText('No entries yet.');

    await user.type(screen.getByTestId('domain-blocklist-sync-url'), SYNC_URL);
    await user.click(screen.getByTestId('domain-blocklist-sync-btn'));

    expect(adminApi.syncDomainBlocklist).toHaveBeenCalledWith(SYNC_URL);
    expect(
      await screen.findByTestId('domain-blocklist-sync-result')
    ).toHaveTextContent(
      'Read 40000 entries and sent 39990 unique domains to the blocklist. Entries already on the list were ignored.'
    );
    expect(screen.getByText('evil.com')).toBeInTheDocument();
  });

  // jsdom does not run constraint validation, so assert the attribute instead.
  it('starts with an empty, required URL field', async () => {
    render(<PageDomainBlocklist />);
    await screen.findByText('No entries yet.');

    const input = screen.getByTestId('domain-blocklist-sync-url');
    expect(input).toHaveValue('');
    expect(input).toBeRequired();
  });

  it('shows the error message when the sync fails', async () => {
    (adminApi.syncDomainBlocklist as jest.Mock).mockRejectedValue(
      new Error('API error 502: could not fetch the list')
    );

    render(<PageDomainBlocklist />);
    await screen.findByText('No entries yet.');

    await user.type(screen.getByTestId('domain-blocklist-sync-url'), SYNC_URL);
    await user.click(screen.getByTestId('domain-blocklist-sync-btn'));

    expect(
      await screen.findByTestId('domain-blocklist-sync-result')
    ).toHaveTextContent('Error: API error 502: could not fetch the list');
  });

  it('deletes a single entry after successful API call', async () => {
    (adminApi.getDomainBlocklist as jest.Mock).mockResolvedValue(mockEntries);
    (adminApi.removeDomainBlocklistEntry as jest.Mock).mockResolvedValue({
      removed: true,
    });

    render(<PageDomainBlocklist />);
    await screen.findByText('evil.com');

    await user.click(screen.getByTestId('delete-evil.com'));

    await waitFor(() => {
      expect(adminApi.removeDomainBlocklistEntry).toHaveBeenCalledWith(
        'evil.com'
      );
      expect(screen.queryByText('evil.com')).not.toBeInTheDocument();
    });
    expect(screen.getByText('spam.net')).toBeInTheDocument();
  });

  it('deletes all entries after confirmation', async () => {
    (adminApi.getDomainBlocklist as jest.Mock)
      .mockResolvedValueOnce(mockEntries)
      .mockResolvedValueOnce([]);
    (adminApi.deleteAllDomainBlocklistEntries as jest.Mock).mockResolvedValue({
      ok: true,
    });

    render(<PageDomainBlocklist />);
    await screen.findByText('evil.com');

    await user.click(screen.getByText('🗑️ Delete All'));

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(adminApi.deleteAllDomainBlocklistEntries).toHaveBeenCalled();
    });
    expect(await screen.findByText('No entries yet.')).toBeInTheDocument();
  });

  it('does not delete all when confirmation is cancelled', async () => {
    confirmSpy.mockReturnValue(false);
    (adminApi.getDomainBlocklist as jest.Mock).mockResolvedValue(mockEntries);

    render(<PageDomainBlocklist />);
    await screen.findByText('evil.com');

    await user.click(screen.getByText('🗑️ Delete All'));

    expect(adminApi.deleteAllDomainBlocklistEntries).not.toHaveBeenCalled();
    expect(screen.getByText('evil.com')).toBeInTheDocument();
  });

  it('adds the entries, then disables matching accounts when the checkbox is set', async () => {
    (adminApi.addDomainBlocklistEntries as jest.Mock).mockResolvedValue({
      ok: true,
    });
    (adminApi.disableDomainBlocklistMatches as jest.Mock).mockResolvedValue({
      disabled: 3,
    });

    render(<PageDomainBlocklist />);
    await screen.findByText('No entries yet.');

    await user.type(
      screen.getByTestId('domain-blocklist-input'),
      'newevilsite.com'
    );
    await user.click(
      screen.getByRole('checkbox', { name: 'Disable matching accounts' })
    );
    await user.click(screen.getByTestId('domain-blocklist-add-btn'));

    expect(
      await screen.findByTestId('disable-matching-result')
    ).toHaveTextContent('Disabled 3 matching accounts.');
    expect(adminApi.addDomainBlocklistEntries).toHaveBeenCalledWith([
      'newevilsite.com',
    ]);
    expect(adminApi.disableDomainBlocklistMatches).toHaveBeenCalledWith([
      'newevilsite.com',
    ]);
  });

  it('does not disable accounts when the checkbox is clear', async () => {
    (adminApi.addDomainBlocklistEntries as jest.Mock).mockResolvedValue({
      ok: true,
    });

    render(<PageDomainBlocklist />);
    await screen.findByText('No entries yet.');

    await user.type(
      screen.getByTestId('domain-blocklist-input'),
      'newevilsite.com'
    );
    await user.click(screen.getByTestId('domain-blocklist-add-btn'));

    await waitFor(() =>
      expect(adminApi.addDomainBlocklistEntries).toHaveBeenCalled()
    );
    expect(adminApi.disableDomainBlocklistMatches).not.toHaveBeenCalled();
  });

  it('disables the accounts that match a row and shows the count', async () => {
    (adminApi.getDomainBlocklist as jest.Mock).mockResolvedValue(mockEntries);
    (adminApi.disableDomainBlocklistMatches as jest.Mock).mockResolvedValue({
      disabled: 1,
    });

    render(<PageDomainBlocklist />);
    await user.click(
      await screen.findByTestId(`disable-matching-${mockEntries[0].domain}`)
    );

    expect(
      await screen.findByTestId('disable-matching-result')
    ).toHaveTextContent('Disabled 1 matching account.');
    expect(adminApi.disableDomainBlocklistMatches).toHaveBeenCalledWith([
      mockEntries[0].domain,
    ]);
  });

  it('shows the error when disabling matching accounts fails', async () => {
    (adminApi.getDomainBlocklist as jest.Mock).mockResolvedValue(mockEntries);
    (adminApi.disableDomainBlocklistMatches as jest.Mock).mockRejectedValue(
      new Error('API error 500')
    );

    render(<PageDomainBlocklist />);
    await user.click(
      await screen.findByTestId(`disable-matching-${mockEntries[0].domain}`)
    );

    expect(
      await screen.findByTestId('disable-matching-result')
    ).toHaveTextContent('Error: API error 500');
    expect(
      screen.getByTestId(`disable-matching-${mockEntries[0].domain}`)
    ).toBeEnabled();
  });
});
