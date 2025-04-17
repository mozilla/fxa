/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import * as Form from '@radix-ui/react-form';
import { useSearchParams } from 'next/navigation';
import { forwardRef, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { ButtonVariant } from '../BaseButton';
import { SubmitButton } from '../SubmitButton';
import {
  CouponErrorMessageType,
  getFallbackTextByFluentId,
} from '../../../utils/error-ftl-messages';
import { applyCouponAction } from '@fxa/payments/ui/actions';

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
    await applyCouponAction(cartId, cartVersion, '');
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
              <SubmitButton
                variant={ButtonVariant.Secondary}
                data-testid="coupon-remove-button"
              >
                <Localized id="next-coupon-remove">Remove</Localized>
              </SubmitButton>
            </Form.Submit>
          )}
        </div>
      </Form.Field>
    </Form.Root>
  );
};

const CouponInput = forwardRef(
  (
    {
      readOnly,
      routeCoupon,
      error,
    }: {
      readOnly: boolean;
      routeCoupon?: string;
      error?: CouponErrorMessageType | null | undefined;
    },
    ref
  ) => {
    const { pending } = useFormStatus();
    return (
      <Localized attrs={{ placeholder: true }} id="next-coupon-enter-code">
        <input
          className={`w-full border rounded-md p-3
            ${
              error
                ? 'border-red-700 focus:border-red-700 focus:shadow-input-red-focus'
                : 'border-black/30 placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none'
            }
            ${pending ? 'cursor-not-allowed' : ''}`}
          type="text"
          name="coupon"
          data-testid="coupon-input"
          placeholder="Enter code"
          disabled={pending || readOnly}
          defaultValue={routeCoupon}
          maxLength={25}
        />
      </Localized>
    );
  }
);

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

    return applyCouponAction(cartId, cartVersion, promotionCode);
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
            <CouponInput
              readOnly={readOnly}
              routeCoupon={routeCoupon}
              error={error}
            />
          </Form.Control>
          <Form.Submit asChild>
            <SubmitButton
              variant={ButtonVariant.Primary}
              data-testid="coupon-button"
              disabled={readOnly}
            >
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
