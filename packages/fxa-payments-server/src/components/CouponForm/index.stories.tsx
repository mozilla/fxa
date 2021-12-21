import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import CouponForm from './index';
import { Coupon } from '../../lib/Coupon';

storiesOf('components/Coupon', module).add('default', () => {
  const [coupon, setCoupon] = useState<Coupon>();
  return (
    <MockApp>
      <CouponForm coupon={coupon} setCoupon={setCoupon} />
    </MockApp>
  );
});
