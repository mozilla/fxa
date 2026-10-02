/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/app.css';
import { Builder } from './screens/Builder';
import { Result } from './screens/Result';
import { Scenarios } from './screens/Scenarios';
import { AuthorizeRequest, Scenario } from './scenarios';
import { discoveryFailed, endpoints, startFlow } from './oauth';

function App() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const isCallback = location.pathname === '/callback';

  const reset = () => {
    history.replaceState(null, '', '/');
    setScenario(null);
  };

  let screen;
  if (isCallback) {
    screen = (
      <Result search={new URLSearchParams(location.search)} onRestart={reset} />
    );
  } else if (scenario) {
    screen = (
      <Builder
        scenario={scenario}
        onBack={() => setScenario(null)}
        onGo={(req: AuthorizeRequest) => startFlow(req)}
      />
    );
  } else {
    screen = <Scenarios onPick={setScenario} />;
  }

  return (
    <>
      <header className="topbar">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            reset();
          }}
          className="brand"
        >
          <span className="brand-dot" /> Relier Demo
        </a>
        <span className="muted">Mozilla accounts OAuth, local stack</span>
        <ThemeToggle />
      </header>
      <main className="page">
        <StackBanner />
        {screen}
      </main>
    </>
  );
}

function StackBanner() {
  const [down, setDown] = useState(false);
  useEffect(() => {
    endpoints().then(() => setDown(discoveryFailed));
  }, []);
  if (!down) return null;
  return (
    <div className="notice critical" role="alert">
      <strong>Local FxA stack not reachable</strong>
      <span>
        Discovery at <code>localhost:3030</code> failed. Start it with{' '}
        <code>yarn start mza</code>, then reload.
      </span>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(
    matchMedia('(prefers-color-scheme: dark)').matches
  );
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  return (
    <button
      className="btn ghost"
      onClick={() => setDark(!dark)}
      aria-label="Toggle colour scheme"
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
