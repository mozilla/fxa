/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import AppLayout from '../../../../components/AppLayout';
import {
  FirefoxWordmarkImage,
  LaptopQrCodeImage,
} from '../../../../components/images';
import { SYNC_SUPPORT_URL } from '../../../../constants';

/**
 * The mobile screen shown before pairing starts. It tells the user to open
 * firefox.com/pair on their computer, which is where the QR code they scan
 * with this device comes from.
 *
 * Presentational only, and deliberately actionless: there is nothing to do on
 * the phone until the computer shows a code. Routing and the page-view/Glean
 * metrics that sibling pairing pages emit land with the flow wiring.
 */
const ReadyToScan = () => (
  <AppLayout whiteBackground>
    <div className="flex flex-col items-center text-center">
      <FirefoxWordmarkImage className="h-8 w-24 text-black dark:text-white" />

      <LaptopQrCodeImage className="mt-14 h-[120px] w-auto" />

      <FtlMsg id="pair2-supplicant-ready-to-scan-heading">
        <h1 className="card-header mt-4">To connect a device</h1>
      </FtlMsg>
      <FtlMsg
        id="pair2-supplicant-ready-to-scan-instruction"
        elems={{ b: <b className="whitespace-nowrap" /> }}
      >
        <p className="mt-1 text-base">
          On your computer, open Firefox and go to{' '}
          <b className="whitespace-nowrap">firefox.com/pair</b>, and follow on
          screen instructions to connect this mobile device.
        </p>
      </FtlMsg>

      <LinkExternal
        href={SYNC_SUPPORT_URL}
        className="link-dark-grey"
      >
        <FtlMsg id="pair2-supplicant-ready-to-scan-learn-more-link">
          Learn more
        </FtlMsg>
      </LinkExternal>
    </div>
  </AppLayout>
);

export default ReadyToScan;
