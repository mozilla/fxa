import React, { useContext } from 'react';
import { Plan, Customer, Profile } from '../../../store/types';
import { AppContext } from '../../../lib/AppContext';

import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';

import PlanDetails from '../../../components/PlanDetails';
import PaymentConfirmation from '../../../components/PaymentConfirmation';
import Header from '../../../components/Header';
import { Coupon } from '../../../lib/Coupon';

const defaultProductRedirectURL = 'https://mozilla.org';

export type SubscriptionSuccessProps = {
  customer: Customer;
  plan: Plan;
  profile: Profile;
  isMobile: boolean;
  accountExists?: boolean;
  coupon?: Coupon;
};

export const SubscriptionSuccess = ({
  customer,
  plan,
  profile,
  isMobile,
  accountExists = true,
  coupon,
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
      <Header {...{ profile }} />
      <div className="main-content">
        <PaymentConfirmation
          {...{
            profile: profile,
            selectedPlan: plan,
            customer: customer,
            productUrl,
            accountExists,
            coupon,
          }}
        />
        <PlanDetails
          {...{
            selectedPlan: plan,
            isMobile,
            showExpandButton: isMobile,
            coupon: coupon,
          }}
        />
      </div>
    </>
  );
};

export default SubscriptionSuccess;
