/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LinkExternal } from 'fxa-react/components/LinkExternal';
import playStoreIcon from './play-store.svg';
import appStoreIcon from './app-store.svg';

export function ConnectAnotherDevicePromo() {
  return (
    <div
      className="my-1 flex flex-col mobileLandscape:flex-row"
      data-testid="connect-another-device-promo"
    >
      <div className="flex flex-col flex-1 text-center mobileLandscape:text-left mobileLandscape:rtl:text-right">
        <p className="text-sm">Get Firefox on mobile or tablet</p>
        <p className="text-grey-300 text-xs">
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
      </div>
      <div className="flex flex-2 justify-center mt-5 mobileLandscape:mt-0 mobileLandscape:justify-end mobileLandscape:rtl:justify-start">
        <LinkExternal
          className="self-center"
          data-testid="play-store-link"
          href="https://app.adjust.com/2uo1qc?redirect=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dorg.mozilla.firefox"
        >
          <img src={playStoreIcon} alt="" />
        </LinkExternal>
        <LinkExternal
          className="self-center p-2"
          data-testid="app-store-link"
          href="https://app.adjust.com/2uo1qc?redirect=https%3A%2F%2Fitunes.apple.com%2Fus%2Fapp%2Ffirefox-private-safe-browser%2Fid989804926"
        >
          <img src={appStoreIcon} alt="" />
        </LinkExternal>
      </div>
    </div>
  );
}

export default ConnectAnotherDevicePromo;
