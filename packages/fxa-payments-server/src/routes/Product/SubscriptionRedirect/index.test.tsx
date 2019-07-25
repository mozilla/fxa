import React from 'react';
import { render, cleanup, fireEvent, } from '@testing-library/react';
import 'jest-dom/extend-expect';
import { config as defaultConfig } from '../../../lib/config';
import { AppContext, AppContextType, defaultAppContext } from '../../../lib/AppContext';

import {
  SubscriptionRedirect,
} from './index';

afterEach(cleanup);

it('performs a redirect to the expected URL for local product', () => {
  assertRedirectForProduct('123doneProProduct', 'local', 'http://127.0.0.1:8080/');
});

it('performs a redirect to the default URL for unknown product', () => {
  assertRedirectForProduct('beepBoop', 'bazquux', 'https://mozilla.org');
});

function assertRedirectForProduct(product_id: string, plan_name: string, expectedUrl: string) {
  const config = {
    ...defaultConfig,
    productRedirectURLs: {
      '123doneProProduct': 'http://127.0.0.1:8080/',
    },
  };
  const navigateToUrl = jest.fn();
  const appContextValue = { ...defaultAppContext, navigateToUrl, config };
  const plan = { ...MOCK_PLAN, product_id, plan_name };
  const { getByText } = render(
    <AppContext.Provider value={appContextValue}>
      <SubscriptionRedirect {...{ navigateToUrl, plan }} />
    </AppContext.Provider>
  );
  expect(getByText(plan_name)).toBeInTheDocument();
  expect(navigateToUrl).toBeCalledWith(expectedUrl);
}

const MOCK_PLAN = {
  plan_id: 'plan_123',
  plan_name: 'Example Plan',
  product_id: '123doneProProduct',
  product_name: 'Example Product',
  currency: 'USD',
  amount: 1050,
  interval: 'month'
};
