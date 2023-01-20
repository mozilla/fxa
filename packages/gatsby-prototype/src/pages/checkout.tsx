import React, { useState } from 'react';

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

import CouponForm from '../components/CouponForm';
import Layout from '../layouts';

import { useStaticQuery, graphql } from 'gatsby';

export type CheckoutProps = {
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
};

const Checkout = ({
  validatorInitialState,
  validatorMiddlewareReducer,
}: CheckoutProps) => {
  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  const [checkboxSet, setCheckboxSet] = useState(false);
  const [coupon, setCoupon] = useState<Coupon>();

  const checkCoupon = async (promo: string) => {
    const data = await fetch('http://localhost:3000');
    const coupon: Coupon = await data.json();
    return coupon;
  };

  const data = useStaticQuery(graphql`
    query {
      subplat {
        plan(id: "123", locale: "en-us") {
          id
          productName
          planName
          active
          styles {
            webIconBackground
          }
          description
          subtitle
          upgradeCTA
          successActionButtonUrl
          successActionButtonLabel
          webIconUrl
          tosUrl
          tosDownloadUrl
          privacyNoticeUrl
          privacyNoticeDownloadUrl
          cancellationSurveyUrl
        }

        invoicePreview(planId: "123") {
          total
          totalExcludingTax
          subtotal
          subtotalExcludingTax
          currency
          tax {
            amount
            inclusive
            displayName
          }
          discount {
            amount
            amountOff
          }
        }
      }
    }
  `);

  const plan = {
    ...data.subplat.plan,
    currency: data.subplat.invoicePreview.currency,
    details: data.subplat.plan.description,
  };

  // const dataCoupon: Coupon = {
  //   ...data.subplat.coupon,
  //   couponDurationDate: 12,
  //   message: 'Your plan will automatically renew at the list price.',
  // };

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
              selectedPlan={plan}
              // isMobile
              // showExpandButton
              invoicePreview={data.subplat.invoicePreview}
              coupon={coupon}
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
              selectedPlan={plan}
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
