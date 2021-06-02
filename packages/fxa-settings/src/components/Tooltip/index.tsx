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
  anchorLeft?: boolean;
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
  anchorLeft = false,
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
         p-3 rounded text-xs left-0 font-header font-bold
          shadow-tooltip-grey-drop
         `,
        type === 'error' ? 'bg-red-600' : 'bg-grey-400',
        className,
        {
          'left-1/2 transform -translate-x-1/2': !anchorLeft,
          'left-0': anchorLeft,
          'bottom-full': position === 'top',
          'top-full': position === 'bottom',
        }
      )}
    >
      <span
        className={classNames('absolute', caretClass(type, position), {
          'left-1/2 transform -translate-x-1/2': !anchorLeft,
          'left-ten': anchorLeft,
          'top-full': position === 'top',
          'bottom-full': position === 'bottom',
        })}
      />
      {message}
    </div>
  );
};

export default Tooltip;
