import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from '@reach/router';
import { ReactComponent as IconClose } from '@fxa/shared/assets/images/close.svg';
import { FtlMsg } from 'fxa-react/lib/utils';
import GleanMetrics from '../../lib/glean';
import { Constants } from '../../lib/constants';
import keyImage from './key.svg';
import phoneImage from './phone-star-icon.svg';
import { useFtlMsgResolver } from '../../models';
import LinkExternal from 'fxa-react/components/LinkExternal';

const PromoKeys: { [key: string]: string } = {
  'account-recovery-dismissed':
    Constants.DISABLE_PROMO_ACCOUNT_RECOVERY_KEY_BANNER,
  'recovery-phone-dismissed': Constants.DISABLE_PROMO_RECOVERY_PHONE_BANNER,
};

type DismissKey = keyof typeof PromoKeys;

type PromotionBannerProps = {
  image: string;
  ctaText: string;
  heading: string;
  description: string;
  route: string;
  dismissKey: DismissKey;
  metricsKey: string;
  link?: string;
  linkText?: string;
};

export const AccountRecoveryKeyPromoBanner = () => {
  const ftlMsgResolver = useFtlMsgResolver();

  return (
    <PromotionBanner
      image={keyImage}
      ctaText={ftlMsgResolver.getMsg(
        'account-recovery-notification-cta',
        'Create'
      )}
      heading={ftlMsgResolver.getMsg(
        'account-recovery-notification-header-value',
        'Don’t lose your data if you forget your password'
      )}
      description={ftlMsgResolver.getMsg(
        'account-recovery-notification-header-description',
        'Create an account recovery key to restore your sync browsing data if you ever forget your password.'
      )}
      route="/settings/account_recovery"
      dismissKey="account-recovery-dismissed"
      metricsKey="create_recovery_key"
    />
  );
};

export const RecoveryPhonePromoBanner = () => {
  const ftlMsgResolver = useFtlMsgResolver();

  return (
    <PromotionBanner
      image={phoneImage}
      ctaText={ftlMsgResolver.getMsg(
        'recovery-phone-promo-cta',
        'Add recovery phone'
      )}
      heading={ftlMsgResolver.getMsg(
        'recovery-phone-promo-heading',
        'Add extra protection to your account with a recovery phone'
      )}
      description={ftlMsgResolver.getMsg(
        'recovery-phone-promo-description',
        'Now you can sign in with a one-time-password via SMS if you can’t use your two-step authenticator app.'
      )}
      route="/settings/recovery_phone/setup"
      dismissKey="recovery-phone-dismissed"
      metricsKey="add_recovery_phone"
      link="https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication"
      linkText={ftlMsgResolver.getMsg(
        'recovery-phone-promo-info-link',
        'Learn more about recovery and SIM swap risk'
      )}
    />
  );
};

const PromotionBanner = ({
  image,
  ctaText,
  heading,
  description,
  dismissKey,
  route,
  metricsKey,
  link,
  linkText,
}: PromotionBannerProps) => {
  const location = useLocation();
  // This value is used to animate the banner out of view when the user dismisses it.
  const [isClosing, setIsClosing] = useState(false);
  const sentMetric = useRef(false);

  const storageKey = PromoKeys[dismissKey];

  // Parent determines if the banner should be rendered, including check for dismissed status in local storage
  // We start out visible by default
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    if (visible && !sentMetric.current) {
      // We have to manually emit the custom view event here because the promo banner is not a page
      switch (metricsKey) {
        case 'add_recovery_phone':
          GleanMetrics?.accountBanner?.addRecoveryPhoneView();
          break;
        case 'create_recovery_key':
          GleanMetrics?.accountBanner?.createRecoveryKeyView();
          break;
        default:
          break;
      }
    }
  }, [metricsKey, visible]);

  const showLink = !!(link && linkText);

  return !visible ? null : (
    // transparent border is for Window high-contrast mode
    <div
      className={`relative flex flex-col tablet:flex-row rounded-lg bg-gradient-to-tr from-blue-600/10 to-purple-500/10
         transition-transform border border-transparent duration-300 ease-in-out p-2 tablet:p-3 ${
           isClosing ? 'translate-x-full' : 'translate-x-0'
         }`}
    >
      <FtlMsg id="promo-banner-dismiss-button" attrs={{ ariaLabel: true }}>
        <button
          type="button"
          aria-label="Dismiss banner"
          data-testid={`close-${dismissKey}`}
          onClick={() => {
            if (storageKey) localStorage.setItem(storageKey, 'true');
            setIsClosing(true);
            setTimeout(() => setVisible(false), 300);
          }}
          className="self-end absolute top-1 end-1 p-2"
          data-glean-id={`account_banner_${metricsKey}_dismiss`}
        >
          <IconClose className="text-black w-4 h-4" role="img" />
        </button>
      </FtlMsg>
      <div className="flex flex-col tablet:flex-row tablet:items-center grow gap-4 p-4">
        <div className="flex flex-row mobileLandscape:flex-col tablet:flex-row tablet:items-center grow gap-4">
          {image && (
            <img
              src={image}
              alt=""
              className="max-w-16 max-h-12 mobileLandscape:self-center mobileLandscape:w-32 mobileLandscape:max-h-24"
            />
          )}
          <div className="flex flex-col text-sm">
            <p className="font-bold">{heading}</p>
            <p>{description}</p>
            {showLink && (
              <LinkExternal href={link} className="link-grey">
                {linkText}
              </LinkExternal>
            )}
          </div>
        </div>

        <Link
          className="cta-neutral cta-base cta-base-p text-sm text-base tablet:self-center transition-standard mt-0"
          to={`${route}${location.search ? location.search : ''}`}
          data-testid={`submit_${metricsKey}`}
          data-glean-id={`account_banner_${metricsKey}_submit`}
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
};

export default PromotionBanner;
