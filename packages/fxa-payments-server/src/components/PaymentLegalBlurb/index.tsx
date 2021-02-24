import React from 'react';
import { Localized } from '@fluent/react';

import './index.scss';

function getPrivacyLinkText(): string {
  return 'View the <stripePrivacyLink>Stripe privacy policy</stripePrivacyLink> and <paypalPrivacyLink>Paypal privacy policy</paypalPrivacyLink>.';
}

function getPaypalPrivacyLinkText(): string {
  return 'View the <paypalPrivacyLink>Paypal privacy policy</paypalPrivacyLink>.';
}

function getStripePrivacyLinkText(): string {
  return 'View the <stripePrivacyLink>Stripe privacy policy</stripePrivacyLink>.';
}

export const PaypalPaymentLegalBlurb = () => (
  <div className="payment-legal-blurb">
    <Localized id="payment-legal-copy-paypal">
      <p>Mozilla uses Paypal for secure payment processing.</p>
    </Localized>

    <Localized
      id="payment-legal-link-paypal"
      elems={{
        paypalPrivacyLink: (
          <a
            href="https://paypal.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          ></a>
        ),
      }}
    >
      <p>{getPaypalPrivacyLinkText()}</p>
    </Localized>
  </div>
);

export const StripePaymentLegalBlurb = () => (
  <div className="payment-legal-blurb">
    <Localized id="payment-legal-copy-stripe">
      <p>Mozilla uses Stripe for secure payment processing.</p>
    </Localized>

    <Localized
      id="payment-legal-link-stripe"
      elems={{
        stripePrivacyLink: (
          <a
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          ></a>
        ),
      }}
    >
      <p>{getStripePrivacyLinkText()}</p>
    </Localized>
  </div>
);

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
