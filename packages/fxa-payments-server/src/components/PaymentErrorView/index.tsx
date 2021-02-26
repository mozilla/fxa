import React from 'react';
import { Localized } from '@fluent/react';

import errorIcon from '../../images/error.svg';
import SubscriptionTitle from '../SubscriptionTitle';

import './index.scss';

export type PaymentErrorViewProps = {
  error: any;
  onRetry: Function;
  className?: string;
};

export const PaymentErrorView = ({
  error,
  onRetry,
  className = '',
}: PaymentErrorViewProps) => {
  return (
    <>
      <SubscriptionTitle screenType="error" className={className} />
      <section
        className={`container card payment-error ${className}`}
        data-testid="payment-error"
      >
        <div className="wrapper">
          <img id="error-icon" src={errorIcon} alt="error icon" />
          <div>
            <Localized id="payment-error-message">
              <p>
                An unexpected error has occured while processing your payment,
                please try again.
              </p>
            </Localized>
          </div>
        </div>

        <div className="footer" data-testid="footer">
          <Localized id="payment-error-retry-button">
            <button
              data-testid="retry-link"
              className="button retry-link"
              onClick={() => onRetry()}
            >
              Try Again
            </button>
          </Localized>
        </div>
      </section>
    </>
  );
};

export default PaymentErrorView;
