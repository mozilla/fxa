/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { FtlMsg } from 'fxa-react/lib/utils';
import foxBodySrc from './fox-body.svg';
import foxTailSrc from './fox-tail.svg';
import { Integration, isWebIntegration } from '../../models/integrations';
import GleanMetrics from '../../lib/glean';
import { isValidCmsUrl } from '../../lib/utilities';
import { useExperiments, useFtlMsgResolver } from '../../models/hooks';
import { useNimbusContext } from '../../models/contexts/NimbusContext';
import { CONTROL_BRANCH, resolveBranch } from './branches';

export type PromoQrMobileIntegration = Pick<
  Integration,
  'type' | 'isDesktopSync'
>;

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

// Bitly builds a ~10% quiet zone into the QR. The card's padding supplies the
// margin instead, so crop most of it or the QR looks small inside the card.
const QR_QUIET_ZONE_CROP = 'scale-[1.1538]';

function shouldShowPromo(pathname: string): boolean {
  if (pathname === '/') return true;
  return QR_PROMO_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const PromoQrMobile = ({
  integration,
  promoQrImageUrl,
  cmsLoading = false,
}: {
  integration: PromoQrMobileIntegration;
  promoQrImageUrl?: string | null;
  cmsLoading?: boolean;
}) => {
  const location = useLocation();
  const hasLoggedView = useRef(false);
  const ftlMsgResolver = useFtlMsgResolver();
  const experiments = useExperiments();
  const { loading: nimbusLoading } = useNimbusContext();

  // The CMS image decides enrollment, so reporting before it lands would stamp a
  // treatment on a user who ends up seeing the CMS control.
  const loading = nimbusLoading || cmsLoading;

  const visible =
    (isWebIntegration(integration) || integration.isDesktopSync()) &&
    shouldShowPromo(location.pathname);

  // A CMS image has no branch tracking, so those users get the control copy and
  // are left out of the experiment.
  const cmsQr =
    promoQrImageUrl && isValidCmsUrl(promoQrImageUrl) ? promoQrImageUrl : null;

  const feature = experiments?.features?.['promo-qr-mobile'];
  const enrolled = !cmsQr && feature?.['enabled'] === true;
  const branchSlug = enrolled ? feature?.['branch'] : CONTROL_BRANCH;
  const branch = resolveBranch(branchSlug);

  useEffect(() => {
    if (
      visible &&
      !loading &&
      !hasLoggedView.current &&
      window.matchMedia(DESKTOP_MQ).matches
    ) {
      hasLoggedView.current = true;
      GleanMetrics.promoQrMobile.view({
        event: {
          nimbusUserId: experiments?.nimbusUserId,
          branch: enrolled ? branch.slug : undefined,
        },
      });
    }
  }, [visible, loading, experiments, enrolled, branch.slug]);

  // Wait for Nimbus and the CMS so the control does not paint and then swap.
  if (!visible || loading) return <></>;

  const heading = ftlMsgResolver.getMsg(branch.ftlId, branch.heading);

  return (
    <aside className="hidden desktop:fixed desktop:flex desktop:flex-col desktop:items-center desktop:bottom-8 desktop:end-12 w-60 gap-3">
      <div className="py-2 text-center">
        <h2 className="text-sm font-bold leading-snug text-grey-900 dark:text-white">
          {heading}
        </h2>
      </div>

      <div className="relative flex w-full justify-center">
        {/* We use 'img' here instead of inlined SVGs since they are heavier SVG assets and
         * are used across multiple pages - the browser will cache them */}
        <img
          src={foxBodySrc}
          alt=""
          aria-hidden="true"
          className="absolute bottom-[5px] end-[-5px] h-[140px] select-none"
        />
        <div className="relative rounded-xl bg-white p-4 shadow-card-grey-drop">
          <div className="w-[104px] h-[104px] overflow-hidden">
            <FtlMsg id="promo-qr-mobile-qr-alt" attrs={{ alt: true }}>
              <img
                src={cmsQr ?? branch.qr}
                alt="QR code to download the Firefox mobile app. Position your phone’s camera on the lower-right corner of your screen to scan it."
                className={`w-full h-full ${QR_QUIET_ZONE_CROP}`}
              />
            </FtlMsg>
          </div>
        </div>
        <img
          src={foxTailSrc}
          alt=""
          aria-hidden="true"
          className="absolute bottom-[21px] start-[11px] h-[101px] select-none"
        />
      </div>

      <FtlMsg id="promo-qr-mobile-description-v2">
        <p className="py-1 text-sm text-grey-900 dark:text-grey-100">
          Scan to download mobile app
        </p>
      </FtlMsg>
    </aside>
  );
};

export default PromoQrMobile;
