/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useState } from 'react';
import { CLIENTS, redirectUri } from '../config';
import { previewUrl } from '../oauth';
import { AuthorizeRequest, Scenario } from '../scenarios';
import { SCOPE_CATALOGUE } from '../scopes';

type Param = {
  name: string;
  label: string;
  help: string;
  options?: { value: string; label: string }[];
};

const PARAMS: Param[] = [
  {
    name: 'action',
    label: 'Entry page',
    help: 'Which FxA page the user lands on first.',
    options: [
      { value: '', label: 'Let FxA decide' },
      { value: 'email', label: 'Email first (recommended)' },
      { value: 'signup', label: 'Sign-up form (needs Email)' },
      { value: 'signin', label: 'Sign-in form (needs Email)' },
      { value: 'force_auth', label: 'Force auth: sign-in locked to Email' },
    ],
  },
  {
    name: 'prompt',
    label: 'Session handling',
    help: 'Whether an existing FxA session in this browser may be reused.',
    options: [
      { value: '', label: 'Reuse session if present' },
      {
        value: 'none',
        label: 'none: never show UI, fail with login_required instead',
      },
      { value: 'login', label: 'login: always ask for the password' },
      {
        value: 'consent',
        label: 'consent: always show the permissions screen',
      },
    ],
  },
  {
    name: 'email',
    label: 'Email',
    help: 'email. Required by the sign-in and sign-up entry pages; prefilled on email first.',
  },
  {
    name: 'login_hint',
    label: 'Login hint',
    help: 'login_hint. Standard OIDC alternative to email. Accepted, rarely used by Mozilla apps.',
  },
  {
    name: 'acr_values',
    label: 'Required assurance level',
    help: 'acr_values. AAL2 means the user must have completed two-step authentication on this session.',
    options: [
      { value: '', label: 'Any' },
      { value: 'AAL1', label: 'AAL1: password or passkey' },
      { value: 'AAL2', label: 'AAL2: plus a second factor' },
    ],
  },
  {
    name: 'max_age',
    label: 'Max session age (seconds)',
    help: 'max_age. Re-authenticate if the last sign-in is older than this. 0 forces it.',
  },
  {
    name: 'entrypoint',
    label: 'Entry point label',
    help: 'entrypoint. Free-text label for your own metrics, e.g. the button the user clicked.',
  },
];

type Props = {
  scenario: Scenario;
  onBack: () => void;
  onGo: (req: AuthorizeRequest) => void;
};

