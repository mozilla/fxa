import React, { useCallback } from 'react';
import { useBooleanState, useCheckboxState } from '../../lib/hooks';
import { CustomerSubscription } from '../../store/types';

type SubscriptionProps = {
  accessToken: string,
  subscription: CustomerSubscription,
  cancelSubscription: Function,
};
export const Subscription = ({
  accessToken,
  cancelSubscription,
  subscription: {
    subscription_id,
    plan_id,
    nickname,
    status,
    current_period_start,
    current_period_end,
  },
}: SubscriptionProps) => {
  const [ cancelRevealed, revealCancel, hideCancel ] = useBooleanState();
  const [ confirmationChecked, onConfirmationChanged ] = useCheckboxState();
  const confirmCancellation = useCallback(
    () => cancelSubscription(accessToken, subscription_id),
    [ accessToken, cancelSubscription, subscription_id ]
  );

  return (
    <div className="subscription">
      <h3>{nickname} ({status})</h3>
      <p>{subscription_id} - {plan_id} - {current_period_start} - {current_period_end}</p>
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