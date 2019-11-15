import React from 'react';

import './index.scss';

export const PaymentLegalBlurb = () => (
  <div className="payment-legal-blurb">
    <p>Mozilla uses Stripe for secure payment processing.</p>
    <p>
      View the{' '}
      <a
        href="https://stripe.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
      >
        Stripe privacy policy
      </a>
      .
    </p>
  </div>
);

export default PaymentLegalBlurb;
