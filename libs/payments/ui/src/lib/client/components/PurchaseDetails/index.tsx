/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import Image from 'next/image';
import { useState } from 'react';
import { InvoicePreview } from '@fxa/payments/customer';
import infoLogo from '@fxa/shared/assets/images/info.svg';
import {
  getLocalizedCurrencyString,
  getLocalizedDateString,
} from '@fxa/shared/l10n';
import chevron from './images/chevron.svg';

type PurchaseDetailsProps = {
  invoice: InvoicePreview;
  priceInterval: React.ReactNode;
  purchaseDetails: {
    details: string[];
    subtitle: string | null;
    productName: string;
    webIcon: string;
  };
  totalPrice: React.ReactNode;
  locale: string;
};

export function PurchaseDetails(props: PurchaseDetailsProps) {
  const { invoice, priceInterval, purchaseDetails, totalPrice, locale } = props;
  const { details, productName, subtitle, webIcon } = purchaseDetails;
  const {
    currency,
    discountAmount,
    discountEnd,
    discountType,
    listAmount,
    taxAmounts,
  } = invoice;
  const exclusiveTaxRates = taxAmounts.filter(
    (taxAmount) => !taxAmount.inclusive
  );
  const [detailsHidden, setDetailsState] = useState(true);
  return (
    <div className="bg-white rounded-b-lg shadow-sm shadow-grey-300 text-sm px-4 rounded-t-none clip-shadow tablet:rounded-t-lg">
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
          <h2 className="text-grey-600 font-semibold leading-5 my-0 break-words">
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

      <div className="border-b border-grey-200"></div>

      <div className={detailsHidden ? 'hidden tablet:block' : 'block'}>
        <Localized id="next-plan-details-header">
          <h3 className="text-grey-600 font-semibold my-4">Product details</h3>
        </Localized>

        <ul className="border-b border-grey-200 text-grey-400 m-0 px-3 list-disc">
          {details.map((detail, idx) => (
            <li className="mb-4 leading-5 marker:text-xs" key={idx}>
              {detail}
            </li>
          ))}
        </ul>

        <ul className="pt-6">
          {!!listAmount && listAmount > 0 && (
            <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
              <Localized id="next-plan-details-list-price">
                <p>List Price</p>
              </Localized>
              <p>{getLocalizedCurrencyString(listAmount, currency, locale)}</p>
            </li>
          )}

          {!!discountAmount && discountAmount > 0 && (
            <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm">
              <Localized id="next-coupon-promo-code">
                <p>Promo Code</p>
              </Localized>
              <p>{getLocalizedCurrencyString(-1 * discountAmount, currency, locale)}</p>
            </li>
          )}

          {exclusiveTaxRates.length === 1 &&
            exclusiveTaxRates[0].amount > 0 && (
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
                      {getLocalizedCurrencyString(taxRate.amount, currency, locale)}
                    </p>
                  </li>
                )
            )}

          <div className="border-t border-grey-200 mt-6"></div>

          <li className="flex items-center justify-between gap-2 leading-5 text-grey-600 text-sm mt-6 pt-4 pb-6 font-semibold">
            <Localized id="next-plan-details-total-label">
              <h3 className="text-base">Total</h3>
            </Localized>
            <p
              className="overflow-hidden text-ellipsis text-lg whitespace-nowrap"
              data-testid="total-price"
            >
              {totalPrice}
            </p>
          </li>
        </ul>

        {!discountType || discountType === 'forever' ? null : discountEnd ? (
          <div
            className="flex items-center justify-center gap-2 text-green-900 pt-2 pb-6 font-medium"
            data-testid="coupon-success-with-date"
          >
            <Image src={infoLogo} alt="" />
            <Localized
              id="next-coupon-success-repeating"
              vars={{
                couponDurationDate: getLocalizedDateString(discountEnd, true),
              }}
            >
              <p>
                Your plan will automatically renew after
                {getLocalizedDateString(discountEnd, true)} at the list price.
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
      </div>

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
    </div>
  );
}

export default PurchaseDetails;
