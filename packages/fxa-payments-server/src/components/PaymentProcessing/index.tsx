import React from 'react';
import { Localized } from '@fluent/react';

import * as Provider from '../../lib/PaymentProvider';
import { LoadingSpinner } from '../LoadingSpinner';
import SubscriptionTitle from '../SubscriptionTitle';
import {
  PaypalPaymentLegalBlurb,
  StripePaymentLegalBlurb,
} from '../PaymentLegalBlurb';

import './index.scss';

export type PaymentProcessingProps = {
  provider: 'stripe' | 'paypal';
  className?: string;
};

export const PaymentProcessing = ({
  provider,
  className = '',
}: PaymentProcessingProps) => {
  return (
    <>
      <SubscriptionTitle screenType="processing" className={className} />
      <section
        className={`container card payment-processing ${className}`}
        data-testid="payment-processing"
      >
        <div className="wrapper">
          <LoadingSpinner />
          <Localized id="payment-processing-message">
            <p>Please wait while we process your payment...</p>
          </Localized>
        </div>

        <div className="footer" data-testid="footer">
          {Provider.isPaypal(provider) && <PaypalPaymentLegalBlurb />}
          {Provider.isStripe(provider) && <StripePaymentLegalBlurb />}
        </div>
      </section>
    </>
  );
};

export default PaymentProcessing;
