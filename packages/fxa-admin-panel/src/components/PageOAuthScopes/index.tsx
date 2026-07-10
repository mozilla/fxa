/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { AdminPanelFeature } from '@fxa/shared/guards';
import { adminApi } from '../../lib/api';
import Guard from '../Guard';
import { useUserContext } from '../../hooks/UserContext';
import { useGuardContext } from '../../hooks/GuardContext';
import type { OAuthScopeDto } from 'fxa-admin-server/src/types';

const submitBtnClass =
  'bg-green-50 border-2 p-1 border-green-300 font-small leading-6 rounded disabled:opacity-40 disabled:cursor-not-allowed';

const byScopeAsc = (a: OAuthScopeDto, b: OAuthScopeDto) =>
  a.scope.localeCompare(b.scope);

const PageOAuthScopes = () => {
  const { user } = useUserContext();
  const { guard } = useGuardContext();
  const canDelete = guard.allow(AdminPanelFeature.DeleteOAuthScope, user.group);

  const [scopes, setScopes] = useState<OAuthScopeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newScope, setNewScope] = useState('');
  const [newHasScopedKeys, setNewHasScopedKeys] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const handleDelete = async (scope: OAuthScopeDto) => {
    if (deletingId !== null) return;
    if (
      !window.confirm(
        `Delete the scope "${scope.scope}" (id ${scope.id})?\n\n` +
          'This takes effect immediately on every auth-server pod — there is ' +
          'no cache and no restart. Removing a row that gates a key-bearing ' +
          'scope can break Sync-style grants and any client that requests it. ' +
          'Only proceed if you are certain this scope is no longer needed.'
      )
    ) {
      return;
    }

    setDeletingId(scope.id);
    try {
      await adminApi.deleteOAuthScope(scope.id);
      setScopes((prev) => prev.filter((s) => s.id !== scope.id));
    } catch (err) {
      window.alert(
        `Error deleting scope: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <h2 className="header-page">OAuth Scopes</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Manage creation and deletion of OAuth Scopes.</li>
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
          Scopes cannot be edited once created. They can be deleted, but a
          scope&rsquo;s value is its identity. Delete and re-create rather than
          rename.
        </li>
      </ul>

      {canDelete && (
        <div
          role="alert"
          data-testid="oauth-scope-delete-warning"
          className="border-2 border-red-300 bg-red-50 text-red-800 rounded p-3 mb-4"
        >
          <strong>⚠️ Deleting a scope is immediate.</strong> Dropping a row that
          gates a key-bearing (<code>hasScopedKeys</code>) or URL-format scope
          can break Sync-style grants and reject any client that still requests
          it. Be <strong>absolutely certain</strong> the scope is no longer in
          use before deleting.
        </div>
      )}

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
              {canDelete && (
                <th className="text-left p-2 border border-grey-100">
                  Actions
                </th>
              )}
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
                {canDelete && (
                  <td className="p-2 border border-grey-100 whitespace-nowrap">
                    <button
                      type="button"
                      data-testid="oauth-scope-delete-btn"
                      onClick={() => handleDelete(s)}
                      disabled={deletingId !== null}
                      className="text-red-700 border-2 border-red-300 rounded p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default PageOAuthScopes;
