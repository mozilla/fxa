/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import * as Form from '@radix-ui/react-form';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { SubPlatPaymentMethodType } from '@fxa/payments/customer';
import {
  getNextChargeChurnContent,
  ButtonVariant,
  SubmitButton,
} from '@fxa/payments/ui';
import { redeemChurnCouponAction } from '@fxa/payments/ui/actions';
import spinner from '@fxa/shared/assets/images/spinner.svg';
import newWindowIcon from '@fxa/shared/assets/images/new-window.svg';
import { LinkExternal } from '@fxa/shared/react';

interface ChurnCancelProps {
  uid: string;
  subscriptionId: string;
  locale: string;
  reason: string;
  cmsChurnInterventionEntry: {
    apiIdentifier: string;
    churnInterventionId: string;
    churnType: string;
    ctaMessage: string;
    discountAmount: number;
    modalHeading: string;
    modalMessage: string[];
    redemptionLimit?: number | null;
    interval: string;
    productPageUrl: string;
    stripeCouponId: string;
    supportUrl: string;
    termsHeading: string;
    termsDetails: string[];
    webIcon: string;
  };
  cmsOfferingContent: {
    successActionButtonUrl: string;
  } | null;
  cancelContent: {
    flowType: 'cancel';
    active: boolean;
    cancelAtPeriodEnd: boolean;
    currency: string;
    currentPeriodEnd: number;
    defaultPaymentMethodType?: SubPlatPaymentMethodType;
    last4?: string;
    nextInvoiceTax?: number;
    nextInvoiceTotal?: number;
    productName: string;
    supportUrl: string;
    webIcon: string;
  };
}

