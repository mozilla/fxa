import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { actions, selectors } from '../../store';
import { Elements } from 'react-stripe-elements';

import {
  State,
  CustomerSubscription,
  SubscriptionsFetchState,
  UpdatePaymentFetchState,
  CustomerFetchState
} from '../../store/types';

import AlertBar from '../../components/AlertBar';
import Subscription from './Subscription';
import PaymentUpdateForm from './PaymentUpdateForm';
import DialogMessage from '../../components/DialogMessage';

export type SubscriptionsProps = {
  accessToken: string,
  customer: CustomerFetchState,
  subscriptions: SubscriptionsFetchState,
  customerSubscriptions: Array<CustomerSubscription>,
  fetchCustomerAndSubscriptions: Function,
  cancelSubscription: Function,
  resetUpdatePayment: Function,
  resetCancelSubscription: Function,
  updatePayment: Function,
  updatePaymentStatus: UpdatePaymentFetchState,
};
export const Subscriptions = ({
  accessToken,
  customer,
  subscriptions,
  customerSubscriptions,
  fetchCustomerAndSubscriptions,
  cancelSubscription,
  updatePayment,
  resetUpdatePayment,
  resetCancelSubscription,
  updatePaymentStatus,
}: SubscriptionsProps) => {
  // Reset subscription cancel status on initial render.
  useEffect(() => {
    resetCancelSubscription();
  }, [ resetCancelSubscription ]);

  // Fetch subscriptions and customer on initial render or auth change.
  useEffect(() => {
    if (accessToken) {
      fetchCustomerAndSubscriptions(accessToken);
    }
  }, [ fetchCustomerAndSubscriptions, accessToken ]);

  if (subscriptions.loading) {
    return <div>(subscriptions loading...)</div>;
  }

  if (subscriptions.error) {
    return <div>(subscriptions error! {'' + subscriptions.error})</div>;
  }

  if (! subscriptions.result || subscriptions.result.length === 0) {
    return (
      <div>
        <h2>Subscriptions</h2>
        <div>No subscriptions yet.</div>
      </div>
    );
  }

  return (
    <div>
      {updatePaymentStatus.loading &&
        <AlertBar className="alert alertPending">
          <span>
            Updating billing information...
          </span>
        </AlertBar>}

      {updatePaymentStatus.error &&
        <DialogMessage className="error" onDismiss={resetUpdatePayment}>
          <p>
            Updating billing information failed:<br />
            {updatePaymentStatus.error.body.message}
          </p>
        </DialogMessage>}

      {updatePaymentStatus.result &&
        <AlertBar className="alert alertSuccess">
          <span>
            Your billing information has been updated successfully!
          </span>
        </AlertBar>}
      
      <h2>Subscriptions</h2>
      <Elements>
        <PaymentUpdateForm {...{
          accessToken,
          customer,
          updatePayment,
          resetUpdatePayment,
          updatePaymentStatus,
        }} />
      </Elements>

      {customerSubscriptions.map((subscription, idx) =>
        <Subscription key={idx} {...{ accessToken, cancelSubscription, subscription }} />)}
    </div>
  );
};

export default connect(
  (state: State) => ({
    customer: selectors.customer(state),
    customerSubscriptions: selectors.customerSubscriptions(state),
    subscriptions: selectors.subscriptions(state),
    updatePaymentStatus: selectors.updatePaymentStatus(state),
  }),
  { 
    fetchCustomerAndSubscriptions: actions.fetchCustomerAndSubscriptions,
    updatePayment: actions.updatePaymentAndRefresh,
    resetUpdatePayment: actions.resetUpdatePayment,
    resetCancelSubscription: actions.resetCancelSubscription,
    cancelSubscription: actions.cancelSubscriptionAndRefresh,
  }
)(Subscriptions);
