import { storiesOf } from '@storybook/react';
import React, { useState } from 'react';

import CouponForm from '.';
import MockApp from '../../../.storybook/components/MockApp';
import { Coupon } from '../../lib/Coupon';
import { SELECTED_PLAN } from '../../lib/mock-data';

storiesOf('components/Coupon', module).add('default', () => {
  const [coupon, setCoupon] = useState<Coupon>();

  return (
    <MockApp>
      <CouponForm planId={SELECTED_PLAN.plan_id} coupon={coupon} setCoupon={setCoupon} />
    </MockApp>
  );
});
