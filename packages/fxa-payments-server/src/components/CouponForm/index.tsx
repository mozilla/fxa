import './index.scss';

import { Localized } from '@fluent/react';
import React, {
  FormEventHandler,
  MouseEventHandler,
  useState,
  useCallback,
  useEffect,
} from 'react';

import { APIError, apiInvoicePreview } from '../../lib/apiClient';
import * as Coupon from 'fxa-shared/dto/auth/payments/coupon';
import sentry from '../../lib/sentry';

import * as Amplitude from '../../lib/amplitude';
import { useCallbackOnce } from '../../lib/hooks';

enum CouponErrorMessageType {
  Expired = 'Expired',
  LimitReached = 'Maximally redeemed',
  Invalid = 'No discount for coupon',
  Generic = 'Generic',
}

type CouponErrorMessageProps = {
  messageType: CouponErrorMessageType;
};

const CouponErrorMessage = ({ messageType }: CouponErrorMessageProps) => {
  let localizedId, defaultMsg;
  const localizedIdPrefix = 'coupon-error';

  switch (messageType) {
    case CouponErrorMessageType.Expired:
      localizedId = `${localizedIdPrefix}-expired`;
      defaultMsg = 'The coupon has expired111';
      break;
    case CouponErrorMessageType.LimitReached:
      localizedId = `${localizedIdPrefix}-limit-reached`;
      defaultMsg = 'The coupon limit has been reached';
      break;
    case CouponErrorMessageType.Invalid:
      localizedId = `${localizedIdPrefix}-invalid`;
      defaultMsg = 'The provided coupon is invalid';
      break;
    case CouponErrorMessageType.Generic:
    default:
      localizedId = `${localizedIdPrefix}-generic`;
      defaultMsg = 'An error occurred processing the coupon. Please try again.';
  }

  return (
    <Localized id={localizedId}>
      <div className="coupon-error" data-testid="coupon-error">
        {defaultMsg}
      </div>
    </Localized>
  );
};

/*
 * Check if the coupon promotion code provided by the user is valid.
 * If it is valid, return the discounted amount in cents.
 */
const checkPromotionCode = async (planId: string, promotionCode: string) => {
  try {
    const { discount } = await apiInvoicePreview({
      priceId: planId,
      promotionCode,
    });
    // TODO - Mock items from apiInvoicePreview
    const { type, expired, maximallyRedeemed } = {
      type: 'forever',
      expired: false,
      maximallyRedeemed: false,
    };

    if (!discount?.amount) {
      throw new Error(CouponErrorMessageType.Invalid);
    }

    if (expired) {
      throw new Error(CouponErrorMessageType.Expired);
    }

    if (maximallyRedeemed) {
      throw new Error(CouponErrorMessageType.LimitReached);
    }

    return {
      amount: discount.amount,
      type,
    };
  } catch (err) {
    if (err instanceof APIError) {
      sentry.captureException(err);
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
      const { amount, type } = await checkPromotionCode(planId, promotionCode);
      setHasCoupon(true);
      setCoupon({
        promotionCode: promotionCode,
        discountAmount: amount,
        type: '',
        valid: true,
      });
    } catch (err) {
      setCoupon(undefined);
      // setError(handlePromotionCodeError(err.message));
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
      {error !== null && <CouponErrorMessage messageType={error} />}
    </div>
  );
};

export default CouponForm;
