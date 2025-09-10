/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Localized, useLocalization } from '@fluent/react';
import * as Form from '@radix-ui/react-form';

import { ActionButton, ButtonVariant, SubmitButton } from '@fxa/payments/ui';
import {
  getLocalizedCurrencyString,
  getLocalizedDateString,
} from '@fxa/shared/l10n';
import { cancelSubscriptionAtPeriodEndAction } from '../../../actions';
import { LinkExternal } from '@fxa/shared/react';

import * as Dialog from '@radix-ui/react-dialog';
import CloseIcon from '@fxa/shared/assets/images/close.svg';
import { resubscribeSubscriptionAction } from '@fxa/payments/ui/actions';

interface Subscription {
  id: string;
  productName: string;
  webIcon: string;
  canResubscribe: boolean;
  currency: string;
  interval?: string;
  creditApplied: number | null;
  currentInvoiceDate: number;
  currentInvoiceTax: number;
  currentInvoiceTotal: number;
  currentPeriodEnd: number;
  nextInvoiceDate: number;
  nextInvoiceTax?: number;
  nextInvoiceTotal?: number;
  promotionName?: string | null;
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
    canResubscribe,
    creditApplied,
    currency,
    currentInvoiceDate,
    currentInvoiceTax,
    currentInvoiceTotal,
    currentPeriodEnd,
    nextInvoiceTax,
    nextInvoiceTotal,
    productName,
    webIcon,
    promotionName,
  } = subscription;

  const [checkedState, setCheckedState] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showCancelActionError, setShowCancelActionError] = useState(false);

  const [openCancellationDialog, setOpenCancellationDialog] = useState(false);
  const [openResubscribeDialog, setOpenResubscribeDialog] = useState(false);
  const [openResubscribeSuccessDialog, setOpenResubscribeSuccessDialog] =
    useState(false);
  const [pendingResubscribe, setPendingResubscribe] = useState(false);
  const [showResubscribeActionError, setResubscribeActionError] =
    useState(false);

  // Fluent React Overlays cause hydration issues due to SSR.
  // Using isClient along with the useEffect ensures its only run Client Side
  // Note this currently only affects strings that make use of React Overlays.
  // Other strings are localized in SSR as expected.
  // - https://github.com/projectfluent/fluent.js/wiki/React-Overlays
  // - https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const { l10n } = useLocalization();
  const getCurrencyFallbackText = (amount: number) => {
    return getLocalizedCurrencyString(amount, currency, locale);
  };

  const currentInvoiceDateLongFallback = getLocalizedDateString(
    currentInvoiceDate,
    false,
    locale
  );
  const currentPeriodEndLongFallback = getLocalizedDateString(
    currentPeriodEnd,
    false,
    locale
  );

  const spanElementBilledOnCurrentInvoiceDate = (
    <span className="font-normal text-grey-600 text-sm">
      billed on {currentInvoiceDateLongFallback}
    </span>
  );

  async function cancelSubscriptionAtPeriodEnd() {
    const result = await cancelSubscriptionAtPeriodEndAction(
      userId,
      subscription.id
    );
    if (result.ok) {
      setOpenCancellationDialog(true);
      setShowCancel(false);
      setShowCancelActionError(false);
    } else {
      setShowCancelActionError(true);
    }
  }

  async function resubscribe() {
    setPendingResubscribe(true);
    setResubscribeActionError(false);

    const result = await resubscribeSubscriptionAction(userId, subscription.id);
    if (result.ok) {
      setOpenResubscribeDialog(false);
      // TODO: This is a workaround to match existing legacy behavior.
      // Fix as part of redesign
      await new Promise((resolve) => setTimeout(resolve, 500));
      setOpenResubscribeSuccessDialog(true);
    } else {
      setResubscribeActionError(true);
    }
    setPendingResubscribe(false);
  }

  return (
    <>
      <Dialog.Root open={openCancellationDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/75 z-50" />
          <Dialog.Content
            className="w-11/12 max-w-[545px] text-center px-7 pt-6 pb-8 rounded-xl shadow inline-block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-white"
            aria-labelledby="subscription-cancellation-dialog-title"
            aria-describedby="subscription-cancellation-dialog-description"
            onEscapeKeyDown={() => setOpenCancellationDialog(false)}
            onPointerDownOutside={() => setOpenCancellationDialog(false)}
            onInteractOutside={() => setOpenCancellationDialog(false)}
          >
            <Dialog.Title
              id="subscription-cancellation-dialog-title"
              className="font-bold leading-6 m-5"
            >
              <Localized id="subscription-cancellation-dialog-title">
                We’re sorry to see you go
              </Localized>
            </Dialog.Title>
            <Dialog.Description
              asChild
              id="subscription-cancellation-dialog-description"
              className="leading-6 space-y-4"
            >
              <div>
                <Localized
                  id="subscription-cancellation-dialog-msg"
                  vars={{
                    name: productName,
                    date: currentPeriodEndLongFallback,
                  }}
                >
                  <p>
                    Your {subscription.productName} subscription has been
                    cancelled. You will still have access to {productName} until{' '}
                    {currentPeriodEndLongFallback}.
                  </p>
                </Localized>
                <Localized
                  id="subscription-cancellation-dialog-aside"
                  vars={{ url: supportUrl }}
                  elems={{
                    LinkExternal: (
                      <LinkExternal href={supportUrl} className="text-blue-500">
                        Mozilla Support
                      </LinkExternal>
                    ),
                  }}
                >
                  <p>
                    Have questions? Visit{' '}
                    <LinkExternal href={supportUrl} className="text-blue-500">
                      Mozilla Support
                    </LinkExternal>
                    .
                  </p>
                </Localized>
              </div>
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                className="absolute bg-transparent border-0 cursor-pointer flex items-center justify-center w-6 h-6 m-0 p-0 top-4 right-4 hover:bg-grey-200 hover:rounded focus:border-blue-400 focus:rounded focus:shadow-input-blue-focus after:absolute after:content-[''] after:top-0 after:left-0 after:w-full after:h-full after:bg-white after:opacity-50 after:z-10"
                onClick={() => setOpenCancellationDialog(false)}
              >
                <Image
                  src={CloseIcon}
                  alt={l10n.getString('dialog-close', null, 'Close dialog')}
                />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={openResubscribeSuccessDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/75 z-50" />
          <Dialog.Content
            className="w-11/12 max-w-[545px] text-center px-7 pt-6 pb-8 rounded-xl shadow inline-block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-9999 bg-white"
            aria-labelledby="resubscribe-success-title"
            aria-describedby="resubscribe-success-description"
            onEscapeKeyDown={() => setOpenResubscribeSuccessDialog(false)}
            onPointerDownOutside={() => setOpenResubscribeSuccessDialog(false)}
            onInteractOutside={() => setOpenResubscribeSuccessDialog(false)}
          >
            <Dialog.Title
              id="resubscribe-success-title"
              className="font-bold leading-6 m-5 space-y-5"
            >
              <Image
                src={webIcon}
                alt={productName}
                height={64}
                width={64}
                className="h-16 w-16 mx-auto"
              />
              <Localized id="resubscribe-success-dialog-title">
                <p>Thanks! You’re all set.</p>
              </Localized>
            </Dialog.Title>
            <Dialog.Description
              id="resubscribe-success-description"
              className="leading-6 space-y-4"
            >
              <Localized
                id="resubscribe-success-dialog-action-button-close"
                attrs={{ 'aria-label': true }}
              >
                <SubmitButton
                  className="h-10 w-full"
                  variant={ButtonVariant.Primary}
                  onClick={() => setOpenResubscribeSuccessDialog(false)}
                  aria-label="Close dialog"
                >
                  Close
                </SubmitButton>
              </Localized>
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                className="absolute bg-transparent border-0 cursor-pointer flex items-center justify-center w-6 h-6 m-0 p-0 top-4 right-4 hover:bg-grey-200 hover:rounded focus:border-blue-400 focus:rounded focus:shadow-input-blue-focus after:absolute after:content-[''] after:top-0 after:left-0 after:w-full after:h-full after:bg-white after:opacity-50 after:z-10"
                onClick={() => setOpenResubscribeSuccessDialog(false)}
              >
                <Image
                  src={CloseIcon}
                  alt={l10n.getString('dialog-close', null, 'Close dialog')}
                />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={openResubscribeDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/75 z-50" />
          <Dialog.Content
            className="w-11/12 max-w-[545px] text-center px-7 pt-6 pb-8 rounded-xl shadow inline-block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-9999 bg-white"
            aria-labelledby="resubscribe-dialog-title"
            aria-describedby="resubscribe-dialog-description"
            onEscapeKeyDown={() => setOpenResubscribeDialog(false)}
            onPointerDownOutside={() => setOpenResubscribeDialog(false)}
            onInteractOutside={() => setOpenResubscribeDialog(false)}
          >
            <Dialog.Title
              id="resubscribe-dialog-title"
              className="font-bold leading-6 m-5 space-y-5"
            >
              <Image
                src={webIcon}
                alt={productName}
                height={64}
                width={64}
                className="h-16 w-16 mx-auto"
              />
              <Localized
                id="resubscribe-dialog-title"
                vars={{
                  name: productName,
                }}
              >
                <p>Want to keep using {productName}?</p>
              </Localized>
            </Dialog.Title>
            <Dialog.Description
              asChild
              id="resubscribe-dialog-description"
              className="leading-6 space-y-4"
            >
              <div>
                {nextInvoiceTax ? (
                  <Localized
                    id="resubscribe-dialog-content-with-tax"
                    vars={{
                      name: productName,
                      amount: getCurrencyFallbackText(nextInvoiceTotal ?? 0),
                      endDate: currentPeriodEndLongFallback,
                      tax: getCurrencyFallbackText(nextInvoiceTax),
                    }}
                  >
                    <p>
                      Your access to {productName} will continue, and your
                      billing cycle and payment will stay the same. Your next
                      charge will be{' '}
                      {getCurrencyFallbackText(nextInvoiceTotal ?? 0)} +{' '}
                      {getCurrencyFallbackText(nextInvoiceTax)} tax on{' '}
                      {currentPeriodEndLongFallback}.
                    </p>
                  </Localized>
                ) : (
                  <Localized
                    id="resubscribe-dialog-content"
                    vars={{
                      name: productName,
                      amount: getCurrencyFallbackText(nextInvoiceTotal ?? 0),
                      endDate: currentPeriodEndLongFallback,
                    }}
                  >
                    <p>
                      Your access to {productName} will continue, and your
                      billing cycle and payment will stay the same. Your next
                      charge will be{' '}
                      {getCurrencyFallbackText(nextInvoiceTotal ?? 0)} on{' '}
                      {currentPeriodEndLongFallback}.
                    </p>
                  </Localized>
                )}

                {showResubscribeActionError && (
                  <Localized id="subscription-content-cancel-action-error">
                    <p
                      className="mt-1 text-alert-red font-normal text-start"
                      role="alert"
                    >
                      An unexpected error occurred. Please try again.
                    </p>
                  </Localized>
                )}
                <ActionButton
                  className="h-10 w-full"
                  variant={ButtonVariant.Primary}
                  aria-label={`Resubscribe to ${productName}`}
                  onClick={resubscribe}
                  pending={pendingResubscribe}
                >
                  <Localized
                    id="resubscribe-dialog-action-button-resubscribe"
                    vars={{ productName }}
                    attrs={{ 'aria-label': true }}
                  >
                    Resubscribe
                  </Localized>
                </ActionButton>
              </div>
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                className="absolute bg-transparent border-0 cursor-pointer flex items-center justify-center w-6 h-6 m-0 p-0 top-4 right-4 hover:bg-grey-200 hover:rounded focus:border-blue-400 focus:rounded focus:shadow-input-blue-focus after:absolute after:content-[''] after:top-0 after:left-0 after:w-full after:h-full after:bg-white after:opacity-50 after:z-10"
                onClick={() => setOpenResubscribeDialog(false)}
              >
                <Image
                  src={CloseIcon}
                  alt={l10n.getString('dialog-close', null, 'Close dialog')}
                />
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
          {canResubscribe ? (
            <>
              {isClient && (
                <Localized
                  id="subscription-content-resubscribe"
                  vars={{
                    name: productName,
                    date: currentPeriodEndLongFallback,
                  }}
                  elems={{
                    strong: <strong></strong>,
                  }}
                >
                  <p className="text-sm leading-4 text-grey-400">
                    You will lose access to {productName} on{' '}
                    <strong>{currentPeriodEndLongFallback}</strong>.
                  </p>
                </Localized>
              )}
              <Localized
                id="subscription-content-button-resubscribe"
                vars={{ productName }}
                attrs={{ 'aria-label': true }}
              >
                <SubmitButton
                  className="h-10"
                  variant={ButtonVariant.Secondary}
                  onClick={() => setOpenResubscribeDialog(true)}
                  aria-label={`Resubscribe to ${productName}`}
                >
                  Resubscribe
                </SubmitButton>
              </Localized>
            </>
          ) : (
            <>
              <div className="leading-5">
                {currentInvoiceTax ? (
                  <Localized
                    id="subscription-content-current-invoice-billed-on-with-tax"
                    vars={{
                      billedOnDate: currentInvoiceDateLongFallback,
                      invoiceTotal:
                        getCurrencyFallbackText(currentInvoiceTotal),
                      taxDue: getCurrencyFallbackText(currentInvoiceTax),
                    }}
                    elems={{ span: spanElementBilledOnCurrentInvoiceDate }}
                  >
                    <p className="text-base font-semibold">
                      {getCurrencyFallbackText(currentInvoiceTotal)} +{' '}
                      {getCurrencyFallbackText(currentInvoiceTax)} tax{' '}
                      {spanElementBilledOnCurrentInvoiceDate}
                    </p>
                  </Localized>
                ) : (
                  <Localized
                    id="subscription-content-current-invoice-billed-on-no-tax"
                    vars={{
                      billedOnDate: currentInvoiceDateLongFallback,
                      invoiceTotal:
                        getCurrencyFallbackText(currentInvoiceTotal),
                    }}
                    elems={{ span: spanElementBilledOnCurrentInvoiceDate }}
                  >
                    <p className="text-base font-semibold">
                      {getCurrencyFallbackText(currentInvoiceTotal)}{' '}
                      {spanElementBilledOnCurrentInvoiceDate}
                    </p>
                  </Localized>
                )}
                {creditApplied && creditApplied > 0 ? (
                  <Localized
                    id="subscription-content-credit-issued-to-your-account"
                    vars={{
                      creditApplied: getCurrencyFallbackText(creditApplied),
                    }}
                  >
                    <p className="text-green-900 text-sm">
                      <strong>{getCurrencyFallbackText(creditApplied)}</strong>{' '}
                      credit issued to your account
                    </p>
                  </Localized>
                ) : null}
                {promotionName && (
                  <Localized
                    id="subscription-content-coupon-applied"
                    vars={{
                      promotionName,
                    }}
                  >
                    <p className="font-bold text-sm text-violet-700">
                      {promotionName} applied
                    </p>
                  </Localized>
                )}
                {nextInvoiceTotal !== undefined && nextInvoiceTotal >= 0 ? (
                  <div className="text-sm">
                    {nextInvoiceTax ? (
                      <Localized
                        id="subscription-content-next-bill-excl-discount-with-tax"
                        vars={{
                          nextBillDate: currentPeriodEndLongFallback,
                          nextInvoiceTotal:
                            getCurrencyFallbackText(nextInvoiceTotal),
                          taxDue: getCurrencyFallbackText(nextInvoiceTax),
                        }}
                      >
                        <p>
                          Next bill of{' '}
                          <strong>
                            {getCurrencyFallbackText(nextInvoiceTotal)} +{' '}
                            {getCurrencyFallbackText(nextInvoiceTax)} tax
                          </strong>
                          , excluding discounts, is due{' '}
                          <strong>{currentPeriodEndLongFallback}</strong>
                        </p>
                      </Localized>
                    ) : (
                      <Localized
                        id="subscription-content-next-bill-excl-discount-no-tax"
                        vars={{
                          nextBillDate: currentPeriodEndLongFallback,
                          nextInvoiceTotal:
                            getCurrencyFallbackText(nextInvoiceTotal),
                        }}
                      >
                        <p>
                          Next bill of{' '}
                          <strong>
                            {getCurrencyFallbackText(nextInvoiceTotal)}
                          </strong>
                          , excluding discounts, is due{' '}
                          <strong>{currentPeriodEndLongFallback}</strong>
                        </p>
                      </Localized>
                    )}
                  </div>
                ) : null}
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
            </>
          )}
        </section>
      )}
    </>
  );
};
