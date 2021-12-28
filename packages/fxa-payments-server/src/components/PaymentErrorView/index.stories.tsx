import React from 'react';
import { storiesOf } from '@storybook/react';
import { PaymentErrorView } from './index';
import { SELECTED_PLAN } from '../../lib/mock-data';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

storiesOf('components/PaymentError', module).add('default', () => (
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
));
