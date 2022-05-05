/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TestRenderer from 'react-test-renderer';

import PlanDetails from './index';
import { getLocalizedCurrency } from '../../lib/formats';
import {
  MOCK_PLANS,
  setupFluentLocalizationTest,
  getLocalizedMessage,
} from '../../lib/test-utils';
import { updateConfig } from '../../lib/config';
import { Plan } from 'fxa-shared/subscriptions/types';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import { Profile } from '../../store/types';
import AppContext, { defaultAppContext } from '../../lib/AppContext';

const userProfile: Profile = {
  avatar: './avatar.svg',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en-US',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
  metricsEnabled: true,
};

const selectedPlan: Plan = {
  plan_id: 'planId',
  plan_name: 'Pro level',
  product_id: 'fpnID',
  product_name: 'Firefox Private Network Pro',
  currency: 'usd',
  amount: 935,
  interval: 'month' as const,
  interval_count: 1,
  plan_metadata: {
    'product:subtitle': 'FPN subtitle',
    'product:details:1': 'Detail 1',
    'product:details:2': 'Detail 2',
    'product:details:3': 'Detail 3',
  },
  product_metadata: null,
};

const selectedPlanWithConfig = {
  ...selectedPlan,
  configuration: {
    urls: {
      webIcon: 'https://webicon',
    },
    uiContent: {
      subtitle: 'VPN subtitle',
    },
    locales: {
      'fy-NL': {
        urls: {
          webIcon: 'https://translatedicon',
        },
        uiContent: {
          subtitle: 'OPN subtitle',
        },
      },
    },
  },
};

afterEach(() => {
  updateConfig({
    featureFlags: {
      useFirestoreProductConfigs: false,
    },
  });
  cleanup();
});

