/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';
import { LinkExternal } from 'fxa-react/components/LinkExternal';
import { Localized } from '@fluent/react';
import { getStoreImageByLanguages, StoreType } from './storeImageLoader';
import { AppContext } from '../../models';

export function ConnectAnotherDevicePromo() {
  const { navigatorLanguages } = useContext(AppContext);
  const GooglePlayBadge = getStoreImageByLanguages(
    StoreType.google,
    navigatorLanguages
  );
  const AppStoreBadge = getStoreImageByLanguages(
    StoreType.apple,
    navigatorLanguages
  );

  return (
    <div
      className="my-1 flex flex-col mobileLandscape:flex-row"
      data-testid="connect-another-device-promo"
    >
      <div className="flex flex-col flex-1 text-center mobileLandscape:text-left mobileLandscape:rtl:text-right">
        <Localized id="connect-another-fx-mobile">
          <p className="text-sm">Get Firefox on mobile or tablet</p>
        </Localized>
        <Localized
          id="connect-another-find-fx-mobile"
          elems={{
            br: <br />,
            linkExternal: (
              <LinkExternal
                href="https://www.mozilla.org/en-US/firefox/mobile/"
                className="link-blue"
                data-testid="download-link"
              >
                {' '}
              </LinkExternal>
            ),
          }}
        >
          <p className="text-grey-400 text-xs">
            Find Firefox in the Google Play and App Store or
            <br />
            <LinkExternal
              href="https://www.mozilla.org/en-US/firefox/mobile/"
              className="link-blue"
              data-testid="download-link"
            >
              send a download link to your device.
            </LinkExternal>
          </p>
        </Localized>
      </div>
      <div className="flex flex-2 justify-center mt-5 mobileLandscape:mt-0 mobileLandscape:justify-end mobileLandscape:rtl:justify-start">
        <LinkExternal
          className="self-center"
          data-testid="play-store-link"
          href="https://app.adjust.com/2uo1qc?redirect=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dorg.mozilla.firefox"
        >
          <Localized
            id="connect-another-play-store-image"
            attrs={{ title: true }}
          >
            <GooglePlayBadge role="img" title="Download Firefox for Android" />
          </Localized>
        </LinkExternal>
        <LinkExternal
          className="self-center p-2"
          data-testid="app-store-link"
          href="https://app.adjust.com/2uo1qc?redirect=https%3A%2F%2Fitunes.apple.com%2Fus%2Fapp%2Ffirefox-private-safe-browser%2Fid989804926"
        >
          <Localized
            id="connect-another-app-store-image"
            attrs={{ title: true }}
          >
            <AppStoreBadge role="img" title="Download Firefox for iOS" />
          </Localized>
        </LinkExternal>
      </div>
    </div>
  );
}

export default ConnectAnotherDevicePromo;
