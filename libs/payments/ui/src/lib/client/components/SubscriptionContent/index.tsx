/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Localized, useLocalization } from '@fluent/react';
import * as Form from '@radix-ui/react-form';

import { ButtonVariant, SubmitButton } from '@fxa/payments/ui';
import couponIcon from '@fxa/shared/assets/images/ico-coupon.svg';
import {
  getLocalizedCurrencyString,
  getLocalizedDate,
  getLocalizedDateString,
} from '@fxa/shared/l10n';
import { cancelSubscriptionAtPeriodEndAction } from '../../../actions';
import * as Dialog from '@radix-ui/react-dialog';
import CloseIcon from '@fxa/shared/assets/images/close.svg';
import { LinkExternal } from '@fxa/shared/react';

interface Subscription {
  id: string;
  productName: string;
  currency: string;
  interval?: string;
  currentInvoiceTax: number;
  currentInvoiceTotal: number;
  currentPeriodEnd: number;
  nextInvoiceDate: number;
  nextInvoiceTax?: number;
  nextInvoiceTotal?: number;
  promotionName?: string | null;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionContentProps {
  userId: string;
  subscription: Subscription;
  locale: string;
  supportUrl: string;
}

export const SubscriptionContent = ({
  userId,
  subscription,
  locale,
  supportUrl,
}: SubscriptionContentProps) => {
  const {
    currency,
    currentInvoiceTax,
    currentInvoiceTotal,
    currentPeriodEnd,
    nextInvoiceDate,
    nextInvoiceTax,
    nextInvoiceTotal,
    productName,
    promotionName,
    cancelAtPeriodEnd,
  } = subscription;
  const [checkedState, setCheckedState] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showCancelActionError, setShowCancelActionError] = useState(false);

  const { l10n } = useLocalization();

  const getCurrencyFallbackText = (amount: number) => {
    return getLocalizedCurrencyString(amount, currency, locale);
  };
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

