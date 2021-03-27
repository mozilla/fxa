import React from 'react';
import { Localized } from '@fluent/react';
import * as Provider from '../../lib/PaymentProvider';
import { getLocalizedCurrency, formatPlanPricing } from '../../lib/formats';
import { Plan, Profile, Customer } from '../../store/types';
import { PaymentProviderDetails } from '../PaymentProviderDetails';
import SubscriptionTitle from '../SubscriptionTitle';
import { TermsAndPrivacy } from '../TermsAndPrivacy';
import PaymentLegalBlurb from '../PaymentLegalBlurb';

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
  const {
    amount,
    currency,
    interval,
    interval_count,
    product_name,
  } = selectedPlan;
  const { displayName, email } = profile;

  const { payment_provider, subscriptions } = customer;

  const invoiceNumber = subscriptions[0].latest_invoice;
  const date = new Date().toLocaleDateString(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const planPrice = formatPlanPricing(
    amount,
    currency,
    interval,
    interval_count
  );

  return (
    <>
      <SubscriptionTitle screenType="success" />
      <section
        className={`container card payment-confirmation ${className}`}
        data-testid="payment-confirmation"
      >
        <header>
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

        {Provider.isStripe(payment_provider) && (
          <div className="billing-info" data-testid="billing-info">
            <Localized id="payment-confirmation-billing-heading">
              <h3>Billed to</h3>
            </Localized>
            <div className="bottom-row">
              {displayName ? <p>{displayName}</p> : null}
              <p>{email}</p>
            </div>
          </div>
        )}

        <div className="payment-details">
          <Localized id="payment-confirmation-details-heading">
            <h3>Payment details</h3>
          </Localized>
          <div className="bottom-row">
            <Localized
              id={`payment-confirmation-amount-${interval}`}
              vars={{
                amount: getLocalizedCurrency(amount, currency),
                intervalCount: interval_count,
              }}
            >
              <p>{planPrice}</p>
            </Localized>

            <PaymentProviderDetails customer={customer} />
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
          <PaymentLegalBlurb provider={payment_provider} />
          <TermsAndPrivacy plan={selectedPlan} />
        </div>
      </section>
    </>
  );
};

export default PaymentConfirmation;
