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
 */
const DownloadFirefox = () => (
  <AppLayout>
    <div className="flex flex-col items-center text-center">
      <FtlMsg id="pair2-authority-download-firefox-heading">
        <h1 className="card-header">Open Firefox to sync</h1>
      </FtlMsg>
      <FtlMsg id="pair2-authority-download-firefox-instruction">
        <p className="mt-1 text-base">
          To set up syncing across devices, open Firefox on this device and visit <b>firefox.com/pair</b>
        </p>
      </FtlMsg>

      <SyncDevicesImage className="mt-10 h-[160px] w-auto" />

      <div className="mt-10 flex w-full">
        <LinkExternal
          href={LINK.FX_DESKTOP}
          gleanDataAttrs={{ id: 'dtm_desktop_download_submit' }}
          className="cta-primary cta-xl"
        >
          <FtlMsg id="pair2-authority-download-firefox-cta">
            Download Firefox
          </FtlMsg>
        </LinkExternal>
      </div>
    </div>
  </AppLayout>
);

export default DownloadFirefox;
