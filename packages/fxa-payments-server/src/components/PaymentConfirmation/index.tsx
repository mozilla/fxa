import React, { useContext } from 'react';
import { Localized, useLocalization } from '@fluent/react';
import { getLocalizedCurrency, formatPlanPricing } from '../../lib/formats';
import { Plan, Profile, Customer } from '../../store/types';
import { PaymentProviderDetails } from '../PaymentProviderDetails';
import SubscriptionTitle from '../SubscriptionTitle';
import { TermsAndPrivacy } from '../TermsAndPrivacy';
import PaymentLegalBlurb from '../PaymentLegalBlurb';

import circledCheckbox from './images/circled-confirm.svg';
import emailSentIcon from './images/email-sent.svg';
import checkmarkIcon from './images/checkmark.svg';

import './index.scss';
import { productDetailsFromPlan } from 'fxa-shared/subscriptions/metadata';
import { AppContext } from '../../lib/AppContext';
import { WebSubscription } from 'fxa-shared/subscriptions/types';
import { Coupon } from '../../lib/Coupon';

type PaymentConfirmationProps = {
  customer: Customer;
  profile: Profile;
  selectedPlan: Plan;
  productUrl: string;
  className?: string;
  accountExists?: boolean;
  coupon?: Coupon;
};

export const PaymentConfirmation = ({
  customer,
  profile,
  selectedPlan,
  productUrl,
  className = 'default',
  accountExists = true,
  coupon,
}: PaymentConfirmationProps) => {
  const { config, navigatorLanguages } = useContext(AppContext);
  const { amount, currency, interval, interval_count, product_name } =
    selectedPlan;
  const { displayName, email } = profile;

  const { payment_provider, subscriptions } = customer;

  const buttonLabel = productDetailsFromPlan(
    selectedPlan,
    navigatorLanguages
  ).successActionButtonLabel;

  const invoiceNumber = (subscriptions[0] as WebSubscription).latest_invoice;
  const date = new Date().toLocaleDateString(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const finalAmount = coupon && amount ? amount - coupon.amount : amount;
  const planPrice = formatPlanPricing(
    finalAmount,
    currency,
    interval,
    interval_count
  );

  const { l10n } = useLocalization();
  const downloadUrl: URL = new URL(productUrl);
  downloadUrl.searchParams.append('email', email);

  return (
    <>
      <SubscriptionTitle screenType="success" />
      <section
        className={`container card payment-confirmation ${className}`}
        data-testid="payment-confirmation"
      >
        <header>
          {accountExists ? (
            <>
              <img
                className="circled-check"
                src={circledCheckbox}
                alt="circled checkbox"
              />
              <Localized id="payment-confirmation-thanks-heading">
                <h2>Thank you!</h2>
              </Localized>
              <Localized
                id="payment-confirmation-thanks-subheading"
                vars={{ email, product_name }}
              >
                <p>{`A confirmation email has been sent to ${email} with details on how to get started with ${product_name}.`}</p>
              </Localized>
            </>
          ) : (
            <>
              <img src={checkmarkIcon} alt="checkmark icon" />
              <img
                className="email-sent-icon"
                src={emailSentIcon}
                alt="email sent icon"
              />
              <Localized id="payment-confirmation-thanks-heading-account-exists">
                <h2>Thanks, now check your email!</h2>
              </Localized>
              <Localized
                id="payment-confirmation-thanks-subheading-account-exists"
                vars={{ email }}
              >
                <p>{`You'll receive an email at ${email} with instructions for setting up your account as well as  your payment details.`}</p>
              </Localized>
            </>
          )}
        </header>

        <div className="order-details">
          <Localized id="payment-confirmation-order-heading">
            <h3>Order details</h3>
          </Localized>
          <div className="bottom-row">
            <Localized
              id="payment-confirmation-invoice-number"
              vars={{ invoiceNumber }}
            >
              <p></p>
            </Localized>
            <p>{date}</p>
          </div>
        </div>

        <div className="payment-details">
          <Localized id="payment-confirmation-details-heading-2">
            <h3>Payment information</h3>
          </Localized>
          <div className="bottom-row">
            <Localized
              id={`payment-confirmation-amount-${interval}`}
              vars={{
                amount: getLocalizedCurrency(finalAmount, currency),
                intervalCount: interval_count,
              }}
            >
              <p data-testid="plan-price">{planPrice}</p>
            </Localized>

            <PaymentProviderDetails customer={customer} />
          </div>
        </div>

        {accountExists && (
          <div className="options" data-testid="options">
            <a
              data-testid="download-link"
              className="button download-link"
              href={downloadUrl.href}
            >
              {buttonLabel ||
                l10n.getString(
                  'payment-confirmation-download-button',
                  null,
                  'Continue to download'
                )}
            </a>
          </div>
        )}

        <div className="footer" data-testid="footer">
          <PaymentLegalBlurb provider={payment_provider} />
          <TermsAndPrivacy
            plan={selectedPlan}
            showFXALinks={!accountExists}
            contentServerURL={config.servers.content.url}
          />
        </div>
      </section>
    </>
  );
};

export default PaymentConfirmation;
