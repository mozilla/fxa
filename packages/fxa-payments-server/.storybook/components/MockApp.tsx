import React, { useEffect, ReactNode } from 'react';
import config from '../../src/lib/config';
import { StripeProvider } from 'react-stripe-elements';
import { MockLoader } from './MockLoader';

type MockAppProps = {
  children: ReactNode
};

export const MockApp = ({
  children
}: MockAppProps) => {
  // HACK: Set attributes on <html> dynamically because it's very hard to
  // customize the template in Storybook
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('lang', 'en');
    el.setAttribute('dir', 'ltr');
    el.setAttribute('class', 'js no-touch no-reveal-pw getusermedia');
  }, []);

  return (
    <StripeProvider apiKey={config.STRIPE_API_KEY}>
      <MockLoader>
        {children}
      </MockLoader>
    </StripeProvider>
  );
};

export default MockApp;