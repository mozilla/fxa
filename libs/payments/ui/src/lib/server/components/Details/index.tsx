/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import { Invoice } from '@fxa/payments/cart';
import infoLogo from '@fxa/shared/assets/images/info.svg';
import { LocalizerRsc } from '@fxa/shared/l10n/server';

type DetailsProps = {
  l10n: LocalizerRsc;
  children: React.ReactNode;
  invoice: Invoice;
  purchaseDetails: {
    details: string[];
    subtitle: string | null;
    productName: string;
    webIcon: string;
  };
};

export async function Details(props: DetailsProps) {
  const { children, purchaseDetails, invoice, l10n } = props;
  const { discountEnd, discountType } = invoice;
  const { details } = purchaseDetails;

  return (
    <>
      <h3 className="text-grey-600 font-semibold my-4">
        {l10n.getString('next-plan-details-header', 'Product details')}
      </h3>

      <ul className="border-b border-grey-200 text-grey-400 m-0 px-3 list-disc">
        {details.map((detail, idx) => (
          <li className="mb-4 leading-5 marker:text-xs" key={idx}>
            {detail}
          </li>
        ))}
      </ul>

      {children}

      {!discountType || discountType === 'forever' ? null : discountEnd ? (
        <div
          className="flex items-center justify-center gap-2 text-green-900 pt-2 pb-6 font-medium"
          data-testid="coupon-success-with-date"
        >
          <Image src={infoLogo} alt="" />
          <div>
            {l10n.getString(
              'next-coupon-success-repeating',
              {
                couponDurationDate: l10n.getLocalizedDateString(
                  discountEnd,
                  true
                ),
              },
              `Your plan will automatically renew after ${l10n.getLocalizedDateString(
                discountEnd,
                true
              )} at the list price.`
            )}
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center gap-2 text-green-900 pt-2 pb-6 font-medium"
          data-testid="coupon-success"
        >
          <Image src={infoLogo} alt="" />
          <div>
            {l10n.getString(
              'next-coupon-success',
              'Your plan will automatically renew at the list price.'
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Details;
