import React, { useCallback, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { selectorsFromState, actions } from '../../store';
import { Elements } from 'react-stripe-elements';
import { SubscriptionsFetchState, UpdatePaymentFetchState, CustomerFetchState } from '../../store/types';
import LoadingSpinner from '../../components/LoadingSpinner';

import Subscription from './Subscription';
import PaymentUpdateForm from './PaymentUpdateForm';

type SubscriptionsProps = {
  accessToken: string,
  isLoading: boolean,
  customer: CustomerFetchState,
  subscriptions: SubscriptionsFetchState,
  cancelSubscription: Function,
  resetUpdatePayment: Function,
  updatePayment: Function,
  updatePaymentStatus: UpdatePaymentFetchState,
};
export const Subscriptions = ({
  accessToken,
  isLoading,
  customer,
  subscriptions,
  cancelSubscription,
  updatePayment,
  resetUpdatePayment,
  updatePaymentStatus,
}: SubscriptionsProps) => {
  const dispatch = useDispatch();

  const resetCancelSubscription = useCallback(() => {
    dispatch(actions.resetCancelSubscription());
  }, [ dispatch ]);

  // Reset subscription cancel status on initial render.
  useEffect(() => {
    resetCancelSubscription();
  }, [ resetCancelSubscription ]);

  // Fetch subscriptions and customer on initial render or auth change.
  useEffect(() => {
    if (accessToken) {
      dispatch(actions.fetchSubscriptions(accessToken));
      dispatch(actions.fetchCustomer(accessToken));
    }
  }, [ dispatch, accessToken ]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (subscriptions.loading) {
    return <div>(subscriptions loading...)</div>;
  }

  if (subscriptions.error) {
    return <div>(subscriptions error! {'' + subscriptions.error})</div>;
  }

  if (subscriptions.result.length === 0) {
    return (
      <div>
        <h2>Subscriptions</h2>
        <div>No subscriptions yet.</div>
      </div>
    );
  }

  return (
    <div>
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

      {subscriptions.result.map((subscription, idx) =>
        <Subscription key={idx} {...{ accessToken, cancelSubscription, subscription }} />)}
    </div>
  );
};

export default connect(
  // TODO: replace this with a useSelector hook
  selectorsFromState('customer', 'subscriptions', 'updatePaymentStatus'),
  // TODO: replace this with a useDispatch hook
  { 
    updatePayment: actions.updatePaymentAndRefresh,
    resetUpdatePayment: actions.resetUpdatePayment,
    cancelSubscription: actions.cancelSubscriptionAndRefresh,
  }
)(Subscriptions);
