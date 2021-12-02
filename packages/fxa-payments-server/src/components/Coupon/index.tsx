import React, { useState, useContext } from 'react';
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

  const validator = useValidatorState({
    initialState: undefined,
  });

  return (
    <section
      className={`coupon-component ${className}`}
      {...{ role }}
      data-testid="coupon-component"
    >
      <div className="coupon-component-inner">
        <Localized id="coupon-header">
          <h4>Discount</h4>
        </Localized>
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
      </div>
    </section>
  );
};

const onSubmit = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  alert('hello');
};

export default Coupon;
