import React, { ReactNode, useEffect, useContext, useState } from 'react';
import { AppContext } from '../../lib/AppContext';
import logo from '../../../../../libs/shared/assets/src/images/moz-m-logo.svg';
import { Localized } from '@fluent/react';
import classNames from 'classnames';

import './index.scss';

export type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <>
      <div
        id="stage"
        data-testid="stage"
        className="fade-in-forward"
        style={{ opacity: 1 }}
      >
        {children}
      </div>
    </>
  );
};

export const SignInLayoutContext = React.createContext({
  setHideLogo: (hideLogo: boolean) => {},
});

export const SignInLayout = ({ children }: { children: ReactNode }) => {
  const [hideLogo, setHideLogo] = useState(false);
  const mainContentClassNames = classNames('payments-card', {
    'hide-logo': hideLogo,
  });
  return (
    <AppLayout>
      <SignInLayoutContext.Provider value={{ setHideLogo }}>
        <div className="sign-in">
          <div className={mainContentClassNames}>{children}</div>
        </div>
      </SignInLayoutContext.Provider>
    </AppLayout>
  );
};

export const SettingsLayout = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    document.body.classList.add('settings');
    return () => document.body.classList.remove('settings');
  }, [children]);

  const { config } = useContext(AppContext);
  const homeURL = `${config.servers.content.url}/settings`;
  let breadcrumbs = (
    <nav aria-label="breadcrumbs" data-testid="breadcrumbs" className="w-full">
      <ol className="breadcrumbs">
        <li>
          <Localized id="settings-home">
            <a href={homeURL}>Account Home</a>
          </Localized>
        </li>
        <li>
          <Localized id="settings-subscriptions-title">
            <a href="/subscriptions" aria-current="location">
              Subscriptions
            </a>
          </Localized>
        </li>
      </ol>
    </nav>
  );

  return (
    <AppLayout>
      <div className="settings">
        <header id="fxa-settings-header">
          <Localized id="app-logo-alt-3">
            <img
              src={logo}
              data-testid="logo"
              className="h-10 w-10 me-4"
              alt="Mozilla m logo"
            />
          </Localized>
          <h1 className="text-xl">
            <Localized id="settings-project-header-title">
              <span>Mozilla account</span>
            </Localized>
          </h1>
        </header>
        {breadcrumbs}

        <div id="fxa-settings" className="mb-12">
          <div id="fxa-settings-content">{children}</div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AppLayout;
