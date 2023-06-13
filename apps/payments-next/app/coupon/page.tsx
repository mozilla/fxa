import { ApolloWrapper, CouponForm } from '@fxa/payments-ui';
/* eslint-disable-next-line */
export interface CouponProps {}

export default function Coupon(props: CouponProps) {
  return (
    <div>
      <h1>Welcome to Coupon!</h1>
      <ApolloWrapper>
        <CouponForm readOnly={false} />
      </ApolloWrapper>
    </div>
  );
}
