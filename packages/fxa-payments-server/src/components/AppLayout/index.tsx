import React, { ReactNode, useEffect, useContext, useState } from 'react';
import { AppContext } from '../../lib/AppContext';
import classNames from 'classnames';

import './index.scss';

export type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { config } = useContext(AppContext);

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
      <footer data-testid="footer">
        <div id="about-moz-footer" data-testid="about-moz-footer">
          <a
            id="about-mozilla"
            rel="author noopener noreferrer"
            target="_blank"
            href="https://www.mozilla.org/about/?utm_source=firefox-accounts&amp;utm_medium=Referral"
          >
            &nbsp;
          </a>
        </div>
        <div id="legal-footer" data-testid="legal-footer">
          <a
            className="terms"
            rel="noopener noreferrer"
            target="_blank"
            href={config.legalDocLinks.termsOfService}
          >
            Terms of Service
          </a>
          <a
            className="privacy"
            rel="noopener noreferrer"
            target="_blank"
            href={config.legalDocLinks.privacyNotice}
          >
            Privacy Notice
          </a>
        </div>
      </footer>
    </>
  );
};

export type SignInLayout = {
  children: ReactNode;
};

export const SignInLayoutContext = React.createContext({
  setHideLogo: (hideLogo: boolean) => {},
});

export const SignInLayout = ({ children }: SignInLayout) => {
  const [hideLogo, setHideLogo] = useState(false);
  const mainContentClassNames = classNames('card', 'payments-card', {
    'hide-logo': hideLogo,
  });
  return (
    <AppLayout>
      <SignInLayoutContext.Provider value={{ setHideLogo }}>
        <div className="sign-in">
          <div id="main-content" className={mainContentClassNames}>
            {children}
          </div>
        </div>
      </SignInLayoutContext.Provider>
    </AppLayout>
  );
};

export type SettingsLayout = {
  children: ReactNode;
};

export const SettingsLayout = ({ children }: SettingsLayout) => {
  useEffect(() => {
    document.body.classList.add('settings');
    return () => document.body.classList.remove('settings');
  }, [children]);

  const { config } = useContext(AppContext);
  const homeURL = `${config.servers.content.url}/settings`;
  let breadcrumbs = (
    <ol className="breadcrumbs" data-testid="breadcrumbs">
      <li>
        <a href={homeURL}>Account Home</a>
      </li>
      <li>
        <a href="/subscriptions">Subscriptions</a>
      </li>
    </ol>
  );

  return (
    <AppLayout>
      <div className="settings">
        <div id="fxa-settings-header-wrapper">
          <header id="fxa-settings-header">
            <h1 id="fxa-manage-account">
              <span className="fxa-account-title">Firefox Accounts</span>
            </h1>
            {/*
              * TODO: We can't actually sign out of FxA from here. Maybe back to settings?
              <button id="signout" className="settings-button secondary-button">Sign out</button>
              */}
          </header>
          {breadcrumbs}
        </div>

        <div id="fxa-settings">
          <div id="fxa-settings-content" className="card">
            {children}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AppLayout;
