/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Image from 'next/image';
import helpIcon from '@fxa/shared/assets/images/help.svg';
import mozillaIcon from '@fxa/shared/assets/images/moz-logo-bw-rgb.svg';
import bentoIcon from '@fxa/shared/assets/images/bento.svg';
import defaultAvatarIcon from '@fxa/shared/assets/images/avatar-default.svg';
import closeIcon from '@fxa/shared/assets/images/close.svg';
import desktopIcon from '@fxa/shared/assets/images/desktop.svg';
import mobileIcon from '@fxa/shared/assets/images/mobile.svg';
import monitorIcon from '@fxa/shared/assets/images/monitor.svg';
import relayIcon from '@fxa/shared/assets/images/relay.svg';
import vpnIcon from '@fxa/shared/assets/images/vpn-logo.svg';
import pocketIcon from '@fxa/shared/assets/images/pocket.svg';
import signOutIcon from '@fxa/shared/assets/images/sign-out.svg';
import { LinkExternal } from '@fxa/shared/react';
import { Localized } from '@fluent/react';
import { useState } from 'react';
import { useClickOutsideEffect } from '../../hooks/useClickOutsideEffect';
import { useEscKeydownEffect } from '../../hooks/useEscKeydownEffect';
import { User } from 'next-auth';
import { constructHrefWithUtm } from '../../../utils/constructHrefWithUtm';
import { OFFERING_LINKS } from '../../../constants';
import { useParams, useRouter } from 'next/navigation';

type HeaderProps = {
  auth?: {
    user: User | undefined;
    signOut: () => Promise<void>;
  };
};

