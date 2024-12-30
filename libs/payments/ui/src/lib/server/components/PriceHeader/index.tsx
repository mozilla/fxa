/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';

type PriceHeaderProps = {
  priceInterval: React.ReactNode;
  purchaseDetails: {
    details: string[];
    subtitle: string | null;
    productName: string;
    webIcon: string;
  };
};

export function PriceHeader(props: PriceHeaderProps) {
  const { priceInterval, purchaseDetails } = props;
  const { subtitle, productName, webIcon } = purchaseDetails;
  return (
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
        <h3 className="text-grey-600 font-semibold leading-5 my-0 break-words">
          {productName}
        </h3>

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
  );
}

export default PriceHeader;
