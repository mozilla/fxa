import React, { useEffect, useContext, useMemo } from 'react';
import { connect } from 'react-redux';
import { Localized } from 'fluent-react';
import { AuthServerErrno } from '../../lib/errors';
import { AppContext } from '../../lib/AppContext';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { State as ValidatorState } from '../../lib/validator';

import { State } from '../../store/state';
import { sequences, SequenceFunctions } from '../../store/sequences';
import { actions, ActionFunctions } from '../../store/actions';
import { selectors, SelectorReturns } from '../../store/selectors';
import { CustomerSubscription, Plan, ProductMetadata } from '../../store/types';
import { metadataFromPlan } from '../../store/utils';

import './index.scss';

import DialogMessage from '../../components/DialogMessage';
import FetchErrorDialogMessage from '../../components/FetchErrorDialogMessage';

import SubscriptionSuccess from './SubscriptionSuccess';
import SubscriptionCreate from './SubscriptionCreate';
import SubscriptionUpgrade from './SubscriptionUpgrade';
import PlanDetails from '../../components/PlanDetails';
import Header from '../../components/Header';

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
  createSubscriptionStatus: SelectorReturns['createSubscriptionStatus'];
  updateSubscriptionPlanStatus: SelectorReturns['updateSubscriptionPlanStatus'];
  createSubscriptionAndRefresh: SequenceFunctions['createSubscriptionAndRefresh'];
  resetCreateSubscription: ActionFunctions['resetCreateSubscription'];
  updateSubscriptionPlanAndRefresh: SequenceFunctions['updateSubscriptionPlanAndRefresh'];
  resetUpdateSubscriptionPlan: ActionFunctions['resetUpdateSubscriptionPlan'];
  fetchProductRouteResources: SequenceFunctions['fetchProductRouteResources'];
  validatorInitialState?: ValidatorState;
};

export const Product = ({
  match: {
    params: { productId },
  },
  profile,
  plans,
  customer,
  customerSubscriptions,
  createSubscriptionStatus,
  plansByProductId,
  createSubscriptionAndRefresh,
  resetCreateSubscription,
  fetchProductRouteResources,
  validatorInitialState,
  updateSubscriptionPlanAndRefresh,
  resetUpdateSubscriptionPlan,
  updateSubscriptionPlanStatus,
}: ProductProps) => {
  const { locationReload, queryParams, matchMedia } = useContext(AppContext);

  const isMobile = matchMedia('(min-width: 768px)');
  const planId = queryParams.plan;
  const accountActivated = !!queryParams.activated;

  // Fetch plans on initial render, change in product ID, or auth change.
  useEffect(() => {
    fetchProductRouteResources();
  }, [fetchProductRouteResources]);

  const plansById = useMemo(() => indexPlansById(plans), [plans]);

  // Figure out a selected plan for product, either from query param or first plan.
  const productPlans = plansByProductId(productId);
  let selectedPlan = productPlans.filter(plan => plan.plan_id === planId)[0];
  if (!selectedPlan) {
    selectedPlan = productPlans[0];
  }

  if (customer.loading || plans.loading || profile.loading) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (!plans.result || plans.error !== null) {
    return (
      <Localized id="product-plan-error">
        <FetchErrorDialogMessage
          testid="error-loading-plans"
          title="Problem loading plans"
          fetchState={plans}
          onDismiss={locationReload}
        />
      </Localized>
    );
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

  if (!selectedPlan) {
    return (
      <DialogMessage className="dialog-error">
        <Localized id="product-plan-not-found">
          <h4>Plan not found</h4>
        </Localized>
        <Localized id="product-no-such-plan">
          <p data-testid="no-such-plan-error">No such plan for this product.</p>
        </Localized>
      </DialogMessage>
    );
  }

  // Only check for upgrade or existing subscription if we have a customer.
  if (customer.result) {
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
            profile: profile.result,
            customer: customer.result,
            selectedPlan,
            upgradeFromPlan: upgradeFrom.plan,
            upgradeFromSubscription: upgradeFrom.subscription,
            updateSubscriptionPlanAndRefresh,
            resetUpdateSubscriptionPlan,
            updateSubscriptionPlanStatus,
          }}
        />
      );
    }

    // Do we already have a subscription to the product in the selected plan?
    if (customerIsSubscribedToProduct(customerSubscriptions, productPlans)) {
      return (
        <SubscriptionSuccess {...{ plan: selectedPlan, customer: customer.result, profile: profile.result }} />
      );
    }
  }

  return (
    <>
      <Header {...{ profile: profile.result }} />
      <div className="main-content">
        <SubscriptionCreate
          {...{
            profile: profile.result,
            accountActivated,
            selectedPlan,
            createSubscriptionAndRefresh,
            createSubscriptionStatus,
            resetCreateSubscription,
            validatorInitialState,
          }}
        />
        <PlanDetails
          {...{
            profile: profile.result,
            selectedPlan,
            showExpandButton: isMobile,
          }}
        />
      </div>
    </>
  );
};

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

// If the customer has any subscription plan that matches a plan for the
// selected product, then they are already subscribed.
const customerIsSubscribedToProduct = (
  customerSubscriptions: ProductProps['customerSubscriptions'],
  productPlans: Plan[]
) =>
  customerSubscriptions &&
  customerSubscriptions.some(customerSubscription =>
    productPlans.some(plan => plan.plan_id === customerSubscription.plan_id)
  );

// If the customer has any subscribed plan that matches the productSet
// for the selected plan, then that is the plan from which to upgrade.
const findUpgradeFromPlan = (
  customerSubscriptions: ProductProps['customerSubscriptions'],
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

// TODO replace this with Redux hooks in component function body
// https://github.com/mozilla/fxa/issues/3020
export default connect(
  (state: State) => ({
    customer: selectors.customer(state),
    customerSubscriptions: selectors.customerSubscriptions(state),
    profile: selectors.profile(state),
    plans: selectors.plans(state),
    createSubscriptionStatus: selectors.createSubscriptionStatus(state),
    updateSubscriptionPlanStatus: selectors.updateSubscriptionPlanStatus(state),
    plansByProductId: selectors.plansByProductId(state),
  }),
  {
    resetCreateSubscription: actions.resetCreateSubscription,
    fetchProductRouteResources: sequences.fetchProductRouteResources,
    createSubscriptionAndRefresh: sequences.createSubscriptionAndRefresh,
    updateSubscriptionPlanAndRefresh:
      sequences.updateSubscriptionPlanAndRefresh,
    resetUpdateSubscriptionPlan: actions.resetUpdateSubscriptionPlan,
  }
)(Product);
