/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import { useState } from 'react';
import { CheckoutCheckbox } from './CheckoutCheckbox';
import { StripeWrapper } from './StripeWrapper';
import { Localized } from '@fluent/react';

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
  };
}

export function PaymentSection({
  cmsCommonContent,
  paymentsInfo,
  cart,
}: PaymentFormProps) {
  const [formEnabled, setFormEnabled] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);

  return (
    <>
      <CheckoutCheckbox
        isRequired={showConsentError}
        termsOfService={cmsCommonContent.termsOfServiceUrl}
        privacyNotice={cmsCommonContent.privacyNoticeUrl}
        notifyCheckboxChange={(consentCheckbox) => {
          setFormEnabled(consentCheckbox);
          setShowConsentError(true);
        }}
      />
      <div
        className={
          formEnabled
            ? 'mt-14'
            : 'mt-14 relative cursor-not-allowed focus:border-blue-400 focus:outline-none focus:shadow-input-blue-focus after:absolute after:content-[""] after:top-0 after:left-0 after:w-full after:h-full after:bg-white after:opacity-50 after:z-10'
        }
        aria-disabled={!formEnabled}
        onClick={() => setShowConsentError(true)}
      >
        <Localized id="next-new-user-card-title">
          <h3 className="font-semibold text-grey-600 text-start mt-3 mb-6">
            Enter your card information
          </h3>
        </Localized>
        <StripeWrapper
          readOnly={!formEnabled}
          amount={paymentsInfo.amount}
          currency={paymentsInfo.currency}
          cart={cart}
        />
      </div>
    </>
  );
}
