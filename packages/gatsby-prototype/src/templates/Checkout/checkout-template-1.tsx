import React, { useState } from 'react';

import { Form } from '../../components/fields';

import AppLocalizationProvider from '../../AppLocalizationProvider';
import ChoosePayment from '../../components/ChoosePayment';
import CreateAccount from '../../components/CreateAccount';
import PlanDetails from '../../components/PlanDetails';
import SubscriptionTitle from '../../components/SubscriptionTitle';

import { Coupon, PaymentMethodHeaderType } from '../../lib/types';
import {
  State as ValidatorState,
  useValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
} from '../../lib/validator';

import CouponForm from '../../components/CouponForm';
import Layout from '../../layouts';

export type CheckoutProps = {
  pageContext: any;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
};

const Checkout = ({
  pageContext: data,
  validatorInitialState,
  validatorMiddlewareReducer,
}: CheckoutProps) => {
  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  const [checkboxSet, setCheckboxSet] = useState(false);
  const [coupon, setCoupon] = useState<Coupon>();

  const checkCoupon = (promo: string) => {
    return revisedCoupon;
  };

  const revisedPlan = {
    ...data.plan,
    currency: 'usd',
    details: [
      'Device-level encryption',
      'Servers is 30+ countries',
      'Connects 5 devices with one subscription',
      'Available for Windows, iOS and Android',
    ],
  };

  const revisedCoupon: Coupon = {
    ...data.coupon,
    couponDurationDate: 12,
    message: 'Your plan will automatically renew at the list price.',
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
              invoicePreview={data.invoicePreview}
              coupon={revisedCoupon}
            />

            <CouponForm
              readOnly={false}
              subscriptionInProgress={false}
              coupon={coupon}
              setCoupon={setCoupon}
              checkCoupon={checkCoupon}
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
              selectedPlan={data}
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
