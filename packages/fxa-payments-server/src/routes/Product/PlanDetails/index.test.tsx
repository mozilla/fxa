import React from 'react';
import { render, cleanup, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import fs from 'fs';
import path from 'path';
import { FluentBundle } from 'fluent';
import { LocalizationProvider } from 'fluent-react';
import { PlanDetails } from './index';
import { MOCK_PLANS } from '../../../lib/test-utils';

afterEach(cleanup);

it('renders default details for unknown product ID', async () => {
  const { findByTestId } = render(<Subject />);
  await findByTestId('plan-default');
});

it('renders specific details for known product ID', async () => {
  const plan_id = 'plan_F4bof27uz71Vk7';
  const { findByTestId } = render(<Subject plan={{ ...MOCK_PLAN, plan_id }} />);
  await findByTestId('plan-123donepro');
});

const findMockPlan = (planId: string) => {
  const plan = MOCK_PLANS.find(x => x.plan_id === planId);
  if (plan) {
    return plan;
  }
  throw new Error('unable to find suitable Plan object for test execution.');
};

it('renders billing details correctly for daily plan', async () => {
  const plan_id = 'plan_daily';
  const plan = findMockPlan(plan_id);

  const { findByText, getByText } = render(<PlanDetails plan={plan} />);

  await findByText("Let's set up your subscription");
  await wait(() =>
    expect(getByText(`FPN billed $5.00 daily`)).toBeInTheDocument()
  );
});

async function createMessagesGenerator() {
  console.log('find me');
  console.log(__dirname);
  const filepath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'public',
    'locales',
    'en-US',
    'main.ftl'
  );
  console.log(filepath);
  const enUS = (await fs.readFileSync(filepath)).toString();

  return function* generateBundles() {
    const bundle = new FluentBundle('en-US');
    bundle.addMessages(enUS);
    yield bundle;
  };
}

it('renders billing details correctly for 6 days plan', async () => {
  const plan_id = 'plan_6days';
  const plan = findMockPlan(plan_id);
  const generateBundles = await createMessagesGenerator();
  const bundles = generateBundles();

  const { getByText } = render(
    <LocalizationProvider bundles={bundles}>
      <PlanDetails plan={plan} />
    </LocalizationProvider>
  );

  expect(getByText("Let's set up your subscription")).toBeInTheDocument();
  await wait(
    () =>
      expect(
        getByText('FPN⁩ billed $⁨5.00⁩ ⁨every ⁨6⁩ days⁩')
      ).toBeInTheDocument(),
    {
      timeout: 4000,
    }
  );
});

it('renders billing details correctly for weekly plan', async () => {
  const plan_id = 'plan_weekly';
  const plan = findMockPlan(plan_id);

  const { findByText, getByText } = render(<PlanDetails plan={plan} />);
  await findByText("Let's set up your subscription");
  expect(await getByText(`FPN billed $5.00 weekly`)).toBeInTheDocument();
});

it('renders billing details correctly for 6 weeks plan', async () => {
  const plan_id = 'plan_6days';
  const plan = findMockPlan(plan_id);

  const { findByText, getByText } = render(<PlanDetails plan={plan} />);
  await findByText("Let's set up your subscription");
  expect(await getByText(`FPN billed $5.00 every 6 weeks`)).toBeInTheDocument();
});

it('renders billing details correctly for monthly plan', async () => {
  const plan_id = 'plan_monthly';
  const plan = findMockPlan(plan_id);

  const { findByText, getByText } = render(<PlanDetails plan={plan} />);
  await findByText("Let's set up your subscription");
  expect(await getByText(`FPN billed $5.00 monthly`)).toBeInTheDocument();
});

it('renders billing details correctly for 6 month plan', async () => {
  const plan_id = 'plan_6months';
  const plan = findMockPlan(plan_id);

  const { findByText, getByText } = render(<PlanDetails plan={plan} />);
  await findByText("Let's set up your subscription");
  expect(
    await getByText(`FPN billed $5.00 every 6 months`)
  ).toBeInTheDocument();
});

it('renders billing details correctly for year plan', async () => {
  const plan_id = 'plan_yearly';
  const plan = findMockPlan(plan_id);

  const { findByText, getByText } = render(<PlanDetails plan={plan} />);
  await findByText("Let's set up your subscription");
  expect(await getByText(`FPN billed $5.00 yearly`)).toBeInTheDocument();
});

it('renders billing details correctly for 6 years plan', async () => {
  const plan_id = 'plan_6years';
  const plan = findMockPlan(plan_id);

  const { findByText, getByText } = render(<PlanDetails plan={plan} />);
  await findByText("Let's set up your subscription");
  expect(await getByText(`FPN billed $5.00 every 6 years`)).toBeInTheDocument();
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
  interval_count: 1,
};
