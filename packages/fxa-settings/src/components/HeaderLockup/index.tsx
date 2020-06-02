/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LogoLockup from 'fxa-react/components/LogoLockup';
import Header from 'fxa-react/components/Header';
import LinkExternal from 'fxa-react/components/LinkExternal';
import Avatar from '../Avatar';
import { ReactComponent as Help } from './help.svg';
import { ReactComponent as Bento } from './bento.svg';
import { ReactComponent as Menu } from './menu.svg';

type HeaderLockupProps = {
  avatarUrl: string | null;
  primaryEmail: string;
};

export const HeaderLockup = ({
  avatarUrl,
  primaryEmail,
}: HeaderLockupProps) => {
  const right = (
    <HeaderContentRight
      {...{
        avatarUrl,
        primaryEmail,
      }}
    />
  );

  return <Header {...{ left: HeaderContentLeft, right }} />;
};

const HeaderContentLeft = (
  <>
    <button
      className="desktop:hidden mr-6 w-8 h-6 self-center"
      data-testid="header-menu"
    >
      <Menu />
    </button>
    <a href="#" title="Back to top" className="flex" data-testid="back-to-top">
      <LogoLockup>
        <>
          <span className="font-bold mr-2">Firefox</span> account
        </>
      </LogoLockup>
    </a>
  </>
);

const HeaderContentRight = ({ avatarUrl, primaryEmail }: HeaderLockupProps) => (
  <>
    <LinkExternal
      href="https://support.mozilla.org"
      title="Help"
      className="self-center"
      data-testid="header-sumo-link"
    >
      <Help
        aria-label="Help"
        title="Help"
        role="img"
        className="w-6"
        data-testid="header-help"
      />
    </LinkExternal>
    <Bento
      aria-label="Firefox Account Menu"
      role="img"
      className="w-6 mx-6 desktop:mx-8"
      data-testid="header-bento"
    />
    {console.log(`TODO display ${primaryEmail} in the header in FXA-1575`)}
    <Avatar {...{ avatarUrl }} className="w-10" />
  </>
);

export default HeaderLockup;
