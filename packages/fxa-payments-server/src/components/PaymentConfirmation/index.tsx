import React from 'react';
import { Localized } from '@fluent/react';
import { getLocalizedCurrency, formatPlanPricing } from '../../lib/formats';
import { Plan, Profile, Customer } from '../../store/types';
import { TermsAndPrivacy } from '../TermsAndPrivacy';

import circledCheckbox from './images/circled-confirm.svg';

import './index.scss';

type PaymentConfirmationProps = {
  customer: Customer;
  profile: Profile;
  selectedPlan: Plan;
  productUrl: string;
  className?: string;
};

export const PaymentConfirmation = ({
  customer,
  profile,
  selectedPlan,
  productUrl,
  className = 'default',
}: PaymentConfirmationProps) => {
  const { amount, currency, interval, interval_count } = selectedPlan;
  const { displayName, email } = profile;
  const { brand, last4, subscriptions } = customer;
  const invoiceNumber = subscriptions[0].latest_invoice;
  const date = new Date().toLocaleDateString(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const heading = displayName ? (
    <Localized id="payment-confirmation-heading" $displayName={displayName}>
      <h2></h2>
    </Localized>
  ) : (
    <Localized id="payment-confirmation-heading-bak">
      <h2></h2>
    </Localized>
  );

  const planPrice = formatPlanPricing(
    amount,
    currency,
    interval,
    interval_count
  );

  return (
    <section className={`container card payment-confirmation ${className}`}>
      <header>
        <img src={circledCheckbox} alt="circled checkbox" />
        {heading}
        <Localized id="payment-confirmation-subheading">
          <p></p>
        </Localized>
        <p>{email}</p>
      </header>

      <div className="order-details">
        <Localized id="payment-confirmation-order-heading">
          <h3></h3>
        </Localized>
        <div className="bottom-row">
          <Localized
            id="payment-confirmation-invoice-number"
            $invoiceNumber={invoiceNumber}
          >
            <p></p>
          </Localized>
          <p>{date}</p>
        </div>
      </div>

      <div className="billing-info">
        <Localized id="payment-confirmation-billing-heading">
          <h3></h3>
        </Localized>
        <div className="bottom-row">
          {displayName ? <p>{displayName}</p> : null}
          <p>{email}</p>
        </div>
      </div>

      <div className="payment-details">
        <Localized id="payment-confirmation-details-heading">
          <h3></h3>
        </Localized>
        <div className="bottom-row">
          <Localized
            id={`payment-confirmation-amount-${interval}`}
            $amount={getLocalizedCurrency(amount, currency)}
            $intervalCount={interval_count}
          >
            <p>{planPrice}</p>
          </Localized>
          <Localized id="payment-confirmation-cc-preview" $last4={last4}>
            <p className={`c-card ${brand.toLowerCase()}`}></p>
          </Localized>
        </div>
      </div>

      <div className="footer" data-testid="footer">
        <Localized id="payment-confirmation-download-button">
          <a
            data-testid="download-link"
            className="button download-link"
            href={productUrl}
          >
            Continue to download
          </a>
        </Localized>
        <TermsAndPrivacy />
      </div>
    </section>
  );
};

export default PaymentConfirmation;
