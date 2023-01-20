// import './index.scss';

import { Localized } from '@fluent/react';
import React, { FormEventHandler, MouseEventHandler, useState } from 'react';
import { Coupon } from '../../lib/types';

// import {
//   coupon_FULFILLED,
//   coupon_PENDING,
//   coupon_REJECTED,
//   couponEngaged,
//   couponMounted,
//   EventProperties,
// } from '../../lib/amplitude';

export enum CouponErrorMessageType {
  Expired = 'coupon-error-expired',
  LimitReached = 'coupon-error-limit-reached',
  Invalid = 'coupon-error-invalid',
  Generic = 'coupon-error-generic',
}

class CouponError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CouponError';
  }
}

/*
 * Check if the coupon promotion code provided by the user is valid.
 * If it is valid, return the discounted amount in cents.
 */
export const checkPromotionCode = async (
  promotionCode: string,
  checkCoupon: (promo: string) => Coupon
) => {
  //   const metricsOptions: EventProperties = {
  //     planId,
  //     promotionCode,
  //   };

  try {
    // coupon_PENDING(metricsOptions);
    const couponDetails = await checkCoupon(promotionCode);

    // if (couponDetails?.expired) {
    //   throw new CouponError(CouponErrorMessageType.Expired);
    // }

    // if (couponDetails?.maximallyRedeemed) {
    //   throw new CouponError(CouponErrorMessageType.LimitReached);
    // }

    // if (!couponDetails.valid || !couponDetails?.discountAmount) {
    //   throw new CouponError(CouponErrorMessageType.Invalid);
    // }

    // coupon_FULFILLED(metricsOptions);
    return couponDetails;
  } catch (err) {
    // coupon_REJECTED({
    //   planId,
    //   promotionCode,
    //   error: err,
    // });
    if (!(err instanceof CouponError)) {
      //   if (err instanceof APIError) {
      //     if (err.errno === 199)
      //       throw new CouponError(CouponErrorMessageType.Invalid);
      //   }
      throw new CouponError(CouponErrorMessageType.Generic);
    }
    throw err;
  }
};

export type CouponFormProps = {
  readOnly: boolean;
  subscriptionInProgress: boolean;
  coupon?: Coupon;
  setCoupon: (coupon: Coupon | undefined) => void;
  checkCoupon: (promo: string) => Coupon;
};

export const CouponForm = ({
  readOnly,
  subscriptionInProgress,
  coupon,
  setCoupon,
  checkCoupon,
}: CouponFormProps) => {
  const [hasCoupon, setHasCoupon] = useState(coupon ? true : false);
  const [promotionCode, setPromotionCode] = useState(
    coupon ? coupon.promotionCode : ''
  );
  const [error, setError] = useState<CouponErrorMessageType | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  //   const onFormMounted = useCallback(() => couponMounted({ planId }), [planId]);

  //   useEffect(() => {
  //     onFormMounted();
  //   }, [onFormMounted, planId]);

  //   const onFormEngaged = useCallbackOnce(
  //     () => couponEngaged({ planId }),
  //     [planId]
  //   );

  //   const onChange = useCallback(() => {
  //     onFormEngaged();
  //   }, [onFormEngaged]);

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      setCheckingCoupon(true);
      const coupon = await checkPromotionCode(promotionCode, checkCoupon);
      setHasCoupon(true);
      setCoupon(coupon);
    } catch (err) {
      setCoupon(undefined);
      setError(err.message);
    } finally {
      setCheckingCoupon(false);
    }
  };

  const removeCoupon: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setHasCoupon(false);
    setCoupon(undefined);
  };

  return (
    <div
      className="component-card mt-6 p-4 rounded-t-lg text-base tablet:my-8 coupon-component"
      data-testid="coupon-component"
    >
      <h4 className="m-0 mb-4">
        {hasCoupon ? (
          <Localized id="coupon-promo-code-applied">
            Promo Code Applied
          </Localized>
        ) : (
          <Localized id="coupon-promo-code">Promo Code</Localized>
        )}
      </h4>
      {hasCoupon ? (
        <div
          className="flex gap-4 justify-between items-center"
          data-testid="coupon-hascoupon"
        >
          <div className="break-all">{promotionCode}</div>
          {readOnly ? null : (
            <div>
              <button
                className="button"
                onClick={removeCoupon}
                disabled={subscriptionInProgress}
                data-testid="coupon-remove-button"
              >
                <Localized id="coupon-remove">Remove</Localized>
              </button>
            </div>
          )}
        </div>
      ) : (
        <form
          className="flex gap-4 justify-between items-center"
          onSubmit={onSubmit}
          //   onChange={onChange}
          data-testid="coupon-form"
        >
          <div className="input-row">
            <Localized attrs={{ placeholder: true }} id="coupon-enter-code">
              <input
                className={`${error ? 'invalid' : ''} h-8`}
                type="text"
                name="coupon"
                data-testid="coupon-input"
                value={promotionCode}
                onChange={(event) => {
                  setError(null);
                  setPromotionCode(event.target.value);
                }}
                placeholder="Enter code"
                disabled={checkingCoupon || readOnly || subscriptionInProgress}
              />
            </Localized>
          </div>

          <div>
            <button
              name="apply"
              className="cta-primary h-8"
              type="submit"
              data-testid="coupon-button"
              disabled={checkingCoupon || readOnly || subscriptionInProgress}
            >
              <Localized id="coupon-submit">Apply</Localized>
            </button>
          </div>
        </form>
      )}
      {error && (
        <Localized id={error}>
          <div className="text-red-700 mt-4" data-testid="coupon-error">
            {/* {getFallbackTextByFluentId(error)} */}
          </div>
        </Localized>
      )}
    </div>
  );
};

export default CouponForm;
