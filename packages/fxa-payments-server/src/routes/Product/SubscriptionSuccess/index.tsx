import React, { useContext, useEffect } from 'react';
import { Localized } from 'fluent-react';
import { Plan, Customer } from '../../../store/types';
import { AppContext } from '../../../lib/AppContext';

import { metadataFromPlan } from '../../../store/utils';
import { SelectorReturns } from '../../../store/selectors';

import './index.scss';
import PlanDetails from '../../../components/PlanDetails';
import PaymentConfirmation from '../../../components/PaymentConfirmation';
import Header from '../../../components/Header';

const defaultProductRedirectURL = 'https://mozilla.org';

export type SubscriptionSuccessProps = {
  customer: Customer;
  plan: Plan;
  profile: SelectorReturns['profile'];
};

export const SubscriptionSuccess = ({
  customer,
  plan,
  profile,
}: SubscriptionSuccessProps) => {
  const { product_id } = plan;
  const { downloadURL } = metadataFromPlan(plan);
  const {
    config: { productRedirectURLs },
    matchMedia,
  } = useContext(AppContext);

  const isMobile = matchMedia('(min-width: 768px)');

  const productUrl =
    downloadURL || productRedirectURLs[product_id] || defaultProductRedirectURL;

  return (
    <>
      <Header {...{ profile: profile }} />
      <div className="main-content product-confirmation">
        <PaymentConfirmation
          {...{
            profile: profile,
            selectedPlan: plan,
            customer: customer,
            productUrl,
          }}
        />
        <PlanDetails
          {...{
            selectedPlan: plan,
            showExpandButton: isMobile,
          }}
        />
      </div>
    </>
  );
};

export default SubscriptionSuccess;
