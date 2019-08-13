import React from 'react';
import { render, cleanup, findByText } from '@testing-library/react';
import 'jest-dom/extend-expect';
import { PlanDetails } from './index';

afterEach(cleanup);

it('renders default details for unknown product ID', async () => {
  const { findByTestId } = render(<Subject />);
  await findByTestId('plan-default');
});

it('renders specific details for known product ID', async () => {
  const plan_id = 'plan_F4bof27uz71Vk7';
  const { findByTestId } = render(
    <Subject plan={{ ...MOCK_PLAN, plan_id }} />
  );
  await findByTestId('plan-123donepro');
});

const Loading = () => <div>Loading</div>;

const Subject = ({ plan = MOCK_PLAN }) => {
  return (
    <React.Suspense fallback={<Loading />}>
      <div>Loaded</div>
      <PlanDetails plan={plan} />
    </React.Suspense>
  );
};

const MOCK_PLAN = {
  plan_id: 'plan_123',
  plan_name: 'Example Plan',
  product_id: '123doneProProduct',
  product_name: 'Example Product',
  currency: 'USD',
  amount: 1050,
  interval: 'month',
};
