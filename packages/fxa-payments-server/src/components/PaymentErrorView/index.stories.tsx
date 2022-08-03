import React from 'react';
import { PaymentErrorView } from './index';
import { SELECTED_PLAN } from '../../lib/mock-data';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Meta } from '@storybook/react';

export default {
  title: 'components/PaymentError',
  component: PaymentErrorView,
} as Meta;

const storyWithContext = (storyName?: string) => {
  const story = () => (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <PaymentErrorView
              error={{ code: 'general-paypal-error' }}
              actionFn={() => {}}
              plan={SELECTED_PLAN}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithContext('default');
