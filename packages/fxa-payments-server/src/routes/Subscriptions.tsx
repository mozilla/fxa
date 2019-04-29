import React, { useCallback, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { selectorsFromState, actions } from '../store';
import { SubscriptionsFetchState, Subscription as SubscriptionType } from '../store/types';
import { useBooleanState, useCheckboxState } from '../lib/hooks';
import LoadingSpinner from '../components/LoadingSpinner';

type SubscriptionsProps = {
  accessToken: string,
  isLoading: boolean,
  subscriptions: SubscriptionsFetchState,
  cancelSubscription: Function,
};
export const Subscriptions = ({
  accessToken,
  isLoading,
  subscriptions,
  cancelSubscription,
}: SubscriptionsProps) => {
  const dispatch = useDispatch();

  const resetCancelSubscription = useCallback(() => {
    dispatch(actions.resetCancelSubscription());
  }, [ dispatch ]);

  // Reset subscription cancel status on initial render.
  useEffect(() => {
    resetCancelSubscription();
  }, [ resetCancelSubscription ]);

  // Fetch subscriptions on initial render or auth change.
  useEffect(() => {
    if (accessToken) {
      dispatch(actions.fetchSubscriptions(accessToken));
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

  return (
    <div>
      <h2>Subscriptions</h2>
      {subscriptions.result.length === 0 && (
        <div>No subscriptions yet.</div>
      )}
      {subscriptions.result.map((subscription, idx) =>
        <Subscription key={idx} {...{ accessToken, cancelSubscription, subscription }} />)}
    </div>
  );
};

type SubscriptionProps = {
  accessToken: string,
  subscription: SubscriptionType,
  cancelSubscription: Function,
};
export const Subscription = ({
  accessToken,
  cancelSubscription,
  subscription: {
    subscriptionId,
    productName,
    createdAt
  },
}: SubscriptionProps) => {
  const [ cancelRevealed, revealCancel, hideCancel ] = useBooleanState();
  const [ confirmationChecked, onConfirmationChanged ] = useCheckboxState();
  const confirmCancellation = useCallback(
    () => cancelSubscription(accessToken, subscriptionId),
    [ accessToken, cancelSubscription, subscriptionId ]
  );

  return (
    <div className="subscription">
      <h3>{productName}</h3>
      <p>{subscriptionId} - {productName} - {'' + new Date(createdAt)}</p>
      {! cancelRevealed ? <>
        <div>Cancel subscription <button onClick={revealCancel}>Cancel...</button></div>
      </> : <>
        <p>Cancel subscription</p>
        <p>Cancelling means you&apos;ll no longer be able to access the product...</p>
        <p>
          <label>
            <input type="checkbox" defaultChecked={confirmationChecked} onChange={onConfirmationChanged} />
            Cancel my access and my saved information
          </label>
        </p>
        <p>
          <button onClick={hideCancel}>No, Stay Subscribed</button>
          <button onClick={confirmCancellation} disabled={! confirmationChecked}>Yes, Cancel My Subscription</button>
        </p>
      </>}
    </div>
  );
};

export default connect(
  // TODO: replace this with a useSelector hook
  selectorsFromState('subscriptions'),
  // TODO: replace this with a useDispatch hook
  { cancelSubscription: actions.cancelSubscriptionAndRefresh }
)(Subscriptions);