describe('PlanDetails', () => {
  it('renders as expected', () => {
    const subject = () => {
      return render(
        <PlanDetails
          {...{
            profile: userProfile,
            showExpandButton: true,
            isMobile: false,
            selectedPlan,
          }}
        />
      );
    };

    const { queryByTestId, queryByText } = subject();
    const productLogo = queryByTestId('product-logo');
    expect(productLogo).toHaveAttribute('alt', selectedPlan.product_name);
    expect(
      queryByText(selectedPlan.plan_metadata!['product:subtitle'])
    ).toBeInTheDocument();

    const footer = queryByTestId('footer');
    expect(footer).toBeVisible();

    expect(queryByTestId('list')).not.toBeTruthy();
  });

  it('renders as expected using firestore config', () => {
    updateConfig({
      featureFlags: {
        useFirestoreProductConfigs: true,
      },
    });
    const subject = () => {
      return render(
        <PlanDetails
          {...{
            profile: userProfile,
            showExpandButton: true,
            isMobile: false,
            selectedPlan: selectedPlanWithConfig,
          }}
        />
      );
    };

    const { queryByTestId, queryByText } = subject();
    const productLogo = queryByTestId('product-logo');
    expect(productLogo).toHaveAttribute(
      'src',
      selectedPlanWithConfig.configuration.urls.webIcon
    );
    expect(
      queryByText(selectedPlanWithConfig.configuration.uiContent.subtitle)
    ).toBeInTheDocument();
  });

  it('renders as expected using firestore config locale', () => {
    updateConfig({
      featureFlags: {
        useFirestoreProductConfigs: true,
      },
    });
    const subject = () => {
      return render(
        <AppContext.Provider
          value={{ ...defaultAppContext, navigatorLanguages: ['fy-NL'] }}
        >
          <PlanDetails
            {...{
              profile: userProfile,
              showExpandButton: true,
              isMobile: false,
              selectedPlan: selectedPlanWithConfig,
            }}
          />
        </AppContext.Provider>
      );
    };

    const { queryByTestId, queryByText } = subject();
    const productLogo = queryByTestId('product-logo');
    expect(productLogo).toHaveAttribute(
      'src',
      selectedPlanWithConfig.configuration.locales['fy-NL'].urls.webIcon
    );
    expect(
      queryByText(
        selectedPlanWithConfig.configuration.locales['fy-NL'].uiContent.subtitle
      )
    ).toBeInTheDocument();
  });

  it('hides expand button when showExpandButton is false', () => {
    const subject = () => {
      return render(
        <PlanDetails
          {...{
            profile: userProfile,
            showExpandButton: false,
            isMobile: false,
            selectedPlan,
          }}
        />
      );
    };

    const { queryByTestId } = subject();

    const list = queryByTestId('list');
    expect(list).toBeVisible();

    expect(queryByTestId('footer')).not.toBeTruthy();
  });

  it('shows and hides detail section when expand button is clicked', () => {
    const subject = () => {
      return render(
        <PlanDetails
          {...{
            profile: userProfile,
            isMobile: true,
            showExpandButton: true,
            selectedPlan,
          }}
        />
      );
    };

    const { getByTestId, queryByTestId, queryByText } = subject();

    fireEvent.click(getByTestId('button'));

    expect(queryByTestId('list')).toBeVisible();

    for (let idx = 1; idx <= 3; idx++) {
      const item = selectedPlan.plan_metadata![`product:details:${idx}`];
      expect(queryByText(item)).toBeInTheDocument();
    }

    fireEvent.click(getByTestId('button'));

    expect(queryByTestId('list')).not.toBeTruthy();
  });

  it('sets role to "complementary" when isMobile is false', () => {
    const subject = () => {
      return render(
        <PlanDetails
          {...{
            profile: userProfile,
            showExpandButton: false,
            selectedPlan,
            isMobile: false,
          }}
        />
      );
    };

    const { queryByTestId } = subject();

    expect(queryByTestId('plan-details-component')).toHaveAttribute(
      'role',
      'complementary'
    );
  });

  it('does not set role to "complementary" when isMobile is true', () => {
    const subject = () => {
      return render(
        <PlanDetails
          {...{
            profile: userProfile,
            showExpandButton: true,
            selectedPlan,
            isMobile: true,
          }}
        />
      );
    };

    const { queryByTestId } = subject();

    expect(queryByTestId('plan-details-component')).not.toHaveAttribute('role');
  });

  it('does not show the coupon success message when there is no coupon used', () => {
    const subject = () => {
      return render(
        <PlanDetails
          {...{
            profile: userProfile,
            showExpandButton: false,
            isMobile: false,
            selectedPlan,
          }}
        />
      );
    };

    const { queryByTestId } = subject();
    expect(queryByTestId('coupon-success')).not.toBeInTheDocument();
  });

  describe('Valid Coupon Used', () => {
    const coupon: CouponDetails = {
      promotionCode: 'CODE10',
      type: 'once',
      durationInMonths: null,
      valid: true,
      discountAmount: 200,
      maximallyRedeemed: false,
      expired: false,
    };

    it('updates price', async () => {
      updateConfig({
        featureFlags: {},
      });

      const props = {
        ...{
          profile: userProfile,
          showExpandButton: false,
          isMobile: false,
          selectedPlan,
          coupon: coupon,
        },
      };

      const testRenderer = TestRenderer.create(<PlanDetails {...props} />);
      const testInstance = testRenderer.root;

      const planPriceComponent = testInstance.findByProps({
        'data-testid': `plan-price-total`,
      });

      const expectedAmount = getLocalizedCurrency(
        selectedPlan.amount && coupon.discountAmount
          ? selectedPlan.amount - coupon.discountAmount
          : selectedPlan.amount,
        selectedPlan.currency
      );

      expect(planPriceComponent.props.vars.amount).toStrictEqual(
        expectedAmount
      );
    });

    it('for coupon info box without couponDurationDate, display coupon-success message', () => {
      const subject = () => {
        return render(
          <PlanDetails
            {...{
              profile: userProfile,
              showExpandButton: false,
              isMobile: false,
              selectedPlan,
              coupon,
            }}
          />
        );
      };

      const { queryByTestId } = subject();
      expect(queryByTestId('coupon-success')).toBeInTheDocument();
      expect(queryByTestId('coupon-success-with-date')).not.toBeInTheDocument();
    });

    it('for coupon info box with couponDurationDate, display coupon-success-with-date message', () => {
      const subject = () => {
        return render(
          <PlanDetails
            {...{
              profile: userProfile,
              showExpandButton: false,
              isMobile: false,
              selectedPlan,
              coupon: {
                ...coupon,
                type: 'repeating',
                durationInMonths: 2,
              },
            }}
          />
        );
      };

      const { queryByTestId } = subject();
      expect(queryByTestId('coupon-success')).not.toBeInTheDocument();
      expect(queryByTestId('coupon-success-with-date')).toBeInTheDocument();
    });

    it('do not show either coupon-success message, if info box is empty', () => {
      const subject = () => {
        return render(
          <PlanDetails
            {...{
              profile: userProfile,
              showExpandButton: false,
              isMobile: false,
              selectedPlan,
              coupon: {
                ...coupon,
                type: 'forever',
              },
            }}
          />
        );
      };

      const { queryByTestId } = subject();
      expect(queryByTestId('coupon-success')).not.toBeInTheDocument();
      expect(queryByTestId('coupon-success-with-date')).not.toBeInTheDocument();
    });
  });

  describe('Payment Amount Localization', () => {
    const dayBasedId = 'plan-price-day';
    const weekBasedId = 'plan-price-week';
    const monthBasedId = 'plan-price-month';
    const yearBasedId = 'plan-price-year';

    const findMockPlan = (planId: string): Plan => {
      const plan = MOCK_PLANS.find((x) => x.plan_id === planId);
      if (plan) {
        return plan;
      }
      throw new Error(
        'unable to find suitable Plan object for test execution.'
      );
    };

    describe('Localized Plan Billing Description Component', () => {
      function runTests(
        plan: Plan,
        expectedMsgId: string,
        expectedMsg: string
      ) {
        const props = {
          ...{
            profile: userProfile,
            showExpandButton: true,
            isMobile: false,
            selectedPlan: plan,
          },
        };

        const testRenderer = TestRenderer.create(<PlanDetails {...props} />);
        const testInstance = testRenderer.root;

        const planPriceComponent = testInstance.findByProps({
          id: expectedMsgId,
        });
        const expectedAmount = getLocalizedCurrency(plan.amount, plan.currency);

        expect(planPriceComponent.props.vars.amount).toStrictEqual(
          expectedAmount
        );
        expect(planPriceComponent.props.vars.intervalCount).toBe(
          plan.interval_count
        );
        expect(planPriceComponent.props.children).toBe(expectedMsg);
      }

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
      const bundle = setupFluentLocalizationTest('en-US');
      const amount = getLocalizedCurrency(500, 'USD');
      const args = {
        amount,
      };

      describe('When message id is plan-price-day', () => {
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

      describe('When message id is plan-price-week', () => {
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

      describe('When message id is plan-price-month', () => {
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

      describe('When message id is plan-price-year', () => {
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
});
