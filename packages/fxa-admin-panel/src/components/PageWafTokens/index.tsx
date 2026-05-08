/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '../../lib/api';
import { AdminPanelFeature } from '@fxa/shared/guards';
import { Guard } from '../Guard';
import { getFormattedDate, getWafTfPath } from '../../lib/utils';
import type {
  WafBypassTokenDto,
  RelyingPartyDto,
} from 'fxa-admin-server/src/types';

const btnClass =
  'bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded m-1';

const WafTokenRow = ({
  token,
  rpName,
  onRotated,
  onDeleted,
  flashOnMount,
}: {
  token: WafBypassTokenDto;
  rpName: string | null;
  onRotated: (updated: WafBypassTokenDto) => void;
  onDeleted: (id: string) => void;
  flashOnMount?: boolean;
}) => {
  const [flash, setFlash] = useState(flashOnMount ?? false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerFlash = () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash(true);
    flashTimer.current = setTimeout(() => setFlash(false), 2000);
  };

  useEffect(() => {
    if (flashOnMount) triggerFlash();
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRotate = async () => {
    if (
      !window.confirm(
        `Rotate token "${token.name}"?\n\nThe old token will continue to work until fxa_ci_bypass_tokens is updated in ${getWafTfPath()} (webservices-infra).`
      )
    )
      return;
    try {
      const updated = await adminApi.rotateWafToken(token.id);
      onRotated(updated);
      triggerFlash();
    } catch (e) {
      window.alert(`Error rotating token: ${(e as Error).message}`);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete token "${token.name}"? The token will continue to be used until it's also removed from fxa_ci_bypass_tokens in ${getWafTfPath()} (webservices-infra).`
      )
    )
      return;
    try {
      await adminApi.deleteWafToken(token.id);
      onDeleted(token.id);
    } catch (e) {
      window.alert(`Error deleting token: ${(e as Error).message}`);
    }
  };

  return (
    <tr
      className={`border-t border-grey-100 transition-colors duration-1000 ${flash ? 'bg-yellow-50' : ''}`}
    >
      <td className="p-2">{token.name}</td>
      <td className="p-2 font-mono text-sm">{token.token}</td>
      <td className="p-2">
        {rpName ?? <span className="text-grey-400">—</span>}
      </td>
      <td className="p-2">{getFormattedDate(token.createdAt)}</td>
      <td className="p-2 whitespace-nowrap">
        <Guard features={[AdminPanelFeature.ManageWafTokens]}>
          <button className={btnClass} onClick={handleRotate}>
            Rotate
          </button>
          <button className={btnClass} onClick={handleDelete}>
            Delete
          </button>
        </Guard>
      </td>
    </tr>
  );
};

const CreateTokenForm = ({
  rps,
  usedClientIds,
  onCreated,
  onCancel,
}: {
  rps: RelyingPartyDto[];
  usedClientIds: Set<string>;
  onCreated: (token: WafBypassTokenDto) => void;
  onCancel: () => void;
}) => {
  const [status, setStatus] = useState('');
  const [createdToken, setCreatedToken] = useState('');
  const availableRps = rps.filter((rp) => !usedClientIds.has(rp.id));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString().trim() || '';
    const clientId = formData.get('clientId')?.toString() || '';

    if (!name) {
      setStatus('Name is required.');
      return;
    }

    setStatus('Creating…');
    try {
      const result = await adminApi.createWafToken({
        name,
        clientId: clientId || undefined,
      });
      setCreatedToken(result.token);
      setStatus('Created!');
      onCreated(result);
    } catch (e) {
      setStatus(`Error: ${(e as Error).message}`);
    }
  };

  if (createdToken) {
    return (
      <div className="p-4 border border-grey-100 rounded mt-4">
        <p className="font-bold mb-2">Token created.</p>
        <p className="mb-1">
          Add this value to <code>fxa_ci_bypass_tokens</code> in{' '}
          <code>{getWafTfPath()}</code> (webservices-infra), then run{' '}
          <code>terraform apply</code>:
        </p>
        <pre className="p-3 bg-grey-50 rounded mb-3">{createdToken}</pre>
        <button className={btnClass} onClick={onCancel}>
          Done
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-grey-100 rounded mt-4"
    >
      <h3 className="font-bold mb-3">Generate new token</h3>

      <label className="block mb-1">Name:</label>
      <input
        className="bg-grey-50 rounded w-full py-2 px-3 mb-3"
        type="text"
        name="name"
        placeholder="e.g. FxA Functional Tests, Mozilla VPN"
        required
      />

      <label className="block mb-1">Linked relying party (optional):</label>
      <select
        className="bg-grey-50 rounded w-full py-2 px-3 mb-3"
        name="clientId"
      >
        <option value="">— None (standalone token) —</option>
        {availableRps.map((rp) => (
          <option key={rp.id} value={rp.id}>
            {rp.name} ({rp.id})
          </option>
        ))}
      </select>

      <button type="submit" className={btnClass}>
        Generate
      </button>
      <button type="button" className={btnClass} onClick={onCancel}>
        Cancel
      </button>
      {status && <span className="ml-2">{status}</span>}
    </form>
  );
};

export const PageWafTokens = () => {
  const [tokens, setTokens] = useState<WafBypassTokenDto[]>([]);
  const [rps, setRps] = useState<RelyingPartyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);
  const [newTokenId, setNewTokenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tokenData, rpData] = await Promise.all([
        adminApi.getWafTokens(),
        adminApi.getRelyingParties(),
      ]);
      setTokens(tokenData);
      setRps(rpData);
    } catch {
      setError('Failed to load WAF tokens.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rpById = Object.fromEntries(rps.map((rp) => [rp.id, rp.name]));
  const usedClientIds = new Set(
    tokens.map((t) => t.clientId).filter((id): id is string => id !== null)
  );

  const handleRotated = (updated: WafBypassTokenDto) => {
    setTokens((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleted = (id: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreated = (token: WafBypassTokenDto) => {
    setTokens((prev) => [token, ...prev]);
    setNewTokenId(token.id);
  };

  // Clear newTokenId after the table has rendered with flashOnMount, not before.
  // Clearing it in the same setState batch as setShowCreate(false) would cause
  // the table to render with newTokenId=null, making flashOnMount always false.
  useEffect(() => {
    if (!showCreate && newTokenId) {
      const t = setTimeout(() => setNewTokenId(null), 2500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [showCreate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = async () => {
    const lines = tokens.map((t) => {
      const rawLabel = t.clientId ? rpById[t.clientId] || t.clientId : t.name;
      const label = rawLabel.replace(/[\r\n]+/g, ' ');
      return `    "${t.token}", # ${label}`;
    });
    const hcl = `locals {\n  fxa_ci_bypass_tokens = [\n${lines.join('\n')}\n  ]\n}`;
    try {
      await navigator.clipboard.writeText(hcl);
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2500);
    } catch {
      window.alert(hcl);
    }
  };

  return (
    <>
      <h2 className="header-page">WAF Bypass Tokens</h2>

      <ul className="mb-3 list-disc pl-5 text-sm">
        <li>
          Per-consumer tokens for bypassing Fastly NGWAF challenge rules in CI
        </li>
        <li>
          Sent as the <code>fxa-ci</code> request header
        </li>
        <li>
          Stored in plaintext so values can be copied directly to Terraform
        </li>
      </ul>
      <p className="mb-4 p-3 rounded bg-yellow-50 text-sm">
        <b>Reminder:</b> Changes here do <b>not</b> automatically update the
        WAF. After generating or rotating a token, update{' '}
        <code>fxa_ci_bypass_tokens</code> in <code>{getWafTfPath()}</code>{' '}
        (webservices-infra) and run <code>terraform apply</code>. Use{' '}
        <b>Export for Terraform</b> below to copy the full <code>locals</code>{' '}
        block.
      </p>

      <hr />

      <Guard features={[AdminPanelFeature.ManageWafTokens]}>
        <div className="mt-4 mb-4 flex gap-2">
          <button className={btnClass} onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? 'Cancel' : 'Generate new token'}
          </button>
          {tokens.length > 0 && (
            <button className={btnClass} onClick={handleExport}>
              {exportCopied ? 'Copied!' : 'Export for Terraform'}
            </button>
          )}
        </div>

        {showCreate && (
          <CreateTokenForm
            rps={rps}
            usedClientIds={usedClientIds}
            onCreated={(token) => {
              handleCreated(token);
            }}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </Guard>

      {!showCreate && tokens.length > 0 && (
        <Guard features={[AdminPanelFeature.WafTokens]}>
          {!loading && !error && (
            <table className="w-full mt-4 text-sm">
              <thead>
                <tr className="text-left border-b-2 border-grey-200">
                  <th className="p-2">Name</th>
                  <th className="p-2">Token</th>
                  <th className="p-2">Linked RP</th>
                  <th className="p-2">Created</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <WafTokenRow
                    key={token.id}
                    token={token}
                    rpName={
                      token.clientId ? (rpById[token.clientId] ?? null) : null
                    }
                    onRotated={handleRotated}
                    onDeleted={handleDeleted}
                    flashOnMount={token.id === newTokenId}
                  />
                ))}
              </tbody>
            </table>
          )}
        </Guard>
      )}

      {loading && <p className="mt-4">Loading…</p>}
      {!loading && error && <p className="mt-4 text-red-600">{error}</p>}
      {!loading && !error && tokens.length === 0 && !showCreate && (
        <p className="mt-4">No WAF bypass tokens found.</p>
      )}
    </>
  );
};

export default PageWafTokens;
