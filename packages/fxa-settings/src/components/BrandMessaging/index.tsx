/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useConfig } from '../../models';
import { useMetrics } from '../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactComponent as CloseIcon } from 'fxa-react/images/close.svg';
import { Localized } from '@fluent/react';
import { createPortal } from 'react-dom';
import logo from 'fxa-react/images/moz-m-logo.svg';

export const bannerClosedLocalStorageKey =
  '__fxa_storage.fxa_disable_brand_banner';

export type BrandMessagingProps = {
  mode?: string;
  viewName: string;
};

export const BrandMessagingPortal = (props: BrandMessagingProps) => {
  const bodyTop = document.querySelector('#body-top');
  const bodyBottom = document.querySelector('#body-bottom');

  if (bodyTop == null || bodyBottom == null) {
    return <></>;
  }

  return (
    <>
      {createPortal(<BrandMessaging {...props} />, bodyTop)}
      {createPortal(<BrandMessaging {...props} />, bodyBottom)}
    </>
  );
};

export const BrandMessaging = ({
  mode,
  viewName,
}: {
  mode?: string;
  viewName: string;
}) => {
  const { brandMessagingMode } = useConfig();
  const { logViewEventOnce } = useMetrics();

  if (mode === undefined) {
    mode = brandMessagingMode;
  }

  const [bannerClosed, setBannerClosed] = useState<string | null>(
    localStorage.getItem(`${bannerClosedLocalStorageKey}_${mode}`)
  );

  const bannerVisible =
    !bannerClosed && (mode === 'prelaunch' || mode === 'postlaunch');

  useEffect(() => {
    if (bannerVisible) {
      // hack to ensure banner doesn't overlap, since the only reasonable to way to do this was
      // with fixed layout.
      setTimeout(() => {
        document.body.classList.add('brand-messaging');
      }, 0);
    }
  });

  // Short circuit if mode is unknown or user has previously closed banner
  if (!bannerVisible) {
    return <></>;
  }

  logViewEventOnce(`flow.${viewName}`, `brand-messaging-${mode}-view`);

  function onClickLearnMore() {
    logViewEventOnce(`flow.${viewName}`, `brand-messaging-${mode}-learn-more`);
    window.open(
      'https://support.mozilla.org/kb/firefox-accounts-renamed-mozilla-accounts',
      '_blank'
    );
  }

  function onClickCloseBanner() {
    logViewEventOnce(
      `flow.${viewName}`,
      `brand-messaging-${mode}-banner-close`
    );
    document.body.classList.remove('brand-messaging');
    localStorage.setItem(`${bannerClosedLocalStorageKey}_${mode}`, 'true');
    setBannerClosed('true');
  }

  return (
    <div
      className="banner-brand-message w-full fixed bottom-0 mobileLandscape:top-0 mobileLandscape:relative"
      role="banner"
    >
      <div className="flex relative justify-center p-2 brand-banner-bg border border-transparent">
        {mode === 'prelaunch' && (
          <div className="flex" data-testid="brand-prelaunch">
            <div className="flex-none relative">
              <Localized id="brand-m-logo" attrs={{ alt: true }}>
                <img
                  className="w-8 h-8 bg-black m-4 mt-1"
                  src={logo}
                  alt="Mozilla m logo"
                />
              </Localized>
            </div>
            <div className="flex-initial max-w-md">
              <p className="text-start text-sm font-bold">
                <FtlMsg id="brand-prelaunch-title">
                  Firefox accounts will be renamed Mozilla accounts on Nov 1
                </FtlMsg>
              </p>
              <p className="text-start text-xs">
                <FtlMsg id="brand-prelaunch-subtitle">
                  You’ll still sign in with the same username and password, and
                  there are no other changes to the products that you use.
                </FtlMsg>
                &nbsp;
                <span
                  role="link"
                  tabIndex={0}
                  className="brand-learn-more underline cursor-pointer"
                  onClick={onClickLearnMore}
                >
                  <FtlMsg id="brand-learn-more">Learn more</FtlMsg>
                </span>
              </p>
            </div>
          </div>
        )}

        {mode === 'postlaunch' && (
          <div className="flex" data-testid="brand-postlaunch">
            <div>
              <p className="text-sm font-bold">
                <FtlMsg id="brand-postlaunch-title">
                  We’ve renamed Firefox accounts to Mozilla accounts. You’ll
                  still sign in with the same username and password, and there
                  are no other changes to the products that you use.
                </FtlMsg>
                &nbsp;
                <span
                  role="link"
                  tabIndex={0}
                  className="brand-learn-more underline cursor-pointer"
                  onClick={onClickLearnMore}
                >
                  <FtlMsg id="brand-learn-more">Learn more</FtlMsg>
                </span>
              </p>
            </div>
          </div>
        )}
        <div className="flex justify-end mx-2 my-1">
          <FtlMsg
            id="brand-banner-dismiss-button-2"
            attrs={{ ariaLabel: true }}
          >
            <button
              className="w-4 h-4"
              data-testid="close-brand-messaging"
              type="button"
              aria-label="Close banner"
              onClick={onClickCloseBanner}
            >
              <CloseIcon className="w-4 h-4 text-black" />
            </button>
          </FtlMsg>
        </div>
      </div>
    </div>
  );
};
