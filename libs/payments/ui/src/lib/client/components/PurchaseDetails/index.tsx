/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import Image from 'next/image';
import { useState } from 'react';
import chevron from './images/chevron.svg';

type PurchaseDetailsProps = {
  children: React.ReactNode;
  priceInterval: React.ReactNode;
  purchaseDetails: {
    details: string[];
    subtitle: string | null;
    productName: string;
    webIcon: string;
  };
};

export function PurchaseDetails(props: PurchaseDetailsProps) {
  const { children, priceInterval, purchaseDetails } = props;
  const { subtitle, productName, webIcon } = purchaseDetails;
  const [detailsHidden, setDetailsState] = useState(true);
  return (
    <div className="bg-white rounded-b-lg shadow-sm shadow-grey-300 text-sm px-4 rounded-t-none clip-shadow tablet:rounded-t-lg">
      <div className="flex gap-4 my-0 py-4 border-b border-grey-200">
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

      <div className={detailsHidden ? 'hidden tablet:block' : 'block'}>
        {children}
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
                Show details
              </Localized>
            </>
          ) : (
            <>
              <Image src={chevron} alt="" className="pb-0.5 rotate-180" />
              <Localized id="next-plan-details-hide-button">
                Hide details
              </Localized>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default PurchaseDetails;
