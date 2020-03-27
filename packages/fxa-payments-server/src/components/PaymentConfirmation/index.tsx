import React from 'react';
import { Localized } from 'fluent-react';
import { formatCurrencyInCents } from '../../lib/formats';
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
  const { amount, interval } = selectedPlan;
  const { displayName, email } = profile;
  const { brand, last4, subscriptions, billing_name } = customer;
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
          {billing_name ? <p>{billing_name}</p> : null}
          <p>{email}</p>
        </div>
      </div>

      <div className="payment-details">
        <Localized id="payment-confirmation-details-heading">
          <h3></h3>
        </Localized>
        <div className="bottom-row">
          <Localized
            id="payment-confirmation-amount"
            $amount={formatCurrencyInCents(amount)}
            $interval={interval}
          >
            <p></p>
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
            click to download
          </a>
        </Localized>
        <TermsAndPrivacy />
      </div>
    </section>
  );
};

export default PaymentConfirmation;
