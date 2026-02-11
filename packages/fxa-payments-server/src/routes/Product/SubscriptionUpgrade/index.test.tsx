import React from 'react';
import TestRenderer from 'react-test-renderer';
import { cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { APIError } from '../../../lib/apiClient';
import { Plan } from '../../../store/types';
import { PlanDetailsCard } from './PlanUpgradeDetails';

import {
  updateSubscriptionPlanMounted,
  updateSubscriptionPlanEngaged,
} from '../../../lib/amplitude';

import {
  MockApp,
  MOCK_PLANS,
  getLocalizedMessage,
  MOCK_PREVIEW_INVOICE_WITH_TAX_EXCLUSIVE,
  MOCK_PREVIEW_INVOICE_WITH_TAX_INCLUSIVE,
  MOCK_PREVIEW_INVOICE_NO_TAX,
  MOCK_PREVIEW_INVOICE_WITH_ZERO_TAX_EXCLUSIVE,
  renderWithLocalizationProvider,
  withLocalizationProvider,
} from '../../../lib/test-utils';
import { getFtlBundle } from 'fxa-react/lib/test-utils';
import { FluentBundle, FluentNumber } from '@fluent/bundle';
import { ReactGALog } from '../../../lib/reactga-event';

import {
  CUSTOMER,
  MOCK_EVENTS,
  SELECTED_PLAN,
  UPGRADE_FROM_PLAN,
  PROFILE,
  UPGRADE_FROM_PLAN_ARCHIVED,
} from '../../../lib/mock-data';

import { SignInLayout } from '../../../components/AppLayout';

import SubscriptionUpgrade, { SubscriptionUpgradeProps } from './index';
import {
  getLocalizedCurrency,
  getLocalizedDateString,
} from '../../../lib/formats';
import { WebSubscription } from 'fxa-shared/subscriptions/types';
import { updateConfig } from '../../../lib/config';
import { deepCopy } from '../../../lib/test-utils';

jest.mock('../../../lib/sentry');
jest.mock('../../../lib/amplitude');
jest.mock('../../../lib/reactga-event');

const customerWebSubscription = CUSTOMER.subscriptions[0] as WebSubscription;
customerWebSubscription.current_period_start =
  new Date('2023-05-10').getTime() / 1000 + 86400 * 31;
customerWebSubscription.current_period_end =
  new Date('2023-06-10').getTime() / 1000 + 86400 * 31;

async function rendersAsExpected(
  upgradeFromPlan = UPGRADE_FROM_PLAN,
  invoicePreview = MOCK_PREVIEW_INVOICE_NO_TAX,
  selectedPlan = SELECTED_PLAN
) {
  const { findByTestId, queryByTestId, container } =
    renderWithLocalizationProvider(
      <Subject props={{ upgradeFromPlan, invoicePreview, selectedPlan }} />
    );
  await findByTestId('subscription-upgrade');

  // Could do some more content-based tests here, but basically just a
  // sanity test to assert that the products are in the correct slots
  const fromName = container.querySelector(
    '.from-plan .product-name'
  ) as Element;
  expect(fromName.textContent).toEqual(upgradeFromPlan.product_name);
  const fromDesc = container.querySelector(
    '.from-plan #product-description'
  ) as Element;
  expect(fromDesc.textContent).toContain(
    upgradeFromPlan.product_metadata?.['product:subtitle']
  );
  const toName = container.querySelector('.to-plan .product-name') as Element;
  expect(toName.textContent).toEqual(SELECTED_PLAN.product_name);
  const toDesc = container.querySelector(
    '.to-plan #product-description'
  ) as Element;
  expect(toDesc.textContent).toContain(
    SELECTED_PLAN.product_metadata?.['product:subtitle']
  );

  // Expected invoice date can come from different sources depending on if interval
  // and interval count match or not.
  const expectedInvoiceDate =
    upgradeFromPlan.interval !== selectedPlan.interval &&
    selectedPlan.interval_count === upgradeFromPlan.interval_count
      ? getLocalizedDateString(invoicePreview.line_items[0].period.end)
      : getLocalizedDateString(customerWebSubscription.current_period_end);

  expect(queryByTestId('plan-upgrade-subtotal')).not.toBeInTheDocument();
  expect(queryByTestId('plan-upgrade-tax-amount')).not.toBeInTheDocument();

  expect(queryByTestId('sub-update-acknowledgment')).toHaveTextContent(
    expectedInvoiceDate
  );

  // <Product Name (Interval)> (e.g. Better Upgrade Product (Monthly))
  // only appears when there is exclusive tax
  if (
    invoicePreview?.subtotal_excluding_tax ||
    invoicePreview?.total_excluding_tax
  ) {
    expect(
      queryByTestId(`sub-update-new-plan-${selectedPlan.interval}`)
    ).toBeInTheDocument();
  }

  if (!!invoicePreview.one_time_charge) {
    if (invoicePreview.one_time_charge > 0) {
      expect(queryByTestId('sub-update-prorated-upgrade')).toBeInTheDocument();
      expect(queryByTestId('prorated-amount')).toBeInTheDocument();
      expect(
        queryByTestId('sub-update-prorated-upgrade-credit')
      ).not.toBeInTheDocument();
    } else if (invoicePreview.one_time_charge < 0) {
      expect(queryByTestId('sub-update-prorated-upgrade')).toBeInTheDocument();
      expect(queryByTestId('prorated-amount')).toBeInTheDocument();
      expect(
        queryByTestId('sub-update-prorated-upgrade-credit')
      ).toBeInTheDocument();
    } else {
      expect(
        queryByTestId('sub-update-prorated-upgrade')
      ).not.toBeInTheDocument();
      expect(
        queryByTestId('sub-update-prorated-upgrade-credit')
      ).not.toBeInTheDocument();
      expect(queryByTestId('prorated-amount')).not.toBeInTheDocument();
    }
  } else {
    expect(
      queryByTestId('sub-update-prorated-upgrade')
    ).not.toBeInTheDocument();
    expect(
      queryByTestId('sub-update-prorated-upgrade-credit')
    ).not.toBeInTheDocument();
    expect(queryByTestId('prorated-amount')).not.toBeInTheDocument();
  }
}

describe('routes/Product/SubscriptionUpgrade', () => {
  afterEach(() => {
    updateConfig({
      featureFlags: {
        useStripeAutomaticTax: false,
      },
    });
    jest.clearAllMocks();
    return cleanup();
  });

  it('renders as expected', async () => {
    await rendersAsExpected();
  });

  it('renders as expected when upgrade to yearly from monthly', async () => {
    const selectedPlan = deepCopy(SELECTED_PLAN);
    selectedPlan.interval = 'yearly';
    selectedPlan.interval_count = 1;
    const invoicePreview = deepCopy(MOCK_PREVIEW_INVOICE_NO_TAX);
    invoicePreview.line_items[0].id = selectedPlan.plan_id;
    invoicePreview.line_items[0].period.end =
      new Date('2024-05-10').getTime() / 1000 + 86400 * 31;
    await rendersAsExpected(UPGRADE_FROM_PLAN, invoicePreview, selectedPlan);
  });

  it('renders as expected when upgrade from plan is archived', async () => {
    await rendersAsExpected(UPGRADE_FROM_PLAN_ARCHIVED);
  });

  it('renders as expected for inclusive tax', async () => {
    updateConfig({
      featureFlags: {
        useStripeAutomaticTax: true,
      },
    });
    const { findByTestId, queryByTestId } = renderWithLocalizationProvider(
      <Subject
        props={{
          invoicePreview: MOCK_PREVIEW_INVOICE_WITH_TAX_INCLUSIVE,
        }}
      />
    );
    await findByTestId('subscription-upgrade');

    expect(queryByTestId('plan-upgrade-subtotal')).not.toBeInTheDocument();
    expect(queryByTestId('plan-upgrade-tax-amount')).not.toBeInTheDocument();
    expect(queryByTestId('total-price')).toHaveTextContent('$20.00 monthly');
  });

  it('renders as expected for exclusive tax', async () => {
    updateConfig({
      featureFlags: {
        useStripeAutomaticTax: true,
      },
    });
    const { findByTestId, queryByTestId } = renderWithLocalizationProvider(
      <Subject
        props={{
          invoicePreview: MOCK_PREVIEW_INVOICE_WITH_TAX_EXCLUSIVE,
        }}
      />
    );
    await findByTestId('subscription-upgrade');

    expect(queryByTestId('plan-upgrade-subtotal')).toHaveTextContent('$20.00');
    expect(queryByTestId('plan-upgrade-tax-amount')).toHaveTextContent('$3.00');
    expect(queryByTestId('total-price')).toHaveTextContent('$23.00 monthly');
  });

  it('does not render tax for zero amount exclusive tax', async () => {
    updateConfig({
      featureFlags: {
        useStripeAutomaticTax: true,
      },
    });
    const { findByTestId, queryByTestId } = renderWithLocalizationProvider(
      <Subject
        props={{
          invoicePreview: MOCK_PREVIEW_INVOICE_WITH_ZERO_TAX_EXCLUSIVE,
        }}
      />
    );
    await findByTestId('subscription-upgrade');

    expect(queryByTestId('plan-upgrade-tax-amount')).not.toBeInTheDocument();
    expect(queryByTestId('plan-upgrade-subtotal')).not.toBeInTheDocument();
    expect(queryByTestId('total-price')).toHaveTextContent('$20.00 monthly');
  });

  it('can be submitted after confirmation is checked', async () => {
    const updateSubscriptionPlanAndRefresh = jest.fn();

    const { findByTestId, getByTestId } = renderWithLocalizationProvider(
      <Subject
        props={{
          updateSubscriptionPlanAndRefresh,
        }}
      />
    );
    await findByTestId('subscription-upgrade');

    expect(getByTestId('submit')).toHaveClass('payment-button-disabled');
    fireEvent.submit(getByTestId('upgrade-form'));
    expect(updateSubscriptionPlanAndRefresh).not.toBeCalled();

    fireEvent.click(getByTestId('confirm'));
    expect(getByTestId('submit')).not.toHaveClass('payment-button-disabled');
    fireEvent.click(getByTestId('submit'));
    expect(updateSubscriptionPlanAndRefresh).toBeCalledWith(
      customerWebSubscription.subscription_id,
      UPGRADE_FROM_PLAN,
      SELECTED_PLAN,
      CUSTOMER.payment_provider
    );
  });

  it('displays a loading spinner while submitting', async () => {
    const { findByTestId, getByTestId } = renderWithLocalizationProvider(
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

    const { findByTestId, getByTestId, getByText } =
      renderWithLocalizationProvider(
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

  it('records an "engage" funnel event when the consent checkbox is clicked', async () => {
    const { findByTestId, getByTestId } = renderWithLocalizationProvider(
      <Subject />
    );
    await findByTestId('subscription-upgrade');
    fireEvent.click(getByTestId('confirm'));
    expect(updateSubscriptionPlanMounted).toBeCalledTimes(1);
    expect(updateSubscriptionPlanEngaged).toBeCalledTimes(1);
  });
});

describe('ReactGA4Log - SubscriptionUpgrade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    return cleanup();
  });

  it('logs ReactGA4 purchase_submit and purchase events during upgrade', () => {
    const updateSubscriptionPlanAndRefresh = jest.fn();
    const { getByTestId } = renderWithLocalizationProvider(
      <Subject
        props={{
          updateSubscriptionPlanAndRefresh,
        }}
      />
    );
    expect(ReactGALog.logEvent).not.toHaveBeenCalled();
    fireEvent.click(getByTestId('confirm'));
    fireEvent.click(getByTestId('submit'));
    expect(ReactGALog.logEvent).toBeCalledTimes(2);
    expect(ReactGALog.logEvent).toBeCalledWith(
      MOCK_EVENTS.PurchaseSubmitUpgrade(SELECTED_PLAN)
    );
    expect(ReactGALog.logEvent).toBeCalledWith(
      MOCK_EVENTS.PurchaseUpgrade(SELECTED_PLAN)
    );
  });
});

describe('PlanDetailsCard', () => {
  const dayBasedId = 'price-details-no-tax-day';
  const weekBasedId = 'price-details-no-tax-week';
  const monthBasedId = 'price-details-no-tax-month';
  const yearBasedId = 'price-details-no-tax-year';

  const findMockPlan = (planId: string): Plan => {
    const plan = MOCK_PLANS.find((x) => x.plan_id === planId);
    if (plan) {
      return plan;
    }
    throw new Error('unable to find suitable Plan object for test execution.');
  };

  describe('Localized Plan Billing Description Component', () => {
    async function runTests(
      plan: Plan,
      expectedMsgId: string,
      expectedMsg: string
    ) {
      const props = { plan: plan, currency: plan.currency };

      const testRenderer = TestRenderer.create(
        withLocalizationProvider(<PlanDetailsCard {...props} />)
      );
      const testInstance = testRenderer.root;
      const planPriceComponent = await testInstance.findByProps({
        id: expectedMsgId,
      });
      const expectedAmount = getLocalizedCurrency(plan.amount, plan.currency);

      expect(
        planPriceComponent.props.vars.priceAmount
      ).toStrictEqual<FluentNumber>(expectedAmount);
      expect(planPriceComponent.props.vars.intervalCount).toBe(
        plan.interval_count
      );
    }

    it('displays product:name when present instead of product_name', async () => {
      const plan_id = 'plan_withname';
      const plan = findMockPlan(plan_id);

      const props = { plan: plan, currency: plan.currency };

      const testRenderer = TestRenderer.create(
        withLocalizationProvider(<PlanDetailsCard {...props} />)
      );
      const testInstance = testRenderer.root;
      const planPriceComponent = await testInstance.findByProps({
        id: 'plan-details-product',
      });

      expect(planPriceComponent.props.children).toEqual(
        plan.plan_metadata?.['product:name']
      );
    });

    it('displays product_name when plan_metadata name is not present', async () => {
      const plan_id = 'plan_daily';
      const plan = findMockPlan(plan_id);

      const props = { plan: plan, currency: plan.currency };

      const testRenderer = TestRenderer.create(
        withLocalizationProvider(<PlanDetailsCard {...props} />)
      );
      const testInstance = testRenderer.root;
      const planPriceComponent = await testInstance.findByProps({
        id: 'plan-details-product',
      });

      expect(planPriceComponent.props.children).toEqual(plan.product_name);
    });

    describe('When plan has day interval', () => {
      const expectedMsgId = dayBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_daily';
        const plan = findMockPlan(plan_id);
        const expectedMsg = '$5.00 daily';

        runTests(plan, expectedMsgId, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6days';
        const plan = findMockPlan(plan_id);
        const expectedMsg = '$5.00 every 6 days';

        runTests(plan, expectedMsgId, expectedMsg);
      });
    });

    describe('When plan has week interval', () => {
      const expectedMsgId = weekBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_weekly';
        const plan = findMockPlan(plan_id);
        const expectedMsg = '$5.00 weekly';

        runTests(plan, expectedMsgId, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6weeks';
        const plan = findMockPlan(plan_id);
        const expectedMsg = '$5.00 every 6 weeks';

        runTests(plan, expectedMsgId, expectedMsg);
      });
    });

    describe('When plan has month interval', () => {
      const expectedMsgId = monthBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_monthly';
        const plan = findMockPlan(plan_id);
        const expectedMsg = '$5.00 monthly';

        runTests(plan, expectedMsgId, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6months';
        const plan = findMockPlan(plan_id);
        const expectedMsg = '$5.00 every 6 months';

        runTests(plan, expectedMsgId, expectedMsg);
      });
    });

    describe('When plan has year interval', () => {
      const expectedMsgId = yearBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_yearly';
        const plan = findMockPlan(plan_id);
        const expectedMsg = '$5.00 yearly';

        runTests(plan, expectedMsgId, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6years';
        const plan = findMockPlan(plan_id);
        const expectedMsg = '$5.00 every 6 years';

        runTests(plan, expectedMsgId, expectedMsg);
      });
    });
  });

  describe('Fluent Translations for Plan Billing Description', () => {
    let bundle: FluentBundle;
    beforeAll(async () => {
      bundle = await getFtlBundle('payments');
    });
    const priceAmount = getLocalizedCurrency(500, 'USD');
    const args = {
      priceAmount,
    };

    describe('When message id is plan-price-interval-day', () => {
      const msgId = dayBasedId;
      it('Handles an interval count of 1', () => {
        const expected = '$5.00 daily';
        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 1,
        });
        expect(actual).toEqual(expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected = '$5.00 every 6 days';
        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 6,
        });
        expect(actual).toEqual(expected);
      });
    });

    describe('When message id is plan-price-interval-week', () => {
      const msgId = weekBasedId;
      it('Handles an interval count of 1', () => {
        const expected = '$5.00 weekly';
        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 1,
        });
        expect(actual).toEqual(expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected = '$5.00 every 6 weeks';
        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 6,
        });
        expect(actual).toEqual(expected);
      });
    });

    describe('When message id is plan-price-interval-month', () => {
      const msgId = monthBasedId;
      it('Handles an interval count of 1', () => {
        const expected = '$5.00 monthly';
        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 1,
        });
        expect(actual).toEqual(expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected = '$5.00 every 6 months';
        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 6,
        });
        expect(actual).toEqual(expected);
      });
    });

    describe('When message id is plan-price-interval-year', () => {
      const msgId = yearBasedId;
      it('Handles an interval count of 1', () => {
        const expected = '$5.00 yearly';
        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 1,
        });
        expect(actual).toEqual(expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected = '$5.00 every 6 years';
        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 6,
        });
        expect(actual).toEqual(expected);
      });
    });
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
  customer: CUSTOMER,
  profile: PROFILE,
  selectedPlan: SELECTED_PLAN,
  upgradeFromPlan: UPGRADE_FROM_PLAN,
  upgradeFromSubscription: customerWebSubscription as WebSubscription,
  invoicePreview: MOCK_PREVIEW_INVOICE_NO_TAX,
  updateSubscriptionPlanStatus: {
    error: null,
    loading: false,
    result: null,
  },
  updateSubscriptionPlanAndRefresh: jest.fn(),
  resetUpdateSubscriptionPlan: jest.fn(),
};
