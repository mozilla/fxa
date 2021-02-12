import React from 'react';
import { Localized } from '@fluent/react';

import './index.scss';

function getPrivacyLinkText(): string {
  return 'View the <stripePrivacyLink>Stripe privacy policy</stripePrivacyLink> and <paypalPrivacyLink>Paypal privacy policy</paypalPrivacyLink>.';
}

export const PaymentLegalBlurb = () => (
  <div className="payment-legal-blurb">
    <Localized id="payment-legal-copy-stripe-paypal">
      <p>Mozilla uses Stripe and Paypal for secure payment processing.</p>
    </Localized>

    <Localized
      id="payment-legal-link-stripe-paypal"
      elems={{
        stripePrivacyLink: (
          <a
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          ></a>
        ),
        paypalPrivacyLink: (
          <a
            href="https://paypal.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          ></a>
        ),
      }}
    >
      <p>{getPrivacyLinkText()}</p>
    </Localized>
  </div>
);

export default PaymentLegalBlurb;
