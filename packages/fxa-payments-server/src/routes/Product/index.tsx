import React, { useEffect, useCallback, useContext } from 'react';
import { connect } from 'react-redux';
import { actions, selectors } from '../../store';
import { AppContext } from '../../lib/AppContext';

import {
  State,
  Plan,
  Profile,
  CustomerFetchState,
  CustomerSubscription,
  PlansFetchState,
  CreateSubscriptionFetchState,
  ProfileFetchState,
} from '../../store/types';

import './index.scss';

import PaymentForm from '../../components/PaymentForm';
import PlanDetails from './PlanDetails';
import SubscriptionRedirect from './SubscriptionRedirect';

export type ProductProps = {
  match: {
    params: {
      productId: string,
    }
  },
  profile: ProfileFetchState,
  plans: PlansFetchState,
  customer: CustomerFetchState,
  customerSubscriptions: Array<CustomerSubscription>,
  createSubscriptionStatus: CreateSubscriptionFetchState,
  plansByProductId: (id: string) => Array<Plan>,
  createSubscription: Function,
  resetCreateSubscription: Function,
  fetchProductRouteResources: Function,
};

export const Product = ({
  match: {
    params: {
      productId
    }
  },
  profile,
  plans,
  customer,
  customerSubscriptions,
  createSubscriptionStatus,
  plansByProductId,
  createSubscription,
  resetCreateSubscription,
  fetchProductRouteResources,
}: ProductProps) => {
  const {
    accessToken,
    queryParams,
    navigateToUrl,
  } = useContext(AppContext);

  const {
    plan: planId = '',
    activated: accountActivated = false
  } = queryParams;

  // Fetch plans on initial render, change in product ID, or auth change.
  useEffect(() => {
    if (accessToken) {
      fetchProductRouteResources(accessToken);
    }
  }, [ fetchProductRouteResources, accessToken ]);

  // Reset subscription creation status on initial render.
  useEffect(() => {
    resetCreateSubscription();
  }, [ resetCreateSubscription ]);

  // Figure out a selected plan for product, either from query param or first plan.
  const productPlans = plansByProductId(productId);
  let selectedPlan = productPlans.filter(plan => plan.plan_id === planId)[0];
  if (!selectedPlan) {
    selectedPlan = productPlans[0];
  }

  const onPayment = useCallback((tokenResponse: stripe.TokenResponse) => {
    if (tokenResponse && tokenResponse.token) {
      createSubscription(accessToken, {
        paymentToken: tokenResponse.token.id,
        // eslint-disable-next-line camelcase
        planId: selectedPlan.plan_id,
      });  
    }
  }, [ accessToken, selectedPlan ]);

  const onPaymentError = useCallback((error: any) => {
  }, [ accessToken, selectedPlan ]);

  if (plans.error) {
    return <div>(plans error! {'' + plans.error})</div>;
  }

  if (customer.error) {
    return <div>(customer error! {'' + customer.error})</div>;
  }

  if (createSubscriptionStatus.error) {
    return <div>
      Problem creating subscription:
      {'' + createSubscriptionStatus.error}
    </div>;
  }

  if (createSubscriptionStatus.loading) {
    return <div>Creating subscription...</div>;
  }

  if (! selectedPlan) {
    return null; //<div>No plans available for this product.</div>;
  }

  // If the customer has any subscription plan that matches a plan for the
  // selected product, then they are already subscribed.
  const customerIsSubscribed = ! customer.error &&
    customerSubscriptions.some(customerSubscription =>
      productPlans.some(plan =>
        plan.plan_id === customerSubscription.plan_id));

  return (
    <div className="product-payment">
      {customerIsSubscribed ? <>
        <SubscriptionRedirect {...{ plan: selectedPlan, navigateToUrl }} />
      </> : <>
        {profile.result && <>
          {accountActivated
            ? <AccountActivatedBanner profile={profile.result} />
            : <ProfileBanner profile={profile.result} />}
          <hr />
        </>}
        <PlanDetails plan={selectedPlan} />
        <hr />
        <PaymentForm {...{ onPayment, onPaymentError }} />

        <div className="legal-blurb">
        Mozilla uses Stripe for secure payment processing.
        <br />
        View the <a href="https://stripe.com/privacy">Stripe privacy policy</a>.
      </div>
      </>}
    </div>
  );
};

type ProfileProps = {
  profile: Profile
};

const ProfileBanner = ({
  profile: {
    email,
    avatar,
    displayName,
  }
}: ProfileProps) => (
  <div className="profile-banner">
    <img className="avatar hoisted" src={avatar} />
    {displayName && <h2 className="displayName">{displayName}</h2>}
    <h3 className="name email">{email}</h3>
    {/* TODO: what does "switch account" do? need to re-login and redirect eventually back here?
      <a href="">Switch account</a>
    */}
  </div>
);

const AccountActivatedBanner = ({
  profile: {
    email,
    displayName,
  }
}: ProfileProps) => (
  <div className="account-activated">
    <h2>
      Your account is activated,
      {" "}
      {displayName ? <>
        <span className="displayName">{displayName}</span>
      </> : <>
        <span className="email">{email}</span>
      </>}
    </h2>
  </div>
);

export default connect(
  (state: State) => ({
    customer: selectors.customer(state),
    customerSubscriptions: selectors.customerSubscriptions(state),
    profile: selectors.profile(state),
    plans: selectors.plans(state),
    createSubscriptionStatus: selectors.createSubscriptionStatus(state),
    plansByProductId: selectors.plansByProductId(state),
  }),
  {
    createSubscription: actions.createSubscriptionAndRefresh,
    resetCreateSubscription: actions.resetCreateSubscription,
    fetchProductRouteResources: actions.fetchProductRouteResources,
  }
)(Product);
