import React, { useCallback, useEffect } from 'react';
import { useBooleanState } from '../../lib/hooks';
import { injectStripe, CardElement, ReactStripeElements } from 'react-stripe-elements';
import { Customer, UpdatePaymentFetchState, CustomerFetchState } from '../../store/types';

type PaymentUpdateFormProps = {
  accessToken: string,
  customer: CustomerFetchState,
  resetUpdatePayment: Function,
  updatePayment: Function,
  updatePaymentStatus: UpdatePaymentFetchState
};
export const PaymentUpdateForm = ({
  accessToken,
  updatePayment,
  updatePaymentStatus,
  resetUpdatePayment,
  customer,
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
          hideUpdate(ev);
          updatePayment(accessToken, {
            paymentToken: result && result.token && result.token.id,
          });
        });
        // TODO: error handling
    }
  }, [ accessToken, updatePayment, hideUpdate, stripe ]);

  if (customer.loading) {
    // If the customer details are loading, then we have nothing to update yet.
    return null;
  }

  if (customer.error) {
    // If there's an error fetching the customer, there are no billing details to update.
    // TODO: Specifically 404 error means no details, 401 / 500 could be reported differently.
    return null;
  }

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

  const { payment_type, last4, exp_month, exp_year } = (customer.result as Customer);
  return (
    <div>
      <h3>Billing information</h3>

      {! updateRevealed ? <>
        <p>[{payment_type}] card ending {last4} Expires {exp_month} / {exp_year}</p>
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