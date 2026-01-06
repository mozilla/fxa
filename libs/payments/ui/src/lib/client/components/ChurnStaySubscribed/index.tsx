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
import {
  redeemChurnCouponAction,
  resubscribeSubscriptionAction,
} from '@fxa/payments/ui/actions';
import spinner from '@fxa/shared/assets/images/spinner.svg';
import newWindowIcon from '@fxa/shared/assets/images/new-window.svg';
import { LinkExternal } from '@fxa/shared/react';

interface ChurnStaySubscribedProps {
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
  } | null;
  cmsOfferingContent: {
    successActionButtonUrl: string;
  } | null;
  staySubscribedContent: {
    flowType: 'stay_subscribed';
    active: boolean;
    cancelAtPeriodEnd: boolean;
    currency: string;
    currentPeriodEnd: number;
    defaultPaymentMethodType?: SubPlatPaymentMethodType;
    last4?: string;
    nextInvoiceTax?: number;
    nextInvoiceTotal?: number;
    productName: string;
    webIcon: string;
  };
}

export function ChurnStaySubscribed({
  uid,
  subscriptionId,
  locale,
  reason,
  staySubscribedContent,
  cmsChurnInterventionEntry,
  cmsOfferingContent,
}: ChurnStaySubscribedProps) {
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

  const { active, cancelAtPeriodEnd, productName, webIcon } =
    staySubscribedContent;

  const nextChargeChurnContent = getNextChargeChurnContent({
    currency: staySubscribedContent.currency,
    currentPeriodEnd: staySubscribedContent.currentPeriodEnd,
    locale,
    defaultPaymentMethodType: staySubscribedContent.defaultPaymentMethodType,
    discountAmount,
    last4: staySubscribedContent.last4,
    nextInvoiceTax: staySubscribedContent.nextInvoiceTax,
    nextInvoiceTotal: staySubscribedContent.nextInvoiceTotal,
  });

  async function churnStaySubscribed() {
    if (loading) return;

    setLoading(true);
    setResubscribeActionError(false);

    const result = await redeemChurnCouponAction(uid, subscriptionId, locale);

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

  async function resubscribe() {
    if (loading) {
      return;
    }

    setLoading(true);
    setResubscribeActionError(false);

    const result = await resubscribeSubscriptionAction(uid, subscriptionId);
    if (result.ok) {
      // TODO: This is a workaround to match existing legacy behavior.
      // Fix as part of redesign
      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {
      setResubscribeActionError(true);
    }
    setLoading(false);
  }

  const isOffer = reason === 'eligible' && cancelAtPeriodEnd && active;
  const isStillActive = reason === 'subscription_still_active';

  return (
    <section
      className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
      aria-labelledby="churn-stay-subscribed-heading"
    >
      {showSuccess ? (
        <div className="w-[480px] max-w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <Localized id="churn-stay-subscribed-title-subscription-renewed">
              <h1
                id="churn-stay-subscribed-heading"
                className="font-bold leading-7 text-xl"
              >
                Subscription renewed
              </h1>
            </Localized>
            <div className="leading-6">
              <Localized
                id={nextChargeChurnContent.l10nId}
                vars={nextChargeChurnContent.l10nVars}
              >
                <p></p>
              </Localized>
              <Localized id="churn-stay-subscribed-thanks-valued-subscriber">
                <p className="my-2">Thanks for being a valued subscriber!</p>
              </Localized>
            </div>

            <div className="flex flex-col gap-3 w-full">
              {goToProductUrl && (
                <LinkExternal
                  href={goToProductUrl}
                  className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50"
                >
                  <Localized
                    id="churn-stay-subscribed-button-go-to-product-page"
                    vars={{ productName }}
                  >
                    <span>Go to {productName}</span>
                  </Localized>
                </LinkExternal>
              )}

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
                  <Localized id="churn-stay-subscribed-button-go-to-subscriptions">
                    <span>Go to Subscriptions</span>
                  </Localized>
                )}
              </Link>
            </div>
          </div>
        </div>
      ) : isOffer ? (
        <Form.Root
          action={churnStaySubscribed}
          className="max-w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]"
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <h1
              id="churn-stay-subscribed-heading"
              className="font-bold leading-7 text-center text-xl"
            >
              {modalHeading}
            </h1>

            <div className="leading-6">
              {modalMessage && (
                <p>
                  {modalMessage.map((line, i) => (
                    <span key={i} className="my-2">
                      {line}
                    </span>
                  ))}
                  <span aria-hidden="true">*</span>
                </p>
              )}

              <Localized
                id={nextChargeChurnContent.l10nId}
                vars={nextChargeChurnContent.l10nVars}
              >
                <p className="my-2"></p>
              </Localized>
            </div>

            {showResubscribeActionError && !loading && (
              <Localized id="churn-stay-subscribed-action-error">
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
                className="flex h-14 items-center justify-center w-full"
                variant={ButtonVariant.Primary}
                disabled={loading}
              >
                {typeof discountAmount === 'number' && discountAmount > 0 ? (
                  <Localized
                    id="churn-stay-subscribed-button-stay-subscribed-and-save-discount"
                    vars={{ discountPercent: discountAmount }}
                  >
                    <span></span>
                  </Localized>
                ) : (
                  <Localized id="churn-stay-subscribed-button-stay-subscribed-and-save">
                    <span>Stay subscribed and save</span>
                  </Localized>
                )}
              </SubmitButton>
            </Form.Submit>
            <Link
              className="border box-border font-bold font-header h-14 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full"
              href={`/${locale}/subscriptions/landing`}
              onClick={(e) => {
                e.preventDefault();
                setLoading(true);
                router.push(`/${locale}/subscriptions/landing`);
              }}
              aria-label={'Back to Subscriptions page'}
            >
              {loading ? (
                <Image
                  src={spinner}
                  alt=""
                  className="absolute animate-spin h-8 w-8"
                />
              ) : (
                <Localized
                  id="churn-stay-subscribed-button-no-thanks"
                  attrs={{ 'aria-label': true }}
                >
                  <span>No thanks</span>
                </Localized>
              )}
            </Link>
            <LinkExternal
              href={`/${locale}/${apiIdentifier}/${interval}/stay_subscribed/loyalty-discount/terms`}
              className="flex gap-1"
            >
              <span aria-hidden="true">*</span>
              <Localized id="churn-stay-subscribed-link-terms-and-restrictions">
                <span className="text-blue-500 underline">
                  Limited terms and restrictions apply
                </span>
              </Localized>
              <Image src={newWindowIcon} alt="" className="text-blue-500" />
            </LinkExternal>
          </div>
        </Form.Root>
      ) : isStillActive ? (
        <div className="w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />

            <Localized
              id="churn-stay-subscribed-title-subscription-active"
              vars={{ productName }}
            >
              <h1
                id="churn-stay-subscribed-heading"
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
                    id="churn-error-page-button-go-to-product-page"
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
                <Localized id="churn-error-page-button-manage-subscriptions">
                  <span>Manage subscriptions</span>
                </Localized>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <Form.Root
          action={resubscribe}
          className="max-w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]"
        >
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <Localized id="churn-stay-subscribed-title-offer-expired">
              <h1
                id="churn-stay-subscribed-heading"
                className="font-bold leading-7 text-center text-xl"
              >
                This offer has expired
              </h1>
            </Localized>

            <div>
              <Localized
                id="churn-stay-subscribed-subtitle-offer-expired"
                vars={{ productName }}
              >
                <h2
                  id="stay-subscribed-heading"
                  className="font-bold text-violet-700"
                >
                  Want to keep using {productName}?
                </h2>
              </Localized>

              <Localized
                id="churn-stay-subscribed-message-access-will-continue"
                vars={{
                  productName,
                }}
              >
                <p className="leading-6 my-2">
                  Your access to {productName} will continue, and your billing
                  cycle and payment will stay the same.
                </p>
              </Localized>

              <Localized
                id={nextChargeChurnContent.l10nId}
                vars={nextChargeChurnContent.l10nVars}
              >
                <p className="leading-6 my-2"></p>
              </Localized>
            </div>

            {showResubscribeActionError && (
              <Localized id="churn-stay-subscribed-action-error">
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
                className="flex h-14 items-center justify-center w-full"
                variant={ButtonVariant.Primary}
                disabled={loading}
              >
                <Localized id="churn-stay-subscribed-button-stay-subscribed">
                  Stay subscribed
                </Localized>
              </SubmitButton>
            </Form.Submit>
          </div>
        </Form.Root>
      )}
    </section>
  );
}
