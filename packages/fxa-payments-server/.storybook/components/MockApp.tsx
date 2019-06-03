import React, { ReactNode } from 'react';
import config from '../../src/lib/config';
import { StripeProvider } from 'react-stripe-elements';
import { MockLoader } from './MockLoader';

type MockAppProps = {
  children: ReactNode
};

export const MockApp = ({ children }: MockAppProps) => <>
  <div id="fox-logo"></div>
  <div id="stage" style={{ opacity: 1 }}>
    <div id="main-content" className="card visible">
      <div className="app">
        <StripeProvider apiKey={config.STRIPE_API_KEY}>
          <MockLoader>
            {children}
          </MockLoader>
        </StripeProvider>
      </div>
    </div>
  </div>
  <a id="about-mozilla" rel="author" target="_blank"
    href="https://www.mozilla.org/about/?utm_source=firefox-accounts&amp;utm_medium=Referral"></a>
</>;

export default MockApp;