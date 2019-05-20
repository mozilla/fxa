import React, { useCallback } from 'react';
import { useBooleanState, useCheckboxState } from '../../lib/hooks';
import { Subscription as SubscriptionType } from '../../store/types';

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
    productId,
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
      <p>{productId} - {subscriptionId} - {'' + new Date(createdAt)}</p>
      <div>
        {! cancelRevealed ? <>
          <h3>Cancel subscription <button onClick={revealCancel}>Cancel...</button></h3>
        </> : <>
          <h3>Cancel subscription</h3>
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
    </div>
  );
};

export default Subscription;