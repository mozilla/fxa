import { CouponForm } from '@fxa/payments-ui';
/* eslint-disable-next-line */
export interface CouponProps {}

export function Coupon(props: CouponProps) {
  return (
    <div>
      <h1>Welcome to Coupon!</h1>
      <CouponForm readOnly={false} />
    </div>
  );
}

export default Coupon;
