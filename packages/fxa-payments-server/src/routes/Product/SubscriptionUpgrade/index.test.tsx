import React from 'react';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

jest.mock('../../../lib/sentry');

import {
  apiUpdateSubscriptionPlan
} from '../../../lib/apiClient';
jest.mock('../../../lib/apiClient');

import {
  updateSubscriptionPlanMounted,
  updateSubscriptionPlanEngaged,
} from '../../../lib/amplitude';
jest.mock('../../../lib/amplitude');

import { MockApp } from '../../../lib/test-utils';

import { CUSTOMER, SELECTED_PLAN, UPGRADE_FROM_PLAN } from './mocks';

import { SignInLayout } from '../../../components/AppLayout';

import SubscriptionUpgrade, { SubscriptionUpgradeProps } from './index';

describe('routes/Product/SubscriptionUpgrade', () => {
  const mockApiUpdateSubscriptionPlan = apiUpdateSubscriptionPlan as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
    return cleanup();
  });

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
    mockApiUpdateSubscriptionPlan.mockResolvedValue({});

    const { findByTestId, getByTestId } = render(<Subject />);
    await findByTestId('subscription-upgrade');

    expect(getByTestId('submit')).toHaveAttribute('disabled');
    fireEvent.submit(getByTestId('upgrade-form'));
    expect(mockApiUpdateSubscriptionPlan).not.toBeCalled();

    fireEvent.click(getByTestId('confirm'));
    expect(getByTestId('submit')).not.toHaveAttribute('disabled');
    await act(async () => {
      fireEvent.click(getByTestId('submit'));
    });
    expect(mockApiUpdateSubscriptionPlan).toBeCalledWith({
      subscriptionId: CUSTOMER.subscriptions[0].subscription_id,
      planId: SELECTED_PLAN.plan_id,
      productId: SELECTED_PLAN.product_id,      
    });
  });

  it('displays a loading spinner while submitting', async () => {
    mockApiUpdateSubscriptionPlan.mockReturnValue(new Promise(() => {}));

    const { findByTestId, getByTestId } = render(<Subject />);
    await findByTestId('subscription-upgrade');

    fireEvent.click(getByTestId('confirm'));
    await act(async () => {
      fireEvent.click(getByTestId('submit'));
    });

    expect(getByTestId('spinner-submit')).toBeInTheDocument();
  });

  it('displays a dialog when updating subscription results in error', async () => {
    const expectedMessage = 'game over man';

    mockApiUpdateSubscriptionPlan.mockRejectedValue({
      message: expectedMessage,
    });

    const { findByTestId, getByTestId, getByText } = render(<Subject />);
    await findByTestId('subscription-upgrade');

    fireEvent.click(getByTestId('confirm'));
    await act(async () => {
      fireEvent.click(getByTestId('submit'));
    });

    expect(getByTestId('error-plan-update-failed')).toBeInTheDocument();
    expect(getByText(expectedMessage)).toBeInTheDocument();
  });

  it('calls updateSubscriptionPlanMounted and updateSubscriptionPlanEngaged', async () => {
    const { findByTestId, getByTestId } = render(<Subject />);
    await findByTestId('subscription-upgrade');
    fireEvent.click(getByTestId('confirm'));
    expect(updateSubscriptionPlanMounted).toBeCalledTimes(1);
    expect(updateSubscriptionPlanEngaged).toBeCalledTimes(1);
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
  selectedPlan: SELECTED_PLAN,
  upgradeFromPlan: UPGRADE_FROM_PLAN,
  upgradeFromSubscription: CUSTOMER.subscriptions[0],
};
