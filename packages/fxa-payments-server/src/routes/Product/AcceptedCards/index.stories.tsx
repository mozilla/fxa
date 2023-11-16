import React from 'react';
import { AcceptedCards } from './index';
import { Meta } from '@storybook/react';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

export default {
  title: 'routes/Product/AcceptedCards',
  component: AcceptedCards,
} as Meta;

export const Default = () => {
  return (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <AcceptedCards />
    </AppLocalizationProvider>
  );
};
