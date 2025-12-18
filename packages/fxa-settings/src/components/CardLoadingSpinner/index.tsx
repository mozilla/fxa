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
};

export const CardLoadingSpinner = ({
  className,
  spinnerType = SpinnerType.Blue,
  spinnerSize = 'w-10 h-10',
}: CardLoadingSpinnerProps) => {
  return (
    <div
      className={classNames(
        'card flex items-center justify-center h-full max-w-48 mobileLandscape:h-32',
        className
      )}
    >
      <LoadingSpinner
        spinnerType={spinnerType}
        imageClassName={`${spinnerSize} animate-spin`}
      />
    </div>
  );
};

export default CardLoadingSpinner;
