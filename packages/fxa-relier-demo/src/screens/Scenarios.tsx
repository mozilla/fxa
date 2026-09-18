/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SCENARIOS, Scenario } from '../scenarios';
import { CLIENTS } from '../config';

const GROUPS: { name: Scenario['group']; intro: string }[] = [
  {
    name: 'Sign in',
    intro:
      'How users arrive at FxA. Pick the entry point that matches your UI.',
  },
  {
    name: 'Data',
    intro:
      'What comes back. Compare the two client types, choose scopes, and see what each one unlocks.',
  },
  {
    name: 'Session',
    intro:
      'Reusing or strengthening an existing FxA session without a full sign-in.',
  },
];

export function Scenarios({ onPick }: { onPick: (s: Scenario) => void }) {
  return (
    <>
      <h1>Try Mozilla accounts sign-in</h1>
      <p className="lede">
        This is a sample relying party running in your browser. Each card below
        is a ready-made authorize request against the local FxA stack. Nothing
        is stored; you can run flows as often as you like.
      </p>

      <ol className="steps">
        <li>
          <strong>Pick a flow.</strong> Start with the starred card; it is what
          every Mozilla app uses.
        </li>
        <li>
          <strong>Adjust the request.</strong> Every parameter is editable and
          explained. The authorize URL updates live.
        </li>
        <li>
          <strong>Read the result.</strong> The callback, the tokens, and a
          table of which scope unlocked which claim.
        </li>
      </ol>

      <div className="legend">
        {CLIENTS.map((c) => (
          <p key={c.id}>
            <span className={`badge ${c.trusted ? 'ok' : 'warn'}`}>
              {c.trusted ? 'Mozilla app' : 'third-party'}
            </span>{' '}
            {c.description}
          </p>
        ))}
      </div>

      {GROUPS.map((group) => (
        <section key={group.name} className="group">
          <h2>{group.name}</h2>
          <p className="muted">{group.intro}</p>
          <div className="cards">
            {SCENARIOS.filter((s) => s.group === group.name).map((s) => {
              const client =
                CLIENTS.find((c) => c.id === s.request.client_id) ?? CLIENTS[0];
              return (
                <button
                  key={s.id}
                  className={`card ${s.recommended ? 'recommended' : ''}`}
                  onClick={() => onPick(s)}
                >
                  <span className="card-title">
                    {s.recommended && (
                      <span className="star" aria-label="Recommended first">
                        ★{' '}
                      </span>
                    )}
                    {s.title}
                  </span>
                  <span className="card-blurb">{s.blurb}</span>
                  <span className="card-meta">
                    <span className={`badge ${client.trusted ? 'ok' : 'warn'}`}>
                      {client.trusted ? 'Mozilla app' : 'third-party'}
                    </span>
                    <code>{s.request.scopes.join(' ')}</code>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
