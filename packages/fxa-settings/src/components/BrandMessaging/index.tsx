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
    <div id="banner-brand-message" className="fixed w-full top-0 left-0">
      <div className="flex relative justify-center p-2 brand-banner-bg">
        {mode === 'prelaunch' && (
          <div className="flex" data-testid="brand-prelaunch">
            <div className="m-logo flex-none relative mt-1 mr-4 mb-2">
              <div className="bg-black">
                <Localized id="brand-m-logo" attrs={{ alt: true }}>
                  <img
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAQCAYAAAAFzx/vAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEKSURBVHgB7ZThDYIwEIWLcQBHYAPdQDfQEdxAR9AJdAN0AnECYAOYoGwAG5yv4UiacrX9ofGPL3kEel/v2tI2IaKFUmqnpiqTJGk5voHXsHnv4SdipQ2DSznPkpkGzG2S1YAkaw9vYO2JX6wcBw+jeSBRBTMK68QDeydNwyoFC47q4AdceGKa3wvmtMAd7YILHuVRAB/26Mg/m5Uzgc6JZ7H/MhU4HUqGtqvD5GNspvyqzS4V2t22RurrfHcxBXsVp1guWPAr+hf8uObmgW17UsM9aSvldqMeO/bqybHl45ODqT3MinMNcQpLjz1JvnGM9hbjuyCy3ywpdA5w9lm7w5XA2MvZwjeBqV7FRzhNrCW4kwAAAABJRU5ErkJggg=="
                    alt="Mozilla m logo"
                  />
                </Localized>
              </div>
            </div>
            <div className="flex-initial max-w-md pr-2">
              <p className="text-left text-sm font-bold">
                <FtlMsg id="brand-prelaunch-title">
                  Firefox accounts will be renamed Mozilla accounts on Nov 1
                </FtlMsg>
              </p>
              <p className="text-left text-xs">
                <FtlMsg id="brand-prelaunch-subtitle">
                  You’ll still sign in with the same username and password, and
                  there are no other changes to the products that you use.
                </FtlMsg>
                <span
                  role="link"
                  className="brand-learn-more underline cursor-pointer"
                  onClick={onClickLearnMore}
                >
                  &nbsp;<FtlMsg id="brand-learn-more">Learn more</FtlMsg>
                </span>
              </p>
            </div>
          </div>
        )}

        {mode === 'postlaunch' && (
          <div className="flex" data-testid="brand-postlaunch">
            <div className="flex-initial max-w-md pr-2">
              <p className="text-sm font-bold">
                <FtlMsg id="brand-postlaunch-title">
                  We’ve renamed Firefox accounts to Mozilla accounts. You’ll
                  still sign in with the same username and password, and there
                  are no other changes to the products that you use.
                </FtlMsg>
                <span
                  role="link"
                  className="brand-learn-more underline cursor-pointer"
                  onClick={onClickLearnMore}
                >
                  &nbsp;<FtlMsg id="brand-learn-more">Learn more</FtlMsg>
                </span>
              </p>
            </div>
          </div>
        )}
        <div className="absolute w-1/12 right-0 top-0 pt-3 start-0">
          <FtlMsg id="brand-banner-dismiss-button" attrs={{ ariaLabel: true }}>
            <button
              id="close-brand-banner"
              className="cursor-pointer"
              data-testid="close-brand-messaging"
              type="button"
              aria-label="Close Banner"
              onClick={onClickCloseBanner}
            >
              <Localized id="branding-close-banner" attrs={{ alt: true }}>
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+CiAgPGc+CiAgICA8cGF0aCBmaWxsPSJyZ2JhKDEyLCAxMiwgMTMsIC44KSIgZD0iTTkuNDE0IDhsNS4yOTMtNS4yOTNhMSAxIDAgMDAtMS40MTQtMS40MTRMOCA2LjU4NiAyLjcwNyAxLjI5M2ExIDEgMCAwMC0xLjQxNCAxLjQxNEw2LjU4NiA4bC01LjI5MyA1LjI5M2ExIDEgMCAxMDEuNDE0IDEuNDE0TDggOS40MTRsNS4yOTMgNS4yOTNhMSAxIDAgMDAxLjQxNC0xLjQxNHoiLz4KICA8L2c+Cjwvc3ZnPgo="
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
