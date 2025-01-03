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
  selectedPrice: React.ReactNode;
  upgradeFrom?: React.ReactNode;
};

export function PurchaseDetails(props: PurchaseDetailsProps) {
  const { children, selectedPrice, upgradeFrom } = props;
  const [detailsHidden, setDetailsState] = useState(true);
  return (
    <div className="bg-white rounded-b-lg shadow-sm shadow-grey-300 text-sm px-4 rounded-t-none clip-shadow tablet:rounded-t-lg">
      {upgradeFrom ? (
        <>
          <div className="pt-4">
            <Localized id="next-sub-update-current-plan-label">
              <h2 className="font-semibold py-2">Current Plan</h2>
            </Localized>
            {upgradeFrom}
          </div>

          <div>
            <Localized id="next-sub-update-new-plan-label">
              <h2 className="font-semibold py-2">New Plan</h2>
            </Localized>
            {selectedPrice}
          </div>
        </>
      ) : (
        selectedPrice
      )}

      <div className="border-b border-grey-200"></div>

      {upgradeFrom ? (
        children
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default PurchaseDetails;
