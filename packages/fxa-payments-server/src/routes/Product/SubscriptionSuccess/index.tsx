import React, { useContext } from 'react';
import { Plan, Customer, Profile } from '../../../store/types';
import { AppContext } from '../../../lib/AppContext';

import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';

import PlanDetails from '../../../components/PlanDetails';
import PaymentConfirmation from '../../../components/PaymentConfirmation';
import Header from '../../../components/Header';

const defaultProductRedirectURL = 'https://mozilla.org';

export type SubscriptionSuccessProps = {
  customer: Customer;
  plan: Plan;
  profile: Profile;
  isMobile: boolean;
};

export const SubscriptionSuccess = ({
  customer,
  plan,
  profile,
  isMobile,
}: SubscriptionSuccessProps) => {
  const { product_id } = plan;
  const { downloadURL } = metadataFromPlan(plan);
  const {
    config: { productRedirectURLs },
  } = useContext(AppContext);

  const productUrl =
    downloadURL || productRedirectURLs[product_id] || defaultProductRedirectURL;

  return (
    <>
      <Header {...{ profile: profile }} />
      <div className="main-content">
        <PaymentConfirmation
          {...{
            profile: profile,
            selectedPlan: plan,
            customer: customer,
            productUrl,
          }}
        />
        {!isMobile && (
          <PlanDetails
            {...{
              selectedPlan: plan,
              isMobile,
              showExpandButton: isMobile,
            }}
          />
        )}
      </div>
    </>
  );
};

export default SubscriptionSuccess;
