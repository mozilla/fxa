/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LoadingSpinner, {
  SpinnerType,
} from 'fxa-react/components/LoadingSpinner';
import classNames from 'classnames';

export type CardLoadingSpinnerProps = {
  className?: string;
  spinnerType?: SpinnerType;
  spinnerSize?: string;
  /** Whether or not to use the card-shrink class, which shrinks card in split
   * layout so that the image on the left fits in the screen (might break in
   * non-split layout; use with caution) */
  shrink?: boolean;
};

export const CardLoadingSpinner = ({
  className,
  spinnerType = SpinnerType.Blue,
  spinnerSize = 'w-10 h-10',
  shrink = false,
}: CardLoadingSpinnerProps) => {
  return (
    <div
      className={classNames(
        shrink ? 'card-shrink' : 'card',
        'flex items-center justify-center h-full mobileLandscape:h-48',
        className
      )}
    >
      <LoadingSpinner
        spinnerType={spinnerType}
        imageClassName={classNames(spinnerSize, 'animate-spin')}
      />
    </div>
  );
};

export default CardLoadingSpinner;
