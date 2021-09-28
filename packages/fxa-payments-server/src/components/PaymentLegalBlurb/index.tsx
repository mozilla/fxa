import React from 'react';
import { Localized } from '@fluent/react';

import * as PaymentProvider from '../../lib/PaymentProvider';

import './index.scss';

function getPrivacyLinkText(): string {
  return '<stripePrivacyLink>Stripe privacy policy</stripePrivacyLink> <paypalPrivacyLink>Paypal privacy policy</paypalPrivacyLink>';
}

function getPaypalPrivacyLinkText(): string {
  return '<paypalPrivacyLink>Paypal privacy policy</paypalPrivacyLink>';
}

function getStripePrivacyLinkText(): string {
  return '<stripePrivacyLink>Stripe privacy policy</stripePrivacyLink>';
}

const PaypalPaymentLegalBlurb = () => (
  <div
    className="payment-legal-blurb"
    data-testid="payment-legal-blurb-component"
  >
    <Localized id="payment-legal-copy-paypal">
      <p>Mozilla uses Paypal for secure payment processing.</p>
    </Localized>

    <Localized
      id="payment-legal-link-paypal-2"
      elems={{
        paypalPrivacyLink: (
          <a
            href="https://www.paypal.com/webapps/mpp/ua/privacy-full"
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

const StripePaymentLegalBlurb = () => (
  <div className="payment-legal-blurb">
    <Localized id="payment-legal-copy-stripe-2">
      <p>Mozilla uses Stripe for secure payment processing.</p>
    </Localized>

    <Localized
      id="payment-legal-link-stripe-3"
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

const DefaultPaymentLegalBlurb = () => (
  <div className="payment-legal-blurb">
    <Localized id="payment-legal-copy-stripe-and-paypal-2">
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
            href="https://www.paypal.com/webapps/mpp/ua/privacy-full"
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

export type PaymentLegalBlurbProps = {
  provider: PaymentProvider.PaymentProvider | undefined;
};

export const PaymentLegalBlurb = ({ provider }: PaymentLegalBlurbProps) => {
  return (
    (PaymentProvider.isPaypal(provider) && <PaypalPaymentLegalBlurb />) ||
    (PaymentProvider.isStripe(provider) && <StripePaymentLegalBlurb />) || (
      <DefaultPaymentLegalBlurb />
    )
  );
};

export default PaymentLegalBlurb;