export function ChurnCancel({
  uid,
  subscriptionId,
  locale,
  reason,
  cancelContent,
  cmsChurnInterventionEntry,
  cmsOfferingContent,
}: ChurnCancelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showResubscribeActionError, setResubscribeActionError] =
    useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    apiIdentifier,
    discountAmount,
    interval,
    modalHeading,
    modalMessage,
    productPageUrl,
  } = cmsChurnInterventionEntry || {};

  const { successActionButtonUrl } = cmsOfferingContent || {};
  const goToProductUrl = productPageUrl ?? successActionButtonUrl;

  const { active, cancelAtPeriodEnd, productName, webIcon } = cancelContent;

  const nextChargeChurnContent = getNextChargeChurnContent({
    currency: cancelContent.currency,
    currentPeriodEnd: cancelContent.currentPeriodEnd,
    locale,
    defaultPaymentMethodType: cancelContent.defaultPaymentMethodType,
    discountAmount,
    last4: cancelContent.last4,
    nextInvoiceTax: cancelContent.nextInvoiceTax,
    nextInvoiceTotal: cancelContent.nextInvoiceTotal,
  });

  async function churnCancelFlow() {
    if (loading) return;

    setLoading(true);
    setResubscribeActionError(false);

    const result = await redeemChurnCouponAction(
      uid,
      subscriptionId,
      'cancel',
      locale
    );

    if (result.redeemed) {
      // TODO: This is a workaround to match existing legacy behavior.
      // Fix as part of redesign
      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {
      setResubscribeActionError(true);
    }
    setLoading(false);
  }

  const isOffer = reason === 'eligible' && !cancelAtPeriodEnd && active;
  const isDiscountAlreadyApplied = reason === 'discount_already_applied';

  return (
    <section
      className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
      aria-labelledby="churn-cancel-flow-heading"
    >
      {showSuccess ? (
        <div className="max-w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <Localized id="churn-cancel-flow-success-title">
              <h1
                id="churn-cancel-flow-heading"
                className="font-bold leading-7 text-xl"
              >
                You’re still subscribed
              </h1>
            </Localized>
            <div className="leading-6">
              <Localized
                id="churn-cancel-flow-success-message"
                vars={{ discountPercent: discountAmount }}
              >
                <p>
                  Your subscription will continue, and you’ll save{' '}
                  {discountAmount}% on your next bill.
                </p>
              </Localized>
              <Localized
                id="churn-cancel-flow-thanks-valued-subscriber"
                vars={{ productName }}
              >
                <p className="my-2">Thanks for using {productName}!</p>
              </Localized>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Link
                className="border box-border flex font-bold font-header h-14 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50"
                href={`/${locale}/subscriptions/landing`}
                onClick={(e) => {
                  e.preventDefault();
                  setLoading(true);
                  router.push(`/${locale}/subscriptions/landing`);
                }}
              >
                {loading ? (
                  <Image
                    src={spinner}
                    alt=""
                    className="absolute animate-spin h-8 w-8"
                  />
                ) : (
                  <Localized id="churn-cancel-flow-button-back-to-subscriptions">
                    <span>Back to subscriptions</span>
                  </Localized>
                )}
              </Link>
            </div>
          </div>
        </div>
      ) : isOffer ? (
        <Form.Root
          action={churnCancelFlow}
          className="max-w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]"
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <h1
              id="churn-cancel-flow-heading"
              className="font-bold leading-7 text-center text-xl"
            >
              {modalHeading}
            </h1>

            <div className="leading-6">
              {modalMessage && (
                <div>
                  {modalMessage.map((line, i) => (
                    <p key={i} className="my-2">
                      {line}
                      {i === modalMessage.length - 1 && (
                        <span aria-hidden="true">*</span>
                      )}
                    </p>
                  ))}
                </div>
              )}

              <Localized
                id={nextChargeChurnContent.l10nId}
                vars={nextChargeChurnContent.l10nVars}
              >
                <p className="my-2"></p>
              </Localized>
            </div>

            {showResubscribeActionError && !loading && (
              <Localized id="churn-cancel-flow-action-error">
                <p
                  className="mt-1 text-alert-red font-normal text-start"
                  role="alert"
                >
                  An unexpected error occurred. Please try again.
                </p>
              </Localized>
            )}

            <Form.Submit asChild>
              <SubmitButton
                className="flex font-bold h-14 items-center justify-center tablet:w-full"
                variant={ButtonVariant.SubscriptionManagementSecondary}
                disabled={loading}
              >
                {typeof discountAmount === 'number' && discountAmount > 0 ? (
                  <Localized
                    id="churn-cancel-flow-button-stay-subscribed-and-save-discount"
                    vars={{ discountPercent: discountAmount }}
                  >
                    <span>Stay subscribed and save {discountAmount}%</span>
                  </Localized>
                ) : (
                  <Localized id="churn-cancel-flow-button-stay-subscribed-and-save">
                    <span>Stay subscribed and save</span>
                  </Localized>
                )}
              </SubmitButton>
            </Form.Submit>
            <Link
              className="border box-border font-bold font-header h-14 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full"
              href={`/${locale}/subscriptions/${subscriptionId}/cancel`}
              onClick={(e) => {
                e.preventDefault();
                setLoading(true);
                router.push(
                  `/${locale}/subscriptions/${subscriptionId}/cancel`
                );
              }}
            >
              {loading ? (
                <Image
                  src={spinner}
                  alt=""
                  className="absolute animate-spin h-8 w-8"
                />
              ) : (
                <Localized id="churn-cancel-flow-button-continue-to-cancel">
                  <span>Continue to cancel</span>
                </Localized>
              )}
            </Link>
            <LinkExternal
              href={`/${locale}/${apiIdentifier}/${interval}/cancel/loyalty-discount/terms`}
              className="flex gap-1"
            >
              <span aria-hidden="true">*</span>
              <Localized id="churn-cancel-flow-link-terms-and-restrictions">
                <span className="text-blue-500 underline">
                  Limited terms and restrictions apply
                </span>
              </Localized>
              <Image src={newWindowIcon} alt="" className="text-blue-500" />
            </LinkExternal>
          </div>
        </Form.Root>
      ) : isDiscountAlreadyApplied ? (
        <section
          className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
          aria-labelledby="error-discount-already-applied-heading"
        >
          <div className="max-w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <Image src={webIcon} alt={productName} height={64} width={64} />
              <h1
                id="error-discount-already-applied-heading"
                className="font-bold leading-7 text-center text-xl"
              >
                <Localized id="churn-cancel-flow-discount-already-applied-title">
                  <span>Discount code already applied</span>
                </Localized>
              </h1>
              <div className="leading-6">
                <Localized
                  id="churn-cancel-flow-discount-already-applied-message"
                  vars={{ productName }}
                >
                  <p className="my-2">
                    This discount was applied to a {productName} subscription
                    for your account. If you still need help, contact our
                    Support team.
                  </p>
                </Localized>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link
                  href={`/${locale}/subscriptions/landing`}
                  className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-blue-500 border-blue-600 hover:bg-blue-700 text-white"
                >
                  <Localized id="churn-cancel-flow-button-manage-subscriptions">
                    <span>Manage subscriptions</span>
                  </Localized>
                </Link>
                <LinkExternal
                  href={cancelContent.supportUrl}
                  className="box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 border-2 border-blue-600 hover:bg-grey-50 text-blue-600"
                >
                  <Localized id="churn-cancel-flow-button-contact-support">
                    <span>Contact Support</span>
                  </Localized>
                </LinkExternal>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="max-w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />

            <Localized
              id="churn-cancel-flow-subscription-active-title"
              vars={{ productName }}
            >
              <h1
                id="churn-cancel-heading"
                className="font-bold leading-7 text-center text-xl"
              >
                Your {productName} subscription is active
              </h1>
            </Localized>

            <div className="leading-6">
              <Localized
                id={nextChargeChurnContent.l10nId}
                vars={nextChargeChurnContent.l10nVars}
              >
                <p className="my-2"></p>
              </Localized>
            </div>
            <div className="flex flex-col gap-3 w-full">
              {goToProductUrl && (
                <LinkExternal
                  href={goToProductUrl}
                  className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50"
                >
                  <Localized
                    id="churn-cancel-flow-button-go-to-product-page"
                    vars={{ productName }}
                  >
                    <span>Go to {productName}</span>
                  </Localized>
                </LinkExternal>
              )}
              <Link
                href={`/${locale}/subscriptions/landing`}
                className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50"
              >
                <Localized id="churn-cancel-flow-button-manage-subscriptions">
                  <span>Manage subscriptions</span>
                </Localized>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
