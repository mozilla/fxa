import React from 'react';
import { render, cleanup, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  setupFluentLocalizationTest,
  getLocalizedMessage,
} from '../../lib/test-utils';

import { PaymentErrorView } from './index';
import SubscriptionTitle, { titles } from '../SubscriptionTitle';
import { SELECTED_PLAN } from '../../lib/mock-data';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

afterEach(cleanup);
describe('PaymentErrorView test with l10n', () => {
  const bundle = setupFluentLocalizationTest('en-US');

  it('renders as expected', () => {
    const { queryByTestId, queryByAltText } = render(
      <PaymentErrorView
        onRetry={() => {}}
        error={{ code: 'general-paypal-error' }}
        plan={SELECTED_PLAN}
      />
    );
    const spinner = queryByAltText('error icon');
    expect(spinner).toBeInTheDocument();

    const mainBlock = queryByTestId('payment-error');
    expect(mainBlock).toBeInTheDocument();

    const expected =
      'An unexpected error has occurred while processing your payment, please try again.';
    const actual = getLocalizedMessage(bundle, 'payment-error-3b', {});
    expect(actual).toEqual(expected);

    const retryButton = queryByTestId('retry-link');
    expect(retryButton).toBeInTheDocument();

    const termsAndPrivacy = queryByTestId('terms');
    expect(termsAndPrivacy).toBeInTheDocument();
  });

  it('calls passed onRetry function when retry button clicked', async () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <PaymentErrorView
        onRetry={onRetry}
        error={{ code: 'general-paypal-error' }}
        plan={SELECTED_PLAN}
      />
    );

    await act(async () => {
      fireEvent.click(getByTestId('retry-link'));
    });

    expect(onRetry).toHaveBeenCalled();
  });

  it('renders as expected for a returning PayPal customer', () => {
    const { queryByTestId, queryByAltText } = render(
      <PaymentErrorView
        onRetry={() => {}}
        error={{ code: 'returning_paypal_customer_error' }}
        plan={SELECTED_PLAN}
      />
    );
    const spinner = queryByAltText('error icon');
    expect(spinner).toBeInTheDocument();

    const mainBlock = queryByTestId('payment-error');
    expect(mainBlock).toBeInTheDocument();

    const expected =
      'Sorry. Currently, you can only sign up for one subscription at a time. Please check back soon.';
    const actual = getLocalizedMessage(
      bundle,
      'returning-paypal-customer-error',
      {}
    );
    expect(actual).toEqual(expected);

    const manageSubscriptionButton = queryByTestId('manage-subscription-link');
    expect(manageSubscriptionButton).toBeInTheDocument();

    const termsAndPrivacy = queryByTestId('terms');
    expect(termsAndPrivacy).toBeInTheDocument();
  });

  it('navigates to the correct relative URL when the "Manage my subscription" button is clicked', async () => {
    const { getByTestId } = render(
      <PaymentErrorView
        onRetry={() => {}}
        error={{ code: 'returning_paypal_customer_error' }}
        plan={SELECTED_PLAN}
      />
    );

    await act(async () => {
      fireEvent.click(getByTestId('manage-subscription-link'));
    });

    expect(mockHistoryPush).toHaveBeenCalledWith('/subscriptions');
  });

  it('uses the given SubscriptionTitle', async () => {
    const { getByTestId } = render(
      <PaymentErrorView
        subscriptionTitle={<SubscriptionTitle screenType={'noupgrade'} />}
        onRetry={() => {}}
        error={{ code: 'no_subscription_upgrades' }}
        plan={SELECTED_PLAN}
      />
    );

    const expectedTitle = titles.noupgrade;
    expect(getByTestId('subscription-noupgrade-title')).toHaveTextContent(
      expectedTitle
    );

    await act(async () => {
      fireEvent.click(getByTestId('manage-subscription-link'));
    });
    expect(mockHistoryPush).toHaveBeenCalledWith('/subscriptions');
  });
});
