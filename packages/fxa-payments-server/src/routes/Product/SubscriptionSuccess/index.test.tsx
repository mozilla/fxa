import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { config as defaultConfig } from '../../../lib/config';
import { AppContext, defaultAppContext } from '../../../lib/AppContext';

import {
  MOCK_PLANS,
  MOCK_PROFILE,
  MOCK_CUSTOMER,
} from '../../../lib/test-utils';

import { SubscriptionSuccess } from './index';

afterEach(cleanup);

it('performs a redirect to the expected URL for local product', () => {
  assertRedirectForProduct(
    '123doneProProduct',
    'local',
    'http://127.0.0.1:8080/'
  );
});

it('performs a redirect to the default URL for unknown product', () => {
  assertRedirectForProduct('beepBoop', 'bazquux', 'https://mozilla.org');
});

function assertRedirectForProduct(
  product_id: string,
  product_name: string,
  expectedUrl: string
) {
  const config = {
    ...defaultConfig,
    env: 'testing',
    productRedirectURLs: {
      '123doneProProduct': 'http://127.0.0.1:8080/',
    },
  };
  const navigateToUrl = jest.fn();
  const appContextValue = { ...defaultAppContext, navigateToUrl, config };
  const selectedPlan = { ...MOCK_PLANS[0], product_id, product_name };
  const { getByTestId } = render(
    <AppContext.Provider value={appContextValue}>
      <SubscriptionSuccess
        {...{
          plan: selectedPlan,
          profile: MOCK_PROFILE,
          customer: MOCK_CUSTOMER,
          isMobile: false,
        }}
      />
    </AppContext.Provider>
  );
  expect(getByTestId('download-link').getAttribute('href')).toEqual(
    expectedUrl
  );
}
