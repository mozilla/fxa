/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import HeaderLockup from '../HeaderLockup';
import Nav from '../Nav';

type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <>
      <HeaderLockup />
      <div className="max-w-screen-desktopXl mx-auto flex flex-1 tablet:px-20 desktop:px-12">
        <Nav />
        <main className="flex-grow" data-testid="main">
          {children}
        </main>
      </div>

      {/*TO DO: pull `Footer` in from `fxa-admin-panel` into
      `fxa-react` and replace this*/}
      <footer></footer>
    </>
  );
};

export default AppLayout;
