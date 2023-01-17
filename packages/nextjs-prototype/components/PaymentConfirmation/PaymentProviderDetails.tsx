import React from 'react';
import { Localized } from '@fluent/react';
import { isPaypal, isStripe, PaymentProvider } from '../../lib/paymentProvider';

type PaymentProviderDetailsProps = {
  paymentProvider: PaymentProvider;
  brand?: string;
  last4?: string;
};

export default function PaymentProviderDetails({
  brand,
  last4,
  paymentProvider,
}: PaymentProviderDetailsProps) {
  return (
    <>
      {isStripe(paymentProvider) && brand && last4 && (
        <Localized id="payment-confirmation-cc-card-ending-in" vars={{ last4 }}>
          <p
            data-testid="card-logo-and-last-four"
            className={`c-card ${brand.toLowerCase()}`}
          >{`Card ending in ${last4}`}</p>
        </Localized>
      )}
      {isPaypal(paymentProvider) && (
        <div className="paypal-logo" data-testid="paypal-logo">
          {paymentProvider}
        </div>
      )}
    </>
  );
}
