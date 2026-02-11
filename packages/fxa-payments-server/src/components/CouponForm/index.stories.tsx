import React from 'react';
import { Meta } from '@storybook/react';

import { CouponForm, CouponFormProps } from '.';
import MockApp from '../../../.storybook/components/MockApp';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import { SELECTED_PLAN } from '../../lib/mock-data';

export default {
  title: 'components/CouponForm',
  component: CouponForm,
} as Meta;

const coupon: CouponDetails = {
  promotionCode: 'Test',
  type: 'repeating',
  durationInMonths: 1,
  discountAmount: 10,
  valid: true,
  expired: false,
  maximallyRedeemed: false,
};

const storyWithProps = ({
  coupon,
  readOnly = false,
  subscriptionInProgress = false,
}: Partial<
  Pick<CouponFormProps, 'coupon' | 'readOnly' | 'subscriptionInProgress'>
>) => {
  const story = () => (
    <MockApp>
      <CouponForm
        planId={SELECTED_PLAN.plan_id}
        coupon={coupon}
        setCoupon={() => {}}
        readOnly={readOnly}
        subscriptionInProgress={subscriptionInProgress}
      />
    </MockApp>
  );
  return story;
};

export const Default = storyWithProps({});

export const ReadOnlyWithSubscriptionSuccess = storyWithProps({
  coupon,
  readOnly: true,
});

export const NoCouponWithSubscriptionInProgress = storyWithProps({
  subscriptionInProgress: true,
});

export const HasCouponWithSubscriptionInProgress = storyWithProps({
  coupon,
  subscriptionInProgress: true,
});
