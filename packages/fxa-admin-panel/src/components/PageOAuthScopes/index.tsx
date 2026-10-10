/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { AdminPanelFeature } from '@fxa/shared/guards';
import { adminApi } from '../../lib/api';
import Guard from '../Guard';
import type { OAuthScopeDto } from 'fxa-admin-server/src/types';

const submitBtnClass =
  'bg-green-50 border-2 p-1 border-green-300 font-small leading-6 rounded disabled:opacity-40 disabled:cursor-not-allowed';

const byScopeAsc = (a: OAuthScopeDto, b: OAuthScopeDto) =>
  a.scope.localeCompare(b.scope);

const PageOAuthScopes = () => {
  const [scopes, setScopes] = useState<OAuthScopeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newScope, setNewScope] = useState('');
  const [newHasScopedKeys, setNewHasScopedKeys] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.getOAuthScopes();
        setScopes([...data].sort(byScopeAsc));
      } catch {
        setError('Failed to load scopes.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await adminApi.createOAuthScope({
        scope: newScope,
        hasScopedKeys: newHasScopedKeys,
      });
      setScopes((prev) => [...prev, created].sort(byScopeAsc));
      setNewScope('');
      setNewHasScopedKeys(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="header-page">OAuth Scopes</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Manage creation of OAuth Scopes.</li>
        <li>
          For URL-format scopes, the presence of a row gates that scope behind a
          client&rsquo;s <code>allowedScopes</code> at grant time. Clients
          requesting it must list it explicitly or the grant is rejected.{' '}
          <strong>hasScopedKeys</strong> additionally forces a verified-session
          assertion (Sync-style scopes that derive encryption keys).
        </li>
        <li>
          Short-name scopes (e.g. <code>profile</code>,{' '}
          <code>profile:email</code>) are not consulted from this table at grant
          time today; they are configured via a client&rsquo;s{' '}
          <code>allowedScopes</code> on the <strong>Relying Parties</strong>{' '}
          page.
        </li>
        <li>
          Scopes cannot be edited or deleted once created, because a
          user&rsquo;s authorizations reference them. Add a new scope rather
          than rename an existing one.
        </li>
      </ul>

      <Guard features={[AdminPanelFeature.CreateOAuthScope]}>
        <h3 className="header-page text-base mt-4">Add Scope</h3>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-2">
            <label htmlFor="oauth-scope-input" className="block mb-1">
              Scope (any value, max 128 chars; empty string allowed)
            </label>
            <input
              id="oauth-scope-input"
              data-testid="oauth-scope-input"
              type="text"
              value={newScope}
              onChange={(e) => {
                setNewScope(e.target.value);
                if (submitError) setSubmitError(null);
              }}
              placeholder="https://identity.mozilla.com/apps/example"
              className="border-2 block w-full max-w-2xl p-1"
              maxLength={128}
              disabled={submitting}
            />
          </div>
          <div className="mb-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                data-testid="oauth-scope-has-scoped-keys"
                checked={newHasScopedKeys}
                onChange={(e) => setNewHasScopedKeys(e.target.checked)}
                disabled={submitting}
                className="mr-2"
              />
              <span>
                <strong>hasScopedKeys</strong> — require a verified-session
                assertion (key-bearing scopes only, e.g. Sync)
              </span>
            </label>
          </div>
          <button
            type="submit"
            data-testid="oauth-scope-add-btn"
            className={submitBtnClass}
            disabled={submitting}
          >
            ➕ Add Scope
          </button>
          {submitError && (
            <p
              role="alert"
              data-testid="oauth-scope-submit-error"
              className="text-red-600 mt-2"
            >
              {submitError}
            </p>
          )}
        </form>
      </Guard>

      <hr className="my-4" />

      <h3 className="header-page text-base">Current Scopes</h3>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && scopes.length === 0 && (
        <p className="result-grey">No scopes yet.</p>
      )}
      {scopes.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-grey-50">
              <th className="text-left p-2 border border-grey-100">ID</th>
              <th className="text-left p-2 border border-grey-100">Scope</th>
              <th className="text-left p-2 border border-grey-100">
                hasScopedKeys
              </th>
            </tr>
          </thead>
          <tbody>
            {scopes.map((s) => (
              <tr
                key={s.id}
                data-testid="oauth-scope-row"
                data-id={s.id}
                data-scope={s.scope}
                data-has-scoped-keys={String(s.hasScopedKeys)}
                className="hover:bg-grey-10"
              >
                <td className="p-2 border border-grey-100 whitespace-nowrap">
                  {s.id}
                </td>
                <td className="p-2 border border-grey-100 font-mono break-all">
                  {s.scope}
                </td>
                <td className="p-2 border border-grey-100 whitespace-nowrap">
                  {s.hasScopedKeys ? '✅ true' : 'false'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default PageOAuthScopes;
