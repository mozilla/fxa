/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useConfig } from '../../models';
import { useMetrics } from '../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';
import { Localized } from '@fluent/react';

export const bannerClosedLocalStorageKey =
  '__fxa_storage.fxa_disable_brand_banner';

const BrandMessaging = ({
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
      id="banner-brand-message"
      className="w-full relative mobileLandscape:absolute mobileLandscape:top-0 mobileLandscape:left-0"
    >
      <div className="flex relative justify-center p-2 brand-banner-bg">
        {mode === 'prelaunch' && (
          <div className="flex" data-testid="brand-prelaunch">
            <div className="flex-none relative">
              <Localized id="brand-m-logo" attrs={{ alt: true }}>
                <img
                  className="w-8 h-8 bg-black m-4 mt-1"
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMC43NjkyMjYiIHk9IjAuNzY5MjI2IiB3aWR0aD0iMzAuNDYxNSIgaGVpZ2h0PSIzMC40NjE1IiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMjcuNzMxNCAyMC41MDg0SDI5LjY0NDFWMjMuNjE1NEgyMy42MTIxVjE1LjI3NDVDMjMuNjEyMSAxMi42NTY3IDIyLjc3ODEgMTEuNjcyOCAyMS4xNTkyIDExLjY3MjhDMTkuMTk3MiAxMS42NzI4IDE4LjQxMjQgMTMuMTYwOSAxOC40MTI0IDE1LjIxMzlWMjAuNDQ5NkgyMC4zMjUxVjIzLjU2MDRIMTQuMzAwOFYxNS4yNjg5QzE0LjMwMDggMTIuNjUxIDEzLjQ2NjcgMTEuNjY3MSAxMS44NDc4IDExLjY2NzFDOS44ODU4MyAxMS42NjcxIDguNzg4MjUgMTMuMTU1MiA4Ljc4ODI1IDE1LjIwODJWMjAuNDQzOUgxMS44MzY0VjIzLjU2MDRIMy4wMTQxNFYyMC40NTM0SDQuODIyNThWMTIuMzU3MkgyLjkyNjk0VjguNjU0OThIOC4zNzY5VjEwLjk5NDJDOS41MDExOSA5LjMyNDQ0IDExLjM5OTMgOC4zNDMyMiAxMy40MTE3IDguMzkxNDlDMTUuNTIxNCA4LjI3NjQ3IDE3LjQzOTkgOS42MDg1NCAxOC4wNjkzIDExLjYyNTRDMTguNzQ2NyA5LjY0MzQ2IDIwLjYzNSA4LjMzMjg3IDIyLjcyODggOC4zOTE0OUMyNC4xMDE5IDguMzI4NzkgMjUuNDM1MSA4Ljg2MzI2IDI2LjM4NDYgOS44NTcxNkMyNy4zMzQyIDEwLjg1MTEgMjcuODA3MyAxMi4yMDcyIDI3LjY4MjEgMTMuNTc2MVYyMC41MDg0SDI3LjczMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K"
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
        <div className="flex justify-right order-last rtl:justify-left m-4 mt-1 mb-1">
          <FtlMsg id="brand-banner-dismiss-button" attrs={{ ariaLabel: true }}>
            <button
              className="w-4 h-4"
              data-testid="close-brand-messaging"
              type="button"
              aria-label="Close Banner"
              onClick={onClickCloseBanner}
            >
              <Localized id="brand-close-banner" attrs={{ alt: true }}>
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+CiAgPGc+CiAgICA8cGF0aCBmaWxsPSJyZ2JhKDEyLCAxMiwgMTMsIC44KSIgZD0iTTkuNDE0IDhsNS4yOTMtNS4yOTNhMSAxIDAgMDAtMS40MTQtMS40MTRMOCA2LjU4NiAyLjcwNyAxLjI5M2ExIDEgMCAwMC0xLjQxNCAxLjQxNEw2LjU4NiA4bC01LjI5MyA1LjI5M2ExIDEgMCAxMDEuNDE0IDEuNDE0TDggOS40MTRsNS4yOTMgNS4yOTNhMSAxIDAgMDAxLjQxNC0xLjQxNHoiLz4KICA8L2c+Cjwvc3ZnPgo="
                  className="cursor-pointer h-4 w-4"
                  alt="Close Banner"
                />
              </Localized>
            </button>
          </FtlMsg>
        </div>
      </div>
    </div>
  );
};
export default BrandMessaging;
