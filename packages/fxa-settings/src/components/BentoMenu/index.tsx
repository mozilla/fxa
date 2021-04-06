/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useClickOutsideEffect } from 'fxa-react/lib/hooks';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useEscKeydownEffect } from '../../lib/hooks';

import firefoxIcon from 'fxa-react/images/ff-logo.svg';
import monitorIcon from './monitor.svg';
import pocketIcon from './pocket.svg';
import desktopIcon from './desktop.svg';
import mobileIcon from './mobile.svg';
import vpnIcon from './vpn-logo.svg';
import { ReactComponent as BentoIcon } from './bento.svg';
import { ReactComponent as CloseIcon } from 'fxa-react/images/close.svg';
import { Localized, useLocalization } from '@fluent/react';

export const BentoMenu = () => {
  const [isRevealed, setRevealed] = useState(false);
  const toggleRevealed = () => setRevealed(!isRevealed);
  const closeFn = () => setRevealed(false);
  const bentoMenuInsideRef = useClickOutsideEffect<HTMLDivElement>(setRevealed);
  useEscKeydownEffect(setRevealed);
  const dropDownId = 'drop-down-bento-menu';
  const iconClassNames = 'inline-block w-5 -mb-1 ltr:pr-1 rtl:pl-1';
  const { l10n } = useLocalization();

  return (
    <div className="relative self-center flex" ref={bentoMenuInsideRef}>
      <button
        onClick={toggleRevealed}
        data-testid="drop-down-bento-menu-toggle"
        title={l10n.getString('bento-menu-title')}
        aria-expanded={isRevealed}
        aria-controls={dropDownId}
        className="rounded p-1 w-7 mx-2 border-transparent hover:bg-grey-200 focus:outline-none transition-standard desktop:mx-8"
      >
        <BentoIcon className="cursor-pointer" />
      </button>

      {isRevealed && (
        <div
          id={dropDownId}
          data-testid={dropDownId}
          className={`w-full h-full fixed top-0 ltr:left-0 rtl:right-0 bg-white z-10
                      mobileLandscape:h-auto mobileLandscape:drop-down-menu mobileLandscape:top-10 mobileLandscape:ltr:-left-52 mobileLandscape:rtl:-right-52 desktop:ltr:-left-50 desktop:rtl:-right-50`}
        >
          <div className="flex flex-wrap">
            <div className="flex w-full pt-4 items-center flex-col tablet:w-auto tablet:relative">
              <button type="button" onClick={closeFn} title="Close">
                <CloseIcon
                  width="16"
                  height="16"
                  className="absolute top-6 right-6 mobileLandscape:hidden"
                />
              </button>
              <div className="mt-12 text-center p-8 pt-2 pb-2 mobileLandscape:mt-0">
                <img src={firefoxIcon} alt="" className="my-2 mx-auto w-10" />
                <Localized id="bento-menu-firefox-title">
                  <h2>Firefox is tech that fights for your online privacy.</h2>
                </Localized>
              </div>
              <div className="w-full text-xs mt-2">
                <ul className="list-none">
                  <li>
                    <LinkExternal
                      data-testid="monitor-link"
                      href="https://monitor.firefox.com"
                      className="block p-2 ltr:pl-6 rtl:pr-6 hover:bg-grey-100"
                    >
                      <div className={iconClassNames}>
                        <img src={monitorIcon} alt="" />
                      </div>
                      <Localized id="bento-menu-monitor">
                        Firefox Monitor
                      </Localized>
                    </LinkExternal>
                  </li>
                  <li>
                    <LinkExternal
                      data-testid="pocket-link"
                      href="https://app.adjust.com/hr2n0yz?engagement_type=fallback_click&fallback=https%3A%2F%2Fgetpocket.com%2Ffirefox_learnmore%3Fsrc%3Dff_bento&fallback_lp=https%3A%2F%2Fapps.apple.com%2Fapp%2Fpocket-save-read-grow%2Fid309601447"
                      className="block p-2 ltr:pl-6 rtl:pr-6 hover:bg-grey-100"
                    >
                      <div className={iconClassNames}>
                        <img src={pocketIcon} alt="" />
                      </div>
                      <Localized id="bento-menu-pocket">Pocket</Localized>
                    </LinkExternal>
                  </li>
                  <li>
                    <LinkExternal
                      data-testid="desktop-link"
                      href="https://www.mozilla.org/firefox/new/?utm_source=firefox-accounts&utm_medium=referral&utm_campaign=bento&utm_content=desktop"
                      className="block p-2 ltr:pl-6 rtl:pr-6 hover:bg-grey-100"
                    >
                      <div className={iconClassNames}>
                        <img src={desktopIcon} alt="" />
                      </div>
                      <Localized id="bento-menu-firefox-desktop">
                        Firefox Browser for Desktop
                      </Localized>
                    </LinkExternal>
                  </li>
                  <li>
                    <LinkExternal
                      data-testid="mobile-link"
                      href="http://mozilla.org/firefox/mobile?utm_source=firefox-accounts&utm_medium=referral&utm_campaign=bento&utm_content=desktop"
                      className="block p-2 ltr:pl-6 rtl:pr-6 hover:bg-grey-100"
                    >
                      <div className={iconClassNames}>
                        <img src={mobileIcon} alt="" />
                      </div>
                      <Localized id="bento-menu-firefox-mobile">
                        Firefox Browser for Mobile
                      </Localized>
                    </LinkExternal>
                  </li>
                  <li>
                    <LinkExternal
                      data-testid="vpn-link"
                      href="https://vpn.mozilla.org/?utm_source=accounts.firefox.com&utm_medium=referral&utm_campaign=fxa-settings&utm_content=bento-promo"
                      className="block p-2 ltr:pl-6 rtl:pr-6 hover:bg-grey-100"
                    >
                      <div className={iconClassNames}>
                        <img src={vpnIcon} alt="" />
                      </div>
                      <Localized id="bento-menu-vpn">Mozilla VPN</Localized>
                    </LinkExternal>
                  </li>
                </ul>
              </div>
              <Localized id="bento-menu-made-by-mozilla">
                <LinkExternal
                  data-testid="mozilla-link"
                  className="link-blue text-xs w-full text-center block m-2 p-2 hover:bg-grey-100"
                  href="https://www.mozilla.org/"
                >
                  Made by Mozilla
                </LinkExternal>
              </Localized>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BentoMenu;
