/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Localized, useLocalization } from '@fluent/react';

import alertIcon from '@fxa/shared/assets/images/alert-yellow.svg';
import couponIcon from '@fxa/shared/assets/images/coupon-purple.svg';
import newWindowIcon from '@fxa/shared/assets/images/new-window.svg';
import {
  getLocalizedCurrencyString,
  getLocalizedDateString,
} from '@fxa/shared/l10n';
import { LinkExternal } from '@fxa/shared/react';

interface Subscription {
  id: string;
  productName: string;
  offeringApiIdentifier: string;
  webIcon: string;
  canResubscribe: boolean;
  currency: string;
  interval?: string;
  creditApplied: number | null;
  currentInvoiceDate: number;
  currentInvoiceTax: number;
  currentInvoiceTotal: number;
  currentInvoiceUrl?: string | null;
  currentPeriodEnd: number;
  nextInvoiceDate: number;
  nextInvoiceTax?: number;
  nextInvoiceTotal?: number;
  nextPromotionName?: string | null;
  promotionName?: string | null;
  isEligibleForChurnStaySubscribed: boolean;
  churnStaySubscribedCtaMessage?: string | null;
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
    canResubscribe,
    currency,
    currentInvoiceDate,
    currentInvoiceTax,
    currentInvoiceTotal,
    currentInvoiceUrl,
    currentPeriodEnd,
    nextInvoiceTax,
    nextInvoiceTotal,
    nextPromotionName,
    productName,
  } = subscription;
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

  return (
    <>
      {isClient && (
        <div className="bg-grey-10 leading-6 p-4 rounded-lg">
          <div className="text-grey-500">
            <Localized
              id="subscription-content-last-bill"
              vars={{ billedOnDate: currentInvoiceDateLongFallback }}
            >
              <p>Last bill • {currentInvoiceDateLongFallback}</p>
            </Localized>
          </div>
          <div className="flex items-center justify-between">
            {currentInvoiceTax ? (
              <Localized
                id="subscription-content-last-bill-with-tax"
                vars={{
                  invoiceTotal: getCurrencyFallbackText(currentInvoiceTotal),
                  taxDue: getCurrencyFallbackText(currentInvoiceTax),
                }}
              >
                <p>
                  {getCurrencyFallbackText(currentInvoiceTotal)} +{' '}
                  {getCurrencyFallbackText(currentInvoiceTax)} tax
                </p>
              </Localized>
            ) : (
              <Localized
                id="subscription-content-last-bill-no-tax"
                vars={{
                  invoiceTotal: getCurrencyFallbackText(currentInvoiceTotal),
                }}
              >
                <p>{getCurrencyFallbackText(currentInvoiceTotal)}</p>
              </Localized>
            )}
            {currentInvoiceUrl && (
              <LinkExternal
                href={currentInvoiceUrl}
                className="text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap"
                data-testid="link-external-view-invoice"
                aria-label={l10n.getString(
                  'subscription-management-link-view-invoice-aria',
                  {
                    productName,
                  },
                  `View invoice for ${productName}`
                )}
              >
                <Localized id="subscription-content-view-invoice">
                  <span className="underline">View invoice</span>
                </Localized>
                <Image src={newWindowIcon} alt="" />
              </LinkExternal>
            )}
          </div>
          {canResubscribe ? (
            <>
              <div
                className="border-none h-px bg-grey-100 my-2"
                role="separator"
                aria-hidden="true"
              ></div>
              {isClient && (
                <div className="flex items-center gap-1">
                  <Image
                    src={alertIcon}
                    alt=""
                    width={20}
                    height={20}
                    aria-hidden="true"
                  />
                  <Localized
                    id="subscription-content-expires-on-expiry-date"
                    vars={{
                      date: currentPeriodEndLongFallback,
                    }}
                  >
                    <p className="text-sm text-yellow-800">
                      Expires on {currentPeriodEndLongFallback}
                    </p>
                  </Localized>
                </div>
              )}
            </>
          ) : (
            <>
              {nextInvoiceTotal !== undefined && nextInvoiceTotal >= 0 ? (
                <>
                  <div
                    className="border-none h-px bg-grey-100 my-2"
                    role="separator"
                    aria-hidden="true"
                  ></div>
                  <div className="text-grey-500">
                    <Localized
                      id="subscription-content-next-bill"
                      vars={{
                        billedOnDate: currentPeriodEndLongFallback,
                      }}
                    >
                      <p>Next bill • {currentPeriodEndLongFallback}</p>
                    </Localized>
                  </div>
                  {nextInvoiceTax ? (
                    <Localized
                      id="subscription-content-next-bill-with-tax-1"
                      vars={{
                        nextInvoiceTotal:
                          getCurrencyFallbackText(nextInvoiceTotal),
                        taxDue: getCurrencyFallbackText(nextInvoiceTax),
                      }}
                    >
                      <p>
                        {getCurrencyFallbackText(nextInvoiceTotal)} +{' '}
                        {getCurrencyFallbackText(nextInvoiceTax)} tax
                      </p>
                    </Localized>
                  ) : (
                    <Localized
                      id="subscription-content-next-bill-no-tax-1"
                      vars={{
                        nextInvoiceTotal:
                          getCurrencyFallbackText(nextInvoiceTotal),
                      }}
                    >
                      <p>{getCurrencyFallbackText(nextInvoiceTotal)}</p>
                    </Localized>
                  )}
                </>
              ) : null}
              {nextPromotionName && (
                <Localized
                  id="subscription-content-coupon-will-be-applied"
                  vars={{
                    promotionName: nextPromotionName,
                  }}
                >
                  <p className="font-bold text-sm text-violet-700">
                    {nextPromotionName} discount will be applied
                  </p>
                </Localized>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-3 tablet:mt-0 flex w-full flex-col tablet:flex-row tablet:justify-end tablet:items-center tablet:justify-between gap-3">
        {canResubscribe && subscription.isEligibleForChurnStaySubscribed && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50">
              <Image
                src={couponIcon}
                alt=""
                width={22}
                height={22}
                aria-hidden="true"
              />
            </div>

            <div>
              <p>
                {subscription.churnStaySubscribedCtaMessage}
              </p>
              <LinkExternal
                href={`/${locale}/${subscription.offeringApiIdentifier}/${subscription.interval}/stay_subscribed/loyalty-discount/terms`}
                className="w-fit text-sm text-blue-500 underline hover:text-blue-600"
                aria-label={l10n.getString(
                  'subscription-content-link-churn-intervention-terms-aria',
                  {},
                  'View coupon terms and restrictions'
                )}
              >
                <Localized id='subscription-content-link-churn-intervention-terms-apply'>
                  <span>Terms apply</span>
                </Localized>
              </LinkExternal>
            </div>
          </div>
        )}
        <div className="ms-auto w-full tablet:w-auto">
          {canResubscribe ? (
            <Link
              href={`/${locale}/subscriptions/${subscription.id}/stay-subscribed`}
              className="border box-border flex font-bold font-header h-10 items-center justify-center rounded-md py-2 px-5 bg-blue-500 hover:bg-blue-700 text-white w-full tablet:w-auto"
              aria-label={`Stay subscribed to ${productName}`}
            >
              <Localized
                id="subscription-content-button-stay-subscribed"
                vars={{ productName }}
              >
                Stay subscribed
              </Localized>
            </Link>
          ) : (
            <Link
              href={`/${locale}/subscriptions/${subscription.id}/cancel`}
              className="border border-grey-200 box-border flex font-bold font-header h-10 items-center justify-center rounded-md py-2 px-5 bg-grey-10 hover:bg-grey-50 w-full tablet:w-auto"
              aria-label={`Cancel your subscription to ${productName}`}
            >
              <Localized
                id="subscription-content-button-cancel-subscription"
                attrs={{ 'aria-label': true }}
                vars={{ productName }}
              >
                Cancel subscription
              </Localized>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};
