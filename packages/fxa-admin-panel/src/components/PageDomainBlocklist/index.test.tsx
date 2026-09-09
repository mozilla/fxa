/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent, UserEvent } from '@testing-library/user-event';
import PageDomainBlocklist from './index';
import { adminApi } from '../../lib/api';

jest.mock('../../lib/api', () => ({
  adminApi: {
    getDomainBlocklist: jest.fn(),
    addDomainBlocklistEntries: jest.fn(),
    removeDomainBlocklistEntry: jest.fn(),
    deleteAllDomainBlocklistEntries: jest.fn(),
    syncDomainBlocklist: jest.fn(),
  },
}));

const mockEntries = [
  { domain: 'evil.com', createdAt: 2000 },
  { domain: 'spam.net', createdAt: 1000 },
];

const DEFAULT_SYNC_URL =
  'https://raw.githubusercontent.com/disposable/disposable-email-domains/master/disposable_email_blocklist.conf';

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

  it('pre-fills the sync URL with the disposable-email-domains list', async () => {
    render(<PageDomainBlocklist />);
    await screen.findByText('No entries yet.');

    expect(screen.getByTestId('domain-blocklist-sync-url')).toHaveValue(
      DEFAULT_SYNC_URL
    );
  });

  it('syncs from the default URL and reports the submitted count', async () => {
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

    await user.click(screen.getByTestId('domain-blocklist-sync-btn'));

    expect(adminApi.syncDomainBlocklist).toHaveBeenCalledWith(DEFAULT_SYNC_URL);
    expect(
      await screen.findByTestId('domain-blocklist-sync-result')
    ).toHaveTextContent(
      'Read 40000 entries and sent 39990 unique domains to the blocklist. Entries already on the list were ignored.'
    );
    expect(screen.getByText('evil.com')).toBeInTheDocument();
  });

  it('syncs from an edited URL', async () => {
    (adminApi.syncDomainBlocklist as jest.Mock).mockResolvedValue({
      ok: true,
      total: 2,
      submitted: 2,
    });

    render(<PageDomainBlocklist />);
    await screen.findByText('No entries yet.');

    const input = screen.getByTestId('domain-blocklist-sync-url');
    await user.clear(input);
    await user.type(input, 'https://lists.example.com/other.conf');
    await user.click(screen.getByTestId('domain-blocklist-sync-btn'));

    expect(adminApi.syncDomainBlocklist).toHaveBeenCalledWith(
      'https://lists.example.com/other.conf'
    );
  });

  it('shows the error message when the sync fails', async () => {
    (adminApi.syncDomainBlocklist as jest.Mock).mockRejectedValue(
      new Error('API error 400: url must use https')
    );

    render(<PageDomainBlocklist />);
    await screen.findByText('No entries yet.');

    await user.click(screen.getByTestId('domain-blocklist-sync-btn'));

    expect(
      await screen.findByTestId('domain-blocklist-sync-result')
    ).toHaveTextContent('Error: API error 400: url must use https');
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
});
