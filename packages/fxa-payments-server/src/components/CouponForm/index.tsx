import './index.scss';

import { Localized } from '@fluent/react';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import React, {
  FormEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useState,
  useContext,
} from 'react';

import {
  coupon_FULFILLED,
  coupon_PENDING,
  coupon_REJECTED,
  couponEngaged,
  couponMounted,
  EventProperties,
} from '../../lib/amplitude';
import { APIError, apiRetrieveCouponDetails } from '../../lib/apiClient';
import { useCallbackOnce } from '../../lib/hooks';
import AppContext from '../../lib/AppContext';

class CouponError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CouponError';
  }
}

export enum CouponErrorMessageType {
  Expired = 'coupon-error-expired',
  LimitReached = 'coupon-error-limit-reached',
  Invalid = 'coupon-error-invalid',
  Generic = 'coupon-error-generic',
}

/*
 * Check if the coupon promotion code provided by the user is valid.
 * If it is valid, return the discounted amount in cents.
 */
export const checkPromotionCode = async (
  planId: string,
  promotionCode: string
) => {
  const metricsOptions: EventProperties = {
    planId,
    promotionCode,
  };

  try {
    coupon_PENDING(metricsOptions);
    const couponDetails = await apiRetrieveCouponDetails({
      priceId: planId,
      promotionCode,
    });

    if (couponDetails?.expired) {
      throw new CouponError(CouponErrorMessageType.Expired);
    }

    if (couponDetails?.maximallyRedeemed) {
      throw new CouponError(CouponErrorMessageType.LimitReached);
    }

    if (!couponDetails.valid || !couponDetails?.discountAmount) {
      throw new CouponError(CouponErrorMessageType.Invalid);
    }

    coupon_FULFILLED(metricsOptions);
    return couponDetails;
  } catch (err) {
    coupon_REJECTED({
      planId,
      promotionCode,
      error: err,
    });
    if (!(err instanceof CouponError)) {
      if (err instanceof APIError) {
        if (err.errno === 199)
          throw new CouponError(CouponErrorMessageType.Invalid);
      }
      throw new CouponError(CouponErrorMessageType.Generic);
    }
    throw err;
  }
};

export type CouponFormProps = {
  planId: string;
  readOnly: boolean;
  subscriptionInProgress: boolean;
  coupon?: CouponDetails;
  setCoupon: (coupon: CouponDetails | undefined) => void;
};

export const CouponForm = ({
  planId,
  readOnly,
  subscriptionInProgress,
  coupon,
  setCoupon,
}: CouponFormProps) => {
  const [hasCoupon, setHasCoupon] = useState(coupon ? true : false);
  const [promotionCode, setPromotionCode] = useState(
    coupon ? coupon.promotionCode : ''
  );
  const [error, setError] = useState<CouponErrorMessageType | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const { queryParams } = useContext(AppContext);

  const onFormMounted = useCallback(() => couponMounted({ planId }), [planId]);

  // check if coupon code was included in URL
  // if true and valid, apply coupon code on page load
  useEffect(() => {
    (async () => {
      if (queryParams.coupon) {
        try {
          setCheckingCoupon(true);
          const coupon = await checkPromotionCode(planId, queryParams.coupon);
          setHasCoupon(true);
          setCoupon(coupon);
          setPromotionCode(coupon.promotionCode);
        } catch (err) {
          setCoupon(undefined);
        } finally {
          setCheckingCoupon(false);
        }
      }
    })();
  }, [queryParams, planId, setCoupon]);

  useEffect(() => {
    onFormMounted();
  }, [onFormMounted, planId]);

  const onFormEngaged = useCallbackOnce(
    () => couponEngaged({ planId }),
    [planId]
  );
  const onChange = useCallback(() => {
    onFormEngaged();
  }, [onFormEngaged]);

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      setCheckingCoupon(true);
      const coupon = await checkPromotionCode(planId, promotionCode);
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
      className="p-4 text-base mt-6 w-full bg-white rounded-lg shadow-sm shadow-grey-300 tablet:my-8 tablet:max-w-xs coupon-component"
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
          onChange={onChange}
          data-testid="coupon-form"
        >
          <div className="input-row">
            <Localized attrs={{ placeholder: true }} id="coupon-enter-code">
              <input
                className={`${error ? 'invalid' : ''}`}
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
              className="button"
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
            {error}
          </div>
        </Localized>
      )}
    </div>
  );
};

export default CouponForm;
