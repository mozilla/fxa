/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { CheckoutForm } from '../CheckoutForm';
import { StripeWrapper } from '../StripeWrapper';

interface PaymentFormProps {
  cmsCommonContent: {
    termsOfServiceUrl: string;
    privacyNoticeUrl: string;
  };
  paymentsInfo: {
    amount: number;
    currency: string;
  };
  cart: {
    id: string;
    version: number;
    email: string | null;
    uid?: string | null;
    errorReasonId: string | null;
    couponCode: string | null;
    currency: string;
    taxAddress: {
      countryCode: string;
      postalCode: string;
    };
  };
  locale: string;
  sessionExists: boolean;
}

export function PaymentSection({
  cmsCommonContent,
  paymentsInfo,
  cart,
  locale,
  sessionExists,
}: PaymentFormProps) {
  return (
    <StripeWrapper
      amount={paymentsInfo.amount}
      currency={paymentsInfo.currency}
    >
      <CheckoutForm
        cmsCommonContent={cmsCommonContent}
        cart={cart}
        locale={locale}
        sessionExists={sessionExists}
      />
    </StripeWrapper>
  );
}
