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
  data: any;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
};

const Checkout = ({
  data,
  validatorInitialState,
  validatorMiddlewareReducer,
}: CheckoutProps) => {
  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  const [checkboxSet, setCheckboxSet] = useState(false);

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
              selectedPlan={data}
              // isMobile
              // showExpandButton
              invoicePreview={data.subplat.invoicePreview}
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

export const planQuery = useStaticQuery(graphql`
  query PlanByName($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        active
        cancellationSurveyUrl
        description
        id
        path
        planName
        privacyNoticeDownloadUrl
        privacyNoticeUrl
        productName
        styles {
          webIconBackground
        }
        subtitle
        successActionButtonLabel
        successActionButtonUrl
        title
        tosDownloadUrl
        tosUrl
        upgradeCTA
        webIconUrl
      }
    }
  }
`);
