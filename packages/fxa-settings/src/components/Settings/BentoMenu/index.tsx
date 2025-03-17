/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { useState } from 'react';
import { useClickOutsideEffect } from 'fxa-react/lib/hooks';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useEscKeydownEffect } from '../../../lib/hooks';

import monitorIcon from './monitor.svg';
import pocketIcon from '@fxa/shared/assets/images/pocket.svg';
import desktopIcon from './desktop.svg';
import mobileIcon from './mobile.svg';
import relayIcon from './relay.svg';
import vpnIcon from './vpn-logo.svg';
import { ReactComponent as BentoIcon } from './bento.svg';
import { ReactComponent as CloseIcon } from '@fxa/shared/assets/images/close.svg';
import { FtlMsg } from 'fxa-react/lib/utils';
import {
  useConfig,
  useExperiments,
  useFtlMsgResolver,
} from '../../../models/hooks';
import { LINK } from '../../../constants';
import { constructHrefWithUtm } from '../../../lib/utilities';
import GleanMetrics from '../../../lib/glean';

export const BentoMenu = () => {
  const [isRevealed, setRevealed] = useState(false);
  const toggleRevealed = () => setRevealed(!isRevealed);
  const closeFn = () => setRevealed(false);
  const bentoMenuInsideRef = useClickOutsideEffect<HTMLDivElement>(setRevealed);
  useEscKeydownEffect(setRevealed);
  const dropDownId = 'drop-down-bento-menu';
  const iconClassNames = 'inline-block w-5 -mb-1 me-1';

  const { env } = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();
  const experiments = useExperiments();
  const nimbusUserId = experiments?.nimbusUserId;
  const exampleFeature = experiments?.features?.['example-feature'];
  const emojiExperiment = exampleFeature?.['emoji'] || '';

  useEffect(() => {
    if (isRevealed) {
      GleanMetrics.accountPref.bentoView({
        event: { nimbusUserId },
      });
    }
  }, [isRevealed, nimbusUserId]);

  const bentoMenuTitle = ftlMsgResolver.getMsg(
    'bento-menu-title-3',
    'Mozilla products'
  );

  const madeByMozilla =
    ftlMsgResolver.getMsg('bento-menu-made-by-mozilla', 'Made by Mozilla') +
    ` ${emojiExperiment}`;

  const desktopLink = constructHrefWithUtm(
    LINK.FX_DESKTOP,
    'mozilla-websites',
    'moz-account',
    'bento',
    'fx-desktop',
    'permanent'
  );

  const mobileLink = constructHrefWithUtm(
    LINK.FX_MOBILE,
    'mozilla-websites',
    'moz-account',
    'bento',
    'fx-mobile',
    'permanent'
  );

  const monitorLink = constructHrefWithUtm(
    env === 'stage' ? LINK.MONITOR_STAGE : LINK.MONITOR,
    'mozilla-websites',
    'moz-account',
    'bento',
    'monitor',
    'permanent'
  );

  const relayLink = constructHrefWithUtm(
    LINK.RELAY,
    'mozilla-websites',
    'moz-account',
    'bento',
    'relay',
    'permanent'
  );

  const vpnLink = constructHrefWithUtm(
    LINK.VPN,
    'mozilla-websites',
    'moz-account',
    'bento',
    'vpn',
    'permanent'
  );

  return (
    <div className="relative self-center flex mx-2" ref={bentoMenuInsideRef}>
      <button
        onClick={toggleRevealed}
        data-testid="drop-down-bento-menu-toggle"
        title={bentoMenuTitle}
        aria-label={bentoMenuTitle}
        aria-expanded={!!isRevealed}
        aria-haspopup="menu"
        className="rounded p-2 mx-2 border-transparent hover:bg-grey-100 transition-standard desktop:mx-8"
      >
        <BentoIcon className="w-5 text-violet-900" />
      </button>

      {isRevealed && (
        <div
          id={dropDownId}
          data-testid={dropDownId}
          className={`w-full h-full fixed top-0 start-0 bg-white z-10
                      mobileLandscape:h-auto mobileLandscape:drop-down-menu mobileLandscape:top-10 mobileLandscape:-start-52 desktop:-start-50`}
          role="menu"
        >
          <div className="flex flex-wrap">
            <div className="flex w-full py-4 gap-2 items-center flex-col tablet:w-auto tablet:relative">
              <button onClick={closeFn} title="Close">
                <CloseIcon
                  width="16"
                  height="16"
                  className="absolute top-5 end-5 mobileLandscape:hidden fill-current"
                />
              </button>
              <div className="mt-12 px-8 text-center mobileLandscape:mt-0">
                <FtlMsg id="bento-menu-tagline">
                  <h2>More products from Mozilla that protect your privacy</h2>
                </FtlMsg>
              </div>
              <div className="w-full text-xs">
                <ul className="list-none">
                  <li>
                    <LinkExternal
                      data-testid="desktop-link"
                      href={desktopLink}
                      className="block p-2 ps-6 hover:bg-grey-100"
                      onClick={() =>
                        GleanMetrics.accountPref.bentoFirefoxDesktop()
                      }
                    >
                      <div className={iconClassNames}>
                        <img src={desktopIcon} alt="" />
                      </div>
                      <FtlMsg id="bento-menu-firefox-desktop">
                        Firefox Browser for Desktop
                      </FtlMsg>
                    </LinkExternal>
                  </li>
                  <li>
                    <LinkExternal
                      data-testid="mobile-link"
                      href={mobileLink}
                      className="block p-2 ps-6 hover:bg-grey-100"
                      onClick={() =>
                        GleanMetrics.accountPref.bentoFirefoxMobile()
                      }
                    >
                      <div className={iconClassNames}>
                        <img src={mobileIcon} alt="" />
                      </div>
                      <FtlMsg id="bento-menu-firefox-mobile">
                        Firefox Browser for Mobile
                      </FtlMsg>
                    </LinkExternal>
                  </li>
                  <li>
                    <LinkExternal
                      data-testid="monitor-link"
                      href={monitorLink}
                      className="block p-2 ps-6 hover:bg-grey-100"
                      onClick={() => GleanMetrics.accountPref.bentoMonitor()}
                    >
                      <div className={iconClassNames}>
                        <img src={monitorIcon} alt="" />
                      </div>
                      <FtlMsg id="bento-menu-monitor-3">Mozilla Monitor</FtlMsg>
                    </LinkExternal>
                  </li>
                  <li>
                    <LinkExternal
                      data-testid="relay-link"
                      href={relayLink}
                      className="block p-2 ps-6 hover:bg-grey-100"
                      onClick={() => GleanMetrics.accountPref.bentoRelay()}
                    >
                      <div className={iconClassNames}>
                        <img src={relayIcon} alt="" />
                      </div>
                      <FtlMsg id="bento-menu-firefox-relay-2">
                        Firefox Relay
                      </FtlMsg>
                    </LinkExternal>
                  </li>
                  <li>
                    <LinkExternal
                      data-testid="vpn-link"
                      href={vpnLink}
                      className="block p-2 ps-6 hover:bg-grey-100"
                      onClick={() => GleanMetrics.accountPref.bentoVpn()}
                    >
                      <div className={iconClassNames}>
                        <img src={vpnIcon} alt="" />
                      </div>
                      <FtlMsg id="bento-menu-vpn-2">Mozilla VPN</FtlMsg>
                    </LinkExternal>
                  </li>
                  <li>
                    <LinkExternal
                      data-testid="pocket-link"
                      href="https://app.adjust.com/hr2n0yz?redirect_macos=https%3A%2F%2Fgetpocket.com%2Fpocket-and-firefox&redirect_windows=https%3A%2F%2Fgetpocket.com%2Fpocket-and-firefox&engagement_type=fallback_click&fallback=https%3A%2F%2Fgetpocket.com%2Ffirefox_learnmore%3Fsrc%3Dff_bento&fallback_lp=https%3A%2F%2Fapps.apple.com%2Fapp%2Fpocket-save-read-grow%2Fid309601447"
                      className="block p-2 ps-6 hover:bg-grey-100"
                      onClick={() => GleanMetrics.accountPref.bentoPocket()}
                    >
                      <div className={iconClassNames}>
                        <img src={pocketIcon} alt="" />
                      </div>
                      <FtlMsg id="bento-menu-pocket-2">Pocket</FtlMsg>
                    </LinkExternal>
                  </li>
                </ul>
              </div>
              <LinkExternal
                data-testid="mozilla-link"
                className="link-blue text-xs underline-offset-4 w-full text-center p-2 block hover:bg-grey-100"
                href="https://www.mozilla.org/"
              >
                {madeByMozilla}
              </LinkExternal>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BentoMenu;
