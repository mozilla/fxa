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
  anchorStart?: boolean;
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
  anchorStart = false,
  position = 'top',
  prefixDataTestId,
}: TooltipProps) => {
  function formatDataTestId(id: string) {
    return prefixDataTestId ? `${prefixDataTestId}-${id}` : id;
  }

  return (
    <div
      data-testid={formatDataTestId('tooltip')}
      title={message}
      className={classNames(
        `z-50 absolute py-2 px-6 text-center text-white
         rounded text-xs font-header font-bold
          shadow-tooltip-grey-drop
         `,
        type === 'error' ? 'bg-red-600' : 'bg-grey-500',
        className,
        {
          'ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2':
            !anchorStart,
          'ltr:left-0 rtl:right-0': anchorStart,
          'bottom-full': position === 'top',
          'top-full': position === 'bottom',
        }
      )}
    >
      <span
        className={classNames('absolute', caretClass(type, position), {
          'ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2':
            !anchorStart,
          'ltr:left-ten rtl:right-ten w-auto': anchorStart,
          'top-full': position === 'top',
          'bottom-full': position === 'bottom',
        })}
      />
      {message}
    </div>
  );
};

export default Tooltip;
