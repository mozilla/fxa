/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Localized, useLocalization } from '@fluent/react';

import {
  cancelSubscriptionAtPeriodEndAction,
  resubscribeSubscriptionAction
} from '@fxa/payments/ui/actions';
import alertIcon from '@fxa/shared/assets/images/alert-yellow.svg';
import infoIcon from '@fxa/shared/assets/images/infoBlack.svg';
import newWindowIcon from '@fxa/shared/assets/images/new-window.svg';
import spinner from '@fxa/shared/assets/images/spinner.svg';
import {
  getLocalizedCurrencyString,
  getLocalizedDateString,
} from '@fxa/shared/l10n';
import { LinkExternal } from '@fxa/shared/react';

interface TrialSubscription {
  id: string;
  productName: string;
  offeringApiIdentifier: string;
  supportUrl: string;
  webIcon: string;
  currency: string;
  interval?: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: number | null;
  nextInvoiceTotal?: number;
  nextInvoiceTax?: number;
  conversionStatus: 'active' | 'past_due';
  failedInvoiceDate?: number;
  failedInvoiceTotal?: number;
  failedInvoiceTax?: number;
  failedInvoiceUrl?: string | null;
}

interface FreeTrialContentProps {
  trial: TrialSubscription;
  locale: string;
  userId: string;
  updatePaymentUrl?: string;
}

