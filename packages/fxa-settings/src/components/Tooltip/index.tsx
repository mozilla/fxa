/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import classNames from 'classnames';

export type TooltipType = 'default' | 'error';
export type PositionType = 'top' | 'bottom';

type TooltipProps = {
  message: string;
  type?: TooltipType;
  anchorPosition?: 'start' | 'middle' | 'end';
  className?: string;
  position?: PositionType;
  prefixDataTestId?: string;
};

function caretClass(type: TooltipType, position: PositionType) {
  // caret position and the positioning rule for tooltip are actually the opposite
  // of the passed in position;
  if (position === 'top') {
    if (type === 'error') {
      return 'caret-bottom-error';
    }
    return 'caret-bottom-default';
  }
  if (type === 'error') {
    return 'caret-top-error';
  }
  return 'caret-top-default';
}

export const Tooltip = ({
  message,
  className,
  type = 'default',
  anchorPosition = 'middle',
  position = 'top',
  prefixDataTestId,
}: TooltipProps) => {
  function formatDataTestId(id: string) {
    return prefixDataTestId ? `${prefixDataTestId}-${id}` : id;
  }

  return (
    <div
      data-testid={formatDataTestId('tooltip')}
      aria-live="polite"
      className={classNames(
        `z-50 absolute py-2 px-6 text-center text-white
         rounded text-xs font-header font-bold
          shadow-tooltip-grey-drop border-transparent border border-solid
         `,
        type === 'error' ? 'bg-red-600' : 'bg-grey-500',
        className,
        {
          'ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2':
            anchorPosition === 'middle',
          'start-0': anchorPosition === 'start',
          'end-0 me-1': anchorPosition === 'end',
          'bottom-full': position === 'top',
          'top-full mt-2': position === 'bottom',
        }
      )}
    >
      <span
        className={classNames('absolute', caretClass(type, position), {
          'ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2':
            anchorPosition === 'middle',
          'start-ten w-auto': anchorPosition === 'start',
          'end-ten w-auto': anchorPosition === 'end',
          'top-full': position === 'top',
          'bottom-full': position === 'bottom',
        })}
      />
      {message}
    </div>
  );
};

export default Tooltip;
