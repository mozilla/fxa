import React from 'react';
import SubscriptionTitle from '../components/SubscriptionTitle';
import AppLocalizationProvider from '../AppLocalizationProvider';

const Checkout = () => (
  <AppLocalizationProvider
    userLocales={navigator.languages}
    bundles={['gatsby', 'react']}
  >
    <main>
      <SubscriptionTitle
        screenType="create"
        // subtitle={plan.subtitle}
      />
    </main>
  </AppLocalizationProvider>
);

export default Checkout;
