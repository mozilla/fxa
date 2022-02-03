import './index.scss';

import { Localized } from '@fluent/react';
import React, {
  FormEventHandler,
  MouseEventHandler,
  useState,
  useCallback,
  useEffect,
} from 'react';

import { APIError, apiRetrieveCouponDetails } from '../../lib/apiClient';
import * as Coupon from 'fxa-shared/dto/auth/payments/coupon';

import * as Amplitude from '../../lib/amplitude';
import { useCallbackOnce } from '../../lib/hooks';

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
const checkPromotionCode = async (planId: string, promotionCode: string) => {
  try {
    const couponDetails = await apiRetrieveCouponDetails({
      priceId: planId,
      promotionCode,
    });

    if (couponDetails?.expired) {
      throw new CouponError(CouponErrorMessageType.Expired);
    }

    if (couponDetails.maximallyRedeemed) {
      throw new CouponError(CouponErrorMessageType.LimitReached);
    }

    if (!couponDetails.valid || !couponDetails.discountAmount) {
      throw new CouponError(CouponErrorMessageType.Invalid);
    }

    return couponDetails;
  } catch (err) {
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

type CouponFormProps = {
  planId: string;
  coupon?: Coupon.couponDetailsSchema;
  setCoupon: (coupon: Coupon.couponDetailsSchema | undefined) => void;
};

export const CouponForm = ({ planId, coupon, setCoupon }: CouponFormProps) => {
  const [hasCoupon, setHasCoupon] = useState(coupon ? true : false);
  const [promotionCode, setPromotionCode] = useState(
    coupon ? coupon.promotionCode : ''
  );
  const [error, setError] = useState<CouponErrorMessageType | null>(null);
  const [loading, setLoading] = useState(false);

  const onFormMounted = useCallback(
    () => Amplitude.couponMounted({ planId }),
    [planId]
  );
  useEffect(() => {
    onFormMounted();
  }, [onFormMounted, planId]);

  const onFormEngaged = useCallbackOnce(
    () => Amplitude.couponEngaged({ planId }),
    [planId]
  );
  const onChange = useCallback(() => {
    onFormEngaged();
  }, [onFormEngaged]);

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      setLoading(true);
      const { discountAmount, type, valid } = await checkPromotionCode(
        planId,
        promotionCode
      );
      setHasCoupon(true);
      setCoupon({
        promotionCode,
        discountAmount,
        type,
        valid,
      });
    } catch (err) {
      setCoupon(undefined);
      setError(err.message);
    } finally {
      setLoading(false);
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
      className={`coupon-component ${coupon ? 'has-coupon' : ''}`}
      data-testid="coupon-component"
    >
      {hasCoupon ? (
        <div className="coupon-header">
          <h4>
            <Localized id="coupon-discount-applied">
              Discount Reward Applied
            </Localized>
          </h4>
        </div>
      ) : (
        <div className="coupon-header">
          <h4>
            <Localized id="coupon-discount">Discount</Localized>
          </h4>
        </div>
      )}
      {hasCoupon ? (
        <div className="flex" data-testid="coupon-hascoupon">
          <div className="coupon-details">
            <div>{promotionCode}</div>
          </div>
          <button onClick={removeCoupon}>
            <Localized id="coupon-remove">
              <span>Remove</span>
            </Localized>
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} onChange={onChange} data-testid="coupon-form">
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
                disabled={loading}
              />
            </Localized>
          </div>

          <button
            name="apply"
            type="submit"
            data-testid="coupon-button"
            disabled={loading}
          >
            <Localized id="coupon-submit">
              <span>Apply</span>
            </Localized>
          </button>
        </form>
      )}
      {error && (
        <Localized id={error}>
          <div className="coupon-error" data-testid="coupon-error">
            {error}
          </div>
        </Localized>
      )}
    </div>
  );
};

export default CouponForm;
