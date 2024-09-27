/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import { useFormState } from 'react-dom';
import { ButtonVariant } from '../BaseButton';
import { SubmitButton } from '../SubmitButton';
import { updateCartAction } from '../../../actions/updateCart';
import { getFallbackTextByFluentId } from '../../../utils/error-ftl-messages';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface WithCouponProps {
  cartId: string;
  cartVersion: number;
  couponCode: string;
  readOnly: boolean;
}
const WithCoupon = ({
  cartId,
  cartVersion,
  couponCode,
  readOnly,
}: WithCouponProps) => {
  async function removeCoupon() {
    await updateCartAction(cartId, cartVersion, { couponCode: '' });
  }

  return (
    <>
      <h2 className="m-0 mb-4 font-semibold text-grey-600">
        <Localized id="next-coupon-promo-code-applied">
          Promo Code Applied
        </Localized>
      </h2>

      <form
        action={removeCoupon}
        className="flex gap-4 justify-between items-center"
        data-testid="coupon-hascoupon"
      >
        <span className="break-all">{couponCode}</span>
        {readOnly ? null : (
          <span>
            <SubmitButton
              variant={ButtonVariant.Secondary}
              data-testid="coupon-remove-button"
            >
              <Localized id="next-coupon-remove">Remove</Localized>
            </SubmitButton>
          </span>
        )}
      </form>
    </>
  );
};

interface WithoutCouponProps {
  cartId: string;
  cartVersion: number;
  readOnly: boolean;
}

const WithoutCoupon = ({
  cartId,
  cartVersion,
  readOnly,
}: WithoutCouponProps) => {
  async function applyCoupon(_: any, formData: FormData) {
    const promotionCode = formData.get('coupon') as string;

    return updateCartAction(cartId, cartVersion, {
      couponCode: promotionCode,
    });
  }
  const routeCoupon = useSearchParams().get('coupon') || undefined;
  useEffect(() => {
    if (routeCoupon) {
      const formData = new FormData();
      formData.set('coupon', routeCoupon);
      formAction(formData);
    }
  }, []);

  const [error, formAction] = useFormState(applyCoupon, null);

  return (
    <>
      <h2 className="m-0 mb-4 font-semibold text-grey-600">
        <Localized id="next-coupon-promo-code">Promo Code</Localized>
      </h2>

      <form action={formAction} data-testid="coupon-form">
        <div className="flex gap-4 justify-between items-center">
          <Localized attrs={{ placeholder: true }} id="next-coupon-enter-code">
            <input
              className="w-full border rounded-md border-black/30 p-3 placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none data-[invalid=true]:border-alert-red data-[invalid=true]:text-alert-red data-[invalid=true]:shadow-inputError"
              type="text"
              name="coupon"
              data-testid="coupon-input"
              placeholder="Enter code"
              disabled={readOnly}
              defaultValue={routeCoupon}
            />
          </Localized>
          <div>
            <SubmitButton
              variant={ButtonVariant.Primary}
              type="submit"
              data-testid="coupon-button"
              disabled={readOnly}
            >
              <Localized id="next-coupon-submit">Apply</Localized>
            </SubmitButton>
          </div>
        </div>

        {error && (
          <div className="text-red-700 mt-4" data-testid="coupon-error">
            <Localized id={error}>{getFallbackTextByFluentId(error)}</Localized>
          </div>
        )}
      </form>
    </>
  );
};

interface CouponFormProps {
  cartId: string;
  cartVersion: number;
  promoCode: string | null;
  readOnly: boolean;
}

export function CouponForm({
  cartId,
  cartVersion,
  promoCode,
  readOnly,
}: CouponFormProps) {
  const hasCouponCode = !!promoCode;
  return (
    <div className="bg-white rounded-b-lg shadow-sm shadow-grey-300 mt-6 p-4 rounded-t-lg text-base tablet:my-8">
      {hasCouponCode ? (
        <WithCoupon
          cartId={cartId}
          cartVersion={cartVersion}
          couponCode={promoCode}
          readOnly={readOnly}
        />
      ) : (
        <WithoutCoupon
          cartId={cartId}
          cartVersion={cartVersion}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