export function Builder({ scenario, onBack, onGo }: Props) {
  const [req, setReq] = useState<AuthorizeRequest>(() =>
    structuredClone(scenario.request)
  );
  const [extra, setExtra] = useState('');
  const [url, setUrl] = useState('');

  const effective: AuthorizeRequest = {
    ...req,
    params: { ...req.params, ...parseExtra(extra) },
  };
  const client = CLIENTS.find((c) => c.id === req.client_id) ?? CLIENTS[0];
  const needsEmail =
    ['signin', 'signup', 'force_auth'].includes(req.params.action) &&
    !req.params.email;

  useEffect(() => {
    let live = true;
    previewUrl(effective).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [JSON.stringify(effective)]);

  const setParam = (k: string, v: string) =>
    setReq({ ...req, params: { ...req.params, [k]: v } });
  const toggleScope = (s: string) =>
    setReq({
      ...req,
      scopes: req.scopes.includes(s)
        ? req.scopes.filter((x) => x !== s)
        : [...req.scopes, s],
    });

  return (
    <>
      <button className="btn ghost back" onClick={onBack}>
        ‹ All flows
      </button>
      <h1>{scenario.title}</h1>
      <p className="lede">{scenario.blurb}</p>

      <div className="two-col">
        <section className="panel">
          <h2>1. Who is asking</h2>
          <div className="segmented" role="radiogroup" aria-label="Client">
            {CLIENTS.map((c) => (
              <label key={c.id} className={req.client_id === c.id ? 'on' : ''}>
                <input
                  type="radio"
                  name="client"
                  checked={req.client_id === c.id}
                  onChange={() => setReq({ ...req, client_id: c.id })}
                />
                {c.name}
              </label>
            ))}
          </div>
          <p className="muted small">{client.description}</p>
          <p className="muted small">
            client_id <code>{client.id}</code>, redirect_uri{' '}
            <code>{redirectUri()}</code>. Both are registered with FxA in
            advance; a request with any other redirect_uri is rejected.
          </p>

          <h2>2. What you want to know</h2>
          <p className="muted small">
            Scopes. Ask for the least you need; the user sees this list on the
            consent screen. <code>openid</code> plus one or two{' '}
            <code>profile:*</code> scopes covers most apps.
          </p>
          <ul className="checks">
            {SCOPE_CATALOGUE.map((s) => (
              <li key={s.scope}>
                <label>
                  <input
                    type="checkbox"
                    checked={req.scopes.includes(s.scope)}
                    onChange={() => toggleScope(s.scope)}
                  />
                  <span>
                    <strong>{s.label}</strong> <code>{s.scope}</code>
                    <em className="muted">
                      {' '}
                      ·{' '}
                      {s.claims.length
                        ? `returns ${s.claims.join(', ')}`
                        : s.note}
                    </em>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <label className="row">
            <input
              type="checkbox"
              checked={req.keys}
              onChange={() => setReq({ ...req, keys: !req.keys })}
            />
            <span>
              Also request scoped keys. A P-256 key pair is generated in this
              tab and its public half sent as <code>keys_jwk</code>. Needs a
              scoped-key scope above.
            </span>
          </label>
        </section>

        <section className="panel">
          <h2>3. How the user gets there</h2>
          {PARAMS.map((p) => (
            <label key={p.name} className="field">
              <span>
                <strong>{p.label}</strong> <em className="muted">{p.help}</em>
              </span>
              {p.options ? (
                <select
                  value={req.params[p.name] ?? ''}
                  onChange={(e) => setParam(p.name, e.target.value)}
                >
                  {p.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={req.params[p.name] ?? ''}
                  onChange={(e) => setParam(p.name, e.target.value)}
                  placeholder="leave blank to omit"
                />
              )}
            </label>
          ))}
          <label className="field">
            <span>
              <strong>Anything else</strong>{' '}
              <em className="muted">
                one <code>key=value</code> per line, sent as-is
              </em>
            </span>
            <textarea
              rows={2}
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
            />
          </label>
        </section>
      </div>

      <section className="panel url">
        <h2>4. Run it</h2>
        <p>{describe(effective, client.trusted)}</p>
        {needsEmail && (
          <p className="warn-text">
            This entry page needs the Email parameter; without it FxA falls back
            to email first. Fill it in above.
          </p>
        )}
        <details>
          <summary>Authorize URL your app would redirect to</summary>
          <pre>{url || 'resolving discovery document…'}</pre>
        </details>
        <div className="actions">
          <button
            className="btn primary"
            onClick={() => onGo(effective)}
            disabled={!url || needsEmail}
          >
            Run flow
          </button>
          <button
            className="btn"
            onClick={() => navigator.clipboard.writeText(url)}
            disabled={!url}
          >
            Copy URL
          </button>
        </div>
      </section>
    </>
  );
}

/** One plain-English sentence predicting what FxA will do with this request. */
function describe(req: AuthorizeRequest, trusted: boolean): string {
  const p = req.params;
  const parts: string[] = [];
  if (p.prompt === 'none')
    parts.push(
      'FxA will not show any UI: it returns a code if this browser already has a session, otherwise login_required'
    );
  else {
    const who = p.email || p.login_hint || 'the given email';
    const entry =
      {
        email: 'the email-first page',
        signin: `the password form for ${who} (or sign-up if that account does not exist)`,
        signup: `account creation for ${who} (or sign-in if that account exists)`,
        force_auth: `the sign-in form locked to ${who}`,
      }[p.action] ?? 'whichever page fits the user';
    parts.push(`FxA will open ${entry}`);
    if ((p.email || p.login_hint) && (p.action === 'email' || !p.action))
      parts.push(`with ${who} prefilled`);
    if (p.prompt === 'login' || p.max_age === '0')
      parts.push('ask for the password even if a session exists');
    if (p.acr_values === 'AAL2') parts.push('require a second factor');
    parts.push(
      trusted && p.prompt !== 'consent'
        ? 'skip the consent screen (Mozilla app)'
        : 'show a consent screen listing the scopes'
    );
  }
  parts.push(
    `then redirect back to /callback with a code that this page exchanges for tokens${req.keys ? ' and an encrypted scoped key' : ''}`
  );
  return parts.join(', ') + '.';
}

function parseExtra(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const i = line.indexOf('=');
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}