export const Header = ({ auth }: HeaderProps) => {
  const router = useRouter();
  const { locale, offeringId, interval } = useParams();

  const signedIn = auth && auth.user;

  const [isBentoMenuRevealed, setBentoMenuRevealed] = useState(false);
  const toggleBentoMenuRevealed = () => {
    setBentoMenuRevealed(!isBentoMenuRevealed);
    setAvatarMenuRevealed(false);
  };
  const bentoMenuInsideRef =
    useClickOutsideEffect<HTMLDivElement>(setBentoMenuRevealed);

  const [isAvatarMenuRevealed, setAvatarMenuRevealed] = useState(false);
  const toggleAvatarMenuRevealed = () => {
    setAvatarMenuRevealed(!isAvatarMenuRevealed);
    setBentoMenuRevealed(false);
  };
  const avatarMenuInsideRef = useClickOutsideEffect<HTMLDivElement>(
    setAvatarMenuRevealed
  );

  useEscKeydownEffect(() => {
    setBentoMenuRevealed(false);
    setAvatarMenuRevealed(false);
  });

  const links = {
    desktop: constructHrefWithUtm(
      OFFERING_LINKS.desktop,
      'mozilla-websites',
      'moz-subplat',
      'bento',
      'fx-desktop',
      'permanent'
    ),
    mobile: constructHrefWithUtm(
      OFFERING_LINKS.mobile,
      'mozilla-websites',
      'moz-subplat',
      'bento',
      'fx-mobile',
      'permanent'
    ),
    monitor: constructHrefWithUtm(
      OFFERING_LINKS.monitor,
      'mozilla-websites',
      'moz-subplat',
      'bento',
      'monitor',
      'permanent'
    ),
    relay: constructHrefWithUtm(
      OFFERING_LINKS.relay,
      'mozilla-websites',
      'moz-subplat',
      'bento',
      'relay',
      'permanent'
    ),
    vpn: constructHrefWithUtm(
      OFFERING_LINKS.vpn,
      'mozilla-websites',
      'moz-subplat',
      'bento',
      'vpn',
      'permanent'
    ),
    pocket: OFFERING_LINKS.pocket,
  };

  const iconClassNames = 'inline-block w-5 -mb-1 me-1';

  return (
    <header
      className="bg-white fixed flex justify-between items-center shadow h-16 left-0 top-0 mx-auto my-0 px-4 py-0 w-full z-40 tablet:h-20"
      role="banner"
    >
      <div className="flex items-center">
        <Image
          src={mozillaIcon}
          alt="Mozilla logo"
          className="object-contain"
          width={120}
        />
      </div>
      <div className="flex items-center leading-normal">
        <Localized id="payments-header-help">
          <LinkExternal
            href="https://support.mozilla.org/products/mozilla-account"
            title="Help"
            className="inline-block relative p-2 -m-2 z-[1] rounded hover:bg-grey-100"
          >
            <Image
              src={helpIcon}
              aria-label="Help"
              alt="Help"
              role="img"
              className="w-5 text-violet-900"
            />
          </LinkExternal>
        </Localized>
        {/** Bento Menu, TODO: convert to Radix Primitive as part of FXA-11035 */}
        <div
          className="relative self-center flex mx-2"
          ref={bentoMenuInsideRef}
        >
          <Localized id="payments-header-bento">
            <button
              onClick={toggleBentoMenuRevealed}
              title="Mozilla products"
              aria-label="Mozilla products"
              aria-expanded={!!isBentoMenuRevealed}
              aria-haspopup="menu"
              className="rounded p-2 mx-2 border-transparent hover:bg-grey-100 transition-standard desktop:mx-8"
            >
              <Image
                src={bentoIcon}
                alt="Mozilla Logo"
                className="w-5 text-violet-900"
              />
            </button>
          </Localized>

          {/** Bento Dropdown */}
          {isBentoMenuRevealed && (
            <div
              className="w-full h-full fixed top-0 start-0 bg-white z-10 desktop:-start-50
                      mobileLandscape:h-auto mobileLandscape:top-10 mobileLandscape:-start-52 mobileLandscape:w-64
                      mobileLandscape:bg-white mobileLandscape:absolute mobileLandscape:shadow-md mobileLandscape:rounded-lg"
            >
              <div className="flex flex-wrap">
                <div className="flex w-full py-4 gap-2 items-center flex-col tablet:w-auto tablet:relative">
                  <button onClick={() => setBentoMenuRevealed(false)}>
                    <Localized id="payments-header-bento-close">
                      <Image
                        src={closeIcon}
                        alt="Close"
                        width="16"
                        height="16"
                        className="absolute top-5 end-5 mobileLandscape:hidden fill-current"
                      />
                    </Localized>
                  </button>
                  <div className="mt-12 px-8 text-center mobileLandscape:mt-0">
                    <Localized id="payments-header-bento-tagline">
                      <h2>
                        More products from Mozilla that protect your privacy
                      </h2>
                    </Localized>
                  </div>
                  <div className="w-full text-xs">
                    <ul className="list-none">
                      <li>
                        <LinkExternal
                          href={links.desktop}
                          className="block p-2 ps-6 hover:bg-grey-100"
                        >
                          <div className={iconClassNames}>
                            <Image src={desktopIcon} alt="" />
                          </div>
                          <Localized id="payments-header-bento-firefox-desktop">
                            <span>Firefox Browser for Desktop</span>
                          </Localized>
                        </LinkExternal>
                      </li>
                      <li>
                        <LinkExternal
                          href={links.mobile}
                          className="block p-2 ps-6 hover:bg-grey-100"
                        >
                          <div className={iconClassNames}>
                            <Image src={mobileIcon} alt="" />
                          </div>
                          <Localized id="payments-header-bento-firefox-mobile">
                            <span>Firefox Browser for Mobile</span>
                          </Localized>
                        </LinkExternal>
                      </li>
                      <li>
                        <LinkExternal
                          href={links.monitor}
                          className="block p-2 ps-6 hover:bg-grey-100"
                        >
                          <div className={iconClassNames}>
                            <Image src={monitorIcon} alt="" />
                          </div>
                          <Localized id="payments-header-bento-monitor">
                            <span>Mozilla Monitor</span>
                          </Localized>
                        </LinkExternal>
                      </li>
                      <li>
                        <LinkExternal
                          href={links.relay}
                          className="block p-2 ps-6 hover:bg-grey-100"
                        >
                          <div className={iconClassNames}>
                            <Image src={relayIcon} alt="" />
                          </div>
                          <Localized id="payments-header-bento-firefox-relay">
                            <span>Firefox Relay</span>
                          </Localized>
                        </LinkExternal>
                      </li>
                      <li>
                        <LinkExternal
                          href={links.vpn}
                          className="block p-2 ps-6 hover:bg-grey-100"
                        >
                          <div className={iconClassNames}>
                            <Image src={vpnIcon} alt="" />
                          </div>
                          <Localized id="payments-header-bento-vpn">
                            <span>Mozilla VPN</span>
                          </Localized>
                        </LinkExternal>
                      </li>
                      <li>
                        <LinkExternal
                          href={links.pocket}
                          className="block p-2 ps-6 hover:bg-grey-100"
                        >
                          <div className={iconClassNames}>
                            <Image src={pocketIcon} alt="" />
                          </div>
                          <Localized id="payments-header-bento-pocket">
                            <span>Pocket</span>
                          </Localized>
                        </LinkExternal>
                      </li>
                    </ul>
                  </div>
                  <Localized id="payments-header-bento-made-by-mozilla">
                    <LinkExternal
                      href="https://www.mozilla.org/"
                      className="link-blue text-xs underline-offset-4 w-full text-center p-2 block hover:bg-grey-100"
                    >
                      Made by Mozilla
                    </LinkExternal>
                  </Localized>
                </div>
              </div>
            </div>
          )}
        </div>
        {/** Avatar Menu, TODO: convert to Radix Primitive as part of FXA-11035 */}
        {signedIn && (
          <div className="relative" ref={avatarMenuInsideRef}>
            <Localized id="payments-header-avatar">
              <button
                onClick={toggleAvatarMenuRevealed}
                title="Mozilla account menu"
              >
                <Localized id="payments-header-avatar-icon">
                  <Image
                    unoptimized={true}
                    src={auth.user?.image ?? defaultAvatarIcon}
                    alt="Account profile picture"
                    width="10"
                    height="10"
                    className="w-10 rounded-full"
                  />
                </Localized>
              </button>
            </Localized>

            {/** Avatar Dropdown */}
            {isAvatarMenuRevealed && (
              <div
                dir="ltr"
                className="w-64 bg-white absolute shadow-md rounded-lg ltr:-left-52"
                role="menu"
              >
                <div className="flex flex-wrap">
                  <div className="flex w-full p-4 items-center">
                    <div className="ltr:mr-3 flex-none">
                      <Localized id="payments-header-avatar-icon">
                        <Image
                          unoptimized={true}
                          src={auth.user?.image ?? defaultAvatarIcon}
                          alt="Account profile picture"
                          width="10"
                          height="10"
                          className="w-10 rounded-full"
                        />
                      </Localized>
                    </div>
                    <p className="leading-5 max-w-full truncate">
                      <Localized id="payments-header-avatar-expanded-signed-in-as">
                        <span className="text-grey-400 text-xs">
                          Signed in as
                        </span>
                      </Localized>
                      <span className="font-bold block truncate">
                        {/* eslint-disable @typescript-eslint/no-non-null-assertion */}
                        {auth.user!.name || auth.user!.email}
                      </span>
                    </p>
                  </div>
                  <div className="w-full">
                    <div className="bg-gradient-to-r from-blue-500 via-pink-700 to-yellow-500 h-px" />
                    <div className="px-4 py-5">
                      <button
                        onClick={async () => {
                          // As of this commit, both router.push and direct location.href overwriting are necessary to ensure
                          // the browser is in the correct state without any contentless flashes
                          await auth.signOut();
                          const redirectUrl = `/${locale}/${offeringId}/${interval}/new`;
                          router.push(redirectUrl);
                          window.location.href = redirectUrl;
                        }}
                        className="pl-3 group"
                      >
                        <Image
                          src={signOutIcon}
                          alt=""
                          height="18"
                          width="18"
                          className="ltr:mr-3 inline-block stroke-current align-middle transform"
                        />
                        <Localized id="payments-header-avatar-expanded-sign-out">
                          <span className="group-hover:underline">
                            Sign out
                          </span>
                        </Localized>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
