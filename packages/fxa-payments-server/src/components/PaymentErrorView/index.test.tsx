import React from 'react';
import { cleanup, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  getLocalizedMessage,
  renderWithLocalizationProvider,
} from '../../lib/test-utils';
import { getFtlBundle } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';

import { PaymentErrorView } from './index';
import SubscriptionTitle, { titles } from '../SubscriptionTitle';
import { SELECTED_PLAN } from '../../lib/mock-data';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const originalRouterDom = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalRouterDom,
    useNavigate: () => mockedNavigate,
  };
});

afterEach(cleanup);
describe('PaymentErrorView test with l10n', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('payments');
  });

  it('renders as expected', () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <PaymentErrorView
        actionFn={() => {}}
        error={{ code: 'general_paypal_error' }}
        plan={SELECTED_PLAN}
      />
    );

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

    expect(queryByTestId('fxa-legal-links')).not.toBeInTheDocument();
  });

  it('calls passed onRetry function when retry button clicked', async () => {
    const onRetry = jest.fn();
    const { getByTestId } = renderWithLocalizationProvider(
      <PaymentErrorView
        actionFn={onRetry}
        error={{ code: 'general_paypal_error' }}
        plan={SELECTED_PLAN}
      />
    );

    await act(async () => {
      fireEvent.click(getByTestId('retry-link'));
    });

    expect(onRetry).toHaveBeenCalled();
  });

  it('navigates to the correct relative URL when the "Manage my subscription" button is clicked', async () => {
    const { getByTestId } = renderWithLocalizationProvider(
      <PaymentErrorView
        actionFn={() => {}}
        error={{ code: 'no_subscription_change' }}
        plan={SELECTED_PLAN}
      />
    );

    await act(async () => {
      fireEvent.click(getByTestId('manage-subscription-link'));
    });

    expect(mockedNavigate).toHaveBeenCalledWith('/subscriptions');
  });

  it('uses the given SubscriptionTitle', async () => {
    const { getByTestId } = renderWithLocalizationProvider(
      <PaymentErrorView
        subscriptionTitle={<SubscriptionTitle screenType={'noplanchange'} />}
        actionFn={() => {}}
        error={{ code: 'no_subscription_change' }}
        plan={SELECTED_PLAN}
      />
    );

    const expectedTitle = titles.noplanchange;
    expect(getByTestId('subscription-noplanchange-title')).toHaveTextContent(
      expectedTitle
    );

    await act(async () => {
      fireEvent.click(getByTestId('manage-subscription-link'));
    });
    expect(mockedNavigate).toHaveBeenCalledWith('/subscriptions');
  });

  it('does not render the ActionButton for post-subscription creation errors', async () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <PaymentErrorView
        actionFn={() => {}}
        error={{ code: 'fxa_fetch_profile_customer_error' }}
        plan={SELECTED_PLAN}
      />
    );

    const expected =
      'Subscription confirmed, but the confirmation page failed to load. Please check your email to set up your account.';
    const actual = getLocalizedMessage(
      bundle,
      'fxa-post-passwordless-sub-error',
      {}
    );
    expect(actual).toEqual(expected);

    const actionButton = queryByTestId('error-view-action-button');
    expect(actionButton).not.toBeInTheDocument();
  });

  it('shows FxA legal links in footer when isPasswordlessCheckout is true', async () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <PaymentErrorView
        actionFn={() => {}}
        error={{ code: 'general_paypal_error' }}
        plan={SELECTED_PLAN}
        showFxaLegalFooterLinks={true}
      />
    );

    expect(queryByTestId('fxa-legal-links')).toBeInTheDocument();
  });

  it('renders error for unsupported locations', async () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <PaymentErrorView
        actionFn={() => {}}
        error={{
          code: 'location_unsupported',
        }}
        plan={SELECTED_PLAN}
        showFxaLegalFooterLinks={true}
      />
    );

    const expected =
      'Your current location is not supported according to our Terms of Service.';
    const actual = getLocalizedMessage(bundle, 'location-unsupported', {});
    expect(actual).toEqual(expected);

    const retryButton = queryByTestId('retry-link');
    expect(retryButton).not.toBeInTheDocument();

    const actionButton = queryByTestId('error-view-action-button');
    expect(actionButton).not.toBeInTheDocument();
  });
});
