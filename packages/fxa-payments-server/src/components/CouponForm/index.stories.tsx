import { storiesOf } from '@storybook/react';
import React, { useState } from 'react';

import CouponForm from '.';
import MockApp from '../../../.storybook/components/MockApp';
import {
  CouponDetails,
  couponDetailsSchema,
} from 'fxa-shared/dto/auth/payments/coupon';
import { SELECTED_PLAN } from '../../lib/mock-data';

storiesOf('components/Coupon', module)
  .add('default', () => {
    const [coupon, setCoupon] = useState<CouponDetails>();

    return (
      <MockApp>
        <CouponForm
          planId={SELECTED_PLAN.plan_id}
          coupon={coupon}
          setCoupon={setCoupon}
          readOnly={false}
          subscriptionInProgress={false}
        />
      </MockApp>
    );
  })
  .add('readOnly', () => {
    const [coupon, setCoupon] = useState<CouponDetails>();

    return (
      <MockApp>
        <CouponForm
          planId={SELECTED_PLAN.plan_id}
          coupon={coupon}
          setCoupon={setCoupon}
          readOnly={true}
          subscriptionInProgress={false}
        />
      </MockApp>
    );
  })
  .add('readOnly with Coupon', () => {
    const [coupon, setCoupon] = useState<CouponDetails>({
      promotionCode: 'Test',
      type: 'repeating',
      discountAmount: 10,
      valid: true,
    });
    return (
      <MockApp>
        <CouponForm
          planId={SELECTED_PLAN.plan_id}
          coupon={coupon}
          setCoupon={() => {}}
          readOnly={true}
          subscriptionInProgress={false}
        />
      </MockApp>
    );
  })
  .add('default subscription in progress', () => {
    const [coupon, setCoupon] = useState<CouponDetails>();
    return (
      <MockApp>
        <CouponForm
          planId={SELECTED_PLAN.plan_id}
          coupon={coupon}
          setCoupon={setCoupon}
          readOnly={false}
          subscriptionInProgress={true}
        />
      </MockApp>
    );
  })
  .add('has coupon, subscription in progress', () => {
    const [coupon, setCoupon] = useState<CouponDetails>({
      promotionCode: 'Test',
      type: 'repeating',
      discountAmount: 10,
      valid: true,
    });
    return (
      <MockApp>
        <CouponForm
          planId={SELECTED_PLAN.plan_id}
          coupon={coupon}
          setCoupon={() => {}}
          readOnly={false}
          subscriptionInProgress={true}
        />
      </MockApp>
    );
  });
