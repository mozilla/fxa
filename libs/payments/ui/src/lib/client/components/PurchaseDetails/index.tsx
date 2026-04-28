/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { InvoicePreview } from '@fxa/payments/customer';
import alertCircle from '@fxa/shared/assets/images/alert-black-circle.svg';
import infoLogo from '@fxa/shared/assets/images/info.svg';
import {
  getLocalizedCurrencyString,
  getLocalizedDateString,
} from '@fxa/shared/l10n';
import chevron from './images/chevron.svg';

type PurchaseDetailsProps = {
  invoice: InvoicePreview;
  offeringPrice: number;
  priceInterval: React.ReactNode;
  purchaseDetails: {
    details: string[];
    subtitle: string | null;
    productName: string;
    webIcon: string;
  };
  totalPrice: React.ReactNode;
  locale: string;
  showPrices: boolean;
  freeTrialOffer?: {
    trialLengthDays: number;
  } | null;
  firstChargeAmount?: number;
  interval?: string;
  cartState?: string;
  trialStartDate?: number;
  trialEndDate?: number;
};

export function PurchaseDetails(props: PurchaseDetailsProps) {
  const {
    invoice,
    offeringPrice,
    priceInterval,
    purchaseDetails,
    totalPrice,
    locale,
    showPrices,
    freeTrialOffer,
    firstChargeAmount,
    interval,
    cartState,
    trialStartDate,
    trialEndDate,
  } = props;
  const { details, productName, subtitle, webIcon } = purchaseDetails;

  // Cache props from START as server re-renders during PROCESSING which
  // may return different data as Stripe state changes
  const [stableInvoice, setStableInvoice] = useState(invoice);
  const [stableTotalPrice, setStableTotalPrice] = useState(totalPrice);
  const [stableFreeTrialOffer, setStableFreeTrialOffer] =
    useState(freeTrialOffer);
  const [stableTrialStartDate, setStableTrialStartDate] =
    useState(trialStartDate);
  const [stableTrialEndDate, setStableTrialEndDate] = useState(trialEndDate);
  useEffect(() => {
    const isFreeTrial =
      !!stableTrialEndDate ||
      (!!stableFreeTrialOffer &&
        stableFreeTrialOffer.trialLengthDays > 0);
    if (cartState === 'start' || (cartState === 'success' && !isFreeTrial)) {
      setStableInvoice(invoice);
      setStableTotalPrice(totalPrice);
      setStableFreeTrialOffer(freeTrialOffer);
      setStableTrialStartDate(trialStartDate);
      setStableTrialEndDate(trialEndDate);
    }
  }, [
    cartState,
    invoice,
    totalPrice,
    freeTrialOffer,
    trialStartDate,
    trialEndDate,
  ]);

  const {
    amountDue,
    creditApplied,
    currency,
    discountAmount,
    discountEnd,
    discountType,
    remainingAmountTotal,
    startingBalance,
    subtotal,
    taxAmounts,
    totalAmount,
    unusedAmountTotal,
  } = stableInvoice;
  const exclusiveTaxRates = taxAmounts.filter(
    (taxAmount) => !taxAmount.inclusive
  );
  const freeTrial =
    !!stableTrialEndDate ||
    (!!stableFreeTrialOffer &&
      stableFreeTrialOffer.trialLengthDays > 0);
  const trialDayLength =
    stableTrialStartDate && stableTrialEndDate
      ? Math.round((stableTrialEndDate - stableTrialStartDate) / 86400)
      : stableFreeTrialOffer?.trialLengthDays;
  const formattedTrialEndDate = freeTrial
    ? getLocalizedDateString(
        stableTrialEndDate ??
          Math.floor((Date.now() + (trialDayLength ?? 0) * 86400000) / 1000),
        false,
        locale
      )
    : '';
  const formattedFirstCharge = getLocalizedCurrencyString(
    firstChargeAmount ?? offeringPrice,
    currency,
    locale
  );
  const intervalLabelMap: Record<string, string> = {
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
    halfyearly: '6 months',
    yearly: 'year',
  };
  const intervalLabel = intervalLabelMap[interval ?? ''] ?? interval;
  const startIdMap: Record<string, string> = {
    daily: 'free-trial-start-message-daily',
    weekly: 'free-trial-start-message-weekly',
    monthly: 'free-trial-start-message-monthly',
    halfyearly: 'free-trial-start-message-halfyearly',
    yearly: 'free-trial-start-message-yearly',
  };
  const firstChargeIdMap: Record<string, string> = {
    daily: 'free-trial-first-charge-message-daily',
    weekly: 'free-trial-first-charge-message-weekly',
    monthly: 'free-trial-first-charge-message-monthly',
    halfyearly: 'free-trial-first-charge-message-halfyearly',
    yearly: 'free-trial-first-charge-message-yearly',
  };
  const freeTrialStartMessageId = interval
    ? startIdMap[interval]
    : 'free-trial-start-message-monthly';
  const firstChargeMessageId = interval
    ? firstChargeIdMap[interval]
    : 'free-trial-first-charge-message-monthly';
  const [detailsHidden, setDetailsState] = useState(true);

  return (
    <section
      aria-labelledby="product-details-heading"
      className="bg-white rounded-b-lg shadow-sm shadow-grey-300 text-sm px-4 pb-2 rounded-t-none clip-shadow tablet:rounded-t-lg"
    >
      <div className="flex gap-4 my-0 py-4">
        <Image
          src={webIcon}
          alt={productName}
          data-testid="product-logo"
          className="w-16 h-16 rounded-lg"
          width={64}
          height={64}
        />

        <div className="text-start">
          <h2
            id="product-details-heading"
            className="text-grey-600 font-semibold leading-5 my-0 break-words"
          >
            {productName}
          </h2>

          <p className="text-grey-400 mt-1 mb-0">
            {priceInterval}
            {subtitle && (
              <span>
                &nbsp;&bull;&nbsp;
                {subtitle}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className={detailsHidden ? 'hidden tablet:block' : 'block'}>
        {showPrices && freeTrial && (
          <div className="bg-[#D5F9FF] mb-4 p-4 rounded-lg">
            <div className="flex gap-2 items-center">
              <Image src={alertCircle} alt="" width={20} height={20} />
              {cartState === 'success' ? (
                <Localized
                  id="free-trial-success-title"
                  vars={{ trialDayLength: trialDayLength ?? 0 }}
                >
                  <h3 className="text-grey-600 font-semibold my-0">
                    Your {trialDayLength}-day free trial has started
                  </h3>
                </Localized>
              ) : (
                <Localized
                  id="free-trial-start-title"
                  vars={{ trialDayLength: trialDayLength ?? 0 }}
                >
                  <h3 className="text-grey-600 font-semibold my-0">
                    Start your {trialDayLength}-day free trial
                  </h3>
                </Localized>
              )}
            </div>

            <Localized
              id={freeTrialStartMessageId}
              vars={{
                endDate: formattedTrialEndDate,
                firstPrice: formattedFirstCharge,
              }}
            >
              <p className="leading-5 mt-1 mb-0 text-grey-600 text-sm">
                No payment required today. You will be charged{' '}
                {formattedFirstCharge}/{intervalLabel} after the free trial ends
                on {formattedTrialEndDate}.
              </p>
            </Localized>
          </div>
        )}

        <div
          className="border-b border-grey-200"
          role="separator"
          aria-hidden="true"
        ></div>

        <Localized id="next-plan-details-header">
          <h3 className="text-grey-600 font-semibold my-4">Product details</h3>
        </Localized>

        <ul className="text-grey-400 m-0 px-3 list-disc">
          {details.map((detail, idx) => (
            <li className="mb-4 leading-5 marker:text-xs" key={idx}>
              {detail}
            </li>
          ))}
        </ul>

        {showPrices && (
          <>
            <div
              className="border-b border-grey-200"
              role="separator"
              aria-hidden="true"
            ></div>

            <ul className="border-b border-grey-200 py-6">
              <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
                {remainingAmountTotal &&
                offeringPrice !== remainingAmountTotal ? (
                  <Localized
                    id="plan-details-product-prorated-price"
                    vars={{ productName }}
                  >
                    <p>Prorated price for {productName}</p>
                  </Localized>
                ) : (
                  <Localized id="next-plan-details-list-price">
                    <p>List Price</p>
                  </Localized>
                )}
                <p>
                  {getLocalizedCurrencyString(
                    remainingAmountTotal ?? offeringPrice,
                    currency,
                    locale
                  )}
                </p>
              </li>

              {!!unusedAmountTotal && (
                <>
                  <li className="flex items-center justify-between gap-2 leading-5 text-grey-600">
                    <Localized id="purchase-details-unused-time-label">
                      <p>Credit from unused time</p>
                    </Localized>
                    <p>
                      {getLocalizedCurrencyString(
                        unusedAmountTotal,
                        currency,
                        locale
                      )}
                    </p>
                  </li>

                  <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 pb-4 font-semibold">
                    <Localized id="purchase-details-subtotal-label">
                      <h3>Subtotal</h3>
                    </Localized>
                    <p>
                      {getLocalizedCurrencyString(subtotal, currency, locale)}
                    </p>
                  </li>
                </>
              )}

              {!!discountAmount && discountAmount > 0 && (
                <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
                  <Localized id="next-coupon-promo-code">
                    <p>Promo Code</p>
                  </Localized>
                  <p>
                    {getLocalizedCurrencyString(
                      -1 * discountAmount,
                      currency,
                      locale
                    )}
                  </p>
                </li>
              )}

              {exclusiveTaxRates.length === 1 &&
                exclusiveTaxRates[0].amount !== 0 && (
                  <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
                    <Localized id="next-plan-details-tax">
                      <p>Taxes and Fees</p>
                    </Localized>
                    <p>
                      {getLocalizedCurrencyString(
                        exclusiveTaxRates[0].amount,
                        currency,
                        locale
                      )}
                    </p>
                  </li>
                )}

              {exclusiveTaxRates.length > 1 &&
                exclusiveTaxRates.map(
                  (taxRate) =>
                    taxRate.amount > 0 && (
                      <li
                        key={taxRate.title}
                        className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm"
                      >
                        <Localized id="tax">
                          <p>{taxRate.title}</p>
                        </Localized>
                        <p>
                          {getLocalizedCurrencyString(
                            taxRate.amount,
                            currency,
                            locale
                          )}
                        </p>
                      </li>
                    )
                )}

              <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 font-semibold">
                <Localized id="next-plan-details-total-label">
                  <h3>Total</h3>
                </Localized>
                <p
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                  data-testid="total-before-credits-price"
                >
                  {getLocalizedCurrencyString(totalAmount, currency, locale)}
                </p>
              </li>

              {!!creditApplied && startingBalance < 0 && (
                <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 pt-4">
                  <Localized id="purchase-details-credit-applied-label">
                    <p>Credit applied</p>
                  </Localized>
                  <p className="flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {getLocalizedCurrencyString(
                      creditApplied,
                      currency,
                      locale
                    )}
                  </p>
                </li>
              )}
            </ul>

            <div className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm my-6 font-semibold">
              <Localized id="purchase-details-total-due-label">
                <h3 className="text-base">Total due</h3>
              </Localized>
              <p
                className="overflow-hidden text-ellipsis text-lg whitespace-nowrap"
                data-testid="total-price"
              >
                {freeTrial
                  ? getLocalizedCurrencyString(0, currency, locale)
                  : !!unusedAmountTotal || !!creditApplied
                    ? getLocalizedCurrencyString(amountDue, currency, locale)
                    : stableTotalPrice}
              </p>
            </div>

            {freeTrial && (
              <div className="bg-grey-50 mb-6 p-4 rounded-lg">
                <Localized
                  id="free-trial-first-charge-title"
                  vars={{ endDate: formattedTrialEndDate }}
                >
                  <h3 className="text-grey-600 font-semibold my-0">
                    First charge: {formattedTrialEndDate}
                  </h3>
                </Localized>

                <Localized
                  id={firstChargeMessageId}
                  vars={{
                    endDate: formattedTrialEndDate,
                    firstPrice: formattedFirstCharge,
                  }}
                >
                  <p className="leading-5 mt-1 mb-0 text-grey-600 text-sm">
                    You will be billed {formattedFirstCharge} on{' '}
                    {formattedTrialEndDate}, then{' '}
                    {interval === 'halfyearly' ? 'every 6 months' : interval}{' '}
                    thereafter until you cancel.
                  </p>
                </Localized>
              </div>
            )}

            {!discountType ||
            discountType === 'forever' ? null : discountEnd ? (
              <div
                className="flex items-center justify-center gap-2 text-green-900 pt-2 pb-6 font-medium"
                data-testid="coupon-success-with-date"
              >
                <Image src={infoLogo} alt="" />
                <Localized
                  id="next-coupon-success-repeating"
                  vars={{
                    couponDurationDate: getLocalizedDateString(
                      discountEnd,
                      false,
                      locale
                    ),
                  }}
                >
                  <p>
                    Your plan will automatically renew after
                    {getLocalizedDateString(discountEnd, false, locale)} at the
                    list price.
                  </p>
                </Localized>
              </div>
            ) : (
              <div
                className="flex items-center justify-center gap-2 text-green-900 pt-2 pb-6 font-medium"
                data-testid="coupon-success"
              >
                <Image src={infoLogo} alt="" />
                <Localized id="next-coupon-success">
                  <p>Your plan will automatically renew at the list price.</p>
                </Localized>
              </div>
            )}
          </>
        )}
      </div>

      {detailsHidden && (
        <div
          className="border-b border-grey-200 tablet:hidden"
          role="separator"
          aria-hidden="true"
        ></div>
      )}

      <div
        className="flex items-center justify-center tablet:hidden"
        data-testid="purchase-details-footer"
      >
        <button
          className="flex items-center justify-center bg-transparent border border-solid border-white cursor-pointer text-blue-500 leading-5 my-2 py-2 px-4 relative focus:border focus:border-solid focus:border-blue-400 focus:py-2 focus:px-4 focus:rounded-md focus:shadow-none"
          data-testid="button"
          onClick={() => setDetailsState(detailsHidden ? false : true)}
        >
          {detailsHidden ? (
            <>
              <Image src={chevron} alt="" className="pt-px" />
              <Localized id="next-plan-details-show-button">
                <span>Show details</span>
              </Localized>
            </>
          ) : (
            <>
              <Image src={chevron} alt="" className="pb-0.5 rotate-180" />
              <Localized id="next-plan-details-hide-button">
                <span>Hide details</span>
              </Localized>
            </>
          )}
        </button>
      </div>
    </section>
  );
}

export default PurchaseDetails;