  async function cancelSubscriptionAtPeriodEnd() {
    const result = await cancelSubscriptionAtPeriodEndAction(userId, subscription.id)
    if (result.ok) {
      setOpenDialog(true);
      setShowCancel(false);
      setShowCancelActionError(false);
    } else {
      setShowCancelActionError(true);
    }
  }
  return (
    <>
      <Dialog.Root open={openDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className='fixed inset-0 bg-black/75 z-50' />
          <Dialog.Content
            className='w-11/12 max-w-[545px] text-center px-7 pt-6 pb-8 rounded-xl shadow inline-block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-white'
            onEscapeKeyDown={() => setOpenDialog(false)}
            onPointerDownOutside={() => setOpenDialog(false)}
            onInteractOutside={() => setOpenDialog(false)}
          >
            <Dialog.Title className='font-bold leading-6 m-5'>
              <Localized id="subscription-cancellation-dialog-title">
                We’re sorry to see you go
              </Localized>
            </Dialog.Title>
            <Dialog.Description asChild className='leading-6 space-y-4'>
              <div>
                <Localized
                  id="subscription-cancellation-dialog-msg"
                  vars={{
                    name: subscription.productName,
                    date: getLocalizedDate(subscription.currentPeriodEnd),
                  }}
                >
                  <p>
                    Your {subscription.productName} subscription has been cancelled. You will still have access to {subscription.productName} until{' '} {getLocalizedDateString(subscription.currentPeriodEnd, false)}.
                  </p>
                </Localized>
                <Localized
                  id="subscription-cancellation-dialog-aside"
                  vars={{ url: supportUrl }}
                  elems={{ LinkExternal: <LinkExternal href={supportUrl} className="text-blue-500">Mozilla Support</LinkExternal> }}
                >
                  <p>
                    Have questions? Visit <LinkExternal href={supportUrl} className="text-blue-500">Mozilla Support</LinkExternal>.
                  </p>
                </Localized>
              </div>
            </Dialog.Description>
            <Dialog.Close asChild
            >
              <button
                className="absolute bg-transparent border-0 cursor-pointer flex items-center justify-center w-6 h-6 m-0 p-0 top-4 right-4 hover:bg-grey-200 hover:rounded focus:border-blue-400 focus:rounded focus:shadow-input-blue-focus after:absolute after:content-[''] after:top-0 after:left-0 after:w-full after:h-full after:bg-white after:opacity-50 after:z-10"
                onClick={() => setOpenDialog(false)}
              >
                <Image src={CloseIcon} alt={l10n.getString('dialog-close', null, 'Close dialog')} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {showCancel ? (
        <Form.Root
          aria-labelledby="cancel-subscription-heading"
          aria-describedby="cancel-subscription-desc"
          action={cancelSubscriptionAtPeriodEnd}
        >
          <Localized id="subscription-content-heading-cancel-subscription">
            <h4 id="cancel-subscription-heading" className="pt-6">
              Cancel Subscription
            </h4>
          </Localized>
          <Form.Field name="cancelAccess" className="text-grey-400 text-sm">
            <Localized
              id="subscription-content-no-longer-use-message"
              vars={{
                productName,
                currentPeriodEnd: currentPeriodEndLongFallback,
              }}
            >
              <p className="py-3" id="cancel-subscription-desc">
                You will no longer be able to use {productName} after{' '}
                {currentPeriodEndLongFallback}, the last day of your billing
                cycle.
              </p>
            </Localized>
            <Form.Label asChild className="cursor-pointer my-3">
              <label htmlFor="cancelAccess" className="flex items-center gap-4">
                <Form.Control asChild>
                  <input
                    id="cancelAccess"
                    name="cancelAccess"
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
                    currentPeriodEnd: currentPeriodEndLongFallback,
                  }}
                >
                  <span>
                    Cancel my access and my saved information within{' '}
                    {productName} on {currentPeriodEndLongFallback}
                  </span>
                </Localized>
              </label>
            </Form.Label>
            {showCancelActionError && (
              <Form.Message asChild>
                <Localized id="subscription-content-cancel-action-error">
                  <p className="mt-1 text-alert-red font-normal" role="alert">
                    An unexpected error occurred. Please try again.
                  </p>
                </Localized>
              </Form.Message>
            )}
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
                showLoadingSpinner={false}
              >
                Stay Subscribed
              </SubmitButton>
            </Localized>
            <Form.Submit asChild>
              <Localized
                id="subscription-content-button-cancel-subscription"
                vars={{ productName }}
                attrs={{ 'aria-label': true }}
              >
                <SubmitButton
                  className={`h-10 w-full tablet:w-1/2`}
                  variant={ButtonVariant.Secondary}
                  disabled={!checkedState}
                  aria-label={`Cancel your subscription to ${productName}`}
                >
                  Cancel Subscription
                </SubmitButton>
              </Localized>
            </Form.Submit>
          </div>
        </Form.Root>
      ) : (
        <section className="flex items-center justify-between gap-4 my-4">
          <div className="flex items-start gap-2 text-sm">
            {promotionName && (
              <Image src={couponIcon} alt="" role="presentation" />
            )}
            <div>
              <div className="font-semibold pb-1 -mt-1">
                {promotionName ? (
                  currentInvoiceTax ? (
                    <Localized
                      id="subscription-content-promotion-applied-with-tax"
                      vars={{
                        invoiceTotal:
                          getCurrencyFallbackText(currentInvoiceTotal),
                        promotionName,
                        taxDue: getCurrencyFallbackText(currentInvoiceTax),
                      }}
                    >
                      <p>
                        {productName} coupon applied:{' '}
                        {getCurrencyFallbackText(currentInvoiceTotal)} +{' '}
                        {getCurrencyFallbackText(currentInvoiceTax)} tax
                      </p>
                    </Localized>
                  ) : (
                    <Localized
                      id="subscription-content-promotion-applied-no-tax"
                      vars={{
                        invoiceTotal:
                          getCurrencyFallbackText(currentInvoiceTotal),
                        promotionName,
                      }}
                    >
                      <p>
                        {promotionName} coupon applied:{' '}
                        {getCurrencyFallbackText(currentInvoiceTotal)}
                      </p>
                    </Localized>
                  )
                ) : currentInvoiceTax ? (
                  <Localized
                    id="subscription-content-current-with-tax"
                    vars={{
                      invoiceTotal:
                        getCurrencyFallbackText(currentInvoiceTotal),
                      taxDue: getCurrencyFallbackText(currentInvoiceTax),
                    }}
                  >
                    <p>
                      {getCurrencyFallbackText(currentInvoiceTotal)} +{' '}
                      {getCurrencyFallbackText(currentInvoiceTax)} tax
                    </p>
                  </Localized>
                ) : (
                  <p>{getCurrencyFallbackText(currentInvoiceTotal)}</p>
                )}
              </div>
              {nextInvoiceTotal && (
                <div className="text-grey-400">
                  {nextInvoiceTax ? (
                    <Localized
                      id="subscription-content-next-bill-with-tax"
                      vars={{
                        invoiceTotal: getCurrencyFallbackText(nextInvoiceTotal),
                        nextBillDate: nextInvoiceDateShortFallback,
                        taxDue: getCurrencyFallbackText(nextInvoiceTax),
                      }}
                    >
                      <p>
                        Next bill of {getCurrencyFallbackText(nextInvoiceTotal)}{' '}
                        + {getCurrencyFallbackText(nextInvoiceTax)} tax is due{' '}
                        {nextInvoiceDateShortFallback}
                      </p>
                    </Localized>
                  ) : (
                    <Localized
                      id="subscription-content-next-bill-no-tax"
                      vars={{
                        invoiceTotal: getCurrencyFallbackText(nextInvoiceTotal),
                        nextBillDate: nextInvoiceDateShortFallback,
                      }}
                    >
                      <p>
                        Next bill of {getCurrencyFallbackText(nextInvoiceTotal)}{' '}
                        is due {nextInvoiceDateShortFallback}
                      </p>
                    </Localized>
                  )}
                </div>
              )}
            </div>
            {/*This is a temporary change. Permanent implementation completed as part of PAY-2510*/}
            {cancelAtPeriodEnd && (
              <div>
                THIS IS CANCELLED NOW
              </div>
            )}
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
              Cancel
            </SubmitButton>
          </Localized>
        </section>
      )}
    </>
  );
};
