/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import LogoLockup from 'fxa-react/components/LogoLockup';
import Header from 'fxa-react/components/Header';
import LinkExternal from 'fxa-react/components/LinkExternal';
import Avatar from '../Avatar';
import { ReactComponent as Help } from './help.svg';
import { ReactComponent as Bento } from './bento.svg';
import { ReactComponent as Menu } from './menu.svg';
import { useAccount } from '../../models';

const SHADOW_SCROLL_THRESHOLD = 5;

export const HeaderLockup = () => {
  const { avatarUrl } = useAccount();
  const [showShadow, setShowShadow] = useState<boolean>(false);

  useEffect(() => {
    function handleScroll() {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const shouldShow = scrollTop > SHADOW_SCROLL_THRESHOLD;
      if (shouldShow !== showShadow) {
        setShowShadow(shouldShow);
      }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showShadow]);

  const left = (
    <>
      <button
        className="desktop:hidden mr-6 w-8 h-6 self-center"
        data-testid="header-menu"
      >
        <Menu />
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
            <span className="font-bold mr-2">Firefox</span> account
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
      <Bento
        aria-label="Firefox Account Menu"
        role="img"
        className="w-6 mx-6 desktop:mx-8"
        data-testid="header-bento"
      />
      {/* TODO display primaryEmail.email in the header in FXA-1575 */}
      <Avatar {...{ avatarUrl }} className="w-10" />
    </>
  );

  return (
    <Header
      {...{ left, right }}
      className={classNames(
        'sticky top-0 bg-grey-10 transition-shadow ease-in duration-100',
        showShadow && 'shadow-md'
      )}
    />
  );
};

export default HeaderLockup;
