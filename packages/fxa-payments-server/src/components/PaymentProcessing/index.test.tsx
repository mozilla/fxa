import React from 'react';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  getLocalizedMessage,
  renderWithLocalizationProvider,
} from '../../lib/test-utils';
import { getFtlBundle } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';

import { PaymentProcessing } from './index';

afterEach(cleanup);
describe('PaymentProcessing tests', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('payments');
  });

  it('renders as expected', () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <PaymentProcessing provider="paypal" />
    );

    const subscriptionTitle = queryByTestId('subscription-processing-title');
    expect(subscriptionTitle).toBeInTheDocument();
    expect(subscriptionTitle).not.toHaveClass('hidden');

    const spinner = queryByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();

    const mainBlock = queryByTestId('payment-processing');
    expect(mainBlock).toBeInTheDocument();

    const footer = queryByTestId('footer');
    expect(footer).toBeInTheDocument();

    const expected = 'Please wait while we process your payment…';
    const actual = getLocalizedMessage(
      bundle,
      'payment-processing-message',
      {}
    );
    expect(actual).toEqual(expected);
  });
});
