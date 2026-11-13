/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import LogoLockup from 'fxa-react/components/LogoLockup';
import Header from 'fxa-react/components/Header';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models';
import BentoMenu from '../BentoMenu';
import DropDownAvatarMenu from '../DropDownAvatarMenu';
import { ReactComponent as HelpLegacy } from './help.svg';
import { ReactComponent as MenuLegacy } from './menu.svg';
import { ReactComponent as CloseLegacy } from './close.svg';
import Sidebar from '../Sidebar';
import GleanMetrics from '../../../lib/glean';
import { Link, useLocation } from 'react-router';
import { ReactComponent as HelpNova } from '../../Icons/nova/help.min.svg';
import { ReactComponent as AppMenu } from '../../Icons/nova/app-menu.min.svg';
import { ReactComponent as CloseNova } from '../../Icons/nova/close.min.svg';
import { withNova } from '../../../lib/nova';

const Help = withNova(HelpLegacy, HelpNova);
const Menu = withNova(MenuLegacy, AppMenu);
const Close = withNova(CloseLegacy, CloseNova);

export const HeaderLockup = () => {
  const [sidebarRevealedState, setNavState] = useState(false);
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();
  const localizedHelpText = ftlMsgResolver.getMsg('header-help', 'Help');
  const localizedMenuText = sidebarRevealedState
    ? ftlMsgResolver.getMsg('header-menu-open', 'Close menu')
    : ftlMsgResolver.getMsg('header-menu-closed', 'Site navigation menu');

  const isAtSettings =
    location?.pathname === '/settings' || location?.pathname === '/settings/';
  const logoTitleId = isAtSettings
    ? 'header-back-to-top-link'
    : 'header-back-to-settings-link';

  const handleHelpLinkClick = () => {
    GleanMetrics.accountPref.help();
  };

  const left = (
    <>
      <button
        className="desktop:hidden me-6 p-2 self-center -m-2 z-[1] rounded hover:bg-grey-100 dark:hover:bg-grey-700 nova:hover:bg-hover-tint nova:transition-colors focus-visible-default"
        data-testid="header-menu"
        aria-label={localizedMenuText}
        title={localizedMenuText}
        aria-haspopup={true}
        aria-expanded={sidebarRevealedState}
        onClick={() => setNavState(!sidebarRevealedState)}
      >
        {sidebarRevealedState ? (
          <Close className="text-violet-900 dark:text-grey-100 nova:text-default w-8 nova:h-8" />
        ) : (
          <Menu className="text-violet-900 dark:text-grey-100 nova:text-default w-8 nova:h-8" />
        )}
        {sidebarRevealedState && <Sidebar />}
      </button>
      <FtlMsg id={logoTitleId} attrs={{ title: true }}>
        <Link
          to="/settings"
          title={
            isAtSettings ? 'Back to top' : 'Back to Mozilla account settings'
          }
          // use gap instead of margin to make the focus outline look right
          // when the header title is invisible
          className="flex gap-4 rounded-sm focus-visible:outline focus-visible:outline-focus focus:outline-2 outline-offset-4"
          data-testid="back-to-settings"
        >
          <LogoLockup>
            <>
              <FtlMsg id="header-title-2">
                <span className="font-heading">Mozilla account</span>
              </FtlMsg>
            </>
          </LogoLockup>
        </Link>
      </FtlMsg>
    </>
  );
  const right = (
    <>
      <LinkExternal
        href="https://support.mozilla.org/products/mozilla-account"
        title={localizedHelpText}
        className="inline-block relative p-2 -m-2 z-[1] rounded hover:bg-grey-100 dark:hover:bg-grey-700 nova:hover:bg-hover-tint nova:transition-colors focus-visible-default"
        onClick={handleHelpLinkClick}
      >
        <Help
          aria-label={localizedHelpText}
          title={localizedHelpText}
          role="img"
          className="w-5 nova:h-5 text-violet-900 dark:text-grey-100 nova:text-default"
        />
      </LinkExternal>
      <BentoMenu />
      <DropDownAvatarMenu />
    </>
  );

  return <Header {...{ left, right }} />;
};

export default HeaderLockup;
