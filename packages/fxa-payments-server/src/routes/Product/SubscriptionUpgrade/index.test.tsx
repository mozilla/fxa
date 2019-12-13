import React from 'react';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { APIError } from '../../../lib/apiClient';

import { MockApp } from '../../../lib/test-utils';

import { PROFILE, CUSTOMER, SELECTED_PLAN, UPGRADE_FROM_PLAN } from './mocks';

import { SignInLayout } from '../../../components/AppLayout';

import SubscriptionUpgrade, { SubscriptionUpgradeProps } from './index';

describe('routes/Product/SubscriptionUpgrade', () => {
  it('renders as expected', async () => {
    const { findByTestId, container } = render(<Subject />);
    await findByTestId('subscription-upgrade');

    // Could do some more content-based tests here, but basically just a
    // sanity test to assert that the products are in the correct slots
    const fromName = container.querySelector(
      '.from-plan .product-name'
    ) as Element;
    expect(fromName.textContent).toEqual(UPGRADE_FROM_PLAN.product_name);
    const toName = container.querySelector('.to-plan .product-name') as Element;
    expect(toName.textContent).toEqual(SELECTED_PLAN.product_name);
  });

  it('can be submitted after confirmation is checked', async () => {
    const updateSubscriptionPlanAndRefresh = jest.fn();

    const { findByTestId, getByTestId } = render(
      <Subject
        props={{
          updateSubscriptionPlanAndRefresh,
        }}
      />
    );
    await findByTestId('subscription-upgrade');

    expect(getByTestId('submit')).toHaveAttribute('disabled');
    fireEvent.submit(getByTestId('upgrade-form'));
    expect(updateSubscriptionPlanAndRefresh).not.toBeCalled();

    fireEvent.click(getByTestId('confirm'));
    expect(getByTestId('submit')).not.toHaveAttribute('disabled');
    fireEvent.click(getByTestId('submit'));
    expect(updateSubscriptionPlanAndRefresh).toBeCalledWith(
      CUSTOMER.subscriptions[0].subscription_id,
      SELECTED_PLAN
    );
  });

  it('displays a loading spinner while submitting', async () => {
    const { findByTestId, getByTestId, getByText } = render(
      <Subject
        props={{
          updateSubscriptionPlanStatus: {
            error: null,
            loading: true,
            result: null,
          },
        }}
      />
    );
    await findByTestId('subscription-upgrade');

    expect(getByTestId('spinner-submit')).toBeInTheDocument();
  });

  it('displays a dialog when updating subscription results in error', async () => {
    const expectedMessage = 'game over man';

    const { findByTestId, getByTestId, getByText } = render(
      <Subject
        props={{
          updateSubscriptionPlanStatus: {
            error: new APIError({
              message: expectedMessage,
            }),
            loading: false,
            result: null,
          },
        }}
      />
    );
    await findByTestId('subscription-upgrade');

    expect(getByTestId('error-plan-update-failed')).toBeInTheDocument();
    expect(getByText(expectedMessage)).toBeInTheDocument();
  });

  it('calls onMounted and onEngaged', async () => {
    const onMounted = jest.fn();
    const onEngaged = jest.fn();

    const { findByTestId, getByTestId } = render(
      <Subject
        props={{
          onMounted,
          onEngaged,
        }}
      />
    );
    await findByTestId('subscription-upgrade');
    fireEvent.click(getByTestId('confirm'));
    expect(onMounted).toBeCalledTimes(1);
    expect(onEngaged).toBeCalledTimes(1);
  });
});

const Subject = ({ props = {} }: { props?: object }) => {
  return (
    <MockApp>
      <SignInLayout>
        <SubscriptionUpgrade {...{ ...MOCK_PROPS, ...props }} />
      </SignInLayout>
    </MockApp>
  );
};

const MOCK_PROPS: SubscriptionUpgradeProps = {
  profile: PROFILE,
  customer: CUSTOMER,
  selectedPlan: SELECTED_PLAN,
  upgradeFromPlan: UPGRADE_FROM_PLAN,
  upgradeFromSubscription: CUSTOMER.subscriptions[0],
  updateSubscriptionPlanStatus: {
    error: null,
    loading: false,
    result: null,
  },
  updateSubscriptionPlanAndRefresh: jest.fn(),
  resetUpdateSubscriptionPlan: jest.fn(),
  onMounted: jest.fn(),
  onEngaged: jest.fn(),
};
