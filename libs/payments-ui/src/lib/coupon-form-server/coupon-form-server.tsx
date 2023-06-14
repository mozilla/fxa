// Currently not able to test useFormStatus, due to a similar/same issue described in the issue below.
// https://github.com/nrwl/nx/issues/16956
// 'use client';
// import { experimental_useFormStatus as useFormStatus } from 'react-dom';
import { addItem } from '../serverActions';
import { fetchCartById, fetchGraphQl, fetchPlans } from '../utils';

/* eslint-disable-next-line */
export interface CouponFormServerProps {
  cartId: number;
  readOnly: boolean;
}

export async function CouponFormServer({
  cartId,
  readOnly,
}: CouponFormServerProps) {
  // Currently not able to test useFormStatus, due to a similar/same issue described in the issue below.
  // https://github.com/nrwl/nx/issues/16956
  // const { pending } = useFormStatus()

  const data = await fetchCartById(cartId);
  await fetchPlans();

  return (
    <form
      className="flex gap-4 justify-between items-center"
      action={addItem}
      data-testid="coupon-form"
    >
      <div className="input-row">
        <input
          className="coupon-input"
          type="text"
          name="coupon"
          data-testid="coupon-input"
          defaultValue={data?.singleCart?.promotionCode || ''}
          placeholder="Enter code"
        />
      </div>

      <div>
        <button
          name="apply"
          className="primary-button"
          type="submit"
          data-testid="coupon-button"
        >
          Apply
        </button>
      </div>
    </form>
  );
}

export default CouponFormServer;
