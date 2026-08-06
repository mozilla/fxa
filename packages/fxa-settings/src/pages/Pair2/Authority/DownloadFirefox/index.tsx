/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import AppLayout from '../../../../components/AppLayout';
import { SyncDevicesImage } from '../../../../components/images';
import { LINK } from '../../../../constants';

/**
 * The desktop screen shown when the user needs Firefox before they can pair.
 * It tells them to open Firefox and visit firefox.com/pair, and offers a
 * download link for the desktop browser as the only action.
 *
 * Unlike the Pair2 mobile cards, the desktop cards carry no in-card Firefox
 * lockup, and they lead with the copy rather than the illustration.
 *
 * Presentational only: routing and the page-view/Glean metrics that sibling
 * pairing pages emit land with the flow wiring.
 */
const DownloadFirefox = () => (
  <AppLayout>
    <div className="flex flex-col items-center text-center">
      <FtlMsg id="pair2-authority-download-firefox-heading">
        <h1 className="card-header">Open Firefox to sync</h1>
      </FtlMsg>
      <FtlMsg id="pair2-authority-download-firefox-instruction">
        <p className="mt-1 text-base">
          To set up syncing across devices, open Firefox on this device and
          visit firefox.com/pair
        </p>
      </FtlMsg>

      <SyncDevicesImage className="mt-10 h-[160px] w-auto" />

      {/* `cta-xl` is `flex-1`, so a primary CTA only fills the card when it
          sits in a flex parent — the same wrapper the button-based CTAs use.
          `FtlMsg` goes inside `LinkExternal` rather than around it so that
          translating the label does not replace the component's own
          "Opens in new window" screen-reader text. */}
      <div className="mt-10 flex w-full">
        <LinkExternal href={LINK.FX_DESKTOP} className="cta-primary cta-xl">
          <FtlMsg id="pair2-authority-download-firefox-cta">
            Download Firefox
          </FtlMsg>
        </LinkExternal>
      </div>
    </div>
  </AppLayout>
);

export default DownloadFirefox;
