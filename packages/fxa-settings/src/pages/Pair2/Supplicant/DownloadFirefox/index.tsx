/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import AppLayout from '../../../../components/AppLayout';
import {
  FirefoxWordmarkImage,
  SyncDevicesImage,
} from '../../../../components/images';
import { LINK } from '../../../../constants';
import { Constants } from '../../../../lib/constants';

const learnMoreLink = (
  <LinkExternal
    href={LINK.FX_SYNC}
    className="link-dark-grey"
  >
    Learn more
  </LinkExternal>
);

/**
 * The mobile screen shown when pairing reaches a device that does not have
 * Firefox yet. It explains what syncing gets the user and sends them off to
 * install the browser.
 *
 * Both actions are static external URLs, so both are wired here and the card
 * takes no props. The primary CTA uses the shared mobile download target
 * rather than a per-platform App Store / Play Store link: picking between the
 * two needs user-agent sniffing and runtime config (see `PocPairInit`), which
 * would make this card non-presentational for no user-visible gain —
 * mozilla.org already routes mobile visitors to the right store.
 */
const DownloadFirefox = () => (
  <AppLayout whiteBackground>
    <div className="flex flex-col items-center text-center">
      <FirefoxWordmarkImage className="h-8 w-24 text-black dark:text-white" />

      <SyncDevicesImage className="mt-10 h-[120px] w-auto" />

      <FtlMsg id="pair2-supplicant-download-firefox-heading">
        <h1 className="card-header mt-4">Get Firefox on this device</h1>
      </FtlMsg>
      <FtlMsg
        id="pair2-supplicant-download-firefox-description"
        elems={{ linkExternal: learnMoreLink }}
      >
        <p className="mt-1 text-base">
          Download Firefox to sync bookmarks, history, and more across devices.{' '}
          {learnMoreLink}
        </p>
      </FtlMsg>

      <div className="mt-6 flex w-full">
        <FtlMsg id="pair2-supplicant-download-firefox-continue-button">
          <LinkExternal
            href={Constants.FIREFOX_MOBILE_DOWNLOAD_URL}
            className="cta-primary cta-xl"
          >
            Continue in Firefox
          </LinkExternal>
        </FtlMsg>
      </div>
    </div>
  </AppLayout>
);

export default DownloadFirefox;
