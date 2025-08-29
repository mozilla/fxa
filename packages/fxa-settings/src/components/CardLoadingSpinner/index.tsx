/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import classNames from 'classnames';
import LoadingSpinner, {SpinnerType} from 'fxa-react/components/LoadingSpinner';

export type CardLoadingSpinnerProps = {
  className?: string;
  widthClass?: string;
  spinnerType?: SpinnerType;
  imageClassName?: string;
};

export const CardLoadingSpinner = ({
  className,
  widthClass = 'w-full tablet:w-[30rem]',
  spinnerType = SpinnerType.Blue,
  imageClassName = 'w-10 h-10 animate-spin',
}: CardLoadingSpinnerProps) => {
  return (
    // ai helped here with the layout, so I'm not sure what all we would need
    // but it appears to be working well.
    <div className={classNames('relative', className)}>
      <section className="mobileLandscape:flex mobileLandscape:items-center mobileLandscape:flex-1">
        <div className={classNames('card', widthClass, 'h-[30rem]')}>
            <div className="flex items-center justify-center h-full w-full">
            <LoadingSpinner
              spinnerType={spinnerType}
              imageClassName={imageClassName}
            />
            </div>
        </div>
      </section>
    </div>
  );
};

export default CardLoadingSpinner;
