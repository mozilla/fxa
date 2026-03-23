/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import * as Form from '@radix-ui/react-form';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { SubPlatPaymentMethodType } from '@fxa/payments/customer';
import { mapErrorReason, type Interval } from '@fxa/payments/metrics/client';
import {
  getNextChargeChurnContent,
  AlreadyCanceling,
  BaseButton,
  ButtonVariant,
} from '@fxa/payments/ui';
import {
  cancelSubscriptionAtPeriodEndAction,
  redeemChurnCouponAction,
} from '@fxa/payments/ui/actions';
import spinner from '@fxa/shared/assets/images/spinner.svg';
import newWindowIcon from '@fxa/shared/assets/images/new-window.svg';
import { getLocalizedDateString } from '@fxa/shared/l10n';
import { LinkExternal } from '@fxa/shared/react';
import { useGleanMetrics } from '../../hooks/useGleanMetrics';

interface ChurnCancelProps {
  uid: string;
  metricsEnabled: boolean;
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
  metricsEnabled,
  subscriptionId,
  locale,
  reason,
  cancelContent,
  cmsChurnInterventionEntry,
  cmsOfferingContent,
}: ChurnCancelProps) {
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showResubscribeActionError, setResubscribeActionError] =
    useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const glean = useGleanMetrics(metricsEnabled);
  const params = useParams();
  const searchParams = useSearchParams();
  const {
    apiIdentifier,
    discountAmount,
    interval,
    modalHeading,
    modalMessage,
    productPageUrl,
  } = cmsChurnInterventionEntry || {};

  const retentionFlowBase = useMemo(
    () => ({
      flowType: 'cancel' as const,
      eligibilityStatus: 'cancel' as const,
      offeringId: apiIdentifier,
      interval: interval as Interval,
      entrypoint: searchParams.get('entrypoint') ?? undefined,
      utmSource: searchParams.get('utm_source') ?? undefined,
      utmMedium: searchParams.get('utm_medium') ?? undefined,
      utmCampaign: searchParams.get('utm_campaign') ?? undefined,
      nimbusUserId: searchParams.get('nimbus_user_id') ?? undefined,
    }),
    [apiIdentifier, interval, searchParams]
  );

  useEffect(() => {
    if (
      reason === 'eligible' &&
      !cancelContent.cancelAtPeriodEnd &&
      cancelContent.active
    ) {
      glean.recordRetentionFlowView(retentionFlowBase);
    }
  }, []);

  const { successActionButtonUrl } = cmsOfferingContent || {};
  const goToProductUrl = productPageUrl ?? successActionButtonUrl;

  const {
    active,
    cancelAtPeriodEnd,
    currentPeriodEnd,
    productName,
    supportUrl,
    webIcon,
  } = cancelContent;

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

  async function handleRedeemSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    glean.recordRetentionFlowEngage({
      ...retentionFlowBase,
      action: 'redeem_coupon',
    });

    setLoading(true);
    setResubscribeActionError(false);

    glean.recordRetentionFlowSubmit({
      ...retentionFlowBase,
      action: 'redeem_coupon',
    });

    try {
      const result = await redeemChurnCouponAction(
        uid,
        subscriptionId,
        'cancel',
        { ...params },
        Object.fromEntries(searchParams),
        locale
      );

      if (result.redeemed) {
        glean.recordRetentionFlowResult({
          ...retentionFlowBase,
          action: 'redeem_coupon',
          outcome: 'redeem_success',
        });
        // TODO: This is a workaround to match existing legacy behavior.
        // Fix as part of redesign
        setShowSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        glean.recordRetentionFlowResult({
          ...retentionFlowBase,
          action: 'redeem_coupon',
          outcome: 'error',
          errorReason: mapErrorReason(result.reason),
        });
        setResubscribeActionError(true);
      }
    } catch {
      glean.recordRetentionFlowResult({
        ...retentionFlowBase,
        action: 'redeem_coupon',
        outcome: 'error',
        errorReason: 'unexpected_exception',
      });
      setResubscribeActionError(true);
    } finally {
      setLoading(false);
    }
  }

  async function cancelSubscriptionAtPeriodEnd() {
    if (cancelLoading) return;

    glean.recordRetentionFlowEngage({
      ...retentionFlowBase,
      action: 'cancel_subscription',
    });

    setCancelLoading(true);
    setResubscribeActionError(false);

    glean.recordRetentionFlowSubmit({
      ...retentionFlowBase,
      action: 'cancel_subscription',
    });

    try {
      const result = await cancelSubscriptionAtPeriodEndAction(
        uid,
        subscriptionId
      );

      if (result.ok) {
        glean.recordRetentionFlowResult({
          ...retentionFlowBase,
          action: 'cancel_subscription',
          outcome: 'customer_canceled',
        });
        // TODO: This is a workaround to match existing legacy behavior.
        // Fix as part of redesign
        setShowCancelSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 500)); // optional: match legacy feel
      } else {
        glean.recordRetentionFlowResult({
          ...retentionFlowBase,
          action: 'cancel_subscription',
          outcome: 'error',
          errorReason: 'operation_denied',
        });
        setResubscribeActionError(true);
      }
    } catch {
      glean.recordRetentionFlowResult({
        ...retentionFlowBase,
        action: 'cancel_subscription',
        outcome: 'error',
        errorReason: 'unexpected_exception',
      });
      setResubscribeActionError(true);
    } finally {
      setCancelLoading(false);
    }
  }

  const isOffer = reason === 'eligible' && !cancelAtPeriodEnd && active;
  const isDiscountAlreadyApplied = reason === 'discount_already_applied';
  const currentPeriodEndLongFallback = getLocalizedDateString(
    currentPeriodEnd,
    false,
    locale
  );

  return (
    <section
      className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
      aria-labelledby="churn-cancel-flow-heading"
    >
      {showCancelSuccess ? (
        <div className="max-w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <div>
              <Localized id="churn-cancel-flow-cancel-success-title">
                <h1
                  id="churn-cancel-flow-heading"
                  className="font-bold leading-7 text-xl"
                >
                  We’re sorry to see you go
                </h1>
              </Localized>

              <div className="leading-6 text-center">
                <Localized
                  id="churn-cancel-flow-cancel-success-dialog-msg"
                  vars={{
                    productName,
                    date: currentPeriodEndLongFallback,
                  }}
                >
                  <p className="my-2">
                    Your {productName} subscription has been cancelled. You will
                    still have access to {productName} until{' '}
                    {currentPeriodEndLongFallback}.
                  </p>
                </Localized>{' '}
                <Localized id="churn-cancel-flow-cancel-turn-back-on">
                  <p className="my-2">
                    You can turn your subscription back on anytime before it
                    ends.
                  </p>
                </Localized>
                <Localized
                  id="churn-cancel-flow-cancel-success-dialog-aside"
                  vars={{ url: supportUrl }}
                  elems={{
                    LinkExternal: (
                      <LinkExternal
                        href={supportUrl}
                        className="text-blue-500 underline"
                      >
                        Mozilla Support
                      </LinkExternal>
                    ),
                  }}
                >
                  <p className="my-2">
                    Have questions? Visit{' '}
                    <LinkExternal
                      href={supportUrl}
                      className="text-blue-500 underline"
                    >
                      Mozilla Support
                    </LinkExternal>
                    .
                  </p>
                </Localized>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Link
                className="border box-border flex font-bold font-header h-14 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50"
                href={`/${locale}/subscriptions/landing`}
              >
                <Localized id="churn-cancel-flow-button-back-to-subscriptions">
                  <span>Back to subscriptions</span>
                </Localized>
              </Link>
            </div>
          </div>
        </div>
      ) : reason === 'already_canceling_at_period_end' ? (
        <AlreadyCanceling
          currentPeriodEnd={currentPeriodEnd}
          locale={locale}
          productName={productName}
          webIcon={webIcon}
        />
      ) : showSuccess ? (
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
              >
                <Localized id="churn-cancel-flow-button-back-to-subscriptions">
                  <span>Back to subscriptions</span>
                </Localized>
              </Link>
            </div>
          </div>
        </div>
      ) : isOffer ? (
        <Form.Root
          onSubmit={handleRedeemSubmit}
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
                <>
                  {modalMessage.map((line, i) => (
                    <p key={i} className="my-2">
                      {line}
                      {i === modalMessage.length - 1 && (
                        <span aria-hidden="true">*</span>
                      )}
                    </p>
                  ))}
                </>
              )}

              <p className="my-2">
                <Localized
                  id={nextChargeChurnContent.l10nId}
                  vars={nextChargeChurnContent.l10nVars}
                >
                  <span></span>
                </Localized>{' '}
                <Localized id="churn-cancel-flow-after">
                  <span>
                    After that, your subscription will automatically renew at
                    the standard fee, unless you cancel.
                  </span>
                </Localized>
              </p>
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
              <BaseButton
                className="flex font-bold h-14 items-center justify-center tablet:w-full"
                variant={ButtonVariant.SubscriptionManagementSecondary}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Image
                    src={spinner}
                    alt=""
                    className="absolute animate-spin h-8 w-8"
                  />
                ) : (
                  <>
                    {typeof discountAmount === 'number' &&
                    discountAmount > 0 ? (
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
                  </>
                )}
              </BaseButton>
            </Form.Submit>
            <BaseButton
              className="border box-border font-bold font-header h-14 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full tablet:w-full"
              variant={ButtonVariant.SubscriptionManagementSecondary}
              onClick={cancelSubscriptionAtPeriodEnd}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <Image
                  src={spinner}
                  alt=""
                  className="absolute animate-spin h-8 w-8"
                />
              ) : (
                <Localized id="churn-cancel-flow-button-cancel-subscription">
                  <span>Cancel subscription</span>
                </Localized>
              )}
            </BaseButton>
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
