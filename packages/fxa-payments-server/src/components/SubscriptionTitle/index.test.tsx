import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import SubscriptionTitle from './index';

import {
  setupFluentLocalizationTest,
  getLocalizedMessage,
} from '../../lib/test-utils';

const defaultProps = {
  screenType: 'create',
};

afterEach(cleanup);

describe('SubscriptionTitle', () => {
  const bundle = setupFluentLocalizationTest('en-US');
  it('renders as expected', async () => {
    const subject = () => {
      return render(<SubscriptionTitle {...defaultProps} />);
    };
    const { findByTestId } = subject();
    const component = await findByTestId('subscription-create-title');

    const expectedTitle = 'Set up your subscription';
    expect(component).toHaveTextContent(expectedTitle);
    const actualTitle = getLocalizedMessage(
      bundle,
      'subscription-create-title',
      {}
    );
    expect(actualTitle).toEqual(expectedTitle);

    const expectedSubtitle = '30-day money-back guarantee';
    expect(component).toHaveTextContent(expectedSubtitle);
    const actualSubtitle = getLocalizedMessage(bundle, 'sub-guarantee', {});
    expect(actualSubtitle).toEqual(expectedSubtitle);
  });

  it('renders as expected for SubscriptionSuccess', async () => {
    const subject = () => {
      return render(<SubscriptionTitle screenType="success" />);
    };
    const { findByTestId } = subject();
    const component = await findByTestId('subscription-success-title');

    const expectedTitle = 'Subscription confirmation';
    expect(component).toHaveTextContent(expectedTitle);
    const actualTitle = getLocalizedMessage(
      bundle,
      'subscription-success-title',
      {}
    );
    expect(actualTitle).toEqual(expectedTitle);

    const expectedSubtitle = '30-day money-back guarantee';
    expect(component).toHaveTextContent(expectedSubtitle);
    const actualSubtitle = getLocalizedMessage(bundle, 'sub-guarantee', {});
    expect(actualSubtitle).toEqual(expectedSubtitle);
  });

  it('renders as expected for PaymentProcessing', async () => {
    const subject = () => {
      return render(<SubscriptionTitle screenType="processing" />);
    };
    const { findByTestId } = subject();
    const component = await findByTestId('subscription-processing-title');

    const expectedTitle = 'Confirming subscription...';
    expect(component).toHaveTextContent(expectedTitle);
    const actualTitle = getLocalizedMessage(
      bundle,
      'subscription-processing-title',
      {}
    );
    expect(actualTitle).toEqual(expectedTitle);

    const expectedSubtitle = '30-day money-back guarantee';
    expect(component).toHaveTextContent(expectedSubtitle);
    const actualSubtitle = getLocalizedMessage(bundle, 'sub-guarantee', {});
    expect(actualSubtitle).toEqual(expectedSubtitle);
  });
});
