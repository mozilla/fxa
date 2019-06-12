import React, { ReactNode, useEffect } from 'react';

import './index.scss';

export type AppLayoutProps = {
  children: ReactNode,
};

export const AppLayout = ({
  children
}: AppLayoutProps) => (
  <>
    <div id="stage" className="fade-in-forward" style={{ opacity: 1 }}>
      {children}
    </div>
  </>
);

export type SignInLayout = {
  children: ReactNode,
};

export const SignInLayout = ({
  children
}: SignInLayout) => <>
  <AppLayout>
    <div className="sign-in">
      <div id="main-content" className="card payments-card">
        {children}
      </div>
    </div>
  </AppLayout>
  <div id="static-footer">
    <a id="about-mozilla" rel="author" target="_blank" href="https://www.mozilla.org/about/?utm_source=firefox-accounts&amp;utm_medium=Referral"></a>
  </div>
</>;

export type SettingsLayout = {
  children: ReactNode,
};

export const SettingsLayout = ({
  children
}: SettingsLayout) => {
  useEffect(() => {
    document.body.classList.add('settings');
    return () => document.body.classList.remove('settings');
  }, [ children ]);

  return (
    <AppLayout>
      <div className="settings">
        <div id="fxa-settings-header-wrapper">
          <header id="fxa-settings-header">
            <h1 id="fxa-manage-account"><span className="fxa-account-title">Firefox Accounts</span></h1>
            {/*
              * TODO: We can't actually sign out of FxA from here. Maybe back to settings?
              <button id="signout" className="settings-button secondary-button">Sign out</button>
              */}
          </header>
        </div>

        <div id="fxa-settings">
          <div id="fxa-settings-content" className="card">
            {children}
          </div>
        </div>

        <footer id="legal-footer">
          <a className="terms" href="/legal/terms">Terms of Service</a>
          <a className="privacy" href="/legal/privacy">Privacy Notice</a>
        </footer>
      </div>
    </AppLayout>
  );
};

export default AppLayout;