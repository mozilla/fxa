/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactNode, useEffect, useState } from 'react';
import { CLIENTS, redirectUri } from '../config';
import { completeFlow, FlowResult, signOut } from '../oauth';
import { scopeMatrix } from '../scopes';

type Props = { search: URLSearchParams; onRestart: () => void };

const ERROR_HELP: Record<string, string> = {
  login_required:
    'You asked for prompt=none but this browser has no FxA session. Fall back to a normal sign-in.',
  interaction_required:
    'FxA needs to show the user something (consent, a second factor). Retry without prompt=none.',
  account_selection_required:
    'The session belongs to a different account than login_hint. Retry without prompt=none.',
  access_denied: 'The user declined the consent screen.',
  invalid_request:
    'A parameter FxA did not accept. Check redirect_uri, scope, and client_id against your registration.',
  invalid_scope:
    'A requested scope is not allowed for this client. Third-party clients get profile:* scopes only.',
};

const TOKEN_HELP: Record<string, string> = {
  access_token:
    'Bearer token for the profile API. Short-lived; store server-side only.',
  refresh_token:
    'Exchange for new access tokens without user interaction. Returned because access_type=offline. Store encrypted.',
  id_token:
    'Signed JWT with the user id (sub). Verify the signature and aud before trusting it.',
  keys_jwe:
    'Scoped keys, encrypted to the keys_jwk you sent. Only your app can decrypt.',
  scope:
    'What FxA actually granted. It can be narrower than what you asked for.',
  expires_in: 'Access-token lifetime in seconds.',
  auth_at: 'When the user last authenticated, as a Unix timestamp.',
  token_type: 'Always bearer.',
};

