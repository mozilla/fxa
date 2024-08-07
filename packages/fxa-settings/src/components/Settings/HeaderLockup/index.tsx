/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized, useLocalization } from '@fluent/react';
import React, { useState } from 'react';
import LogoLockup from 'fxa-react/components/LogoLockup';
import Header from 'fxa-react/components/Header';
import LinkExternal from 'fxa-react/components/LinkExternal';
import BentoMenu from '../BentoMenu';
import DropDownAvatarMenu from '../DropDownAvatarMenu';
import { ReactComponent as Help } from './help.svg';
import { ReactComponent as Menu } from './menu.svg';
import { ReactComponent as Close } from './close.svg';
import { SettingsIntegration } from '../interfaces';
import Sidebar from '../Sidebar';
import GleanMetrics from '../../../lib/glean';

export const HeaderLockup = ({
  integration,
}: {
  integration: SettingsIntegration;
}) => {
  const [sidebarRevealedState, setNavState] = useState(false);
  const { l10n } = useLocalization();
  const localizedHelpText = l10n.getString('header-help', null, 'Help');
  const localizedMenuText = sidebarRevealedState
    ? l10n.getString('header-menu-open', null, 'Close menu')
    : l10n.getString('header-menu-closed', null, 'Site navigation menu');

  const handleHelpLinkClick = () => {
    GleanMetrics.accountPref.help();
  };

  const left = (
    <>
      <button
        className="desktop:hidden me-6 p-2 self-center -m-2 z-[1] rounded hover:bg-grey-100"
        data-testid="header-menu"
        aria-label={localizedMenuText}
        title={localizedMenuText}
        aria-haspopup={true}
        aria-expanded={sidebarRevealedState}
        onClick={() => setNavState(!sidebarRevealedState)}
      >
        {sidebarRevealedState ? (
          <Close className="text-violet-900 w-8" />
        ) : (
          <Menu className="text-violet-900 w-8" />
        )}
        {sidebarRevealedState && <Sidebar />}
      </button>
      <Localized id="header-back-to-top-link" attrs={{ title: true }}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          href="#"
          title="Back to top"
          className="flex"
          data-testid="back-to-top"
        >
          <LogoLockup>
            <>
              <Localized id="header-title-2">
                <span className="font-bold ltr:mr-2 rtl:ml-2">
                  Mozilla account
                </span>
              </Localized>
            </>
          </LogoLockup>
        </a>
      </Localized>
    </>
  );
  const right = (
    <>
      <LinkExternal
        href="https://support.mozilla.org/products/mozilla-account"
        title={localizedHelpText}
        className="inline-block relative p-2 -m-2 z-[1] rounded hover:bg-grey-100"
        onClick={handleHelpLinkClick}
      >
        <Help
          aria-label={localizedHelpText}
          title={localizedHelpText}
          role="img"
          className="w-5 text-violet-900"
        />
      </LinkExternal>
      <BentoMenu />
      <DropDownAvatarMenu {...{ integration }} />
    </>
  );

  return <Header {...{ left, right }} />;
};

export default HeaderLockup;
