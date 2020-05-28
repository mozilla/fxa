/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ReactComponent as DefaultAvatar } from '../../images/avatar-default.svg';

type UnitRowWithImageProps = {
  header: string;
  imageUrl: string | null;
  alt: string;
  route: string;
};

export const UnitRowWithImage = ({
  header,
  imageUrl,
  alt,
  route,
}: UnitRowWithImageProps) => {
  const ctaText = imageUrl ? 'Change' : 'Add';

  return (
    <div>
      <h4 data-testid="unit-row-with-image-header">{header}</h4>
      <div>
        {imageUrl ? (
          <img
            data-testid="unit-row-with-image-nondefault"
            src={imageUrl}
            {...{ alt }}
          />
        ) : (
          <DefaultAvatar
            data-testid="unit-row-with-image-default"
            role="img"
            aria-label={alt}
            className="w-16"
          />
        )}
      </div>
      <div>
        <a data-testid="unit-row-with-image-route" href={route}>
          {ctaText}
        </a>
      </div>
    </div>
  );
};

export default UnitRowWithImage;
