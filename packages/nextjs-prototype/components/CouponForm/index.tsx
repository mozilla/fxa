import { Localized } from '@fluent/react';
import React, { FormEventHandler, MouseEventHandler, useState } from 'react';

export type CouponFormProps = {
  promotionCode: string;
  type: string;
  durationInMonths: number;
  discountAmount: number;
};

export const CouponForm = () =>
  // {
  //   promotionCode,
  //   type,
  //   durationInMonths,
  //   discountAmount,
  // }: CouponFormProps
  {
    const [hasCoupon, setHasCoupon] = useState(false);
    const [promotionCode, setPromotionCode] = useState('');
    const [error, setError] = useState(false);

    const onSubmit: FormEventHandler = async (event) => {
      event.preventDefault();
      event.stopPropagation();

      promotionCode === 'ChardeeMacDennis'
        ? setHasCoupon(true)
        : setError(true);
    };

    const removeCoupon: MouseEventHandler<HTMLButtonElement> = (event) => {
      event.preventDefault();
      event.stopPropagation();
      setHasCoupon(false);
    };

    return (
      <div className="component-card mt-6 p-4 rounded-t-lg text-base tablet:my-8 coupon-component">
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
          <div className="flex gap-4 justify-between items-center">
            <div className="break-all">{promotionCode}</div>
            <div>
              <button className="coupon-applied" onClick={removeCoupon}>
                <Localized id="coupon-remove">Remove</Localized>
              </button>
            </div>
          </div>
        ) : (
          <form
            className="flex gap-4 justify-between items-center"
            onSubmit={onSubmit}
          >
            <div className="m-0 relative w-full text-base">
              <Localized attrs={{ placeholder: true }} id="coupon-enter-code">
                <input
                  className={`${error ? 'coupon-invalid' : 'coupon-input'}`}
                  type="text"
                  name="coupon"
                  value={promotionCode}
                  onChange={(event) => {
                    setError(false);
                    setPromotionCode(event.target.value);
                  }}
                  placeholder="Enter code"
                />
              </Localized>
            </div>
            <div>
              <button name="apply" className="coupon-button" type="submit">
                <Localized id="coupon-submit">Apply</Localized>
              </button>
            </div>
          </form>
        )}
        {error && (
          <Localized id="coupon-error-invalid">
            <div className="text-red-700 mt-4">
              The code you entered is invalid.
            </div>
          </Localized>
        )}
      </div>
    );
  };

export default CouponForm;
