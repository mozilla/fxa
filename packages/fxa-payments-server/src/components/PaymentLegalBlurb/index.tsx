import React from 'react';
import { Localized } from 'fluent-react';

import './index.scss';

export const PaymentLegalBlurb = () => (
  <div className="payment-legal-blurb">
    <Localized id="payment-legal-copy">
      <p>Mozilla uses Stripe for secure payment processing.</p>
    </Localized>

    <Localized
      id="payment-legal-link"
      a={
        <a
          href="https://stripe.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        ></a>
      }
    >
      <p>
        View the <a>Stripe privacy policy</a>.
      </p>
    </Localized>
  </div>
);

export default PaymentLegalBlurb;
