/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import { useLocation } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import ffLogo from '@fxa/shared/assets/images/ff-logo.svg';
import qrMobileKitSrc from './qr-mobile-kit.svg';
import { Integration, isWebIntegration } from '../../models/integrations';
import GleanMetrics from '../../lib/glean';
import { isValidCmsUrl } from '../../lib/utilities';

export type PromoQrMobileIntegration = Pick<Integration, 'type'>;

// Must match the `desktop` breakpoint in packages/fxa-react/configs/tailwind.js.
// This is a little fragile, but we're doing it to fire a Glean event only at
// desktop when the QR code is shown. We won't worry about window resizing.
const DESKTOP_MQ = '(min-width: 1024px)';

const QR_PROMO_ROUTE_PREFIXES = [
  '/signin',
  '/signup',
  '/confirm_signup',
  '/inline_totp_setup',
  '/inline_recovery_setup',
  '/inline_recovery_key_setup',
];

function shouldShowPromo(pathname: string): boolean {
  if (pathname === '/') return true;
  return QR_PROMO_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const PromoQrMobile = ({
  integration,
  promoQrImageUrl,
}: {
  integration: PromoQrMobileIntegration;
  promoQrImageUrl?: string | null;
}) => {
  const location = useLocation();
  const hasLoggedView = useRef(false);

  const visible =
    isWebIntegration(integration) && shouldShowPromo(location.pathname);

  useEffect(() => {
    if (
      visible &&
      !hasLoggedView.current &&
      window.matchMedia(DESKTOP_MQ).matches
    ) {
      hasLoggedView.current = true;
      GleanMetrics.promoQrMobile.view();
    }
  }, [visible]);

  if (!visible) return <></>;

  const qrSrc =
    promoQrImageUrl && isValidCmsUrl(promoQrImageUrl)
      ? promoQrImageUrl
      : qrMobileKitSrc;

  return (
    <aside className="hidden desktop:fixed desktop:flex desktop:flex-col desktop:items-center desktop:bottom-8 desktop:end-12">
      {/* We use 'img' here instead of inlined SVGs since they are heavier SVG assets and
       * are used across multiple pages - the browser will cache them */}
      <div className="me-5 text-center">
        <img src={ffLogo} alt="Firefox logo" className="w-6 h-6 mb-2 mx-auto" />
        <FtlMsg id="promo-qr-mobile-heading">
          <h2 className="text-md font-extrabold text-grey-900 dark:text-white">
            Your phone. Your rules.
          </h2>
        </FtlMsg>
        <FtlMsg id="promo-qr-mobile-description">
          <p className="text-sm text-grey-700 dark:text-grey-100">
            Scan to get the app
          </p>
        </FtlMsg>
      </div>
      <FtlMsg id="promo-qr-mobile-qr-alt" attrs={{ alt: true }}>
        <img
          src={qrSrc}
          alt="QR code to download the Firefox mobile app. Position your phone’s camera on the lower-right corner of your screen to scan it."
          className="mx-auto max-h-44 mt-1"
        />
      </FtlMsg>
    </aside>
  );
};

export default PromoQrMobile;
