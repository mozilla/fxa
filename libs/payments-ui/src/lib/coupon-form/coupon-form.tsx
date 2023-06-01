'use client';

import { FormEventHandler, RefObject, useRef } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

/*
  ## Links
  * https://www.apollographql.com/blog/apollo-client/next-js/next-js-getting-started/
  * https://www.apollographql.com/docs/react/performance/server-side-rendering/
  * https://medium.com/@zhamdi/server-side-rendering-ssr-using-apollo-and-next-js-ac0b2e3ea461
  * https://github.com/vercel/next.js/tree/canary/examples/with-apollo
  * https://www.apollographql.com/blog/announcement/frontend/using-apollo-client-with-next-js-13-releasing-an-official-library-to-support-the-app-router/
  * https://www.apollographql.com/blog/apollo-client/next-js/how-to-use-apollo-client-with-next-js-13/
*/

export const CART_QUERY = gql`
  query singleCart($input: SingleCartInput!) {
    singleCart(input: $input) {
      id
      promotionCode
    }
  }
`;

export const CHECK_CODE = gql`
  mutation checkPromotionCode($input: CheckPromotionCodeInput!) {
    checkPromotionCode(input: $input) {
      id
      promotionCode
    }
  }
`;

export const UPDATE_CART = gql`
  mutation updateCart($input: UpdateCartInput!) {
    updateCart(input: $input) {
      id
      promotionCode
    }
  }
`;

const CART_ID = 1;

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
  readOnly: boolean;
}

export function CouponForm({ readOnly }: CouponFormProps) {
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
  } = useQuery(CART_QUERY, {
    variables: {
      input: { id: CART_ID },
    },
  });

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    checkCode({
      variables: {
        input: {
          id: CART_ID,
          promotionCode: couponInputRef?.current?.value || '',
        },
      },
    });
  };

  const promotionCode = data?.singleCart?.promotionCode;
  const hasPromotionCode = !!promotionCode;
  const error =
    queryError?.message || checkError?.message || updateError?.message;

  if (loading) {
    return <>Loading...</>;
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
          clearPromotionCode={() => {
            updateCart({
              variables: {
                input: {
                  id: CART_ID,
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
