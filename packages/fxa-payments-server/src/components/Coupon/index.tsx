import React, {
  useState,
  useContext,
  MouseEventHandler,
  FormEventHandler,
} from 'react';
import { Localized } from '@fluent/react';
import './index.scss';
import { Form, SubmitButton } from '../fields';
import useValidatorState from '../../lib/validator';
import { checkoutContext } from '../../routes/Checkout';

export const Coupon = () => {
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState(false);

  const validator = useValidatorState({
    initialState: undefined,
  });

  const { coupon, setCoupon } = useContext(checkoutContext);

  const onSubmit: FormEventHandler = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (couponCode === 'test') {
      setHasCoupon(true);
      setCoupon({
        name: 'Test Coupon',
        type: 'fixed',
        expiry: '1/1/2022',
        amount: 2,
      });
    } else {
      setError(true);
    }
  };

  const removeCoupon: MouseEventHandler<HTMLButtonElement> = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    setHasCoupon(false);
    setCoupon(null);
  };

  return (
    <section className={`coupon-component`} data-testid="coupon-component">
      <div className="coupon-component-inner">
        <Localized id="coupon-header">
          <div className="coupon-header">
            <h4>{hasCoupon ? 'Discount Reward Applied' : 'Discount'}</h4>
          </div>
        </Localized>
        {hasCoupon ? (
          <div className="flex">
            <div className="coupon-details">
              <div>{coupon.name}</div>
              <div>Expires {coupon.expiry}</div>
            </div>
            <button onClick={removeCoupon}>
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <Form validator={validator} onSubmit={onSubmit}>
            <Localized attrs={{ placeholder: false }} id={undefined}>
              <div className="input-row">
                <input
                  className={`${error ? 'invalid' : ''}`}
                  type="text"
                  name="coupon"
                  data-testid="coupon"
                  value={couponCode}
                  onChange={(event) => {
                    setError(false);
                    setCouponCode(event.target.value);
                  }}
                  placeholder="Enter code"
                />
              </div>
            </Localized>
            <SubmitButton name="apply">
              <Localized id="sub-apply">
                <span>Apply</span>
              </Localized>
            </SubmitButton>
          </Form>
        )}
        {error ? (
          <div className="coupon-error">
            The code you entered is invalid or expired.
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Coupon;
