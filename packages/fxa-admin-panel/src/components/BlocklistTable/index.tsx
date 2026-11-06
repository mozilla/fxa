/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useMemo, useState } from 'react';

const btnClass =
  'bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded disabled:opacity-40 disabled:cursor-not-allowed';

/** A synced list holds tens of thousands of rows; mounting them all is slow. */
export const PAGE_SIZE = 500;

type BlocklistTableProps<T> = {
  entries: T[];
  label: string;
  getValue: (entry: T) => string;
  onDelete: (value: string) => void;
  onDisableMatching: (value: string) => Promise<void>;
};

const BlocklistTable = <T extends { createdAt: number }>({
  entries,
  label,
  getValue,
  onDelete,
  onDisableMatching,
}: BlocklistTableProps<T>) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  // Values in flight; one row scan at a time, because the page keeps one result.
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());

  const disableMatching = async (value: string) => {
    setPending((p) => new Set(p).add(value));
    try {
      await onDisableMatching(value);
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(value);
        return next;
      });
    }
  };

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? entries.filter((e) => getValue(e).toLowerCase().includes(needle))
      : entries;
  }, [entries, getValue, query]);

  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  // Clamp, because a remove or a reload can shrink the list under the page.
  const current = Math.min(page, pageCount - 1);
  const start = current * PAGE_SIZE;
  const shown = matches.slice(start, start + PAGE_SIZE);

  return (
    <>
      <input
        type="search"
        aria-label={`Filter by ${label.toLowerCase()}`}
        placeholder={`Filter by ${label.toLowerCase()}…`}
        className="border-2 block w-full max-w-md p-1 mb-2 font-mono text-sm"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
      />

      {/* One live region for both messages, so an empty result is announced too. */}
      <p role="status" className="result-grey mb-2">
        {matches.length === 0 ? (
          <>No entries match “{query.trim()}”.</>
        ) : (
          <>
            Showing {(start + 1).toLocaleString()} to{' '}
            {(start + shown.length).toLocaleString()} of{' '}
            {matches.length.toLocaleString()}{' '}
            {matches.length === 1 ? 'entry' : 'entries'}.
          </>
        )}
      </p>

      {pageCount > 1 && (
        <nav aria-label="Blocklist pages" className="mb-2">
          <button
            type="button"
            className={btnClass}
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            ← Previous
          </button>
          &nbsp;Page {current + 1} of {pageCount}&nbsp;
          <button
            type="button"
            className={btnClass}
            disabled={current === pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            Next →
          </button>
        </nav>
      )}

      {shown.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-grey-50">
              <th className="text-left p-2 border border-grey-100">{label}</th>
              <th className="text-left p-2 border border-grey-100">Added</th>
              <th className="p-2 border border-grey-100"></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((entry) => {
              const value = getValue(entry);
              return (
                <tr key={value} className="hover:bg-grey-10">
                  <td className="p-2 border border-grey-100 font-mono">
                    {value}
                  </td>
                  <td className="p-2 border border-grey-100 whitespace-nowrap">
                    {new Date(entry.createdAt).toISOString()}
                  </td>
                  <td className="p-2 border border-grey-100 text-center whitespace-nowrap">
                    <button
                      type="button"
                      data-testid={`delete-${value}`}
                      className={btnClass}
                      onClick={() => onDelete(value)}
                    >
                      🗑️ Remove
                    </button>
                    &nbsp;
                    <button
                      type="button"
                      data-testid={`disable-matching-${value}`}
                      className={btnClass}
                      disabled={pending.size > 0}
                      onClick={() => disableMatching(value)}
                    >
                      🚫 Disable matching accounts
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
};

export default BlocklistTable;
