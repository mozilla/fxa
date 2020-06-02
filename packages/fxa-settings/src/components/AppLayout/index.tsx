/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import HeaderLockup from '../HeaderLockup';
import Nav from '../Nav';

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
  <>
    <HeaderLockup
      {...{
        avatarUrl,
        primaryEmail,
      }}
    />
    <div className="max-w-screen-desktopXl mx-auto flex flex-1 tablet:px-20 desktop:px-12">
      <Nav {...{ hasSubscription }} />
      <main className="flex-grow" data-testid="main">
        {children}
      </main>
    </div>

    {/*TODO: pull `Footer` in from `fxa-admin-panel` into
    `fxa-react` and replace this*/}
    <footer></footer>
  </>
);

export default AppLayout;
