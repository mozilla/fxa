/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Localized } from '@fluent/react';
import * as Form from '@radix-ui/react-form';

import { ButtonVariant, SubmitButton } from '@fxa/payments/ui';
import couponIcon from '@fxa/shared/assets/images/ico-coupon.svg';
import {
  getLocalizedCurrency,
  getLocalizedCurrencyString,
  getLocalizedDate,
  getLocalizedDateString,
} from '@fxa/shared/l10n';

interface Subscription {
  productName: string;
  currency: string;
  interval: string;
  currentInvoiceTax: number;
  currentInvoiceTotal: number;
  currentPeriodEnd: number;
  nextInvoiceDate: number;
  nextInvoiceTax: number;
  nextInvoiceTotal: number;
  discountApplied: boolean;
  promotionName?: string | null;
}

interface SubscriptionContentProps {
  subscription: Subscription;
  locale: string;
}

export const SubscriptionContent = ({
  subscription,
  locale,
}: SubscriptionContentProps) => {
  const {
    currency,
    currentInvoiceTax,
    currentInvoiceTotal,
    currentPeriodEnd,
    discountApplied,
    nextInvoiceDate,
    nextInvoiceTax,
    nextInvoiceTotal,
    productName,
    promotionName,
  } = subscription;
  const [checkedState, setCheckedState] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const currentInvoiceTotalVars = getLocalizedCurrency(
    currentInvoiceTotal,
    currency
  );
  const currentInvoiceTaxVars = getLocalizedCurrency(
    currentInvoiceTax,
    currency
  );
  const nextInvoiceTotalVars = getLocalizedCurrency(nextInvoiceTotal, currency);
  const nextInvoiceTaxVars = getLocalizedCurrency(nextInvoiceTax, currency);
  const nextInvoiceDateShortVars = getLocalizedDate(nextInvoiceDate, true);
  const currentPeriodEndLongVars = getLocalizedDate(currentPeriodEnd);

  const currentInvoiceTotalFallback = getLocalizedCurrencyString(
    currentInvoiceTotal,
    currency,
    locale
  );
  const currentInvoiceTaxFallback = getLocalizedCurrencyString(
    currentInvoiceTax,
    currency,
    locale
  );
  const nextInvoiceTotalFallback = getLocalizedCurrencyString(
    nextInvoiceTotal,
    currency,
    locale
  );
  const nextInvoiceTaxFallback = getLocalizedCurrencyString(
    nextInvoiceTax,
    currency,
    locale
  );
  const nextInvoiceDateShortFallback = getLocalizedDateString(
    nextInvoiceDate,
    true,
    locale
  );
  const currentPeriodEndLongFallback = getLocalizedDateString(
    currentPeriodEnd,
    false,
    locale
  );
  return (
    <>
      {showCancel ? (
        <Form.Root
          aria-labelledby="cancel-subscription-heading"
          aria-describedby="cancel-subscription-desc"
        >
          <Localized id="subscription-content-heading-cancel-subscription">
            <h4 id="cancel-subscription-heading" className="pt-6">
              Cancel Subscription
            </h4>
          </Localized>
          <Form.Field name="agreement" className="text-grey-400 text-sm">
            <Localized
              id="subscription-content-no-longer-use-message"
              vars={{
                productName,
                currentPeriodEnd: currentPeriodEndLongVars,
              }}
            >
              <p className="py-3" id="cancel-subscription-desc">
                You will no longer be able to use {productName} after{' '}
                {currentPeriodEndLongFallback}, the last day of your billing
                cycle.
              </p>
            </Localized>
            <Form.Label asChild className="cursor-pointer my-3">
              <label
                htmlFor="cancel-access"
                className="flex items-center gap-4"
              >
                <Form.Control asChild>
                  <input
                    id="cancel-access"
                    type="checkbox"
                    className="ml-1 grow-0 shrink-0 basis-4 scale-150 cursor-pointer"
                    onChange={(e) => setCheckedState(e.target.checked)}
                    required
                  />
                </Form.Control>
                <Localized
                  id="subscription-content-cancel-access-message"
                  vars={{
                    productName,
                    currentPeriodEnd: currentPeriodEndLongVars,
                  }}
                >
                  <span>
                    Cancel my access and my saved information within{' '}
                    {productName} on {currentPeriodEndLongFallback}
                  </span>
                </Localized>
              </label>
            </Form.Label>
          </Form.Field>
          <div className="flex flex-col gap-4 tablet:flex-row items-center justify-between pt-3">
            <Localized
              id="subscription-content-button-stay-subscribed"
              vars={{ productName }}
              attrs={{ 'aria-label': true }}
            >
              <SubmitButton
                className="h-10 w-full tablet:w-1/2"
                variant={ButtonVariant.Primary}
                onClick={() => setShowCancel(false)}
                aria-label={`Stay subscribed to ${productName}`}
              >
                <span>Stay Subscribed</span>
              </SubmitButton>
            </Localized>
            <Form.Submit asChild>
              <Localized
                id="subscription-content-button-cancel-subscription"
                vars={{ productName }}
                attrs={{ 'aria-label': true }}
              >
                <SubmitButton
                  className={`h-10 w-full tablet:w-1/2 ${!checkedState && 'bg-grey-50 text-grey-300 hover:bg-grey-50 hover:cursor-not-allowed hover:bg-inherit aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none'}`}
                  variant={ButtonVariant.Secondary}
                  disabled={!checkedState}
                  aria-label={`Cancel your subscription to ${productName}`}
                >
                  <span>Cancel Subscription</span>
                </SubmitButton>
              </Localized>
            </Form.Submit>
          </div>
        </Form.Root>
      ) : (
        <section className="flex items-center justify-between gap-4 my-4">
          <div className="flex items-start gap-2 text-sm">
            {discountApplied && (
              <Image src={couponIcon} alt="" role="presentation" />
            )}
            <div>
              <div className="font-semibold pb-1 -mt-1">
                {promotionName ? (
                  currentInvoiceTax ? (
                    <Localized
                      id="subscription-content-promotion-applied-with-tax"
                      vars={{
                        invoiceTotal: currentInvoiceTotalVars,
                        promotionName,
                        taxDue: currentInvoiceTaxVars,
                      }}
                    >
                      <p>
                        {productName} coupon applied:{' '}
                        {currentInvoiceTotalFallback} +{' '}
                        {currentInvoiceTaxFallback} tax
                      </p>
                    </Localized>
                  ) : (
                    <Localized
                      id="subscription-content-promotion-applied-no-tax"
                      vars={{
                        invoiceTotal: currentInvoiceTotalVars,
                        promotionName,
                      }}
                    >
                      <p>
                        {promotionName} coupon applied:{' '}
                        {currentInvoiceTotalFallback}
                      </p>
                    </Localized>
                  )
                ) : currentInvoiceTax ? (
                  <Localized
                    id="subscription-content-current-bill-with-tax"
                    vars={{
                      invoiceTotal: currentInvoiceTotalVars,
                      taxDue: currentInvoiceTaxVars,
                    }}
                  >
                    <p>
                      Current bill: {currentInvoiceTotalFallback} +{' '}
                      {currentInvoiceTaxFallback} tax
                    </p>
                  </Localized>
                ) : (
                  <Localized
                    id="subscription-content-current-bill-no-tax"
                    vars={{
                      invoiceTotal: currentInvoiceTotalVars,
                    }}
                  >
                    <p>Current bill: {currentInvoiceTotalFallback}</p>
                  </Localized>
                )}
              </div>
              <div className="text-grey-400">
                {nextInvoiceTax ? (
                  <Localized
                    id="subscription-content-next-bill-with-tax"
                    vars={{
                      invoiceTotal: nextInvoiceTotalVars,
                      nextBillDate: nextInvoiceDateShortVars,
                      taxDue: nextInvoiceTaxVars,
                    }}
                  >
                    <p>
                      Next bill of {nextInvoiceTotalFallback} +{' '}
                      {nextInvoiceTaxFallback} tax is due{' '}
                      {nextInvoiceDateShortFallback}
                    </p>
                  </Localized>
                ) : (
                  <Localized
                    id="subscription-content-next-bill-no-tax"
                    vars={{
                      invoiceTotal: nextInvoiceTotalVars,
                      nextBillDate: nextInvoiceDateShortVars,
                    }}
                  >
                    <p>
                      Next bill of {nextInvoiceTotalFallback} is due
                      {nextInvoiceDateShortFallback}
                    </p>
                  </Localized>
                )}
              </div>
            </div>
          </div>
          <Localized
            id="subscription-content-button-cancel"
            vars={{ productName }}
            attrs={{ 'aria-label': true }}
          >
            <SubmitButton
              className="h-10"
              variant={ButtonVariant.Secondary}
              onClick={() => setShowCancel(true)}
              aria-label={`Cancel your subscription for ${productName}`}
            >
              <span>Cancel</span>
            </SubmitButton>
          </Localized>
        </section>
      )}
    </>
  );
};
