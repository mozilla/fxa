/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import HeaderLockup from '../HeaderLockup';
import ContentSkip from '../ContentSkip';
import Nav from '../Nav';
import Footer from 'fxa-react/components/Footer';

type AppLayoutProps = {
  avatarUrl: string | null;
  primaryEmail: string;
  hasSubscription: boolean;
  children: React.ReactNode;
};

export const AppLayout = ({
  avatarUrl,
  primaryEmail,
  hasSubscription,
  children,
}: AppLayoutProps) => (
  <div className="flex flex-col min-h-screen" data-testid="app">
    <ContentSkip />
    <HeaderLockup
      {...{
        avatarUrl,
        primaryEmail,
      }}
    />
    <div className="max-w-screen-desktopXl mx-auto flex flex-1 tablet:px-20 desktop:px-12">
      <div className="hidden desktop:block desktop:flex-2">
        <Nav {...{ hasSubscription, primaryEmail }} />
      </div>
      <main id="main" data-testid="main" className="desktop:flex-7">
        {children}
      </main>
    </div>
    <Footer />
  </div>
);

export default AppLayout;
