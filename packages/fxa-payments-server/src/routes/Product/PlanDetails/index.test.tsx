import React from 'react';
import { render, cleanup, findByText } from '@testing-library/react';
import 'jest-dom/extend-expect';
import { PlanDetails } from './index';

afterEach(cleanup);

it('renders default details for unknown product ID', async () => {
  const { findByText, queryByTestId } = render(<Subject />);
  await findByText('Loaded');
  expect(queryByTestId('plan-default')).toBeInTheDocument();
});

it('renders specific details for known product ID', async () => {
  const plan_id = 'plan_F4bof27uz71Vk7';
  const { findByText, queryByTestId } = render(
    <Subject plan={{ ...MOCK_PLAN, plan_id }} />
  );
  await findByText('Loaded');
  expect(queryByTestId('plan-123donepro')).toBeInTheDocument();
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
