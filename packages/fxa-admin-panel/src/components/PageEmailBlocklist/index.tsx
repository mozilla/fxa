/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '../../lib/api';
import type { EmailBlocklistEntry } from 'fxa-admin-server/src/types';

const btnClass =
  'bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded';

const PageEmailBlocklist = () => {
  const [entries, setEntries] = useState<EmailBlocklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadEntries = useCallback(async () => {
    setError(null);
    try {
      const data = await adminApi.getEmailBlocklist();
      setEntries(
        [...data].sort(
          (a, b) => b.createdAt - a.createdAt || a.regex.localeCompare(b.regex)
        )
      );
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
    const regexes = raw
      .split('\n')
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    if (regexes.length === 0) return;

    setSubmitting(true);
    try {
      await adminApi.addEmailBlocklistEntries(regexes);
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
      if (textareaRef.current) textareaRef.current.value = lines.join('\n');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = async (regex: string) => {
    try {
      await adminApi.removeEmailBlocklistEntry(regex);
      setEntries((prev) => prev.filter((e) => e.regex !== regex));
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
      await adminApi.deleteAllEmailBlocklistEntries();
      await loadEntries();
    } catch {
      window.alert('Failed to delete all entries.');
    }
  };

  return (
    <>
      <h2 className="header-page">Email Blocklist</h2>
      <ul className="list-disc list-inside mb-4">
        <li>
          Blocks registration for emails matching any pattern. Does not affect
          existing accounts.
        </li>
        <li>
          Patterns are regexes matched against the full address. Mostly used for
          domains (e.g. <code>@evildoge\.example\.com$</code>).
        </li>
        <li>
          Use <code>$</code> to anchor to the end of the address — without it,{' '}
          <code>@mozilla\.com</code> would also match{' '}
          <code>@mozilla\.com.haxor.net</code>.
        </li>
        <li>
          Enter one pattern per line, or upload a CSV/TXT file (one entry per
          line). Duplicates are silently ignored.
        </li>
        <li>Blocked attempts are logged and counted in statsd.</li>
        <li>
          Changes propagate to auth-server within 5 minutes. Keep the list small
          (hundreds of entries, not thousands) to avoid slowing registration.
        </li>
      </ul>
      <p className="mb-4">
        <strong>
          ⚠️ Avoid complex patterns with nested quantifiers (e.g.{' '}
          <code>{'(a+)+'}</code>).
        </strong>{' '}
        These can cause slow matching on every registration attempt. Stick to
        simple domain patterns like <code>@domain\.com$</code>.
      </p>

      <form method="post" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          data-testid="blocklist-input"
          name="regexList"
          rows={8}
          cols={60}
          className="border-2 block"
          placeholder={'@evildoge\\.example\\.com$\n@haxor\\.net$'}
        />
        <br />
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
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
          data-testid="blocklist-add-btn"
          className="bg-green-50 border-2 p-1 border-green-300 font-small leading-6 rounded"
          disabled={submitting}
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
              <th className="text-left p-2 border border-grey-100">Pattern</th>
              <th className="text-left p-2 border border-grey-100">Added</th>
              <th className="p-2 border border-grey-100"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.regex} className="hover:bg-grey-10">
                <td className="p-2 border border-grey-100 font-mono">
                  {entry.regex}
                </td>
                <td className="p-2 border border-grey-100 whitespace-nowrap">
                  {new Date(entry.createdAt).toISOString()}
                </td>
                <td className="p-2 border border-grey-100 text-center">
                  <button
                    data-testid={`delete-${entry.regex}`}
                    className={btnClass}
                    onClick={() => handleDelete(entry.regex)}
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

export default PageEmailBlocklist;
