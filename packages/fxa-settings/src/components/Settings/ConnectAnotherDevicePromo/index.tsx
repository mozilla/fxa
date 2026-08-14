/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';
import { LinkExternal } from 'fxa-react/components/LinkExternal';
import { getStoreImageByLanguages, StoreType } from './storeImageLoader';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import GleanMetrics from '../../../lib/glean';
import { FtlMsg } from 'fxa-react/lib/utils';

// Bitly smart link. It detects the platform and redirects to the correct store.
const APP_DOWNLOAD_LINK = 'https://mzl.la/setting-appdownload';

export function ConnectAnotherDevicePromo() {
  const { navigatorLanguages } = useContext(SettingsContext);
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
      <div className="flex flex-col flex-1 text-center mobileLandscape:text-start">
        <FtlMsg id="connect-another-fx-mobile">
          <p className="text-sm">Get Firefox on mobile or tablet</p>
        </FtlMsg>
        <FtlMsg id="connect-another-find-fx-mobile-2">
          <p className="text-grey-400 dark:text-grey-200 text-xs">
            Find Firefox in the Google Play and App Store.
          </p>
        </FtlMsg>
      </div>
      <div className="flex flex-2 justify-center mt-5 mobileLandscape:mt-0 mobileLandscape:justify-end mobileLandscape:rtl:justify-start">
        <LinkExternal
          className="self-center rounded focus-visible-default outline-offset-2"
          data-testid="play-store-link"
          href={APP_DOWNLOAD_LINK}
          onClick={() => GleanMetrics.accountPref.googlePlaySubmit()}
        >
          {GooglePlayBadge}
        </LinkExternal>
        <LinkExternal
          className="self-center m-2 rounded focus-visible-default outline-offset-2"
          data-testid="app-store-link"
          href={APP_DOWNLOAD_LINK}
          onClick={() => GleanMetrics.accountPref.appleSubmit()}
        >
          {AppStoreBadge}
        </LinkExternal>
      </div>
    </div>
  );
}

export default ConnectAnotherDevicePromo;
