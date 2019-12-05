import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../lib/AppContext';
import { State as ValidatorState } from '../../lib/validator';

import { AppContextType } from '../../lib/AppContext';
import { CustomerSubscription, Plan, ProductMetadata } from '../../lib/types';
import { metadataFromPlan } from '../../lib/metadataFromPlan';

import './index.scss';

import DialogMessage from '../../components/DialogMessage';

import SubscriptionRedirect from './SubscriptionRedirect';
import SubscriptionCreate from './SubscriptionCreate';
import SubscriptionUpgrade from './SubscriptionUpgrade';

export type ProductProps = {
  match: {
    params: {
      productId: string;
    };
  };
  validatorInitialState?: ValidatorState;
};

export const Product = ({
  match: {
    params: { productId },
  },
  validatorInitialState,
}: ProductProps) => {
  const {
    locationReload,
    queryParams,
    profile,
    plans,
    customer,
  } = useContext(AppContext);

  const plansById = useMemo(() => indexPlansById(plans), [plans]);

  if (!profile || !plans) {
    return null;
  }

  const customerSubscriptions = customer ? customer.subscriptions : [];

  const planId = queryParams.plan;
  const accountActivated = !!queryParams.activated;

  // Figure out a selected plan for product, either from query param or first plan.
  const productPlans = plans.filter(plan => plan.product_id === productId);
  let selectedPlan = productPlans.filter(plan => plan.plan_id === planId)[0];
  if (!selectedPlan) {
    selectedPlan = productPlans[0];
  }

  if (!selectedPlan) {
    return (
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <h4>Plan not found</h4>
        <p data-testid="no-such-plan-error">No such plan for this product.</p>
      </DialogMessage>
    );
  }

  // Only check for upgrade or existing subscription if we have a customer.
  if (customer) {
    // Can we upgrade from an existing subscription with selected plan?
    const upgradeFrom = findUpgradeFromPlan(
      customerSubscriptions,
      selectedPlan,
      plansById
    );
    if (upgradeFrom) {
      return (
        <SubscriptionUpgrade
          {...{
            selectedPlan,
            upgradeFromPlan: upgradeFrom.plan,
            upgradeFromSubscription: upgradeFrom.subscription,
          }}
        />
      );
    }

    // Do we already have a subscription to the product in the selected plan?
    if (customerIsSubscribedToProduct(customerSubscriptions, productPlans)) {
      return <SubscriptionRedirect {...{ plan: selectedPlan }} />;
    }
  }

  return (
    <SubscriptionCreate
      {...{
        accountActivated,
        selectedPlan,
        validatorInitialState,
      }}
    />
  );
};

type PlansByIdType = {
  [plan_id: string]: { plan: Plan; metadata: ProductMetadata };
};

const indexPlansById = (plans: AppContextType['plans']): PlansByIdType =>
  (plans || []).reduce(
    (acc, plan) => ({
      ...acc,
      [plan.plan_id]: { plan, metadata: metadataFromPlan(plan) },
    }),
    {}
  );

// If the customer has any subscription plan that matches a plan for the
// selected product, then they are already subscribed.
const customerIsSubscribedToProduct = (
  customerSubscriptions: CustomerSubscription[],
  productPlans: Plan[]
) =>
  customerSubscriptions &&
  customerSubscriptions.some(customerSubscription =>
    productPlans.some(plan => plan.plan_id === customerSubscription.plan_id)
  );

// If the customer has any subscribed plan that matches the productSet
// for the selected plan, then that is the plan from which to upgrade.
const findUpgradeFromPlan = (
  customerSubscriptions: CustomerSubscription[],
  selectedPlan: Plan,
  plansById: PlansByIdType
): {
  plan: Plan;
  subscription: CustomerSubscription;
} | null => {
  if (customerSubscriptions) {
    const selectedPlanInfo = plansById[selectedPlan.plan_id];
    for (const customerSubscription of customerSubscriptions) {
      const subscriptionPlanInfo = plansById[customerSubscription.plan_id];
      if (
        selectedPlan.plan_id !== customerSubscription.plan_id &&
        selectedPlanInfo.metadata.productSet &&
        subscriptionPlanInfo.metadata.productSet &&
        selectedPlanInfo.metadata.productSet ===
          subscriptionPlanInfo.metadata.productSet
      ) {
        return {
          plan: subscriptionPlanInfo.plan,
          subscription: customerSubscription,
        };
      }
    }
  }
  return null;
};

export default Product;
