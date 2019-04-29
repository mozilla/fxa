import React from 'react';
import { connect } from 'react-redux';
import { Elements } from 'react-stripe-elements';
import { selectors, actions } from '../../store';
import { mapToObject } from '../../utils';

import SubscriptionForm from '../SubscriptionForm';

export const Home = ({
  config = {},
  accessToken = '',
  isLoading = true,
  lastError = null,
  profile = {},
  plans = [],
  subscriptions = [],
  productId = null,
  plansByProductId = [],
  createSubscription,
  cancelSubscription,
}) => {
  if (!accessToken) {
    return <h1>Need an #accessToken=... parameter!</h1>
  }
  return (
    <div>
      <a href={`${config.CONTENT_SERVER_ROOT}/settings`}>&#x2039; Back to FxA Settings</a>

      {profile.loading && <h1>(profile loading...)</h1>}
      {profile.error && <h1>(profile error! {'' + profile.error})</h1>}
      {profile.result && <h1>Hello! {profile.result.email}</h1>}

      {productId === null && <div>
        <h2>Current Subscriptions</h2>
        <ul>
          {subscriptions.loading && <li>(subscriptions loading...)</li>}
          {subscriptions.error && <h1>(subscriptions error! {'' + subscriptions.error})</h1>}
          {subscriptions.result && (
            subscriptions.result.length === 0 ? (
              <li>No subscriptions yet.</li>
            ) : (
              subscriptions.result.map(({ subscriptionId, productName, createdAt }) => (
                <li key={subscriptionId}>
                  <button onClick={() => cancelSubscription(subscriptionId)}>Cancel!</button>
                  {" "}- {subscriptionId} - {productName} - {createdAt}
                </li>
              ))
            )
          )}
        </ul>
      </div>}

      <div>
        <h2>Available Plans</h2>
        {plans.loading && <li>(plans loading...)</li>}
        {plans.error && <h1>(plans error! {'' + plans.error})</h1>}
        {plans.result && (
          <Elements>
            <SubscriptionForm {...{
              plansByProductId,
              createSubscription,
            }} />
          </Elements>
        )}
      </div>

    </div>
  );
};

export default connect(
  state => ({
    ...mapToObject(Object.keys(selectors), name => selectors[name](state))
  }),
  {
    createSubscription: actions.createSubscriptionAndRefresh,
    cancelSubscription: actions.cancelSubscriptionAndRefresh,
  }
)(Home);
