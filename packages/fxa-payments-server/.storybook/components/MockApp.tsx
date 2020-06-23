import React, { useEffect, useMemo, ReactNode } from 'react';
import { action } from '@storybook/addon-actions';
import { StripeProvider } from 'react-stripe-elements';
import { MockLoader } from './MockLoader';
import { AppContext, AppContextType } from '../../src/lib/AppContext';
import { config } from '../../src/lib/config';
import ScreenInfo from '../../src/lib/screen-info';
import AppLocalizationProvider from '../../src/lib/AppLocalizationProvider';

declare global {
  interface Window {
    Stripe: stripe.StripeStatic;
  }
}

type MockAppProps = {
  children: ReactNode;
  appContextValue?: AppContextType;
  stripeApiKey?: string;
  applyStubsToStripe?: (orig: stripe.Stripe) => stripe.Stripe;
  languages?: readonly string[];
};

export const defaultAppContextValue: AppContextType = {
  config: {
    ...config,
    productRedirectURLs: {
      product_8675309: 'https://example.com/product',
    },
    servers: {
      ...config.servers,
      content: {
        url: 'https://accounts.firefox.com',
      },
    },
  },
  queryParams: {},
  navigateToUrl: action('navigateToUrl'),
  getScreenInfo: () => new ScreenInfo(window),
  matchMedia: (query: string) => window.matchMedia(query).matches,
  matchMediaDefault: (query: string) => window.matchMedia(query),
  locationReload: action('locationReload'),
};

export const defaultStripeStubs = (stripe: stripe.Stripe) => ({
  ...stripe,
  createToken: (element: stripe.elements.Element | string) =>
    Promise.resolve({
      token: {
        id: 'asdf',
        object: 'mock_object',
        client_ip: '123.123.123.123',
        created: Date.now(),
        livemode: false,
        type: 'card',
        used: false,
      },
    }),
});

export const MockApp = ({
  children,
  stripeApiKey = '8675309',
  applyStubsToStripe = defaultStripeStubs,
  appContextValue = defaultAppContextValue,
  languages = navigator.languages,
}: MockAppProps) => {
  const mockStripe = useMemo<stripe.Stripe>(
    () => applyStubsToStripe(window.Stripe(stripeApiKey)),
    [stripeApiKey, applyStubsToStripe]
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
    <AppContext.Provider
      value={{ ...appContextValue, navigatorLanguages: languages }}
    >
      <AppLocalizationProvider
        baseDir="./locales"
        userLocales={languages}
        bundles={['main']}
      >
        <StripeProvider stripe={mockStripe}>
          <MockLoader>{children}</MockLoader>
        </StripeProvider>
      </AppLocalizationProvider>
    </AppContext.Provider>
  );
};

export default MockApp;
