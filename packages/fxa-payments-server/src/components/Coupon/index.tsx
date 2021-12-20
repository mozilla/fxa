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
import { CouponContext } from '../../lib/CouponContext';

export const Coupon = () => {
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState(false);

  const validator = useValidatorState({
    initialState: undefined,
  });

  const { coupon, setCoupon } = useContext(CouponContext);

  const onSubmit: FormEventHandler = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (couponCode === 'test') {
      setHasCoupon(true);
      setCoupon({
        code: 'TEST',
        type: 'fixed',
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
    <section
      className={`coupon-component ${coupon ? 'has-coupon' : ''}`}
      data-testid="coupon-component"
    >
      <div className="coupon-component-inner">
        {hasCoupon ? (
          <div className="coupon-header">
            <h4>
              <Localized id="coupon-discount-applied">
                Discount Reward Applied
              </Localized>
            </h4>
          </div>
        ) : (
          <div className="coupon-header">
            <h4>
              <Localized id="coupon-discount">Discount</Localized>
            </h4>
          </div>
        )}
        {hasCoupon ? (
          <div className="flex">
            <div className="coupon-details">
              <div>{couponCode}</div>
            </div>
            <button onClick={removeCoupon}>
              <Localized id="coupon-remove">
                <span>Remove</span>
              </Localized>
            </button>
          </div>
        ) : (
          <Form validator={validator} onSubmit={onSubmit}>
            <div className="input-row">
              <Localized attrs={{ placeholder: true }} id="coupon-enter-code">
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
              </Localized>
            </div>

            <SubmitButton name="apply">
              <Localized id="coupon-submit">
                <span>Apply</span>
              </Localized>
            </SubmitButton>
          </Form>
        )}
        {error ? (
          <Localized id="coupon-error">
            <div className="coupon-error">
              The code you entered is invalid or expired.
            </div>
          </Localized>
        ) : null}
      </div>
    </section>
  );
};

export default Coupon;
