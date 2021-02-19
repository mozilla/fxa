import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  setupFluentLocalizationTest,
  getLocalizedMessage,
} from '../../lib/test-utils';

import { PaymentProcessing } from './index';

afterEach(cleanup);
describe('Fluent Localized Text', () => {
  const bundle = setupFluentLocalizationTest('en-US');

  it('renders as expected', () => {
    const { queryByTestId } = render(<PaymentProcessing />);

    const subscriptionTitle = queryByTestId('subscription-processing-title');
    expect(subscriptionTitle).toBeInTheDocument();
    expect(subscriptionTitle).not.toHaveClass('hidden');

    const spinner = queryByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();

    const mainBlock = queryByTestId('payment-processing');
    expect(mainBlock).toBeInTheDocument();

    const expected = 'Please wait while we process your payment...';
    const actual = getLocalizedMessage(
      bundle,
      'payment-processing-message',
      {}
    );
    expect(actual).toEqual(expected);
  });
});
