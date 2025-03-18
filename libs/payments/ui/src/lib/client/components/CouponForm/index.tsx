/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import * as Form from '@radix-ui/react-form';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { BaseButton, ButtonVariant } from '../BaseButton';
import { SubmitButton } from '../SubmitButton';
import { updateCartAction } from '../../../actions/updateCart';
import { getFallbackTextByFluentId } from '../../../utils/error-ftl-messages';

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
    <Form.Root
      action={removeCoupon}
      className="bg-white rounded-b-lg shadow-sm shadow-grey-300 mt-6 p-4 rounded-t-lg text-base tablet:my-8"
      data-testid="coupon-hascoupon"
    >
      <Form.Field name="appliedCouponCode">
        <Localized id="next-coupon-promo-code-applied">
          <Form.Label className="font-semibold text-grey-600">
            <h2>Promo Code Applied</h2>
          </Form.Label>
        </Localized>
        <div className="mt-4 flex gap-4 justify-between items-center">
          <span className="break-all">{couponCode}</span>
          {readOnly ? null : (
            <Form.Submit asChild>
              <BaseButton
                variant={ButtonVariant.Secondary}
                data-testid="coupon-remove-button"
              >
                <Localized id="next-coupon-remove">Remove</Localized>
              </BaseButton>
            </Form.Submit>
          )}
        </div>
      </Form.Field>
    </Form.Root>
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
    <Form.Root
      action={formAction}
      className="bg-white rounded-b-lg shadow-sm shadow-grey-300 mt-6 p-4 rounded-t-lg text-base tablet:my-8"
      data-testid="coupon-form"
    >
      <Form.Field name="couponCode">
        <Localized id="next-coupon-promo-code">
          <Form.Label className="font-semibold text-grey-600">
            <h2>Promo Code</h2>
          </Form.Label>
        </Localized>

        <div className="mt-4 flex gap-4 justify-between items-center">
          <Form.Control asChild>
            <Localized
              attrs={{ placeholder: true }}
              id="next-coupon-enter-code"
            >
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
          </Form.Control>
          <Form.Submit asChild>
            <SubmitButton data-testid="coupon-button" disabled={readOnly}>
              <Localized id="next-coupon-submit">Apply</Localized>
            </SubmitButton>
          </Form.Submit>
        </div>

        {error && (
          <Localized id={error}>
            <div className="text-red-700 mt-4" data-testid="coupon-error">
              {getFallbackTextByFluentId(error)}
            </div>
          </Localized>
        )}
      </Form.Field>
    </Form.Root>
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
  return hasCouponCode ? (
    <WithCoupon
      cartId={cartId}
      cartVersion={cartVersion}
      couponCode={promoCode}
      readOnly={readOnly}
    />
  ) : readOnly ? null : (
    <WithoutCoupon
      cartId={cartId}
      cartVersion={cartVersion}
      readOnly={readOnly}
    />
  );
}
