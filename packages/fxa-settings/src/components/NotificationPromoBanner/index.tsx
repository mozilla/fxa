import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { ReactComponent as IconClose } from '@fxa/shared/assets/images/close.svg';
import { FtlMsg } from 'fxa-react/lib/utils';
import GleanMetrics from '../../lib/glean';

type NotificationPromoBannerProps = {
  headerImage: string;
  ctaText: string;
  headerValue: string;
  headerDescription: string;
  route: string;
  dismissKey: string;
  metricsKey: string;
  isVisible: boolean;
};

const NotificationPromoBanner = ({
  headerImage,
  ctaText,
  headerValue,
  headerDescription,
  dismissKey,
  isVisible,
  route,
  metricsKey,
}: NotificationPromoBannerProps & RouteComponentProps) => {
  const location = useLocation();

  // The visibility state of the banner should be determined by the parent component
  // since it knows if the user has already enabled the feature being promoted.
  const [visible, setVisible] = useState(isVisible);

  // This value is used to animate the banner out of view when the user dismisses it.
  const [isClosing, setIsClosing] = useState(false);

  const notificationBannerClosedLocalStorageKey = `__fxa_storage.fxa_disable_notification_banner.${dismissKey}`;

  const [bannerClosed] = useState<string | null>(
    localStorage.getItem(notificationBannerClosedLocalStorageKey)
  );

  useEffect(() => {
    if (visible || bannerClosed === 'false') {
      // We have to manually emit the custom view event here because the promo banner is not a page
      GleanMetrics.accountBanner.createRecoveryKeyView();
    }
  }, [visible, bannerClosed]);

  if (!visible || bannerClosed === 'true') return null;

  return (
    <div
      className={`relative flex justify-between items-center rounded-lg bg-gradient-to-tr from-blue-600/10 to-purple-500/10 p-3 shadow-md space-x-4 mb-5 transition-transform duration-300 ease-in-out ${
        isClosing ? 'translate-x-full' : 'translate-x-0'
      }`}
    >
      <FtlMsg id="banner-dismiss-button" attrs={{ ariaLabel: true }}>
        <button
          type="button"
          aria-label="Close"
          data-testid="close-account-recovery-dismissed"
          onClick={() => {
            localStorage.setItem(
              notificationBannerClosedLocalStorageKey,
              'true'
            );
            setIsClosing(true);
            setTimeout(() => setVisible(false), 300);
          }}
          className="absolute top-3 end-3"
          data-glean-id={`account_banner_${metricsKey}_dismiss`}
        >
          <IconClose className="text-black w-3 h-3" role="img" />
        </button>
      </FtlMsg>
      <div className="flex-shrink-0 items-center justify-center p-4">
        {headerImage && (
          <img src={headerImage} alt="Key Icon" className="w-8 h-8" />
        )}
      </div>

      <div className="flex-grow">
        <p className="font-bold text-black mb-2">{headerValue}</p>
        <p className="text-sm leading-relaxed">{headerDescription}</p>
      </div>

      <div className="flex-shrink-0">
        <Link
          className="cta-neutral cta-base cta-base-p transition-standard me-8"
          to={`${route}${location.search}`}
          data-glean-id={`account_banner_${metricsKey}_submit`}
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
};

export default NotificationPromoBanner;