export const FreeTrialContent = ({
  trial,
  locale,
  userId,
  updatePaymentUrl,
}: FreeTrialContentProps) => {
  const {
    cancelAtPeriodEnd,
    conversionStatus,
    currency,
    failedInvoiceDate,
    failedInvoiceTax,
    failedInvoiceTotal,
    failedInvoiceUrl,
    interval,
    nextInvoiceTax,
    nextInvoiceTotal,
    productName,
    trialEnd,
  } = trial;

  const isPastDue = conversionStatus === 'past_due';

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showActionError, setShowActionError] = useState(false);
  const [isCancelled, setIsCancelled] = useState(cancelAtPeriodEnd);

  useEffect(() => setIsClient(true), []);

  const { l10n } = useLocalization();

  const getCurrencyFallbackText = (amount: number) => {
    return getLocalizedCurrencyString(amount, currency, locale);
  };

  const trialEndDateFallback = trialEnd
    ? getLocalizedDateString(trialEnd, false, locale)
    : undefined;

  const failedInvoiceDateFallback = failedInvoiceDate
    ? getLocalizedDateString(failedInvoiceDate, false, locale)
    : undefined;

  const getChargeInfoIds = (
    interval?: string,
    hasTax?: boolean,
    amount?: string,
    tax?: string,
    date?: string,
  ): { ftlId: string; fallbackText: string } => {
    if (hasTax) {
      switch (interval) {
        case 'daily':
          return {
            ftlId: 'free-trial-content-charge-info-with-tax-day',
            fallbackText: `You will be charged ${amount} + ${tax} tax per day after the free trial ends on ${date}.`,
          };
        case 'weekly':
          return {
            ftlId: 'free-trial-content-charge-info-with-tax-week',
            fallbackText: `You will be charged ${amount} + ${tax} tax per week after the free trial ends on ${date}.`,
          };
        case 'monthly':
          return {
            ftlId: 'free-trial-content-charge-info-with-tax-month',
            fallbackText: `You will be charged ${amount} + ${tax} tax per month after the free trial ends on ${date}.`,
          };
        case 'halfyearly':
          return {
            ftlId: 'free-trial-content-charge-info-with-tax-halfyear',
            fallbackText: `You will be charged ${amount} + ${tax} tax every six months after the free trial ends on ${date}.`,
          };
        case 'yearly':
          return {
            ftlId: 'free-trial-content-charge-info-with-tax-year',
            fallbackText: `You will be charged ${amount} + ${tax} tax per year after the free trial ends on ${date}.`,
          };
        default:
          return {
            ftlId: 'free-trial-content-charge-info-with-tax-default',
            fallbackText: `You will be charged ${amount} + ${tax} tax after the free trial ends on ${date}.`,
          };
      }
    } else {
      switch (interval) {
        case 'daily':
          return {
            ftlId: 'free-trial-content-charge-info-no-tax-day',
            fallbackText: `You will be charged ${amount} per day after the free trial ends on ${date}.`,
          };
        case 'weekly':
          return {
            ftlId: 'free-trial-content-charge-info-no-tax-week',
            fallbackText: `You will be charged ${amount} per week after the free trial ends on ${date}.`,
          };
        case 'monthly':
          return {
            ftlId: 'free-trial-content-charge-info-no-tax-month',
            fallbackText: `You will be charged ${amount} per month after the free trial ends on ${date}.`,
          };
        case 'halfyearly':
          return {
            ftlId: 'free-trial-content-charge-info-no-tax-halfyear',
            fallbackText: `You will be charged ${amount} every six months after the free trial ends on ${date}.`,
          };
        case 'yearly':
          return {
            ftlId: 'free-trial-content-charge-info-no-tax-year',
            fallbackText: `You will be charged ${amount} per year after the free trial ends on ${date}.`,
          };
        default:
          return {
            ftlId: 'free-trial-content-charge-info-no-tax-default',
            fallbackText: `You will be charged ${amount} after the free trial ends on ${date}.`,
          };
      }
    }
  };

  async function cancelTrial() {
    if (loading) return;

    setLoading(true);
    setShowActionError(false);

    const result = await cancelSubscriptionAtPeriodEndAction(
      userId,
      trial.id
    );
    if (result.ok) {
      setIsCancelled(true);
    } else {
      setShowActionError(true);
    }
    setLoading(false);
  }

  async function resumeTrial() {
    if (loading) return;

    setLoading(true);
    setShowActionError(false);

    const result = await resubscribeSubscriptionAction(
      userId,
      trial.id
    );
    if (result.ok) {
      setIsCancelled(false);
    } else {
      setShowActionError(true);
    }
    setLoading(false);
  }

  if (isPastDue) {
    return (
      <>
        {isClient && (
          <div className="bg-grey-10 leading-6 p-4 rounded-lg">
            {failedInvoiceDateFallback && (
              <div className="text-grey-500">
                <Localized
                  id="free-trial-content-last-bill"
                  vars={{ billedOnDate: failedInvoiceDateFallback }}
                >
                  <p>Last bill • {failedInvoiceDateFallback}</p>
                </Localized>
              </div>
            )}
            <div className="flex items-center justify-between">
              {failedInvoiceTotal !== undefined && failedInvoiceTax ? (
                <Localized
                  id="free-trial-content-last-bill-with-tax"
                  vars={{
                    invoiceTotal: getCurrencyFallbackText(failedInvoiceTotal),
                    taxDue: getCurrencyFallbackText(failedInvoiceTax),
                  }}
                >
                  <p>
                    {getCurrencyFallbackText(failedInvoiceTotal)} +{' '}
                    {getCurrencyFallbackText(failedInvoiceTax)} tax
                  </p>
                </Localized>
              ) : failedInvoiceTotal !== undefined ? (
                <Localized
                  id="free-trial-content-last-bill-no-tax"
                  vars={{
                    invoiceTotal: getCurrencyFallbackText(failedInvoiceTotal),
                  }}
                >
                  <p>{getCurrencyFallbackText(failedInvoiceTotal)}</p>
                </Localized>
              ) : null}
              {failedInvoiceUrl && (
                <LinkExternal
                  href={failedInvoiceUrl}
                  className="text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap"
                  data-testid="free-trial-link-view-invoice"
                  aria-label={l10n.getString(
                    'free-trial-content-link-view-invoice-aria',
                    { productName },
                    `View invoice for ${productName}`
                  )}
                >
                  <Localized id="free-trial-content-link-view-invoice">
                    <span className="underline">View invoice</span>
                  </Localized>
                  <Image src={newWindowIcon} alt="" />
                </LinkExternal>
              )}
            </div>

            <div
              className="border-none h-px bg-grey-100 my-2"
              role="separator"
              aria-hidden="true"
            ></div>

            <div className="flex items-start gap-1">
              <Image
                src={infoIcon}
                alt=""
                width={20}
                height={20}
                aria-hidden="true"
              />
              {trialEndDateFallback ? (
                <Localized
                  id="free-trial-content-payment-failed"
                  vars={{ date: trialEndDateFallback }}
                  elems={{ bold: <span className="font-bold" /> }}
                >
                  <p className="text-sm text-black">
                    Your free trial ended on{' '}
                    <span className="font-bold">{trialEndDateFallback}</span>.
                    We were unable to process your payment to start your
                    subscription. Please update your payment method to
                    activate your subscription and restore access to your
                    services.
                  </p>
                </Localized>
              ) : (
                <Localized id="free-trial-content-payment-failed-no-date">
                  <p className="text-sm text-black">
                    We were unable to process your payment to start your
                    subscription. Please update your payment method to
                    activate your subscription and restore access to your
                    services.
                  </p>
                </Localized>
              )}
            </div>
          </div>
        )}

        {updatePaymentUrl && (
          <div className="flex justify-end items-start gap-2 self-stretch">
            <div className="ms-auto w-full tablet:w-auto">
              <LinkExternal
                href={updatePaymentUrl}
                className="border box-border flex font-bold font-header h-10 items-center justify-center rounded-md py-2 px-5 bg-blue-500 hover:bg-blue-700 text-white w-full tablet:w-auto"
              >
                <Localized id="free-trial-content-button-update-payment">
                  Update payment method
                </Localized>
              </LinkExternal>
            </div>
          </div>
        )}
      </>
    );
  } else {
    let chargeInfoContent = null;
    if (nextInvoiceTotal !== undefined && trialEndDateFallback) {
      const hasTax = !!nextInvoiceTax;
      const amountText = getCurrencyFallbackText(nextInvoiceTotal);
      const taxText = nextInvoiceTax
        ? getCurrencyFallbackText(nextInvoiceTax)
        : undefined;
      const { ftlId, fallbackText } = getChargeInfoIds(
        interval,
        hasTax,
        amountText,
        taxText,
        trialEndDateFallback
      );

      chargeInfoContent = (
        <Localized
          id={ftlId}
          vars={{
            amount: amountText,
            ...(hasTax && taxText && { tax: taxText }),
            date: trialEndDateFallback,
          }}
        >
          <p className="text-sm text-black">{fallbackText}</p>
        </Localized>
      );
    }
    return (
      <>
      {isClient && (
        <div className="bg-grey-10 leading-6 p-4 rounded-lg">
          {isCancelled ? (
            <div className="flex items-center gap-1">
              <Image
                src={alertIcon}
                alt=""
                width={20}
                height={20}
                aria-hidden="true"
              />
              {trialEndDateFallback ? (
                <Localized
                  id="free-trial-content-trial-expires"
                  vars={{ date: trialEndDateFallback }}
                >
                  <p className="text-sm text-yellow-800">
                    Your free trial expires on {trialEndDateFallback}.
                  </p>
                </Localized>
              ) : (
                <Localized id="free-trial-content-trial-cancelled">
                  <p className="text-sm text-yellow-800">
                    Your free trial has been cancelled.
                  </p>
                </Localized>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Image
                src={infoIcon}
                alt=""
                width={20}
                height={20}
                aria-hidden="true"
              />
              {chargeInfoContent ? (
                chargeInfoContent
              ) : trialEndDateFallback ? (
                <Localized
                  id="free-trial-content-trial-ends"
                  vars={{ date: trialEndDateFallback }}
                >
                  <p className="text-sm">Your free trial ends on {trialEndDateFallback}. Update your payment method to keep access after your free trial.</p>
                </Localized>
              ) : (
                <Localized id="free-trial-content-trial-active">
                  <p className="text-sm">Your free trial is active.</p>
                </Localized>
              )}
            </div>
          )}
        </div>
      )}

      {showActionError && (
        <Localized id="free-trial-content-action-error">
          <p
            className="mt-1 text-alert-red font-normal text-start"
            role="alert"
          >
            An unexpected error occurred. Please try again.
          </p>
        </Localized>
      )}

      <div className="mt-3 tablet:mt-0 flex w-full flex-col tablet:flex-row tablet:justify-end gap-3">
        <div className="ms-auto w-full tablet:w-auto">
          {isCancelled ? (
            <button
              onClick={resumeTrial}
              disabled={loading}
              className="relative border box-border flex font-bold font-header h-10 items-center justify-center rounded-md py-2 px-5 bg-blue-500 hover:bg-blue-700 text-white w-full tablet:w-auto"
              aria-label={l10n.getString(
                'free-trial-content-button-resume-trial-aria',
                { productName },
                `Resume trial for ${productName}`
              )}
            >
              {loading && (
                <Image
                  src={spinner}
                  alt=""
                  className="absolute animate-spin h-5 w-5"
                />
              )}
              <span className={loading ? 'text-transparent' : ''}>
                <Localized id="free-trial-content-button-resume-trial">
                  Resume trial
                </Localized>
              </span>
            </button>
          ) : (
            <button
              onClick={cancelTrial}
              disabled={loading}
              className="relative border border-grey-200 box-border flex font-bold font-header h-10 items-center justify-center rounded-md py-2 px-5 bg-grey-10 hover:bg-grey-50 w-full tablet:w-auto"
              aria-label={l10n.getString(
                'free-trial-content-button-cancel-trial-aria',
                { productName },
                `Cancel trial for ${productName}`
              )}
            >
              {loading && (
                <Image
                  src={spinner}
                  alt=""
                  className="absolute animate-spin h-5 w-5"
                />
              )}
              <span className={loading ? 'text-transparent' : ''}>
                <Localized id="free-trial-content-button-cancel-trial">
                  Cancel trial
                </Localized>
              </span>
            </button>
          )}
        </div>
      </div>
      </>
    );
  }
};
