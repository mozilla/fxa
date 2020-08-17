/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef } from 'react';
import HeaderLockup from '../HeaderLockup';
import ContentSkip from '../ContentSkip';
import Nav from '../Nav';
import Footer from 'fxa-react/components/Footer';
import AlertBarContext from '../../lib/AlertBarContext';
import { Router } from '@reach/router';

type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const alertBarRootRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col min-h-screen" data-testid="app">
      <ContentSkip />
      <HeaderLockup />
      <div className="max-w-screen-desktopXl w-full mx-auto flex flex-1 tablet:px-20 desktop:px-12">
        <Router
          className="hidden desktop:block desktop:flex-2"
          primary={false}
          basepath="/beta/settings"
        >
          <Nav path="/" />
        </Router>
        <main id="main" data-testid="main" className="flex-7">
          <div
            id="alert-bar-root"
            data-testid="alert-bar-root"
            ref={alertBarRootRef}
          />
          <AlertBarContext.Provider value={{ alertBarRootRef }}>
            {children}
          </AlertBarContext.Provider>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
