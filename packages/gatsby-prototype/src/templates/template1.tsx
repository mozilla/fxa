import React, { useState } from 'react';
import { graphql, useStaticQuery } from 'gatsby';

import { Form } from '../components/fields';

import AppLocalizationProvider from '../AppLocalizationProvider';
import ChoosePayment from '../components/ChoosePayment';
import CreateAccount from '../components/CreateAccount';
import PlanDetails from '../components/PlanDetails';
import SubscriptionTitle from '../components/SubscriptionTitle';

import { Coupon, PaymentMethodHeaderType } from '../lib/types';
import {
  State as ValidatorState,
  useValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
} from '../lib/validator';

import Layout from '../layouts';

export type CheckoutProps = {
  pageContext: any;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
};

const Checkout = ({
  pageContext: { plan },
  validatorInitialState,
  validatorMiddlewareReducer,
}: CheckoutProps) => {
  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  const [checkboxSet, setCheckboxSet] = useState(false);

  const revisedPlan = {
    ...plan,
    currency: 'usd',
    details: [
      'Device-level encryption',
      'Servers is 30+ countries',
      'Connects 5 devices with one subscription',
      'Available for Windows, iOS and Android',
    ],
  };

  return (
    <AppLocalizationProvider
      userLocales={['en-US']}
      bundles={['gatsby', 'react']}
    >
      <Layout profile={mockProfile}>
        <main className="main-content">
          <SubscriptionTitle
            screenType="create"
            // subtitle={plan.subtitle}
          />

          <div className="payment-panel">
            <PlanDetails
              selectedPlan={revisedPlan}
              // isMobile
              // showExpandButton
              invoicePreview={mockInvoicePreview}
              // coupon={dataCoupon}
            />
          </div>

          <Form
            className="component-card border-t-0 mb-6 py-4 px-4 rounded-t-lg text-grey-600 tablet:rounded-t-none desktop:px-12 desktop:pb-12"
            data-testid="subscription-create"
            validator={validator}
          >
            <CreateAccount />

            <hr className="mx-auto w-full" />

            <ChoosePayment
              paypalScriptLoaded
              selectedPlan={revisedPlan}
              type={PaymentMethodHeaderType.SecondStep}
              onClick={() => setCheckboxSet(!checkboxSet)}
            />
          </Form>
        </main>
      </Layout>
    </AppLocalizationProvider>
  );
};

export default Checkout;

const mockProfile = {
  avatar: 'http://placekitten.com/256/256',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
  metricsEnabled: true,
};

const mockInvoicePreview = {
  total: 2250,
  totalExcludingTax: 1950,
  subtotal: 2000,
  subtotalExcludingTax: 2000,
  currency: 'USD',
  tax: [
    {
      amount: 300,
      inclusive: false,
      displayName: 'Sales Tax',
    },
  ],
  discount: [
    {
      amount: 50,
      amountOff: 50,
      percentOff: null,
    },
  ],
};
