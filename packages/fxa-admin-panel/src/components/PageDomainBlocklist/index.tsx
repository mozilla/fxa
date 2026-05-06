/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '../../lib/api';
import type { DomainBlocklistEntry } from 'fxa-admin-server/src/types';

const btnClass =
  'bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded';

const PageDomainBlocklist = () => {
  const [entries, setEntries] = useState<DomainBlocklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasInput, setHasInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadEntries = useCallback(async () => {
    setError(null);
    try {
      const data = await adminApi.getDomainBlocklist();
      setEntries(data);
    } catch (e) {
      setError('Failed to load blocklist.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadEntries().finally(() => setLoading(false));
  }, [loadEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = textareaRef.current?.value ?? '';
    const domains = raw
      .split('\n')
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    if (domains.length === 0) return;

    setHasInput(false);
    setSubmitting(true);
    try {
      await adminApi.addDomainBlocklistEntries(domains);
      if (textareaRef.current) textareaRef.current.value = '';
      await loadEntries();
    } catch (e) {
      window.alert(
        `Error: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = (ev.target?.result as string)
        .split(/\r?\n/)
        .map((l) => l.trim().replace(/^"|"$/g, ''))
        .filter((l) => l.length > 0);
      if (textareaRef.current) {
        textareaRef.current.value = lines.join('\n');
        setHasInput(lines.length > 0);
      }
    };
    reader.onerror = () => window.alert('Failed to read file.');
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = async (domain: string) => {
    try {
      await adminApi.removeDomainBlocklistEntry(domain);
      setEntries((prev) => prev.filter((e) => e.domain !== domain));
    } catch {
      window.alert('Failed to remove entry.');
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        `Delete all ${entries.length} blocklist entries? This cannot be undone.`
      )
    )
      return;
    try {
      await adminApi.deleteAllDomainBlocklistEntries();
      await loadEntries();
    } catch {
      window.alert('Failed to delete all entries.');
    }
  };

  return (
    <>
      <h2 className="header-page">Email Blocklist (string)</h2>
      <ul className="list-disc list-inside mb-4">
        <li>
          Blocks registration for any email whose domain exactly matches an
          entry. Does not affect existing accounts.
        </li>
        <li>
          Enter plain domain names only — no <code>@</code>, no wildcards, no
          regex. E.g. <code>evildoge.example.com</code>.
        </li>
        <li>
          Matching is case-insensitive; entries are normalized to lowercase on
          save.
        </li>
        <li>
          Enter one domain per line, or upload a CSV/TXT file (one entry per
          line). Leading <code>@</code> is stripped automatically. Duplicates
          are silently ignored.
        </li>
        <li>Blocked attempts are logged and counted in statsd.</li>
        <li>
          Changes propagate to auth-server within 5 minutes (same cache TTL as
          the regex blocklist).
        </li>
      </ul>

      <form method="post" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          data-testid="domain-blocklist-input"
          aria-label="Domain blocklist entries, one per line"
          name="domainList"
          rows={8}
          cols={60}
          className="border-2 block"
          placeholder={'evildoge.example.com\nhaxor.net'}
          onChange={(e) => setHasInput(e.target.value.trim().length > 0)}
        />
        <br />
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.conf"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          className={btnClass}
          onClick={() => fileInputRef.current?.click()}
        >
          📂 Load from file…
        </button>
        &nbsp;
        <button
          type="submit"
          data-testid="domain-blocklist-add-btn"
          className="bg-green-50 border-2 p-1 border-green-300 font-small leading-6 rounded disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={submitting || !hasInput}
        >
          ➕ Add Entries
        </button>
      </form>

      <hr className="my-4" />

      <div className="flex items-center justify-between mb-2">
        <h2 className="header-page">Current Blocklist</h2>
        {entries.length > 0 && (
          <button
            className="bg-red-50 border-2 p-1 border-red-300 font-small leading-6 rounded"
            onClick={handleDeleteAll}
          >
            🗑️ Delete All
          </button>
        )}
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && entries.length === 0 && (
        <p className="result-grey">No entries yet.</p>
      )}
      {entries.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-grey-50">
              <th className="text-left p-2 border border-grey-100">Domain</th>
              <th className="text-left p-2 border border-grey-100">Added</th>
              <th className="p-2 border border-grey-100"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.domain} className="hover:bg-grey-10">
                <td className="p-2 border border-grey-100 font-mono">
                  {entry.domain}
                </td>
                <td className="p-2 border border-grey-100 whitespace-nowrap">
                  {new Date(entry.createdAt).toISOString()}
                </td>
                <td className="p-2 border border-grey-100 text-center">
                  <button
                    data-testid={`delete-${entry.domain}`}
                    className={btnClass}
                    onClick={() => handleDelete(entry.domain)}
                  >
                    🗑️ Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default PageDomainBlocklist;
