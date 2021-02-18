import React from 'react';
import { Localized } from '@fluent/react';
import { Customer } from '../../store/types';
import * as Provider from '../../lib/PaymentProvider';

import './index.scss';

type PaymentProviderDetailsProps = {
  customer: Customer;
};

export const PaymentProviderDetails = ({
  customer,
}: PaymentProviderDetailsProps) => {
  const { brand, last4, payment_provider } = customer;

  return (
    <>
      {Provider.isStripe(payment_provider) && brand && last4 && (
        <Localized id="payment-confirmation-cc-preview" vars={{ last4 }}>
          <p
            data-testid="card-logo-and-last-four"
            className={`c-card ${brand.toLowerCase()}`}
          ></p>
        </Localized>
      )}
      {Provider.isPaypal(payment_provider) && (
        <div className="paypal-logo" data-testid="paypal-logo">
          {payment_provider}
        </div>
      )}
    </>
  );
};

export default PaymentProviderDetails;
