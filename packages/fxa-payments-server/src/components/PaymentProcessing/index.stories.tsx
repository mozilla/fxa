import React from 'react';
import { PaymentProcessing } from '.';
import { Meta } from '@storybook/react';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

export default {
  title: 'Components/PaymentProcessing',
  component: PaymentProcessing,
} as Meta;

export const Default = () => {
  return (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <PaymentProcessing provider="paypal" />
    </AppLocalizationProvider>
  );
};
