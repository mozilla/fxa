/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent, UserEvent } from '@testing-library/user-event';
import BlocklistTable, { PAGE_SIZE } from './index';

type Entry = { domain: string; createdAt: number };

const getDomain = (entry: Entry) => entry.domain;

const makeEntries = (count: number): Entry[] =>
  Array.from({ length: count }, (_, i) => ({
    domain: `host${i}.example`,
    createdAt: 1000,
  }));

const renderTable = (
  entries: Entry[],
  onDelete = jest.fn(),
  onDisableMatching = jest.fn().mockResolvedValue(undefined)
) =>
  render(
    <BlocklistTable
      entries={entries}
      label="Domain"
      getValue={getDomain}
      onDelete={onDelete}
      onDisableMatching={onDisableMatching}
    />
  );

describe('BlocklistTable', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('shows one page with no pager when the list fits', () => {
    renderTable(makeEntries(2));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Showing 1 to 2 of 2 entries.'
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    // Two entry rows plus the header row.
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('uses the singular for one entry', () => {
    renderTable(makeEntries(1));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Showing 1 to 1 of 1 entry.'
    );
  });

  it('pages through the list and disables the buttons at each end', async () => {
    const { container } = renderTable(makeEntries(PAGE_SIZE + 3));
    // Role queries over 500 rows are slow; text and selector queries are not.
    const rows = () => container.querySelectorAll('tbody tr');

    const previous = screen.getByText('← Previous');
    const next = screen.getByText('Next →');
    expect(previous).toBeDisabled();
    expect(rows()).toHaveLength(PAGE_SIZE);

    await user.click(next);

    expect(
      screen.getByText('Page 2 of 2', { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Showing ${PAGE_SIZE + 1} to ${PAGE_SIZE + 3} of ${PAGE_SIZE + 3} entries.`
      )
    ).toBeInTheDocument();
    expect(rows()).toHaveLength(3);
    expect(next).toBeDisabled();
    expect(previous).toBeEnabled();

    await user.click(previous);
    expect(screen.getByText('host0.example')).toBeInTheDocument();
  });

  it('filters by case-insensitive substring and returns to page 1', async () => {
    renderTable(makeEntries(PAGE_SIZE + 3));
    await user.click(screen.getByRole('button', { name: 'Next →' }));

    // paste fires one input event; type re-renders the 500-row table per key.
    await user.click(screen.getByLabelText('Filter by domain'));
    await user.paste('HOST50');

    // host50 and host500 to host502.
    expect(screen.getByRole('status')).toHaveTextContent(
      'Showing 1 to 4 of 4 entries.'
    );
    expect(screen.getByText('host502.example')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('says when nothing matches the filter', async () => {
    renderTable(makeEntries(2));

    await user.type(screen.getByLabelText('Filter by domain'), 'nope');

    expect(screen.getByRole('status')).toHaveTextContent(
      'No entries match “nope”.'
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('moves back to the last page when the list shrinks under it', async () => {
    const { rerender } = renderTable(makeEntries(PAGE_SIZE + 1));
    await user.click(screen.getByRole('button', { name: 'Next →' }));

    rerender(
      <BlocklistTable
        entries={makeEntries(2)}
        label="Domain"
        getValue={getDomain}
        onDelete={jest.fn()}
        onDisableMatching={jest.fn()}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Showing 1 to 2 of 2 entries.'
    );
    expect(screen.getByText('host1.example')).toBeInTheDocument();
  });

  it('passes the entry value to onDelete', async () => {
    const onDelete = jest.fn();
    renderTable(makeEntries(1), onDelete);

    await user.click(screen.getByRole('button', { name: /remove/i }));

    expect(onDelete).toHaveBeenCalledWith('host0.example');
  });

  it('disables the row button until onDisableMatching settles', async () => {
    let settle = () => {};
    const onDisableMatching = jest.fn(
      () => new Promise<void>((resolve) => (settle = resolve))
    );
    renderTable(makeEntries(1), jest.fn(), onDisableMatching);
    const button = screen.getByRole('button', {
      name: /disable matching accounts/i,
    });

    await user.click(button);

    expect(onDisableMatching).toHaveBeenCalledWith('host0.example');
    expect(button).toBeDisabled();

    settle();
    await waitFor(() => expect(button).toBeEnabled());
    expect(onDisableMatching).toHaveBeenCalledTimes(1);
  });

  it('disables every row button while one request is pending', async () => {
    let settle = () => {};
    const onDisableMatching = jest.fn(
      () => new Promise<void>((resolve) => (settle = resolve))
    );
    renderTable(makeEntries(2), jest.fn(), onDisableMatching);
    const [first, second] = screen.getAllByRole('button', {
      name: /disable matching accounts/i,
    });

    await user.click(first);

    expect(first).toBeDisabled();
    expect(second).toBeDisabled();
    await user.click(second);

    settle();
    await waitFor(() => expect(second).toBeEnabled());
    expect(onDisableMatching).toHaveBeenCalledTimes(1);
  });
});
