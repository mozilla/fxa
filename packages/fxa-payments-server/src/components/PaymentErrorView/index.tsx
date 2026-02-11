import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Localized } from '@fluent/react';
import { StripeError } from '@stripe/stripe-js';

import {
  getErrorMessageId,
  GeneralError,
  getFallbackTextByFluentId,
} from '../../lib/errors';
import errorIcon from '../../images/error.svg';
import SubscriptionTitle, { SubscriptionTitleType } from '../SubscriptionTitle';
import TermsAndPrivacy from '../TermsAndPrivacy';

import './index.scss';
import { Plan } from '../../store/types';
import PaymentLegalBlurb from '../PaymentLegalBlurb';
import AppContext from '../../lib/AppContext';
import LinkExternal from 'fxa-react/components/LinkExternal';

export type PaymentErrorViewProps = {
  actionFn: VoidFunction;
  plan: Plan;
  error?: StripeError | GeneralError;
  className?: string;
  subscriptionTitle?: React.ReactElement<SubscriptionTitleType>;
  showFxaLegalFooterLinks?: boolean;
  contentProps?: { [key: string]: unknown };
};

const retryButtonFn = (onRetry: PaymentErrorViewProps['actionFn']) =>
  onRetry && (
    <Localized id="payment-error-retry-button">
      <button
        data-testid="retry-link"
        className="button primary-button mb-10"
        onClick={() => onRetry()}
      >
        Try again
      </button>
    </Localized>
  );

const manageSubButtonFn = (onClick: VoidFunction) => {
  return (
    <Localized id="payment-error-manage-subscription-button">
      <button
        data-testid="manage-subscription-link"
        className="button primary-button mb-10"
        onClick={onClick}
      >
        Manage my subscription
      </button>
    </Localized>
  );
};

const iapStopUpgradeSubButtonFn = () => {
  return (
    <LinkExternal
      data-testid="iap-upgrade-get-help-button"
      className="button primary-button mb-10"
      href="https://support.mozilla.org/kb/upgrade-error"
    >
      <Localized id="iap-upgrade-get-help-button">Get help</Localized>
    </LinkExternal>
  );
};

export const PaymentErrorView = ({
  actionFn,
  plan,
  error,
  className = '',
  subscriptionTitle,
  showFxaLegalFooterLinks = false,
  contentProps = {},
}: PaymentErrorViewProps) => {
  const navigate = useNavigate();
  const { config } = useContext(AppContext);

  // We want the button label and onClick handler to be different depending
  // on the type of error
  const ActionButton = () => {
    switch (error?.code) {
      case 'no_subscription_change':
        return manageSubButtonFn(() => navigate('/subscriptions'));
      case 'iap_already_subscribed':
        return manageSubButtonFn(actionFn);
      case 'iap_upgrade_contact_support':
        return iapStopUpgradeSubButtonFn();
      default:
        return retryButtonFn(actionFn);
    }
  };

  // We want to know which layout to display
  const screenType = () => {
    switch (error?.code) {
      case 'iap_upgrade_contact_support':
        return 'iaperrorupgrade';
      case 'iap_already_subscribed':
      default:
        return 'error';
    }
  };

  const title = subscriptionTitle ?? (
    <SubscriptionTitle screenType={screenType()} className={className} />
  );

  const productName = plan.product_name;

  // Returns an array of localized errors, opening the door for multiline
  // without having to retranslate whole blocks for one word or one line changes.
  // Currently hardcodes l10n ids for iap subscription upgrade roadblock error
  // as per https://mozilla-hub.atlassian.net/browse/FXA-5480 (full refactor out of scope)
  // Issue filed to refactor and dynamically add ids: https://mozilla-hub.atlassian.net/browse/FXA-6100
  const PaymentErrorMessage = () => {
    const l10nIds: string[] = [];
    const errorMessage: any[] = [];

    getErrorMessageId(error) === 'iap-upgrade-contact-support'
      ? l10nIds.push(
          'iap-upgrade-already-subscribed-2',
          'iap-upgrade-no-bundle-support',
          'iap-upgrade-contact-support'
        )
      : l10nIds.push(getErrorMessageId(error));

    for (const [idx, l10nId] of l10nIds.entries()) {
      errorMessage.push(
        <Localized
          key={idx}
          id={l10nId}
          vars={{ productName, ...contentProps }}
        >
          <p className="mb-4" data-testid="error-payment-submission">
            {getFallbackTextByFluentId(l10nId)}
          </p>
        </Localized>
      );
    }

    return (
      <div className="py-0 px-7 text-grey-400 desktop:px-24">
        {errorMessage}
      </div>
    );
  };

  return error ? (
    <>
      {title}
      <section
        className={`payment-error tablet:mt-0 ${className}`}
        data-testid="payment-error"
      >
        <div className="wrapper mb-12">
          <img className="mt-16 mb-10 mx-auto" src={errorIcon} alt="" />
          <PaymentErrorMessage />
        </div>

        {/* This error code means the subscription was created successfully, but
          there was an error loading the information on the success screen. In this
          case, we do not want a "Try again" or "Manage subscription" button. */}
        {error.code !== 'fxa_fetch_profile_customer_error' &&
          error.code !== 'location_unsupported' && (
            <div className="options mb-6" data-testid="options">
              <ActionButton data-testid={'error-view-action-button'} />
            </div>
          )}

        <div className="payment-footer" data-testid="footer">
          <PaymentLegalBlurb provider={undefined} />
          <TermsAndPrivacy
            showFXALinks={showFxaLegalFooterLinks}
            plan={plan}
            contentServerURL={config.servers.content.url}
          />
        </div>
      </section>
    </>
  ) : null;
};

export default PaymentErrorView;
