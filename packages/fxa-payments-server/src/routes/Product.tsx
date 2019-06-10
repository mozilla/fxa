import React, { useEffect, useCallback, useContext } from 'react';
import { connect } from 'react-redux';
import { injectStripe, CardElement, Elements, ReactStripeElements } from 'react-stripe-elements';
import { Link } from 'react-router-dom';
import { actions, selectors } from '../store';
import { AppContext } from '../lib/AppContext';

import {
  State,
  Plan,
  SubscriptionsFetchState,
  PlansFetchState,
  CreateSubscriptionFetchState,
} from '../store/types';

import ProductValueProposition from '../components/ProductValueProposition';
import { useCheckboxState } from '../lib/hooks';

export type ProductProps = {
  match: {
    params: {
      productId: string,
    }
  },
  plans: PlansFetchState,
  createSubscriptionStatus: CreateSubscriptionFetchState,
  subscriptions: SubscriptionsFetchState,
  plansByProductId: (id: string) => Array<Plan>,
  createSubscription: Function,
  resetCreateSubscription: Function,
  fetchPlansAndSubscriptions: Function,
};

export const Product = ({
  match: {
    params: {
      productId
    }
  },
  plans,
  createSubscriptionStatus,
  subscriptions,
  plansByProductId,
  createSubscription,
  resetCreateSubscription,
  fetchPlansAndSubscriptions,
}: ProductProps) => {
  const {
    accessToken,
    queryParams,
  } = useContext(AppContext);

  // Reset subscription creation status on initial render.
  useEffect(() => {
    resetCreateSubscription();
  }, [ resetCreateSubscription ]);

  // Fetch plans on initial render, change in product ID, or auth change.
  useEffect(() => {
    if (accessToken) {
      fetchPlansAndSubscriptions(accessToken);
    }
  }, [ fetchPlansAndSubscriptions, accessToken ]);

  if (plans.error) {
    return <div>(plans error! {'' + plans.error})</div>;
  }

  if (subscriptions.error) {
    return <div>(subscriptions error! {'' + subscriptions.error})</div>;
  }

  const planId = queryParams.plan;
  const productPlans = plansByProductId(productId);
  let selectedPlan = productPlans
    .filter(plan => plan.plan_id === planId)[0];
  if (!selectedPlan) {
    selectedPlan = productPlans[0];
  }

  if (! selectedPlan) {
    return <div>No plans available for this product.</div>;
  }

  if (createSubscriptionStatus.loading) {
    return <div>Creating subscription...</div>;
  }

  if (createSubscriptionStatus.error) {
    return <div>
      Problem creating subscription:
      {'' + createSubscriptionStatus.error}
    </div>;
  }

  if (createSubscriptionStatus.result) {
    return <div>
      <h2>TODO: Redirect to product goes here</h2>
      <Link to="/subscriptions">Manage subscriptions</Link>
    </div>;
  }

  // TODO: Rename productName column to productId
  // https://github.com/mozilla/fxa/issues/1187
  const alreadyHasProduct = (subscriptions.result || [])
    .some(subscription => subscription.productName === productId);
  if (alreadyHasProduct) {
    return <div>
      <h2>TODO: Already have a subscription to the product. Redirect to product goes here?</h2>
      <Link to="/subscriptions">Manage subscriptions</Link>
    </div>;
  }

  return (
    <div>
      <div>
        <h2>Let&apos;s set up your subscription</h2>
        <ProductValueProposition plan={selectedPlan} />
      </div>
      <Elements>
        <SubscriptionForm {...{
          accessToken,
          createSubscription,
          selectedPlan,
        }} />
      </Elements>
    </div>
  );
};

type SubscriptionFormProps = {
  accessToken: string,
  selectedPlan: Plan,
  createSubscription: Function,
};
export const SubscriptionFormRaw = ({
  accessToken,
  selectedPlan,
  createSubscription,
  stripe,
}: SubscriptionFormProps & ReactStripeElements.InjectedStripeProps) => {
  const [ confirmationChecked, onConfirmationChanged ] = useCheckboxState();

  const onSubmit = useCallback(ev => {
    ev.preventDefault();

    // TODO: use react state on form fields along with validation
    const data = new FormData(ev.target);
    const name = String(data.get('name'));

    if (stripe) {
      stripe
        .createToken({ name })
        .then((result) => {
          console.log('RESULT', result);

          createSubscription(accessToken, {
            paymentToken: result && result.token && result.token.id,
            // eslint-disable-next-line camelcase
            planId: selectedPlan.plan_id,
          });
        });
    }
  }, [ accessToken, selectedPlan, createSubscription, stripe ]);

  return (
    <form onSubmit={onSubmit}>
      <h2>Payment information</h2>
      <ul>
        <li>
          <input name="name" placeholder="Name" />
        </li>
        <li>
          <p>Card details (e.g. 4242 4242 4242 4242)</p>
          <CardElement style={{base: {fontSize: '18px'}}} />
        </li>
        <li>
          <label>
            <input type="checkbox" defaultChecked={confirmationChecked} onChange={onConfirmationChanged} />
            {' '}I authorize Mozilla to charge this payment method
          </label>
        </li>
        <li>
          <button disabled={! confirmationChecked}>Submit</button>
        </li>
      </ul>
    </form>
  );
};
export const SubscriptionForm = injectStripe(SubscriptionFormRaw);

export default connect(
  (state: State) => ({
    plans: selectors.plans(state),
    subscriptions: selectors.subscriptions(state),
    createSubscriptionStatus: selectors.createSubscriptionStatus(state),
    plansByProductId: selectors.plansByProductId(state),
  }),
  {
    createSubscription: actions.createSubscriptionAndRefresh,
    resetCreateSubscription: actions.resetCreateSubscription,
    fetchPlansAndSubscriptions: actions.fetchPlansAndSubscriptions,
  }
)(Product);
