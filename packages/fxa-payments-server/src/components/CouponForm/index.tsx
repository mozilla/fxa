import React, { useState, MouseEventHandler, FormEventHandler } from 'react';
import { Localized } from '@fluent/react';
import './index.scss';
import { Coupon } from '../../lib/Coupon';

type CouponFormProps = {
  coupon?: Coupon;
  setCoupon: (coupon: Coupon | undefined) => void;
};

export const CouponForm = ({ coupon, setCoupon }: CouponFormProps) => {
  const [hasCoupon, setHasCoupon] = useState(coupon ? true : false);
  const [couponCode, setCouponCode] = useState(coupon ? 'test' : '');
  const [error, setError] = useState(false);

  const onSubmit: FormEventHandler = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (couponCode === 'test') {
      setHasCoupon(true);
      setCoupon({
        amount: 200,
      });
    } else {
      setError(true);
    }
  };

  const removeCoupon: MouseEventHandler<HTMLButtonElement> = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    setHasCoupon(false);
    setCoupon(undefined);
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
          <div className="flex" data-testid="coupon-hascoupon">
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
          <form onSubmit={onSubmit} data-testid="coupon-form">
            <div className="input-row">
              <Localized attrs={{ placeholder: true }} id="coupon-enter-code">
                <input
                  className={`${error ? 'invalid' : ''}`}
                  type="text"
                  name="coupon"
                  data-testid="coupon-input"
                  value={couponCode}
                  onChange={(event) => {
                    setError(false);
                    setCouponCode(event.target.value);
                  }}
                  placeholder="Enter code"
                />
              </Localized>
            </div>

            <button name="apply" type="submit" data-testid="coupon-button">
              <Localized id="coupon-submit">
                <span>Apply</span>
              </Localized>
            </button>
          </form>
        )}
        {error ? (
          <Localized id="coupon-error">
            <div className="coupon-error" data-testid="coupon-error">
              The code you entered is invalid or expired.
            </div>
          </Localized>
        ) : null}
      </div>
    </section>
  );
};

export default CouponForm;
