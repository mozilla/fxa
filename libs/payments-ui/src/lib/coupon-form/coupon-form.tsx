'use client';

import { FormEventHandler, RefObject, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  CART_QUERY,
  CART_QUERY_DELAY,
  CHECK_CODE,
  UPDATE_CART,
} from '../graphql';

/**
 * GENERAL COMMENTS
 *  - Example of a Client Component. (Note the 'use client' directive on line 1)
 *    - Necessary to be a client component to handle loading/disabled states
 *    - Uses Apollo Client, and Apollo Cache to maintain Cart state
 *  - Improvements
 *    - Instead of querying initial cart state in this component, pass it in via props.
 *    - Use Next.js Server Actions and turn this into a server component, and remove
 *      complexity of using Apollo Client.
 *    - Add proper loading state
 */

/*
  ## Links
  * https://www.apollographql.com/blog/apollo-client/next-js/next-js-getting-started/
  * https://www.apollographql.com/docs/react/performance/server-side-rendering/
  * https://medium.com/@zhamdi/server-side-rendering-ssr-using-apollo-and-next-js-ac0b2e3ea461
  * https://github.com/vercel/next.js/tree/canary/examples/with-apollo
  * https://www.apollographql.com/blog/announcement/frontend/using-apollo-client-with-next-js-13-releasing-an-official-library-to-support-the-app-router/
  * https://www.apollographql.com/blog/apollo-client/next-js/how-to-use-apollo-client-with-next-js-13/
*/

function errorHandler(err: Error) {
  console.error(err.message);
}

interface WithCouponProps {
  readOnly: boolean;
  disabled: boolean;
  promotionCode: string;
  clearPromotionCode: () => void;
}

function WithCoupon({
  promotionCode,
  readOnly,
  disabled,
  clearPromotionCode,
}: WithCouponProps) {
  return (
    <div
      className="flex gap-4 justify-between items-center"
      data-testid="coupon-hascoupon"
    >
      <div className="break-all">{promotionCode}</div>
      {readOnly ? null : (
        <div>
          <button
            className="secondary-button"
            onClick={clearPromotionCode}
            disabled={disabled}
            data-testid="coupon-remove-button"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

interface WithoutCouponProps {
  disabled: boolean;
  promotionCode: string;
  couponInputRef: RefObject<HTMLInputElement>;
  onSubmit: (event: any) => void;
}

function WithoutCoupon({
  disabled,
  promotionCode,
  couponInputRef,
  onSubmit,
}: WithoutCouponProps) {
  return (
    <form
      className="flex gap-4 justify-between items-center"
      onSubmit={onSubmit}
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
          disabled={disabled}
          ref={couponInputRef}
        />
      </div>

      <div>
        <button
          name="apply"
          className="primary-button"
          type="submit"
          data-testid="coupon-button"
          disabled={disabled}
        >
          Apply
        </button>
      </div>
    </form>
  );
}

/* eslint-disable-next-line */
export interface CouponFormProps {
  cartId: number;
  readOnly: boolean;
}

export function CouponForm({ cartId, readOnly }: CouponFormProps) {
  const couponInputRef = useRef<HTMLInputElement>(null);
  const [checkCode, { loading: checkLoading, error: checkError }] = useMutation(
    CHECK_CODE,
    {
      onError: errorHandler,
    }
  );
  const [updateCart, { loading: updateLoading, error: updateError }] =
    useMutation(UPDATE_CART, {
      onError: errorHandler,
    });
  const {
    loading,
    error: queryError,
    data,
  } = useQuery(CART_QUERY_DELAY, {
    variables: {
      input: { id: cartId },
    },
  });

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    // Simulate request time (For demo purposes)
    await new Promise((resolve) => {
      setTimeout(() => resolve(null), 1000);
    });
    checkCode({
      variables: {
        input: {
          id: cartId,
          promotionCode: couponInputRef?.current?.value || '',
        },
      },
    });
  };

  const promotionCode = data?.singleCartDelay?.promotionCode;
  const hasPromotionCode = !!promotionCode;
  const error =
    queryError?.message || checkError?.message || updateError?.message;

  // TODO - Add proper loading state maybe using Suspense?
  if (loading) {
    return (
      <div className="py-12 text-center text-xl bg-slate-200">Loading...</div>
    );
  }

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
          readOnly={readOnly}
          disabled={updateLoading}
          promotionCode={promotionCode}
          clearPromotionCode={async () => {
            updateCart({
              variables: {
                input: {
                  id: cartId,
                  promotionCode: '',
                },
              },
            });
          }}
        />
      ) : (
        <WithoutCoupon
          disabled={checkLoading}
          promotionCode={promotionCode}
          couponInputRef={couponInputRef}
          onSubmit={onSubmit}
        />
      )}
      {error && (
        <div className="text-red-700 mt-4" data-testid="coupon-error">
          {error}
        </div>
      )}
    </div>
  );
}

export default CouponForm;
