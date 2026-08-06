/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import AppLayout from '../../../../components/AppLayout';
import QRCode from '../../../../components/QRCode';
import { QrPhoneFrameImage } from '../../../../components/images';
import { useFtlMsgResolver } from '../../../../models';

/**
 * SUMO article on setting up sync. There is no shared constant for it — the
 * same URL is written inline at `pages/Pair/Unsupported` and at
 * `components/Settings/ConnectedServices/Service`, which is the dominant
 * pattern for SUMO links in this repo.
 */
const SYNC_SUMO_URL =
  'https://support.mozilla.org/kb/how-do-i-set-sync-my-computer';

/**
 * The Figma artwork frame (`Kit QR`), which sits flush to the card's left,
 * right and bottom edges rather than inside its padding. Every layer below is
 * placed as a percentage of this frame, so the composite — decorative phone
 * outline, QR code and help link — scales as one with the card.
 */
const ARTWORK = { width: 480, height: 346 };

/**
 * Bounds of `QrPhoneFrameImage` within the artwork frame. The asset is exported
 * cropped to its own ink, so it does not fill the frame and cannot simply be
 * stretched across it.
 */
const PHONE_FRAME = { x: 40.75, y: 0.75, width: 420.5, height: 345.25 };

/**
 * The blank white screen area of the phone outline. The QR code is composited
 * into it; the asset deliberately leaves it empty.
 */
const QR_CODE = { x: 141.633, y: 93, size: 196.733 };

/** Top of the help link, which overlaps the artwork below the QR code. */
const HELP_LINK_Y = 297.733;

const pctX = (px: number) => `${(px / ARTWORK.width) * 100}%`;
const pctY = (px: number) => `${(px / ARTWORK.height) * 100}%`;

export type ScanQRProps = {
  /**
   * The string encoded into the QR code. Required so that routing this card
   * cannot leave it showing a QR that scans to nothing — generating the
   * pairing value lands with the flow wiring, and this card only renders it.
   */
  qrCodeValue: string;
};

/**
 * The desktop screen that shows the pairing QR code. The user scans it with
 * their phone or tablet to start syncing; there is no button to press, so the
 * only action is the link out to scanning help.
 *
 * Presentational only: routing and the page-view/Glean metrics that sibling
 * pairing pages emit land with the flow wiring.
 */
const ScanQR = ({ qrCodeValue }: ScanQRProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  // `QRCode` takes a plain string, so this is the one label on the card that
  // cannot be resolved with `FtlMsg`.
  const localizedQrCodeLabel = ftlMsgResolver.getMsg(
    'pair2-authority-scan-qr-code-aria-label',
    'QR code to connect your mobile device'
  );

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

        {/* Negative margins cancel the card's padding so the artwork bleeds to
            the card's left, right and bottom edges, as it does in Figma.
            Offsets below are deliberately physical rather than logical: the
            illustration does not mirror under RTL, so the layers composited
            onto it must not either. */}
        <div
          className="relative -mx-6 -mb-8 mt-6 mobileLandscape:-mx-8 mobileLandscape:-mb-9"
          style={{ aspectRatio: `${ARTWORK.width} / ${ARTWORK.height}` }}
        >
          <div
            className="absolute"
            style={{
              left: pctX(PHONE_FRAME.x),
              top: pctY(PHONE_FRAME.y),
              width: pctX(PHONE_FRAME.width),
              height: pctY(PHONE_FRAME.height),
            }}
          >
            <QrPhoneFrameImage className="h-full w-full" />
          </div>

          <div
            className="absolute"
            style={{
              left: pctX(QR_CODE.x),
              top: pctY(QR_CODE.y),
              width: pctX(QR_CODE.size),
            }}
          >
            {/* `border-none` drops the outline `QRCode` draws by default: in
                this composite the code sits bare on the phone's white screen.
                The `[&_svg]` rules make the generated QR fluid so it tracks the
                frame around it — without them it would render at a fixed pixel
                size and drift out of the phone as the card resizes. `QRCode`'s
                own `p-4` stays a fixed quiet zone, which only ever grows in
                proportion as the card narrows. */}
            <QRCode
              value={qrCodeValue}
              localizedLabel={localizedQrCodeLabel}
              className="w-full border-none [&_svg]:h-auto [&_svg]:w-full"
            />
          </div>

          {/* No dark-mode variant: the link overlaps the phone's screen, which
              is white in the artwork under either theme. */}
          <div
            className="absolute inset-x-0"
            style={{ top: pctY(HELP_LINK_Y) }}
          >
            {/* `FtlMsg` wraps the text rather than the link so the localized
                string does not absorb the "opens in new window" note that
                `LinkExternal` appends for screen readers. */}
            <LinkExternal
              href={SYNC_SUMO_URL}
              className="rounded-sm text-sm text-grey-900 underline focus-visible-default hover:text-grey-700"
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
