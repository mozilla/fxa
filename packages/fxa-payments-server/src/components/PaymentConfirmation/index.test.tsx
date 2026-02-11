import React from 'react';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TestRenderer from 'react-test-renderer';

import PaymentConfirmation from './index';
import {
  getLocalizedCurrency,
  getLocalizedDateString,
} from '../../lib/formats';
import { Customer, Plan } from '../../store/types';
import {
  MOCK_PLANS,
  getLocalizedMessage,
  renderWithLocalizationProvider,
  withLocalizationProvider,
} from '../../lib/test-utils';
import { getFtlBundle } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import AppContext, { defaultAppContext } from '../../lib/AppContext';
import { updateConfig } from '../../lib/config';
import { FirstInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';
import { CUSTOMER, PAYPAL_CUSTOMER } from '../../lib/mock-data';

const userProfile = {
  avatar: './avatar.svg',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
  metricsEnabled: false,
};

const userProfileNoDisplayName = {
  ...userProfile,
  displayName: null,
};

const productUrl = 'https://www.example.com';
const defaultButtonLabel = 'Continue to download';

const selectedPlan: Plan = {
  active: true,
  plan_id: '123doneProMonthly',
  plan_name: 'Pro level',
  product_id: 'fpnID',
  product_name: 'Firefox Private Network Pro',
  currency: 'usd',
  amount: 935,
  interval: 'month' as const,
  interval_count: 1,
  plan_metadata: {},
  product_metadata: {},
};

const selectedPlanWithMetadata = {
  ...selectedPlan,
  plan_metadata: {
    'product:successActionButtonLabel': 'Do something else',
    'product:successActionButtonLabel:xx-pirate': 'Yarr...',
  },
};

const selectedPlanWithConfiguration: Plan = {
  ...selectedPlan,
  configuration: {
    productSet: ['testSet'],
    uiContent: {
      successActionButtonLabel: 'Do something else, with configuration',
    },
    locales: {
      'fy-NL': {
        uiContent: {
          successActionButtonLabel: 'Yarr...with configuration',
        },
      },
    },
    styles: {},
    support: {},
    urls: {
      termsOfService: 'https://test',
      termsOfServiceDownload: 'https://test2',
      privacyNotice: 'https://test3',
      successActionButton: 'https://test/4',
      webIcon: 'https://webicon',
    },
  },
};

const customer: Customer = CUSTOMER;

const paypalCustomer: Customer = PAYPAL_CUSTOMER;

const invoice: FirstInvoicePreview = {
  line_items: [],
  subtotal: 0,
  subtotal_excluding_tax: null,
  total: 735,
  total_excluding_tax: null,
};

afterEach(() => {
  cleanup();
  updateConfig({
    featureFlags: {
      useFirestoreProductConfigs: false,
    },
  });
});

describe('PaymentConfirmation', () => {
  it('renders as expected', () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <PaymentConfirmation
          {...{
            profile: userProfile,
            selectedPlan,
            customer,
            productUrl,
          }}
        />
      );
    };

    const { queryByTestId, queryByText } = subject();
    const subscriptionTitle = queryByTestId('subscription-success-title');
    expect(subscriptionTitle).toBeInTheDocument();
    const footer = queryByTestId('footer');
    expect(footer).toBeVisible();
    expect(queryByText(defaultButtonLabel)).toBeInTheDocument();
    const paymentOrder = queryByTestId('payment-confirmation-order');
    expect(paymentOrder?.textContent).toBe(
      `Order detailsInvoice #628031D-0002${getLocalizedDateString(
        Date.now() / 1000 - 86400 * 31
      )}`
    );
  });

  it('renders as expected with no display name', () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <PaymentConfirmation
          {...{
            profile: userProfileNoDisplayName,
            selectedPlan,
            customer,
            productUrl,
          }}
        />
      );
    };

    const { queryByTestId, queryByDisplayValue } = subject();
    const subscriptionTitle = queryByTestId('subscription-success-title');
    expect(subscriptionTitle).toBeInTheDocument();
    const displayName = queryByDisplayValue(userProfile.displayName);
    expect(displayName).toBeNull();
    const footer = queryByTestId('footer');
    expect(footer).toBeVisible();
  });

  it('renders as expected with custom success button label text', () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <PaymentConfirmation
          {...{
            profile: userProfile,
            selectedPlan: selectedPlanWithMetadata,
            customer,
            productUrl,
          }}
        />
      );
    };

    const { queryByTestId, queryByText } = subject();
    const subscriptionTitle = queryByTestId('subscription-success-title');
    expect(subscriptionTitle).toBeInTheDocument();
    const footer = queryByTestId('footer');
    expect(footer).toBeVisible();
    expect(
      queryByText(
        selectedPlanWithMetadata.plan_metadata[
          'product:successActionButtonLabel'
        ]
      )
    ).toBeInTheDocument();
    expect(queryByText(defaultButtonLabel)).not.toBeInTheDocument();
  });

  it('renders as expected with custom success button label text localized to xx-pirate', () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <AppContext.Provider
          value={{ ...defaultAppContext, navigatorLanguages: ['xx-pirate'] }}
        >
          <PaymentConfirmation
            {...{
              profile: userProfile,
              selectedPlan: selectedPlanWithMetadata,
              customer,
              productUrl,
            }}
          />
        </AppContext.Provider>
      );
    };

    const { queryByTestId, queryByText } = subject();
    const subscriptionTitle = queryByTestId('subscription-success-title');
    expect(subscriptionTitle).toBeInTheDocument();
    const footer = queryByTestId('footer');
    expect(footer).toBeVisible();
    expect(
      queryByText(
        selectedPlanWithMetadata.plan_metadata[
          'product:successActionButtonLabel:xx-pirate'
        ]
      )
    ).toBeInTheDocument();
    expect(queryByText(defaultButtonLabel)).not.toBeInTheDocument();
  });

  it('renders as expected with custom success button label text, from firestore config', () => {
    updateConfig({
      featureFlags: {
        useFirestoreProductConfigs: true,
      },
    });
    const subject = () => {
      return renderWithLocalizationProvider(
        <PaymentConfirmation
          {...{
            profile: userProfile,
            selectedPlan: selectedPlanWithConfiguration,
            customer,
            productUrl,
          }}
        />
      );
    };

    const { queryByTestId, queryByText } = subject();
    const subscriptionTitle = queryByTestId('subscription-success-title');
    expect(subscriptionTitle).toBeInTheDocument();
    const footer = queryByTestId('footer');
    expect(footer).toBeVisible();
    expect(
      queryByText(
        selectedPlanWithConfiguration.configuration?.uiContent
          .successActionButtonLabel!
      )
    ).toBeInTheDocument();
    expect(queryByText(defaultButtonLabel)).not.toBeInTheDocument();
  });

  it('renders as expected with custom success button label text, from firestore config, localized to fy-NL', () => {
    updateConfig({
      featureFlags: {
        useFirestoreProductConfigs: true,
      },
    });
    const subject = () => {
      return renderWithLocalizationProvider(
        <AppContext.Provider
          value={{ ...defaultAppContext, navigatorLanguages: ['fy-NL'] }}
        >
          <PaymentConfirmation
            {...{
              profile: userProfile,
              selectedPlan: selectedPlanWithConfiguration,
              customer,
              productUrl,
            }}
          />
        </AppContext.Provider>
      );
    };

    const { queryByTestId, queryByText } = subject();
    const subscriptionTitle = queryByTestId('subscription-success-title');
    expect(subscriptionTitle).toBeInTheDocument();
    const footer = queryByTestId('footer');
    expect(footer).toBeVisible();
    expect(
      queryByText(
        selectedPlanWithConfiguration.configuration?.locales['fy-NL'].uiContent!
          .successActionButtonLabel!
      )
    ).toBeInTheDocument();
    expect(queryByText(defaultButtonLabel)).not.toBeInTheDocument();
  });

  it('renders with the invoice total amount when an invoice is present', () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <AppContext.Provider value={{ ...defaultAppContext }}>
          <PaymentConfirmation
            {...{
              profile: userProfileNoDisplayName,
              selectedPlan,
              customer,
              productUrl,
              invoice,
            }}
          />
        </AppContext.Provider>
      );
    };

    const { queryByTestId } = subject();
    const planPrice = queryByTestId('plan-price');
    expect(planPrice?.innerHTML).toContain('$7.35 monthly');
  });

  it('renders without Order details if not available', () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <PaymentConfirmation
          {...{
            profile: userProfile,
            selectedPlan: {
              ...selectedPlan,
              plan_id: 'other_plan_id',
            },
            customer,
            productUrl,
          }}
        />
      );
    };

    const { queryByTestId } = subject();
    expect(queryByTestId('payment-confirmation-order')).not.toBeInTheDocument();
  });

  describe('When payment_provider is "paypal"', () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <PaymentConfirmation
          {...{
            profile: userProfile,
            selectedPlan,
            customer: paypalCustomer,
            productUrl,
          }}
        />
      );
    };

    it('renders the paypal logo', () => {
      const { queryByTestId } = subject();
      const paypalLogo = queryByTestId('paypal-logo');
      expect(paypalLogo).toBeVisible();
    });

    it('omits the billing info row', () => {
      const { queryByTestId } = subject();
      const billingDetailsRow = queryByTestId('billing-info');
      expect(billingDetailsRow).toBeNull();
    });
  });

  describe('When payment_provider is "stripe"', () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <PaymentConfirmation
          {...{
            profile: userProfile,
            selectedPlan,
            customer,
            productUrl,
          }}
        />
      );
    };

    it('omits the paypal logo', () => {
      const { queryByTestId } = subject();
      const paypalLogo = queryByTestId('paypal-logo');
      expect(paypalLogo).toBeNull();
    });
  });

  describe('Payment information', () => {
    const dayBasedId = 'payment-confirmation-amount-day';
    const weekBasedId = 'payment-confirmation-amount-week';
    const monthBasedId = 'payment-confirmation-amount-month';
    const yearBasedId = 'payment-confirmation-amount-year';

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
      async function runTests(
        plan: Plan,
        expectedMsgId: string,
        expectedMsg: string
      ) {
        const props = {
          ...{
            profile: userProfile,
            selectedPlan: plan,
            customer,
            productUrl,
          },
        };

        const testRenderer = TestRenderer.create(
          withLocalizationProvider(<PaymentConfirmation {...props} />)
        );
        const testInstance = testRenderer.root;

        const planPriceComponent = await testInstance.findByProps({
          id: expectedMsgId,
        });
        const expectedAmount = getLocalizedCurrency(plan.amount, plan.currency);

        expect(planPriceComponent.props.vars.amount).toStrictEqual(
          expectedAmount
        );
        expect(planPriceComponent.props.vars.intervalCount).toBe(
          plan.interval_count
        );
        expect(planPriceComponent.props.children.props.children).toBe(
          expectedMsg
        );
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
      let bundle: FluentBundle;
      beforeAll(async () => {
        bundle = await getFtlBundle('payments');
      });
      const amount = getLocalizedCurrency(500, 'USD');
      const args = {
        amount,
      };

      describe('When message id is payment-confirmation-amount-day', () => {
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

      describe('When message id is payment-confirmation-amount-week', () => {
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

      describe('When message id is payment-confirmation-amount-month', () => {
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

      describe('When message id is payment-confirmation-amount-year', () => {
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
