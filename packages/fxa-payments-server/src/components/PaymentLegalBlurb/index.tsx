import React from 'react';
import { Localized } from '@fluent/react';
import * as PaymentProvider from '../../lib/PaymentProvider';
import LinkExternal from 'fxa-react/components/LinkExternal';

const PaypalPaymentLegalBlurb = () => (
  <div className="legal-blurb" data-testid="payment-legal-blurb-component">
    <Localized id="payment-legal-copy-paypal">
      <p className="legal-heading">
        Mozilla uses PayPal for secure payment processing.
      </p>
    </Localized>

    <Localized
      id="payment-legal-link-paypal-2"
      elems={{
        paypalPrivacyLink: (
          <LinkExternal href="https://www.paypal.com/webapps/mpp/ua/privacy-full">
            PayPal privacy policy
          </LinkExternal>
        ),
      }}
    >
      <p>
        <LinkExternal href="https://www.paypal.com/webapps/mpp/ua/privacy-full">
          PayPal privacy policy
        </LinkExternal>
      </p>
    </Localized>
  </div>
);

const StripePaymentLegalBlurb = () => (
  <div className="legal-blurb">
    <Localized id="payment-legal-copy-stripe-2">
      <p className="legal-heading">
        Mozilla uses Stripe for secure payment processing.
      </p>
    </Localized>

    <Localized
      id="payment-legal-link-stripe-3"
      elems={{
        stripePrivacyLink: (
          <LinkExternal href="https://stripe.com/privacy">
            Stripe privacy policy
          </LinkExternal>
        ),
      }}
    >
      <p>
        <LinkExternal href="https://stripe.com/privacy">
          Stripe privacy policy
        </LinkExternal>
      </p>
    </Localized>
  </div>
);

const DefaultPaymentLegalBlurb = () => (
  <div className="legal-blurb">
    <Localized id="payment-legal-copy-stripe-and-paypal-2">
      <p className="legal-heading">
        Mozilla uses Stripe and PayPal for secure payment processing.
      </p>
    </Localized>

    <Localized
      id="payment-legal-link-stripe-paypal"
      elems={{
        stripePrivacyLink: (
          <LinkExternal href="https://stripe.com/privacy">
            Stripe privacy policy
          </LinkExternal>
        ),
        paypalPrivacyLink: (
          <LinkExternal href="https://www.paypal.com/webapps/mpp/ua/privacy-full">
            PayPal privacy policy
          </LinkExternal>
        ),
      }}
    >
      <p>
        <LinkExternal href="https://stripe.com/privacy">
          Stripe privacy policy
        </LinkExternal>{' '}
        &nbsp;{' '}
        <LinkExternal href="https://www.paypal.com/webapps/mpp/ua/privacy-full">
          PayPal privacy policy
        </LinkExternal>
      </p>
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
