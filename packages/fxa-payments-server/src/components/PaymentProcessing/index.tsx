import React from 'react';
import { Localized } from '@fluent/react';

import { LoadingSpinner } from '../LoadingSpinner';
import SubscriptionTitle from '../SubscriptionTitle';
import PaymentLegalBlurb from '../PaymentLegalBlurb';
import { PaymentProvider } from 'fxa-payments-server/src/lib/PaymentProvider';

import './index.scss';

export type PaymentProcessingProps = {
  provider?: PaymentProvider;
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
        className={`payment-processing flex flex-col mx-4 ${className}`}
        data-testid="payment-processing"
      >
        <div className="flex flex-col text-center">
          <LoadingSpinner />
          <Localized id="payment-processing-message">
            <p>Please wait while we process your payment...</p>
          </Localized>
        </div>

        <div
          className="border-0 flex flex-col justify-center mt-auto pt-16"
          data-testid="footer"
        >
          <PaymentLegalBlurb provider={provider} />
        </div>
      </section>
    </>
  );
};

export default PaymentProcessing;
