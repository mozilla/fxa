// Currently not able to test useFormStatus, due to a similar/same issue described in the issue below.
// https://github.com/nrwl/nx/issues/16956
// 'use client';
// import { experimental_useFormStatus as useFormStatus } from 'react-dom';
import { redirect } from 'next/navigation';
import {
  addItem,
  checkPromotionCode,
  updateCartPromotionCode,
} from '../serverActions';
import { fetchCartById, fetchGraphQl, fetchPlans } from '../utils';
import { CHECK_CODE_STRING, UPDATE_CART_STRING } from '../graphql';

interface WithCouponProps {
  cartId: number;
  readOnly: boolean;
  promotionCode: string;
}

function WithCoupon({ cartId, promotionCode, readOnly }: WithCouponProps) {
  async function removeCoupon() {
    'use server';
    await updateCartPromotionCode('', cartId);

    // Temporary workaround
    // This redirect forces the page to re-load to show cart changes
    // This should be temporary, as it should be possible to update only this component,
    // instead of refreshing the whole page. Still investigating.
    redirect(`/vpn/demo?id=${cartId}`);
  }

  // Currently not able to test useFormStatus, due to a similar/same issue described in the issue below.
  // https://github.com/nrwl/nx/issues/16956
  // const { pending } = useFormStatus()
  const pending = false;

  return (
    <form
      className="flex gap-4 justify-between items-center"
      action={removeCoupon}
      data-testid="coupon-hascoupon"
    >
      <div className="break-all">{promotionCode}</div>
      {readOnly ? null : (
        <div>
          <button
            className="secondary-button"
            disabled={pending}
            data-testid="coupon-remove-button"
          >
            Remove
          </button>
        </div>
      )}
    </form>
  );
}

interface WithoutCouponProps {
  cartId: number;
  promotionCode: string;
}

function WithoutCoupon({ cartId, promotionCode }: WithoutCouponProps) {
  async function applyCoupon(data: FormData) {
    'use server';
    const promotionCode = data.get('coupon') as string;

    await checkPromotionCode(promotionCode, cartId);

    // Temporary workaround
    // This redirect forces the page to re-load to show cart changes
    // This should be temporary, as it should be possible to update only this component,
    // instead of refreshing the whole page. Still investigating.
    redirect(`/vpn/demo?id=${cartId}`);
  }

  // Currently not able to test useFormStatus, due to a similar/same issue described in the issue below.
  // https://github.com/nrwl/nx/issues/16956
  // const { pending } = useFormStatus()
  const pending = false;

  return (
    <form
      className="flex gap-4 justify-between items-center"
      action={applyCoupon}
      data-testid="coupon-form"
    >
      <div className="input-row">
        <input
          className="coupon-input"
          type="text"
          name="coupon"
          data-testid="coupon-input"
          defaultValue={promotionCode}
          placeholder="Enter code"
          disabled={pending}
        />
      </div>

      <div>
        <button
          name="apply"
          className="primary-button"
          type="submit"
          data-testid="coupon-button"
          disabled={pending}
        >
          Apply
        </button>
      </div>
    </form>
  );
}

/* eslint-disable-next-line */
export interface CouponFormServerProps {
  cartId: number;
  readOnly: boolean;
}

export async function CouponFormServer({
  cartId,
  readOnly,
}: CouponFormServerProps) {
  const data = await fetchCartById(cartId);
  const promotionCode = data?.singleCart?.promotionCode;
  const hasPromotionCode = !!promotionCode;
  // const error =
  //   queryError?.message || checkError?.message || updateError?.message;
  const error = null;

  return (
    <div
      className="bg-white rounded-b-lg shadow-sm shadow-grey-300 mt-6 p-4 rounded-t-lg text-base tablet:my-8 coupon-component"
      data-testid="coupon-component"
    >
      <h4 className="m-0 mb-4 font-bold">
        {hasPromotionCode ? `Promo Code Applied` : `Promo Code`}
      </h4>
      {hasPromotionCode ? (
        <WithCoupon
          cartId={cartId}
          readOnly={readOnly}
          promotionCode={promotionCode}
        />
      ) : (
        <WithoutCoupon cartId={cartId} promotionCode={promotionCode} />
      )}
      {error && (
        <div className="text-red-700 mt-4" data-testid="coupon-error">
          {error}
        </div>
      )}
    </div>
  );

  // return (
  //   <form
  //     className="flex gap-4 justify-between items-center"
  //     action={addItem}
  //     data-testid="coupon-form"
  //   >
  //     <div className="input-row">
  //       <input
  //         className="coupon-input"
  //         type="text"
  //         name="coupon"
  //         data-testid="coupon-input"
  //         defaultValue={data?.singleCart?.promotionCode || ''}
  //         placeholder="Enter code"
  //       />
  //     </div>

  //     <div>
  //       <button
  //         name="apply"
  //         className="primary-button"
  //         type="submit"
  //         data-testid="coupon-button"
  //       >
  //         Apply
  //       </button>
  //     </div>
  //   </form>
  // );
}

export default CouponFormServer;
