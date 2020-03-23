import React from 'react';
import { render, cleanup } from '@testing-library/react';
import TestRenderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import fs from 'fs';
import path from 'path';
import { FluentBundle } from 'fluent';
import { Localized } from 'fluent-react';
import { PlanDetails } from './index';
import { DefaultDetails as DoneProDetails } from './Details123DonePro';
import { MOCK_PLANS } from '../../../lib/test-utils';
import { Plan } from '../../../store/types';

const findMockPlan = (planId: string): Plan => {
  const plan = MOCK_PLANS.find(x => x.plan_id === planId);
  if (plan) {
    return plan;
  }
  throw new Error('unable to find suitable Plan object for test execution.');
};

describe('PlanDetails Component', () => {
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
    interval_count: 1,
  };

  describe('rendering the plan billing Localized component', () => {
    it('renders Localized for daily plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_daily';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'day-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 daily';

      const testRenderer = TestRenderer.create(<PlanDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(1);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for 6 days plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_6days';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'day-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 every 6 days';

      const testRenderer = TestRenderer.create(<PlanDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(6);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for weekly plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_weekly';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'week-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 weekly';

      const testRenderer = TestRenderer.create(<PlanDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(1);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for 6 weeks plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_6weeks';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'week-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 every 6 weeks';

      const testRenderer = TestRenderer.create(<PlanDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(6);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for monthly plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_monthly';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'month-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 monthly';

      const testRenderer = TestRenderer.create(<PlanDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(1);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for 6 months plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_6months';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'month-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 every 6 months';

      const testRenderer = TestRenderer.create(<PlanDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(6);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for yearly plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_yearly';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'year-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 yearly';

      const testRenderer = TestRenderer.create(<PlanDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(1);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for years plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_6years';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'year-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 every 6 years';

      const testRenderer = TestRenderer.create(<PlanDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(6);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });
  });

  describe('Fluent Localized Plan Details', () => {
    let bundle: FluentBundle;
    const args = {
      productName: 'FPN',
      amount: '5.00',
    };

    beforeEach(async () => {
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
      bundle = new FluentBundle('en-US');
      bundle.addMessages(enUS);
    });

    describe('when the localized id is day-based-plan-details-amount', () => {
      const msgID = 'day-based-plan-details-amount';

      it('returns the correct string for an interval count of 1', () => {
        const expected = 'FPN billed $5.00 daily';

        const msg = bundle.getMessage(msgID);
        const actual = bundle.format(msg, {
          ...args,
          intervalCount: 1,
        });

        expect(actual == expected);
      });

      it('returns the correct string for an interval count greater than 1', () => {
        const expected = 'FPN billed $5.00 every 6 days';

        const msg = bundle.getMessage(msgID);
        const actual = bundle.format(msg, {
          ...args,
          intervalCount: 6,
        });

        expect(actual == expected);
      });
    });

    describe('when the localized id is week-based-plan-details-amount', () => {
      const msgID = 'week-based-plan-details-amount';

      it('returns the correct string for an interval count of 1', () => {
        const expected = 'FPN billed $5.00 weekly';

        const msg = bundle.getMessage(msgID);
        const actual = bundle.format(msg, {
          ...args,
          intervalCount: 1,
        });

        expect(actual == expected);
      });

      it('returns the correct string for an interval count greater than 1', () => {
        const expected = 'FPN billed $5.00 every 6 weeks';

        const msg = bundle.getMessage(msgID);
        const actual = bundle.format(msg, {
          ...args,
          intervalCount: 6,
        });

        expect(actual == expected);
      });
    });

    describe('when the localized id is month-based-plan-details-amount', () => {
      const msgID = 'month-based-plan-details-amount';

      it('returns the correct string for an interval count of 1', () => {
        const expected = 'FPN billed $5.00 monthly';

        const msg = bundle.getMessage(msgID);
        const actual = bundle.format(msg, {
          ...args,
          intervalCount: 1,
        });

        expect(actual == expected);
      });

      it('returns the correct string for an interval count greater than 1', () => {
        const expected = 'FPN billed $5.00 every 6 months';

        const msg = bundle.getMessage(msgID);
        const actual = bundle.format(msg, {
          ...args,
          intervalCount: 6,
        });

        expect(actual == expected);
      });
    });

    describe('when the localized id is year-based-plan-details-amount', () => {
      const msgID = 'month-based-plan-details-amount';

      it('returns the correct string for an interval count of 1', () => {
        const expected = 'FPN billed $5.00 yearly';

        const msg = bundle.getMessage(msgID);
        const actual = bundle.format(msg, {
          ...args,
          intervalCount: 1,
        });

        expect(actual == expected);
      });

      it('returns the correct string for an interval count greater than 1', () => {
        const expected = 'FPN billed $5.00 every 6 years';

        const msg = bundle.getMessage(msgID);
        const actual = bundle.format(msg, {
          ...args,
          intervalCount: 6,
        });

        expect(actual == expected);
      });
    });
  });
});

describe('123Done PlanDetails Component', () => {
  describe('rendering the plan billing Localized component', () => {
    it('renders Localized for daily plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_daily';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'day-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 daily';

      const testRenderer = TestRenderer.create(<DoneProDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(1);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for 6 days plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_6days';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'day-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 every 6 days';

      const testRenderer = TestRenderer.create(<DoneProDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(6);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for weekly plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_weekly';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'week-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 weekly';

      const testRenderer = TestRenderer.create(<DoneProDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(1);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for 6 weeks plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_6weeks';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'week-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 every 6 weeks';

      const testRenderer = TestRenderer.create(<DoneProDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(6);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for monthly plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_monthly';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'month-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 monthly';

      const testRenderer = TestRenderer.create(<DoneProDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(1);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for 6 months plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_6months';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'month-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 every 6 months';

      const testRenderer = TestRenderer.create(<DoneProDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(6);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for yearly plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_yearly';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'year-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 yearly';

      const testRenderer = TestRenderer.create(<DoneProDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(1);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });

    it('renders Localized for years plan with correct props and displays correct default string', async () => {
      const plan_id = 'plan_6years';
      const plan = findMockPlan(plan_id);
      const expectedMsgId = 'year-based-plan-details-amount';
      const expectedMsg = 'FPN billed $5.00 every 6 years';

      const testRenderer = TestRenderer.create(<DoneProDetails plan={plan} />);
      const testInstance = testRenderer.root;

      const localizedComponents = testInstance.findAllByType(Localized);

      expect(localizedComponents).toHaveLength(2);
      const planDetailsLocalized = localizedComponents[1];
      expect(planDetailsLocalized.props.id).toBe(expectedMsgId);
      expect(planDetailsLocalized.props.$productName).toBe('FPN');
      expect(planDetailsLocalized.props.$amount).toBe('5.00');
      expect(planDetailsLocalized.props.$intervalCount).toBe(6);

      expect(planDetailsLocalized.props.children.props.children).toBe(
        expectedMsg
      );
    });
  });
});
