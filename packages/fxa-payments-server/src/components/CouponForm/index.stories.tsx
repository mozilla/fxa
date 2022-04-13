import { storiesOf } from '@storybook/react';
import React, { useState } from 'react';

import CouponForm from '.';
import MockApp from '../../../.storybook/components/MockApp';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
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
  .add('readOnly with Coupon - subscription success', () => {
    const [coupon] = useState<CouponDetails>({
      promotionCode: 'Test',
      type: 'repeating',
      durationInMonths: 1,
      discountAmount: 10,
      valid: true,
      expired: false,
      maximallyRedeemed: false,
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
  .add('no coupon - subscription in progress', () => {
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
  .add('has coupon - subscription in progress', () => {
    const [coupon] = useState<CouponDetails>({
      promotionCode: 'Test',
      type: 'repeating',
      durationInMonths: 1,
      discountAmount: 10,
      valid: true,
      expired: false,
      maximallyRedeemed: false,
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
