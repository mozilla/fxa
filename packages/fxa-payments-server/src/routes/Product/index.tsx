import React, { useEffect, useContext, useMemo } from 'react';
import { connect } from 'react-redux';
import { Localized } from '@fluent/react';
import { AuthServerErrno } from '../../lib/errors';
import { AppContext } from '../../lib/AppContext';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useMatchMedia } from '../../lib/hooks';
import { getSelectedPlan } from '../../lib/plan';

import { State } from '../../store/state';
import { sequences, SequenceFunctions } from '../../store/sequences';
import { actions, ActionFunctions } from '../../store/actions';
import { selectors, SelectorReturns } from '../../store/selectors';
import { CustomerSubscription, Plan, ProductMetadata } from '../../store/types';
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import { getSubscriptionUpdateEligibility } from 'fxa-shared/subscriptions/stripe';

import '../Product/index.scss';

import FetchErrorDialogMessage from '../../components/FetchErrorDialogMessage';
import PlanErrorDialog from '../../components/PlanErrorDialog';

import SubscriptionSuccess from '../Product/SubscriptionSuccess';
import SubscriptionUpgrade from '../Product/SubscriptionUpgrade';
import SubscriptionCreate from '../Product/SubscriptionCreate';
import SubscriptionChangeRoadblock from './SubscriptionChangeRoadblock';
import { SubscriptionUpdateEligibility } from 'fxa-shared/subscriptions/types';

type PlansByIdType = {
  [plan_id: string]: { plan: Plan; metadata: ProductMetadata };
};

const indexPlansById = (plans: State['plans']): PlansByIdType =>
  (plans.result || []).reduce(
    (acc, plan) => ({
      ...acc,
      [plan.plan_id]: { plan, metadata: metadataFromPlan(plan) },
    }),
    {}
  );

// Check if the customer is subscribed to a product.
const customerIsSubscribedToProduct = (
  customerSubscriptions: ProductProps['customerSubscriptions'],
  productId: string
) =>
  customerSubscriptions &&
  customerSubscriptions.some(
    (customerSubscription) => customerSubscription.product_id === productId
  );

// If the customer has any subscription plan that matches a plan for the
// selected product, then they are already subscribed.
const customerIsSubscribedToPlan = (
  customerSubscriptions: ProductProps['customerSubscriptions'],
  selectedPlan: Plan
) =>
  customerSubscriptions &&
  customerSubscriptions.some(
    (customerSubscription) =>
      selectedPlan.plan_id === customerSubscription.plan_id
  );

// If the customer has any subscribed plan that matches the productSet for the
// selected plan, determine whether if it's an upgrade or downgrade.
// Otherwise, it's 'invalid'.
const subscriptionUpdateEligibilityResult = (
  customerSubscriptions: ProductProps['customerSubscriptions'],
  selectedPlan: Plan,
  plansById: PlansByIdType
):
  | {
      subscriptionUpdateEligibility: SubscriptionUpdateEligibility;
      plan: Plan;
      subscription: CustomerSubscription;
    }
  | typeof SubscriptionUpdateEligibility.INVALID => {
  if (customerSubscriptions) {
    for (const customerSubscription of customerSubscriptions) {
      const subscriptionPlanInfo = plansById[customerSubscription.plan_id];
      const subscriptionUpdateEligibility = getSubscriptionUpdateEligibility(
        subscriptionPlanInfo.plan,
        selectedPlan
      );
      if (
        subscriptionUpdateEligibility !== SubscriptionUpdateEligibility.INVALID
      ) {
        return {
          subscriptionUpdateEligibility,
          plan: subscriptionPlanInfo.plan,
          subscription: customerSubscription,
        };
      }
    }
  }

  return SubscriptionUpdateEligibility.INVALID;
};

export type ProductProps = {
  match: {
    params: {
      productId: string;
    };
  };
  profile: SelectorReturns['profile'];
  plans: SelectorReturns['plans'];
  customer: SelectorReturns['customer'];
  customerSubscriptions: SelectorReturns['customerSubscriptions'];
  plansByProductId: SelectorReturns['plansByProductId'];
  updateSubscriptionPlanStatus: SelectorReturns['updateSubscriptionPlanStatus'];
  updateSubscriptionPlanAndRefresh: SequenceFunctions['updateSubscriptionPlanAndRefresh'];
  resetUpdateSubscriptionPlan: ActionFunctions['resetUpdateSubscriptionPlan'];
  fetchProductRouteResources: SequenceFunctions['fetchProductRouteResources'];
  fetchCustomerAndSubscriptions: SequenceFunctions['fetchCustomerAndSubscriptions'];
};

