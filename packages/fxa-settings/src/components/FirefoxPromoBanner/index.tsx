/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { ReactComponent as IconClose } from '@fxa/shared/assets/images/close.svg';
import { isProbablyFirefox, useAccount } from '../../models';
import { Constants } from '../../lib/constants';
import { isMobileDevice, isMobileOrTabletDevice } from '../../lib/utilities';
import GleanMetrics from '../../lib/glean';
import { BannerState, getBannerState } from './bannerState';
import kitMirror from './kit-mirror.svg';
import heartFoxes from './heart-foxes.svg';

type VisibleBannerState = Exclude<BannerState, 'hidden'>;
type PromoAction = 'view' | 'submit' | 'dismiss';

// Each variant maps its actions to the Glean events it emits.
const VARIANTS = {
  'firefox-pair': {
    image: kitMirror,
    headingId: 'firefox-promo-banner-mobile-heading',
    heading: 'Get Firefox wherever you are',
    descriptionId: 'firefox-promo-banner-mobile-description',
    description:
      'Sync your tabs, bookmarks, and passwords across your devices. Plus, everything stays safely encrypted.',
    ctaId: 'firefox-promo-banner-mobile-cta',
    cta: 'Connect a device',
    events: {
      view: 'connectMobileView',
      submit: 'connectMobileSubmit',
      dismiss: 'connectMobileDismiss',
    },
  },
  'switch-desktop': {
    image: heartFoxes,
    headingId: 'firefox-promo-banner-switch-heading',
    heading: 'Fast to switch. Easy to settle in.',
    descriptionId: 'firefox-promo-banner-switch-description',
    description:
      'When you switch to Firefox, you can bring your bookmarks, passwords, history and more so you can get to browsing without missing a beat.',
    ctaId: 'firefox-promo-banner-switch-cta',
    cta: 'Switch to Firefox',
    events: {
      view: 'switchToFirefoxView',
      submit: 'switchToFirefoxSubmit',
      dismiss: 'switchToFirefoxDismiss',
    },
  },
} as const;

// Presentational banner for one visible variant. Exported for Storybook and
// isolated rendering tests.
export const FirefoxPromoBannerView = ({
  bannerState,
  mobileDeviceCount,
}: {
  bannerState: VisibleBannerState;
  mobileDeviceCount: number;
}) => {
  const location = useLocation();

  // Drives the slide-out animation on dismiss.
  const [isClosing, setIsClosing] = useState(false);
  const [visible, setVisible] = useState(true);
  const sentMetric = useRef(false);

  // 'switch-mobile' reuses the switch content; only the CTA target differs.
  const variant =
    VARIANTS[bannerState === 'switch-mobile' ? 'switch-desktop' : bannerState];

  const eventExtras = { mobile_device_count: String(mobileDeviceCount) };

  function emitMetric(action: PromoAction) {
    GleanMetrics?.firefoxPromo?.[variant.events[action]]?.({
      event: eventExtras,
    });
  }

  useEffect(() => {
    // The banner is not a page, so its view event is emitted manually, once.
    if (visible && !sentMetric.current) {
      sentMetric.current = true;
      emitMetric('view');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, variant]);

  if (!visible) return null;

  function onDismiss() {
    emitMetric('dismiss');
    localStorage.setItem(Constants.DISABLE_PROMO_FIREFOX_BANNER, 'true');
    setIsClosing(true);
    setTimeout(() => setVisible(false), 300);
  }

  // Mirrors the shared PromotionBanner styling for visual consistency.
  const ctaProps = {
    'data-testid': 'firefox-promo-cta',
    className: 'cta-neutral cta-base cta-base-p text-sm transition-standard',
    onClick: () => emitMetric('submit'),
  };
  const downloadUrl =
    bannerState === 'switch-mobile'
      ? Constants.FIREFOX_MOBILE_DOWNLOAD_URL
      : Constants.FIREFOX_DESKTOP_DOWNLOAD_URL;
  const cta = (
    <FtlMsg id={variant.ctaId}>
      {bannerState === 'firefox-pair' ? (
        <Link {...ctaProps} to={`/pair${location.search ?? ''}`}>
          {variant.cta}
        </Link>
      ) : (
        <LinkExternal {...ctaProps} href={downloadUrl}>
          {variant.cta}
        </LinkExternal>
      )}
    </FtlMsg>
  );

  return (
    // transparent border is for Windows high-contrast mode
    <div
      className={`relative flex flex-col mobileLandscape:flex-row mobileLandscape:items-center gap-4 p-5 rounded-lg bg-gradient-to-tr from-blue-600/10 to-purple-500/10
         transition-transform border border-transparent duration-300 ease-in-out ${
           isClosing ? 'translate-x-full' : 'translate-x-0'
         }`}
    >
      <FtlMsg id="promo-banner-dismiss-button" attrs={{ 'aria-label': true }}>
        <button
          type="button"
          aria-label="Dismiss banner"
          data-testid="firefox-promo-dismiss"
          onClick={onDismiss}
          className="absolute top-3 end-1 p-2"
        >
          <IconClose
            className="text-black dark:text-grey-100 w-4 h-4"
            role="img"
          />
        </button>
      </FtlMsg>
      <img
        src={variant.image}
        alt=""
        className="h-20 w-auto object-contain self-center mobileLandscape:h-28"
      />
      <div className="flex flex-col grow text-sm">
        <FtlMsg id={variant.headingId}>
          <p className="font-bold pe-8">{variant.heading}</p>
        </FtlMsg>
        <FtlMsg id={variant.descriptionId}>
          <p>{variant.description}</p>
        </FtlMsg>
        <div className="mt-3">{cta}</div>
      </div>
    </div>
  );
};

function currentBannerState(isSignedIntoBrowser: boolean): BannerState {
  return getBannerState({
    isFirefox: isProbablyFirefox(),
    isMobile: isMobileOrTabletDevice(),
    isSignedIntoBrowser,
  });
}

// Whether the banner would render for the current browser/device, ignoring
// dismissal. The settings page uses this to order it against other promos.
export function shouldShowFirefoxPromo(isSignedIntoBrowser: boolean): boolean {
  return currentBannerState(isSignedIntoBrowser) !== 'hidden';
}

// Container: picks the variant from browser, device, and browser sign-in state
// (all user-agent based, so window size never affects it). Renders nothing for
// Firefox mobile or signed-out desktop Firefox. Dismissal is gated by the parent.
const FirefoxPromoBanner = ({
  isSignedIntoFirefox,
}: {
  isSignedIntoFirefox: boolean;
}) => {
  const account = useAccount();
  const bannerState = useMemo(
    () => currentBannerState(isSignedIntoFirefox),
    [isSignedIntoFirefox]
  );

  const mobileDeviceCount = useMemo(
    () => account.attachedClients.filter((c) => isMobileDevice(c)).length,
    [account.attachedClients]
  );

  if (bannerState === 'hidden') {
    return null;
  }

  return (
    <FirefoxPromoBannerView
      bannerState={bannerState}
      mobileDeviceCount={mobileDeviceCount}
    />
  );
};

export default FirefoxPromoBanner;