export function Result({ search, onRestart }: Props) {
  const [result, setResult] = useState<FlowResult | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    completeFlow(search).then(setResult, (e) => setFailure(String(e)));
  }, []);

  if (failure)
    return (
      <Notice kind="critical" title="Flow failed">
        {failure}
      </Notice>
    );
  if (!result) return <p className="lede">Exchanging code for tokens…</p>;

  const granted = result.token?.scope?.split(' ') ?? result.request.scopes;
  const matrix = scopeMatrix(granted, result.userinfo ?? null);
  const client = CLIENTS.find((c) => c.id === result.request.client_id);
  const errorCode = result.callback.error;

  return (
    <>
      <div className="actions">
        <button className="btn primary" onClick={onRestart}>
          Run another flow
        </button>
        {result.token && (
          <button
            className="btn"
            onClick={() =>
              result.token && signOut(result.token).then(onRestart)
            }
          >
            Sign out (revoke tokens)
          </button>
        )}
      </div>

      <Timeline result={result} />

      {result.error ? (
        <Notice kind="critical" title="Authorization did not complete">
          <code>{result.error}</code>
          {errorCode && ERROR_HELP[errorCode] && (
            <span className="block">{ERROR_HELP[errorCode]}</span>
          )}
        </Notice>
      ) : (
        <Notice kind="success" title="Signed in">
          {result.userinfo?.email
            ? String(result.userinfo.email)
            : 'no email claim granted'}
          {result.token && (
            <>
              {' '}
              · granted <code>{result.token.scope}</code>
            </>
          )}
        </Notice>
      )}

      <section className="panel">
        <h2>Callback</h2>
        <p className="muted">
          The query string FxA appended to <code>{redirectUri()}</code>. Your
          server must check that <code>state</code> matches what it sent, then
          exchange <code>code</code> within a few minutes.
        </p>
        <Json value={result.callback} />
      </section>

      {result.userinfo !== undefined && (
        <section className="panel">
          <h2>What the scopes unlocked</h2>
          <p className="muted">
            Green chips came back from the profile endpoint. Struck-through
            chips did not: either the scope was not granted, or the account has
            no value for it (a fresh account has no display name or locale, for
            instance). Greyed rows are scopes you did not ask for.
            {client &&
              !client.trusted &&
              ' As a third-party client you only ever receive exactly what you requested.'}
            {client &&
              client.trusted &&
              ' As a Mozilla app, the profile scope expands to every profile:* scope.'}
          </p>
          <table className="matrix">
            <thead>
              <tr>
                <th>Scope</th>
                <th>Requested</th>
                <th>Claims</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.scope} className={row.requested ? '' : 'dim'}>
                  <td>
                    <code>{row.scope}</code>
                  </td>
                  <td>{row.requested ? 'yes' : 'no'}</td>
                  <td>
                    {row.claims.map((c) => (
                      <span
                        key={c.name}
                        className={`chip ${c.present ? 'ok' : 'off'}`}
                        title={
                          c.present
                            ? 'present in userinfo'
                            : 'absent from userinfo: not granted, or not set on the account'
                        }
                      >
                        {c.name}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>
            Profile response{' '}
            <span className="muted">
              GET userinfo, HTTP {result.userinfoStatus}
            </span>
          </h3>
          <Json value={result.userinfo} />
        </section>
      )}

      {result.token && (
        <section className="panel">
          <h2>Tokens</h2>
          <p className="muted">
            Response from the token endpoint. Secrets are truncated here; hover
            a field name for what it is for.
          </p>
          <dl className="fields">
            {Object.entries(mask(result.token) as Record<string, unknown>).map(
              ([k, v]) => (
                <div key={k}>
                  <dt title={TOKEN_HELP[k]}>
                    <code>{k}</code>
                  </dt>
                  <dd>
                    {String(v)}
                    <span className="muted small block">{TOKEN_HELP[k]}</span>
                  </dd>
                </div>
              )
            )}
          </dl>
          {result.idToken && (
            <>
              <h3>
                id_token decoded{' '}
                <span
                  className={`badge ${result.idToken.verified ? 'verified' : 'unverified'}`}
                >
                  {result.idToken.verified
                    ? 'signature verified against JWKS'
                    : 'signature NOT verified'}
                </span>
              </h3>
              {result.idToken.problem && (
                <p className="muted">{result.idToken.problem}</p>
              )}
              <Json
                value={{
                  header: result.idToken.header,
                  payload: result.idToken.payload,
                }}
              />
            </>
          )}
          <h3>
            Introspection{' '}
            <span className="muted">POST introspect with the access token</span>
          </h3>
          <p className="muted">
            What FxA knows about this token: whether it is active, the assurance
            level (<code>acr</code>), and how the user authenticated (
            <code>amr</code>). Useful when you enforce AAL2 server-side.
          </p>
          <Json value={result.introspection} />
        </section>
      )}

      {result.scopedKeys && (
        <section className="panel">
          <h2>Scoped keys</h2>
          <p className="muted">
            Decrypted in this tab with the private key generated before the
            redirect. FxA never sees the key material. Use the key to encrypt
            user data so it stays unreadable to the server.
          </p>
          <label className="row">
            <input
              type="checkbox"
              checked={showKeys}
              onChange={() => setShowKeys(!showKeys)}
            />{' '}
            <span>Reveal key bytes</span>
          </label>
          <Json
            value={
              showKeys ? result.scopedKeys : mask(result.scopedKeys, ['k'])
            }
          />
        </section>
      )}

      {!result.error && (
        <section className="panel">
          <h2>Use this in your app</h2>
          <p className="muted">
            To register your own client, FxA needs the values below; an FxA
            engineer adds them in the admin panel. Your redirect URI replaces
            the demo one. Public clients with PKCE, like this page, need no
            client secret.
          </p>
          <Json
            value={{
              name: 'Your app name',
              redirectUri: 'https://your.app/oauth/callback',
              publicClient: true,
              trusted: client?.trusted ?? false,
              scopes: result.request.scopes.join(' '),
              authorizeParams: result.request.params,
            }}
          />
          <div className="actions">
            <button
              className="btn"
              onClick={() =>
                navigator.clipboard.writeText(
                  JSON.stringify(
                    {
                      redirectUri: 'https://your.app/oauth/callback',
                      publicClient: true,
                      trusted: client?.trusted ?? false,
                      scopes: result.request.scopes.join(' '),
                      authorizeParams: result.request.params,
                    },
                    null,
                    2
                  )
                )
              }
            >
              Copy registration request
            </button>
          </div>
        </section>
      )}
    </>
  );
}

function Timeline({ result }: { result: FlowResult }) {
  const steps: [string, boolean | undefined][] = [
    ['Redirect to FxA', true],
    ['Callback with code', !result.callback.error && !!result.callback.code],
    ['Code → tokens (PKCE)', !!result.token],
    ['Profile fetched', result.userinfoStatus === 200],
    ['id_token verified', result.idToken?.verified],
  ];
  return (
    <ol className="timeline" aria-label="Flow steps">
      {steps.map(([label, ok]) => (
        <li key={label} className={ok ? 'done' : ok === false ? 'failed' : ''}>
          {label}
        </li>
      ))}
    </ol>
  );
}

function Notice({
  kind,
  title,
  children,
}: {
  kind: 'success' | 'critical';
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={`notice ${kind}`} role="status">
      <strong>{title}</strong>
      <span>{children}</span>
    </div>
  );
}

function Json({ value }: { value: unknown }) {
  return <pre className="json">{JSON.stringify(value, null, 2)}</pre>;
}

function mask(
  value: unknown,
  keys = ['access_token', 'refresh_token', 'id_token', 'keys_jwe']
): unknown {
  if (Array.isArray(value)) return value.map((v) => mask(v, keys));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        keys.includes(k) && typeof v === 'string'
          ? `${v.slice(0, 12)}… (${v.length} chars)`
          : mask(v, keys),
      ])
    );
  }
  return value;
}