export const Product = ({
  match: {
    params: { productId },
  },
  profile,
  plans,
  customer,
  customerSubscriptions,
  plansByProductId,
  fetchProductRouteResources,
  fetchCustomerAndSubscriptions,
  updateSubscriptionPlanAndRefresh,
  resetUpdateSubscriptionPlan,
  updateSubscriptionPlanStatus,
}: ProductProps) => {
  const {
    accessToken,
    config,
    locationReload,
    queryParams,
    matchMediaDefault,
  } = useContext(AppContext);

  const planId = queryParams.plan;

  if (!accessToken) {
    window.location.href = `${config.servers.content.url}/subscriptions/products/${productId}?plan=${planId}&signin=yes`;
  }

  // Fetch plans on initial render, change in product ID, or auth change.
  useEffect(() => {
    fetchProductRouteResources();
  }, [fetchProductRouteResources]);

  const isMobile = !useMatchMedia('(min-width: 768px)', matchMediaDefault);
  const plansById = useMemo(() => indexPlansById(plans), [plans]);

  const selectedPlan = useMemo(
    () => getSelectedPlan(productId, planId, plansByProductId),
    [plans]
  );

  if (!accessToken || customer.loading || plans.loading || profile.loading) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (!profile.result || profile.error !== null) {
    return (
      <Localized id="product-plan-error">
        <FetchErrorDialogMessage
          testid="error-loading-profile"
          title="Problem loading profile"
          fetchState={profile}
          onDismiss={locationReload}
        />
      </Localized>
    );
  }

  if (
    customer.error &&
    // Unknown customer just means the user hasn't subscribed to anything yet
    customer.error.errno !== AuthServerErrno.UNKNOWN_SUBSCRIPTION_CUSTOMER
  ) {
    return (
      <Localized id="product-customer-error">
        <FetchErrorDialogMessage
          testid="error-loading-customer"
          title="Problem loading customer"
          fetchState={customer}
          onDismiss={locationReload}
        />
      </Localized>
    );
  }

  if (!plans.result || plans.error !== null || !selectedPlan) {
    return <PlanErrorDialog locationReload={locationReload} plans={plans} />;
  }

  // Only check for upgrade or existing subscription if we have a customer.
  if (customer.result) {
    const alreadySubscribedToSelectedPlan = customerIsSubscribedToPlan(
      customerSubscriptions,
      selectedPlan
    );

    // Do we already have a subscription to the product in the selected plan?
    if (alreadySubscribedToSelectedPlan) {
      return (
        <SubscriptionSuccess
          {...{
            plan: selectedPlan,
            customer: customer.result,
            profile: profile.result,
            isMobile,
          }}
        />
      );
    }

    const planUpdateEligibilityResult = subscriptionUpdateEligibilityResult(
      customerSubscriptions,
      selectedPlan,
      plansById
    );

    // Not an upgrade or a downgrade.
    if (planUpdateEligibilityResult === SubscriptionUpdateEligibility.INVALID) {
      if (customerIsSubscribedToProduct(customerSubscriptions, productId)) {
        return (
          <SubscriptionChangeRoadblock
            {...{ profile: profile.result, isMobile, selectedPlan }}
          />
        );
      }
      return (
        <SubscriptionCreate
          {...{
            isMobile,
            profile: profile.result,
            customer: customer.result,
            selectedPlan,
            refreshSubscriptions: fetchCustomerAndSubscriptions,
          }}
        />
      );
    }

    if (
      planUpdateEligibilityResult.subscriptionUpdateEligibility ===
      SubscriptionUpdateEligibility.DOWNGRADE
    ) {
      return (
        <SubscriptionChangeRoadblock
          {...{ profile: profile.result, isMobile, selectedPlan }}
        />
      );
    }

    if (
      planUpdateEligibilityResult.subscriptionUpdateEligibility ===
      SubscriptionUpdateEligibility.UPGRADE
    ) {
      return (
        <SubscriptionUpgrade
          {...{
            isMobile,
            profile: profile.result,
            customer: customer.result,
            selectedPlan,
            upgradeFromPlan: planUpdateEligibilityResult.plan,
            upgradeFromSubscription: planUpdateEligibilityResult.subscription,
            updateSubscriptionPlanAndRefresh,
            resetUpdateSubscriptionPlan,
            updateSubscriptionPlanStatus,
          }}
        />
      );
    }
  }

  return (
    <SubscriptionCreate
      {...{
        isMobile,
        profile: profile.result,
        customer: customer.result,
        selectedPlan,
        refreshSubscriptions: fetchCustomerAndSubscriptions,
      }}
    />
  );
};

export default connect(
  (state: State) => ({
    customer: selectors.customer(state),
    customerSubscriptions: selectors.customerSubscriptions(state),
    profile: selectors.profile(state),
    plans: selectors.plans(state),
    updateSubscriptionPlanStatus: selectors.updateSubscriptionPlanStatus(state),
    plansByProductId: selectors.plansByProductId(state),
  }),
  {
    fetchProductRouteResources: sequences.fetchProductRouteResources,
    fetchCustomerAndSubscriptions: sequences.fetchCustomerAndSubscriptions,
    updateSubscriptionPlanAndRefresh:
      sequences.updateSubscriptionPlanAndRefresh,
    resetUpdateSubscriptionPlan: actions.resetUpdateSubscriptionPlan,
  }
)(Product);
