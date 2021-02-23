import React from 'react';
import { Localized } from '@fluent/react';

import { LoadingSpinner } from '../LoadingSpinner';

import './index.scss';

export type PaymentProcessingProps = {
  className?: string;
};

export const PaymentProcessing = ({
  className = '',
}: PaymentProcessingProps) => {
  return (
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
    </section>
  );
};

export default PaymentProcessing;
