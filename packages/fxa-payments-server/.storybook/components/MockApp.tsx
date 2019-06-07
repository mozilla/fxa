import React, { useEffect, useMemo, ReactNode } from 'react';
import { StripeProvider } from 'react-stripe-elements';
import { MockLoader } from './MockLoader';
import { AppContext, AppContextType } from '../../src/lib/AppContext';

declare global {
  interface Window {
    Stripe: stripe.StripeStatic;
  }
}

type MockAppProps = {
  children: ReactNode,
  appContextValue?: AppContextType,
  stripeApiKey?: string,
  applyStubsToStripe?: (orig: stripe.Stripe) => stripe.Stripe,
}

export const defaultAppContextValue = {
  accessToken: 'at_12345',
  config: {},
  queryParams: {},
};

export const defaultStripeStubs = (stripe: stripe.Stripe) => {
  stripe.createToken = (element: stripe.elements.Element | string) => {
    return Promise.resolve({
      token: {
        id: 'asdf',
        object: 'mock_object',
        client_ip: '123.123.123.123',
        created: Date.now(),
        livemode: false,
        type: 'card',
        used: false,
      }
    });
  }
  return stripe;
};

export const MockApp = ({
  children,
  stripeApiKey = '8675309',
  applyStubsToStripe = defaultStripeStubs,
  appContextValue = defaultAppContextValue,
}: MockAppProps) => {
  const mockStripe = useMemo<stripe.Stripe>(
    () => applyStubsToStripe(window.Stripe(stripeApiKey)),
    [ stripeApiKey, applyStubsToStripe ]
  );

  // HACK: Set attributes on <html> dynamically because it's very hard to
  // customize the template in Storybook
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('lang', 'en');
    el.setAttribute('dir', 'ltr');
    el.setAttribute('class', 'js no-touch no-reveal-pw getusermedia');
  }, []);

  return (
    <StripeProvider stripe={mockStripe}>
      <AppContext.Provider value={appContextValue}>
        <MockLoader>
          {children}
        </MockLoader>
      </AppContext.Provider>
    </StripeProvider>
  );
};

export default MockApp;
