import React from 'react';
import { useHistory } from 'react-router-dom';
import { Localized } from '@fluent/react';
import { StripeError } from '@stripe/stripe-js';

import { getErrorMessage, GeneralError } from '../../lib/errors';
import errorIcon from './error.svg';
import SubscriptionTitle from '../SubscriptionTitle';
import TermsAndPrivacy from '../TermsAndPrivacy';

import './index.scss';

export type PaymentErrorViewProps = {
  onRetry: Function;
  error?: StripeError | GeneralError;
  className?: string;
};

export const PaymentErrorView = ({
  onRetry,
  error,
  className = '',
}: PaymentErrorViewProps) => {
  const history = useHistory();

  // We want the button label and onClick handler to be different depending
  // on the type of error
  const ActionButton = () => {
    return error?.code === 'returning_paypal_customer_error' ? (
      <Localized id="payment-error-manage-subscription-button">
        <button
          data-testid="manage-subscription-link"
          className="button"
          onClick={() => history.push('/subscriptions')}
        >
          Manage my subscription
        </button>
      </Localized>
    ) : (
      <Localized id="payment-error-retry-button">
        <button
          data-testid="retry-link"
          className="button retry-link"
          onClick={() => onRetry()}
        >
          Try again
        </button>
      </Localized>
    );
  };

  return error ? (
    <>
      <SubscriptionTitle screenType="error" className={className} />
      <section
        className={`container card payment-error ${className}`}
        data-testid="payment-error"
      >
        <div className="wrapper">
          <img id="error-icon" src={errorIcon} alt="error icon" />
          <div>
            <Localized id={getErrorMessage(error)}>
              <p data-testid="error-payment-submission">
                {getErrorMessage(error)}
              </p>
            </Localized>
          </div>
        </div>

        <div className="footer" data-testid="footer">
          <ActionButton />
          <TermsAndPrivacy />
        </div>
      </section>
    </>
  ) : null;
};

export default PaymentErrorView;
