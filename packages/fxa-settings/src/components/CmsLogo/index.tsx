/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

const CmsLogo = (opts: {
  isMobile: boolean;
  logoPosition: 'left' | 'center';
  logos: Array<
    | {
        logoUrl?: string;
        logoAltText?: string;
      }
    | undefined
  >;
}) => {
  const logo = opts.logos.find(
    (x) => x?.logoAltText != null && x?.logoUrl != null
  );
  return (
    <>
      {!opts.isMobile && logo && (
        <img
          src={logo.logoUrl}
          alt={logo.logoAltText}
          className={`${
            opts.logoPosition === 'center' ? 'justify-center mb-4 max-h-[160px]' : 'justify-left mb-4 max-h-[40px]'
          }`}
        />
      )}
    </>
  );
};

export default CmsLogo;
