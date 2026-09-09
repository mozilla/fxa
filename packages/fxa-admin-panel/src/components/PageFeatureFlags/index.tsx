/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import type { FeatureFlagDto } from 'fxa-admin-server/src/types';

const btnClass =
  'bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded';
const inputClass = 'border-2 border-grey-100 p-1 rounded';

const PageFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlagDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadFlags = useCallback(async () => {
    setError(null);
    try {
      setFlags(await adminApi.getFeatureFlags());
    } catch (e) {
      setError('Failed to load feature flags.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadFlags().finally(() => setLoading(false));
  }, [loadFlags]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim().toLowerCase();
    if (trimmedName.length === 0) return;

    setSubmitting(true);
    try {
      await adminApi.upsertFeatureFlag({
        name: trimmedName,
        enabled: false,
        description: description.trim(),
      });
      setName('');
      setDescription('');
      await loadFlags();
    } catch (e) {
      window.alert(
        `Error: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (flag: FeatureFlagDto) => {
    try {
      await adminApi.upsertFeatureFlag({
        name: flag.name,
        enabled: !flag.enabled,
        description: flag.description,
      });
      await loadFlags();
    } catch {
      window.alert(`Failed to toggle "${flag.name}".`);
    }
  };

  const handleDelete = async (flag: FeatureFlagDto) => {
    if (
      !window.confirm(
        `Delete the flag "${flag.name}"? Turning it off is usually what you want — delete only once no code refers to it.`
      )
    )
      return;
    try {
      await adminApi.deleteFeatureFlag(flag.name);
      await loadFlags();
    } catch {
      window.alert(`Failed to delete "${flag.name}".`);
    }
  };

  return (
    <>
      <h2 className="header-page">Feature Flags</h2>
      <ul className="list-disc list-inside mb-4">
        <li>
          Enabled flags are served by name from the auth server. Disabled flags
          are omitted entirely, so an unreleased feature's name stays
          unpublished until you switch it on.
        </li>
        <li>
          Flips are not instant. Each auth server process caches the list, so a
          change takes up to the configured cache TTL to reach every pod.
        </li>
        <li>
          Name a flag for the behaviour it turns <em>on</em>. A client that
          cannot reach the auth server sees every flag as off, so off has to
          mean the existing behaviour.
        </li>
        <li>
          Never gate a security control — a rate limit, an OTP check, a
          signature check — on a flag.
        </li>
      </ul>

      <form onSubmit={handleCreate} className="mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            className={inputClass}
            type="text"
            placeholder="flag-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Flag name"
          />
          <input
            className={`${inputClass} flex-1`}
            type="text"
            placeholder="What does this flag control?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Flag description"
          />
          <button
            className={btnClass}
            type="submit"
            disabled={submitting || name.trim().length === 0}
          >
            Create (off)
          </button>
        </div>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-700">{error}</p>}

      {!loading && !error && flags.length === 0 && (
        <p>No feature flags defined.</p>
      )}

      {flags.length > 0 && (
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="p-1">Name</th>
              <th className="p-1">Description</th>
              <th className="p-1">State</th>
              <th className="p-1">Last updated</th>
              <th className="p-1" />
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.name} className="border-t border-grey-100">
                <td className="p-1 font-mono">{flag.name}</td>
                <td className="p-1">{flag.description}</td>
                <td className="p-1">
                  <button
                    className={btnClass}
                    onClick={() => handleToggle(flag)}
                    aria-label={`Toggle ${flag.name}`}
                  >
                    {flag.enabled ? 'ON' : 'OFF'}
                  </button>
                </td>
                <td className="p-1">
                  {new Date(flag.updatedAt).toLocaleString()} by{' '}
                  {flag.updatedBy}
                </td>
                <td className="p-1">
                  <button
                    className={btnClass}
                    onClick={() => handleDelete(flag)}
                    aria-label={`Delete ${flag.name}`}
                  >
                    Delete
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

export default PageFeatureFlags;
