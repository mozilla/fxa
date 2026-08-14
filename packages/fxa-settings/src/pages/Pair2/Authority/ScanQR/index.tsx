/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import AppLayout from '../../../../components/AppLayout';
import QRCode from '../../../../components/QRCode';
import { QrPhoneFrameImage } from '../../../../components/images';
import { Integration, useFtlMsgResolver } from '../../../../models';
import { Constants } from '../../../../lib/constants';


export type ScanQRProps = {
  /**
   * The string encoded into the QR code. Required so that routing this card
   * cannot leave it showing a QR that scans to nothing — generating the
   * pairing value lands with the flow wiring, and this card only renders it.
   */
  qrCodeValue?: string;

  /** The active integraiton state. */
  integration?: Integration;
};

/**
 * The desktop screen that shows the pairing QR code. The user scans it with
 * their phone or tablet to start syncing; there is no button to press, so the
 * only action is the link out to scanning help.
 */
const ScanQR = ({ qrCodeValue, integration }: ScanQRProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  // `QRCode` takes a plain string, so this is the one label on the card that
  // cannot be resolved with `FtlMsg`.
  const localizedQrCodeLabel = ftlMsgResolver.getMsg(
    'pair2-authority-scan-qr-code-aria-label',
    'QR code to connect your mobile device'
  );

  if (integration && integration.isFirefoxMobileClient()) {
    throw new Error('Mobile to desktop not supported!')
  }

  function createQrCodeUrl() {
    // TODO: Create new pairing channel and create URL
    const key = `000000000`;
    const id = `111111111`;
    return qrCodeValue || `${window.location.origin}/pair#channel_id=${id}&channel_key=${key}&v=2`;
  }

  return (
    <AppLayout>
      <div className="text-center">
        <FtlMsg id="pair2-authority-scan-qr-heading">
          <h1 className="card-header">Scan to connect your mobile device</h1>
        </FtlMsg>
        <FtlMsg id="pair2-authority-scan-qr-instruction">
          <p className="mt-1 text-base">
            Scan the QR code with your phone or tablet to sync your Firefox
            bookmarks, tabs, and more.
          </p>
        </FtlMsg>

        {/* The artwork sits flush to the card's left, right and bottom edges
            rather than inside its padding. It carries its own 480x346 aspect
            ratio, so it — and the layers positioned over it as a percentage of
            it — scale as one with the card. */}
        <div className="relative -mx-6 -mb-8 mt-6 mobileLandscape:-mx-8 mobileLandscape:-mb-9">
          <QrPhoneFrameImage className="h-auto w-full" />

          {/* Stacked onto the phone's blank screen, which the artwork
              deliberately leaves empty. `top` is where that screen starts.
              No dark-mode variant for the link: it overlaps the screen, which
              is white in the artwork under either theme. */}
          <div className="absolute inset-x-0 top-[26.9%] flex flex-col items-center">
            {/* `border-none` drops the outline `QRCode` draws by default: in
                this composite the code sits bare on the phone's screen. The
                `[&_svg]` rules make the generated QR fluid so it tracks the
                frame around it — without them it would render at a fixed pixel
                size and drift out of the phone as the card resizes. `QRCode`'s
                own `p-4` stays a fixed quiet zone, which only ever grows in
                proportion as the card narrows. */}
            <div className="w-[41%]">
              <QRCode
                value={createQrCodeUrl()}
                localizedLabel={localizedQrCodeLabel}
                className="w-full border-none [&_svg]:h-auto [&_svg]:w-full"
              />
            </div>

            {/* `FtlMsg` wraps the text rather than the link so the localized
                string does not absorb the "opens in new window" note that
                `LinkExternal` appends for screen readers. */}
            <LinkExternal
              href={Constants.SYNC_SUMO_URL}
              className="mt-2 rounded-sm text-sm text-grey-900 underline focus-visible-default hover:text-grey-700"
            >
              <FtlMsg id="pair2-authority-scan-qr-help-link">
                Get help scanning
              </FtlMsg>
            </LinkExternal>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ScanQR;
