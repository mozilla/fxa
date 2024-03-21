/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Header from 'fxa-react/components/Header';
import LogoLockup from 'fxa-react/components/LogoLockup';
import LinkAbout from '../../components/LinkAbout';
import Nav from '../../components/Nav';
import Footer from 'fxa-react/components/Footer';
import headerBackground from '../../images/ff-branding-bg.svg';

type AppLayoutProps = {
  children: any;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const logoLockup = (
    <LogoLockup className="text-white font-semibold text-shadow-md">
      Mozilla Accounts Admin Panel
    </LogoLockup>
  );

  return (
    <div data-testid="app" className="flex flex-col min-h-screen">
      <Header
        left={logoLockup}
        right={<LinkAbout />}
        className="bg-cover bg-no-repeat bg-gradient-to-r from-violet-700 via-yellow-600 to-red-500"
        styles={{ backgroundImage: `url(${headerBackground})` }}
      />

      <div className="flex flex-1 flex-col desktop:flex-row px-4 desktop:px-6 mx-auto max-w-screen-desktopXl pt-6 w-full">
        <Nav />

        <main className="flex-4">
          <div className="px-6 pb-6 pt-5 rounded-md bg-white border border-grey-100 text-grey-900">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AppLayout;
