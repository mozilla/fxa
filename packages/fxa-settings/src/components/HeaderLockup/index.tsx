/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import LogoLockup from 'fxa-react/components/LogoLockup';
import Header from 'fxa-react/components/Header';
import LinkExternal from 'fxa-react/components/LinkExternal';
import BentoMenu from '../BentoMenu';
import DropDownAvatarMenu from '../DropDownAvatarMenu';
import { ReactComponent as Help } from './help.svg';
import { ReactComponent as Menu } from './menu.svg';
import { ReactComponent as Close } from './close.svg';
import Nav from '../Nav';

export const HeaderLockup = () => {
  const [navRevealedState, setNavState] = useState(false);
  const left = (
    <>
      <button
        className="desktop:hidden ltr:mr-6 rtl:ml-6 w-8 h-6 self-center"
        data-testid="header-menu"
        aria-label={navRevealedState ? 'Close menu' : 'Site navigation menu'}
        aria-haspopup={true}
        aria-expanded={navRevealedState}
        onClick={() => setNavState(!navRevealedState)}
      >
        {navRevealedState ? <Close /> : <Menu />}
        {navRevealedState && <Nav />}
      </button>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a
        href="#"
        title="Back to top"
        className="flex"
        data-testid="back-to-top"
      >
        <LogoLockup>
          <>
            <span className="font-bold ltr:mr-2 rtl:ml-2">
              Firefox accounts
            </span>
            <a
              href="/settings/beta_optout"
              title="classic design link"
              className="cta-base cta-neutral transition-standard text-sm ltr:ml-4 rtl:mr-4 p-2"
            >
              Switch to classic design
            </a>
          </>
        </LogoLockup>
      </a>
    </>
  );
  const right = (
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
      <BentoMenu />
      <DropDownAvatarMenu />
    </>
  );

  return <Header {...{ left, right }} />;
};

export default HeaderLockup;
