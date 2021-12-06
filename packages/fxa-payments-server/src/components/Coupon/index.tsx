import React, {
  useState,
  useContext,
  MouseEventHandler,
  FormEventHandler,
} from 'react';
import { Localized } from '@fluent/react';
import { AppContext } from '../../lib/AppContext';
import './index.scss';
import { Form, Input, OnValidateFunction, SubmitButton } from '../fields';
import useValidatorState from '../../lib/validator';

type CouponProps = {
  isMobile: boolean;
  className?: string;
};

export const Coupon = ({ isMobile, className = 'default' }: CouponProps) => {
  const role = isMobile ? undefined : 'complementary';
  const [hasCoupon, setHasCoupon] = useState(false);

  const validator = useValidatorState({
    initialState: undefined,
  });

  const onSubmit: FormEventHandler = (event: any) => {
    event.preventDefault();
    debugger;
    event.stopPropagation();
    setHasCoupon(true);
  };

  const removeCoupon: MouseEventHandler<HTMLButtonElement> = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    setHasCoupon(false);
  };

  return (
    <section
      className={`coupon-component ${className}`}
      {...{ role }}
      data-testid="coupon-component"
    >
      <div className="coupon-component-inner">
        <Localized id="coupon-header">
          <div className="coupon-header">
            <h4>{hasCoupon ? 'Discount Reward Applied' : 'Discount'}</h4>
          </div>
        </Localized>
        {hasCoupon ? (
          <div className="flex">
            <div className="coupon-details">
              <div>Coupon Name</div>
              <div>Expires 1/1/2020</div>
            </div>
            <button onClick={removeCoupon}>
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <Form validator={validator} onSubmit={onSubmit}>
            <Localized attrs={{ placeholder: false }} id={undefined}>
              <Input
                type="text"
                name="coupon"
                data-testid="coupon"
                placeholder="Enter code"
              />
            </Localized>
            <SubmitButton name="apply">
              <Localized id="sub-apply">
                <span>Apply</span>
              </Localized>
            </SubmitButton>
          </Form>
        )}
      </div>
    </section>
  );
};

export default Coupon;
