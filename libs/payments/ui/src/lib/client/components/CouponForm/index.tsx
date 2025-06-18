/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import * as Form from '@radix-ui/react-form';
import classNames from 'classnames';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { forwardRef, useEffect, useState } from 'react';
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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const promoCode = searchParams.get('coupon');

  async function removeCoupon() {
    await applyCouponAction(cartId, cartVersion, '');

    if (promoCode) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('coupon');
      const newQuery = params.toString();
      const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.push(newUrl);
    }
  }

  return (
    <section aria-labelledby="coupon-heading">
      <Form.Root
        aria-describedby="Applied promotion code"
        action={removeCoupon}
        className="bg-white rounded-b-lg shadow-sm shadow-grey-300 mt-6 p-4 rounded-t-lg text-base tablet:my-8"
        data-testid="coupon-hascoupon"
      >
        <Form.Field name="appliedCouponCode">
          <Localized id="next-coupon-promo-code-applied">
            <h2 id="coupon-heading" className="font-semibold text-grey-600">
              Promo Code Applied
            </h2>
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
    </section>
  );
};

const CouponInput = forwardRef(
  (
    {
      readOnly,
      routeCoupon,
      errorMessage,
      onChange,
    }: {
      readOnly: boolean;
      routeCoupon?: string;
      errorMessage: boolean;
      onChange: () => void;
    },
    ref
  ) => {
    const { pending } = useFormStatus();
    return (
      <Localized attrs={{ placeholder: true }} id="next-coupon-enter-code">
        <input
          className={classNames(
            'w-full border rounded-md p-3 placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none',
            {
              'border-black/30': !errorMessage && !pending,
              'border-alert-red text-alert-red shadow-inputError': errorMessage,
              'cursor-not-allowed': pending,
            }
          )}
          type="text"
          id="coupon"
          name="coupon"
          data-testid="coupon-input"
          placeholder="Enter code"
          disabled={pending || readOnly}
          defaultValue={routeCoupon}
          maxLength={25}
          onChange={onChange}
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
  const [errorMessage, setErrorMessage] =
    useState<CouponErrorMessageType | null>(null);
  async function applyCoupon(_: any, formData: FormData) {
    const promotionCode = formData.get('coupon') as string;

    const result = await applyCouponAction(cartId, cartVersion, promotionCode);
    if (result) {
      setErrorMessage(result);
    }
    return result;
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
    <section aria-labelledby="coupon-heading">
      <Form.Root
        action={formAction}
        className="bg-white rounded-b-lg shadow-sm shadow-grey-300 mt-6 p-4 rounded-t-lg text-base tablet:my-8"
        data-testid="coupon-form"
      >
        <Form.Field name="couponCode">
          <Localized id="next-coupon-promo-code">
            <Form.Label
              htmlFor="coupon"
              className="font-semibold text-grey-600"
            >
              <h2 id="coupon-heading">Promo Code</h2>
            </Form.Label>
          </Localized>

          <div className="mt-4 flex gap-4 justify-between items-center">
            <Form.Control asChild>
              <CouponInput
                readOnly={readOnly}
                routeCoupon={routeCoupon}
                errorMessage={!!errorMessage}
                onChange={() => {
                  setErrorMessage(null);
                }}
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

          {errorMessage && error && (
            <Localized id={error}>
              <div className="text-alert-red mt-4" data-testid="coupon-error">
                {getFallbackTextByFluentId(error)}
              </div>
            </Localized>
          )}
        </Form.Field>
      </Form.Root>
    </section>
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
