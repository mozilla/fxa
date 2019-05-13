import React, { useCallback, useEffect } from 'react';
import { useBooleanState } from '../../lib/hooks';
import { injectStripe, CardElement, ReactStripeElements } from 'react-stripe-elements';
import { UpdatePaymentFetchState } from '../../store/types';

type PaymentUpdateFormProps = {
  accessToken: string,
  resetUpdatePayment: Function,
  updatePayment: Function,
  updatePaymentStatus: UpdatePaymentFetchState
};
export const PaymentUpdateForm = ({
  accessToken,
  updatePayment,
  updatePaymentStatus,
  resetUpdatePayment,
  stripe
}: PaymentUpdateFormProps & ReactStripeElements.InjectedStripeProps) => {
  const [ updateRevealed, revealUpdate, hideUpdate ] = useBooleanState();

  // Reset payment update status on initial render.
  useEffect(() => { 
    resetUpdatePayment(); 
  }, [ resetUpdatePayment ]);

  const onSubmit = useCallback(ev => {
    ev.preventDefault();

    // TODO: use react state on form fields along with validation
    const data = new FormData(ev.target);
    const name = String(data.get('name'));

    if (stripe) {
      stripe
        .createToken({ name })
        .then((result) => {
          updatePayment(accessToken, {
            paymentToken: result && result.token && result.token.id,
          });
          hideUpdate(ev);
        });
        // TODO: error handling
    }
  }, [ accessToken, updatePayment, stripe ]);

  if (updatePaymentStatus.loading) {
    return (
      <div>
        <h3>Billing information</h3>
        <p>Updating...</p>
      </div>
    );
  }

  if (updatePaymentStatus.error) {
    return (
      <div>
        <h3>Billing information</h3>
        <p>Updating... Error! {'' + updatePaymentStatus.error}</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Billing information</h3>
      {(!!updatePaymentStatus.result) &&
        <p>Updating... Success! {'' + updatePaymentStatus.result}</p>}
      {! updateRevealed ? <>
        <button onClick={revealUpdate}>Change...</button>
      </> : <>
        <form onSubmit={onSubmit}>
          <ul>
            <li>
              <input name="name" placeholder="Name" />
            </li>
            <li>
              <p>Card details (e.g. 4242 4242 4242 4242)</p>
              <CardElement style={{base: {fontSize: '18px'}}} />
            </li>
            <li>
              <button onClick={hideUpdate}>Cancel</button>
              <button>Update</button>
            </li>
          </ul>
        </form>
      </>}
    </div>
  );
};

export default injectStripe(PaymentUpdateForm);